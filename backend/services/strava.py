import os
import hmac
import hashlib
import logging
from typing import Optional
from services.oauth_base import OAuth2Provider, is_token_expired

logger = logging.getLogger("strava")

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID", "")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET", "")
STRAVA_REDIRECT_URI = os.getenv("STRAVA_REDIRECT_URI", "http://localhost:8001/api/wearable/callback/strava")
STRAVA_VERIFY_TOKEN = os.getenv("STRAVA_VERIFY_TOKEN", "elite_fit_verify_2025")

AUTH_URL = "https://www.strava.com/oauth/authorize"
TOKEN_URL = "https://www.strava.com/oauth/token"
API_BASE = "https://www.strava.com/api/v3"
SCOPE = "read,activity:read_all,profile:read_all"


class StravaOAuth(OAuth2Provider):
    client_id = STRAVA_CLIENT_ID
    client_secret = STRAVA_CLIENT_SECRET
    redirect_uri = STRAVA_REDIRECT_URI
    auth_url = AUTH_URL
    token_url = TOKEN_URL
    api_base = API_BASE
    scopes = SCOPE

    def get_authorization_url(self, state: str) -> str:
        params = (
            f"client_id={self.client_id}"
            f"&redirect_uri={self.redirect_uri}"
            f"&response_type=code"
            f"&approval_prompt=force"
            f"&scope={self.scopes}"
            f"&state={state}"
        )
        return f"{self.auth_url}?{params}"

    async def exchange_code(self, code: str) -> Optional[dict]:
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "authorization_code",
            "code": code,
        }
        result = await self._post(self.token_url, data)
        if result:
            return {
                "access_token": result.get("access_token"),
                "refresh_token": result.get("refresh_token"),
                "expires_at": result.get("expires_at"),
                "provider_user_id": str(result.get("athlete", {}).get("id", "")),
            }
        return None

    async def refresh_access_token(self, refresh_token: str) -> Optional[dict]:
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }
        result = await self._post(self.token_url, data)
        if result:
            return {
                "access_token": result.get("access_token"),
                "refresh_token": result.get("refresh_token"),
                "expires_at": result.get("expires_at"),
                "provider_user_id": str(result.get("athlete", {}).get("id", "")),
            }
        return None

    async def fetch_user_id(self, access_token: str) -> Optional[str]:
        data = await self._get(
            f"{self.api_base}/athlete",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if data:
            return str(data.get("id", ""))
        return None

    async def fetch_activities(self, access_token: str, after: Optional[int] = None, page: int = 1, per_page: int = 50) -> list:
        params = f"page={page}&per_page={per_page}"
        if after:
            params += f"&after={after}"
        headers = {"Authorization": f"Bearer {access_token}"}
        data = await self._get(f"{self.api_base}/athlete/activities?{params}", headers)
        return data if isinstance(data, list) else []

    async def fetch_activity_detail(self, access_token: str, activity_id: int) -> Optional[dict]:
        headers = {"Authorization": f"Bearer {access_token}"}
        return await self._get(f"{self.api_base}/activities/{activity_id}", headers=headers)


def verify_strava_webhook(body: bytes, signature_header: str) -> bool:
    if not STRAVA_CLIENT_SECRET:
        logger.warning("STRAVA_CLIENT_SECRET not set — skipping webhook verification.")
        return True
    expected = hmac.new(
        STRAVA_CLIENT_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)


def normalize_strava_activity(raw: dict) -> dict:
    sport_type = raw.get("sport_type", raw.get("type", "")).lower()
    activity_type = "other"
    if "run" in sport_type:
        activity_type = "run"
    elif "ride" in sport_type or "bike" in sport_type or "cycling" in sport_type:
        activity_type = "ride"
    elif "swim" in sport_type:
        activity_type = "swim"
    elif "walk" in sport_type or "hike" in sport_type:
        activity_type = "walk"
    elif "workout" in sport_type or "weight" in sport_type or "strength" in sport_type:
        activity_type = "workout"

    distance_m = raw.get("distance", 0) or 0
    moving_time_s = raw.get("moving_time", 0) or 0
    calories = raw.get("calories", 0) or 0
    hr_avg = raw.get("average_heartrate")
    hr_max = raw.get("max_heartrate")
    elev = raw.get("total_elevation_gain", 0) or 0

    return {
        "provider": "strava",
        "provider_activity_id": str(raw.get("id", "")),
        "date": raw.get("start_date", "")[:10] if raw.get("start_date") else "",
        "type": activity_type,
        "name": raw.get("name", ""),
        "steps": 0,
        "calories": round(calories),
        "distance_km": round(distance_m / 1000, 2),
        "duration_minutes": round(moving_time_s / 60),
        "heart_rate_avg": round(hr_avg) if hr_avg else 0,
        "heart_rate_peak": round(hr_max) if hr_max else 0,
        "elevation_gain": round(elev, 1),
        "raw_data": {
            "strava_id": raw.get("id"),
            "sport_type": raw.get("sport_type", raw.get("type")),
            "start_date": raw.get("start_date"),
            "elapsed_time": raw.get("elapsed_time"),
        },
    }


strava_oauth = StravaOAuth()
