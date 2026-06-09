import os
import json
import time
import logging
import secrets
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Request, Query
from fastapi.responses import RedirectResponse, JSONResponse

from routes.auth import get_current_user
from routes.crud import (
    upsert_wearable_connection,
    get_wearable_connection,
    get_all_wearable_connections,
    update_wearable_tokens,
    disconnect_wearable,
    upsert_wearable_activity_log,
    get_wearable_activity_logs,
)
from services.wearable import get_provider, normalize_activity, compute_totals_from_logs
from services.strava import strava_oauth, STRAVA_VERIFY_TOKEN
from services.fitbit import fitbit_oauth
from services.oauth_base import is_token_expired
from services.redis_client import cache_get, cache_set, cache_delete
from services.cache import cache_aside, invalidate_user_stats, invalidate_user_provider
from services.webhook_queue import enqueue_webhook

router = APIRouter(prefix="/api/wearable", tags=["wearable"])
logger = logging.getLogger("wearable")

PROVIDER_NAMES = {"strava": "Strava", "fitbit": "Fitbit"}

STATS_CACHE_TTL = 300
TOKEN_CACHE_TTL_KEY = "token_remaining"

# ──────────────────────────────────────────────
# OAuth Connect & Callback
# ──────────────────────────────────────────────

@router.get("/connect/{provider}")
async def connect_provider(provider: str, current_user: dict = Depends(get_current_user)):
    oauth = get_provider(provider)
    if not oauth:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
    if not oauth.client_id:
        raise HTTPException(status_code=501, detail=f"{PROVIDER_NAMES.get(provider, provider)} not configured. Set {provider.upper()}_CLIENT_ID and {provider.upper()}_CLIENT_SECRET")
    state = secrets.token_urlsafe(32)
    auth_url = oauth.get_authorization_url(state)

    user_id = str(current_user.get("_id", ""))
    from db.mongodb import get_db
    db = get_db()
    await db.oauth_requests.insert_one({
        "state": state,
        "user_id": user_id,
        "provider": provider,
        "created_at": datetime.utcnow(),
    })
    return {"authorization_url": auth_url, "state": state}


@router.get("/callback/{provider}")
async def oauth_callback(
    provider: str,
    code: str = Query(""),
    state: str = Query(""),
    scope: str = Query(""),
    error: str = Query(None),
):
    if error:
        logger.warning("%s OAuth error: %s", provider, error)
        return RedirectResponse(url=f"/?wearable_error={error}&provider={provider}")

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    from db.mongodb import get_db
    db = get_db()
    oauth_req = await db.oauth_requests.find_one({"state": state, "provider": provider})
    user_id = oauth_req.get("user_id", "") if oauth_req else ""

    if not user_id:
        logger.error("No oauth_request found for state %s", state)
        return RedirectResponse(url="/?wearable_error=invalid_state")

    await db.oauth_requests.delete_one({"state": state})

    oauth = get_provider(provider)
    if not oauth:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    token_data = await oauth.exchange_code(code)
    if not token_data:
        logger.error("Failed to exchange code for %s", provider)
        return RedirectResponse(url=f"/?wearable_error=token_exchange_failed&provider={provider}")

    user_id_from_provider = await oauth.fetch_user_id(token_data.get("access_token", ""))
    if user_id_from_provider:
        token_data["provider_user_id"] = user_id_from_provider

    await upsert_wearable_connection(user_id, provider, token_data)

    expires_in = token_data.get("expires_at", 0) - int(time.time())
    token_key = f"user:{user_id}:tokens:{provider}"
    await cache_set(token_key, {
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "expires_at": token_data.get("expires_at"),
    }, ttl_seconds=max(expires_in, 60))

    await invalidate_user_stats(user_id)

    logger.info("%s OAuth success: user=%s provider_user_id=%s", provider, user_id, token_data.get("provider_user_id"))

    FRONTEND_URL = os.getenv("FRONTEND_URL", "")
    redirect_target = f"{FRONTEND_URL}/?wearable=connected&provider={provider}" if FRONTEND_URL else f"/?wearable=connected&provider={provider}"
    return RedirectResponse(url=redirect_target)


# ──────────────────────────────────────────────
# Connection Status
# ──────────────────────────────────────────────

@router.get("/status")
async def wearable_status(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id", ""))
    connections = await get_all_wearable_connections(user_id)

    result = []
    for conn in connections:
        result.append({
            "provider": conn.get("provider"),
            "provider_user_id": conn.get("provider_user_id"),
            "connected": conn.get("connected", False),
            "last_sync": conn.get("last_sync"),
            "token_expired": is_token_expired(conn.get("token_expires_at")),
        })
    return {"connections": result}


# ──────────────────────────────────────────────
# Disconnect
# ──────────────────────────────────────────────

@router.post("/disconnect/{provider}")
async def wearable_disconnect(provider: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id", ""))
    await disconnect_wearable(user_id, provider)
    await invalidate_user_provider(user_id, provider)
    await invalidate_user_stats(user_id)
    return {"status": "disconnected", "provider": provider}


# ──────────────────────────────────────────────
# Sync from Provider API
# ──────────────────────────────────────────────

async def _get_token_from_cache(user_id: str, provider: str, oauth) -> Optional[str]:
    token_key = f"user:{user_id}:tokens:{provider}"
    cached = await cache_get(token_key)
    if cached:
        access_token = cached.get("access_token")
        expires_at = cached.get("expires_at")
        if access_token and not is_token_expired(expires_at):
            return access_token

    conn = await get_wearable_connection(user_id, provider)
    if not conn or not conn.get("connected"):
        return None

    access_token = conn.get("access_token")
    refresh_token = conn.get("refresh_token")
    expires_at = conn.get("token_expires_at")

    if access_token and not is_token_expired(expires_at):
        return access_token

    if not refresh_token:
        logger.warning("No refresh token for %s user %s", provider, user_id)
        return None

    new_tokens = await oauth.refresh_access_token(refresh_token)
    if not new_tokens:
        logger.error("Failed to refresh token for %s", provider)
        return None

    await update_wearable_tokens(user_id, provider, new_tokens)

    expires_in = new_tokens.get("expires_at", 0) - int(time.time())
    await cache_set(token_key, new_tokens, ttl_seconds=max(expires_in, 60))

    return new_tokens.get("access_token")


@router.post("/sync/{provider}")
async def wearable_sync(provider: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id", ""))
    oauth = get_provider(provider)
    if not oauth:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    access_token = await _get_token_from_cache(user_id, provider, oauth)
    if not access_token:
        raise HTTPException(status_code=401, detail=f"{PROVIDER_NAMES.get(provider, provider)} not connected or token expired")

    conn = await get_wearable_connection(user_id, provider)
    last_sync = conn.get("last_sync") if conn else None

    if provider == "strava":
        after_ts = int(last_sync.timestamp()) if last_sync else None
        raw_list = await oauth.fetch_activities(access_token, after=after_ts)
    elif provider == "fitbit":
        after_date = last_sync.strftime("%Y-%m-%d") if last_sync else ""
        raw_list = await oauth.fetch_activities(access_token, after_date=after_date)
    else:
        raw_list = []

    if not raw_list:
        return {"synced": 0, "message": "No new activities found"}

    synced = 0
    for raw in raw_list:
        normalized = normalize_activity(provider, raw)
        if not normalized:
            continue
        await upsert_wearable_activity_log(user_id, normalized)
        synced += 1

    await invalidate_user_stats(user_id)

    logger.info("Synced %d activities for %s user %s", synced, provider, user_id)
    return {"synced": synced, "message": f"Synced {synced} activities from {PROVIDER_NAMES.get(provider, provider)}"}


# ──────────────────────────────────────────────
# Stats (aggregated from DB — cached in Redis)
# ──────────────────────────────────────────────

@router.get("/stats")
async def wearable_stats(
    current_user: dict = Depends(get_current_user),
    days: int = Query(7, ge=1, le=30),
    provider: Optional[str] = Query(None),
):
    user_id = str(current_user.get("_id", ""))
    cache_key = f"user:{user_id}:stats"

    async def fetch_stats():
        logs = await get_wearable_activity_logs(user_id, days=days, provider=provider)
        totals = compute_totals_from_logs(logs)
        return {"logs": logs, "totals": totals}

    return await cache_aside(cache_key, fetch_stats, ttl_seconds=STATS_CACHE_TTL)


# ──────────────────────────────────────────────
# Strava Webhook
# ──────────────────────────────────────────────

@router.get("/webhook/strava")
async def strava_webhook_verify(
    hub_mode: str = Query("", alias="hub.mode"),
    hub_challenge: str = Query("", alias="hub.challenge"),
    hub_verify_token: str = Query("", alias="hub.verify_token"),
):
    if hub_mode == "subscribe" and hub_verify_token == STRAVA_VERIFY_TOKEN:
        return {"hub.challenge": hub_challenge}
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/webhook/strava")
async def strava_webhook_event(request: Request):
    body = await request.body()
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    aspect_type = payload.get("aspect_type", "")
    object_type = payload.get("object_type", "")
    object_id = payload.get("object_id")
    owner_id = payload.get("owner_id")

    logger.info("Strava webhook: %s %s id=%s owner=%s", aspect_type, object_type, object_id, owner_id)

    if aspect_type == "create" and object_type == "activity" and object_id:
        queued = await enqueue_webhook({
            "type": "strava_activity",
            "owner_id": str(owner_id),
            "object_id": int(object_id),
        })
        if queued:
            return {"status": "queued"}
        conn = await get_wearable_connection_by_provider_user_id(str(owner_id), "strava")
        if not conn:
            logger.warning("No strava connection for owner_id %s", owner_id)
            return {"status": "ignored", "reason": "unknown_user"}
        return await _process_strava_activity(conn, int(object_id))

    return {"status": "received"}


async def _process_strava_activity(conn: dict, object_id: int) -> dict:
    access_token = conn.get("access_token")
    if not access_token:
        logger.warning("No access token for strava user")
        return {"status": "ignored", "reason": "no_token"}

    raw_detail = await strava_oauth.fetch_activity_detail(access_token, object_id)
    if not raw_detail:
        logger.warning("Failed to fetch strava activity %s", object_id)
        return {"status": "ignored", "reason": "fetch_failed"}

    normalized = normalize_activity("strava", raw_detail)
    if normalized:
        user_id = conn.get("user_id")
        log_id = await upsert_wearable_activity_log(user_id, normalized)
        await invalidate_user_stats(user_id)
        logger.info("Strava activity %s saved as %s", object_id, log_id)
        return {"status": "saved", "log_id": log_id}
    return {"status": "ignored", "reason": "normalize_failed"}


# ──────────────────────────────────────────────
# Fitbit Webhook (Subscription callback)
# ──────────────────────────────────────────────

@router.get("/webhook/fitbit")
async def fitbit_webhook_verify(request: Request):
    verify = request.query_params.get("verify")
    if verify:
        return JSONResponse(
            content={"hub.challenge": verify},
            headers={"Content-Type": "application/json"},
        )
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/webhook/fitbit")
async def fitbit_webhook_event(request: Request):
    body = await request.body()
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    if not isinstance(payload, list):
        payload = [payload]

    for event in payload:
        collection_type = event.get("collectionType", "")
        owner_id = event.get("ownerId", "")
        date_str = event.get("date", "")

        logger.info("Fitbit webhook: %s owner=%s date=%s", collection_type, owner_id, date_str)

        if collection_type in ("activities", "foods", "sleep", "body"):
            queued = await enqueue_webhook({
                "type": "fitbit_activity",
                "owner_id": owner_id,
                "date": date_str,
            })
            if queued:
                continue
            conn = await get_wearable_connection_by_provider_user_id(owner_id, "fitbit")
            if not conn:
                logger.warning("No fitbit connection for owner_id %s", owner_id)
                continue
            await _process_fitbit_activity(conn, date_str)

    return {"status": "received"}


async def _process_fitbit_activity(conn: dict, date_str: str):
    access_token = conn.get("access_token")
    if not access_token:
        return
    raw_list = await fitbit_oauth.fetch_activities(access_token, after_date=date_str)
    user_id = conn.get("user_id")
    saved = 0
    for raw in raw_list:
        normalized = normalize_activity("fitbit", raw)
        if normalized:
            await upsert_wearable_activity_log(user_id, normalized)
            saved += 1
    if saved:
        await invalidate_user_stats(user_id)


# ──────────────────────────────────────────────
# Webhook Queue Processor (called by main.py worker)
# ──────────────────────────────────────────────

async def process_webhook_payload(payload: dict):
    wh_type = payload.get("type", "")
    if wh_type == "strava_activity":
        conn = await get_wearable_connection_by_provider_user_id(
            str(payload.get("owner_id", "")), "strava"
        )
        if conn:
            await _process_strava_activity(conn, payload.get("object_id"))
    elif wh_type == "fitbit_activity":
        conn = await get_wearable_connection_by_provider_user_id(
            payload.get("owner_id", ""), "fitbit"
        )
        if conn:
            await _process_fitbit_activity(conn, payload.get("date", ""))


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

async def get_wearable_connection_by_provider_user_id(provider_user_id: str, provider: str) -> Optional[dict]:
    from db.mongodb import get_db
    db = get_db()
    doc = await db.wearable_connections.find_one({
        "provider_user_id": provider_user_id,
        "provider": provider,
        "connected": True,
    })
    if doc:
        doc["id"] = str(doc.pop("_id"))
    return doc
