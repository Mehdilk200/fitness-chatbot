

from datetime import datetime, timedelta
from typing import Optional, List
from bson import ObjectId
from db.mongodb import get_db



async def create_user(email: str, password_hash: str, first_name: str = "", last_name: str = "") -> dict:
    db  = get_db()
    doc = {
        "email":         email,
        "password_hash": password_hash,
        "first_name":    first_name,
        "last_name":     last_name,
        "is_active":     True,
        "created_at":    datetime.utcnow(),
        "updated_at":    datetime.utcnow(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


async def get_user_by_email(email: str) -> Optional[dict]:
    db  = get_db()
    doc = await db.users.find_one({"email": email})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


async def get_user_by_id(user_id: str) -> Optional[dict]:
    db  = get_db()
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc



async def create_or_update_profile(user_id: str, data: dict) -> dict:
    db  = get_db()
    data["user_id"]    = user_id
    data["updated_at"] = datetime.utcnow()
    await db.user_profiles.update_one(
        {"user_id": user_id},
        {"$set": data},
        upsert=True
    )
    return await get_profile(user_id)


async def get_profile(user_id: str) -> Optional[dict]:
    db  = get_db()
    doc = await db.user_profiles.find_one({"user_id": user_id})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc




async def create_session(user_id: str, title: str = "Nouvelle discussion") -> str:
   
    db  = get_db()
    doc = {
        "user_id":    user_id,
        "title":      title,
        "messages":   [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.chat_sessions.insert_one(doc)
    return str(result.inserted_id)

async def update_session_title(session_id: str, title: str) -> bool:
    db = get_db()
    result = await db.chat_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"title": title}}
    )
    return result.modified_count > 0


async def add_message(session_id: str, message: dict) -> bool:
  
    db     = get_db()
    message["timestamp"] = datetime.utcnow()
    result = await db.chat_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$push": {"messages": message},
            "$set":  {"updated_at": datetime.utcnow()},
        }
    )
    return result.modified_count > 0


async def get_session(session_id: str) -> Optional[dict]:
    db  = get_db()
    doc = await db.chat_sessions.find_one({"_id": ObjectId(session_id)})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

async def delete_chat_session(session_id: str, user_id: str) -> bool:
    db = get_db()
    result = await db.chat_sessions.delete_one({"_id": ObjectId(session_id), "user_id": user_id})
    return result.deleted_count > 0


async def get_session_history(session_id: str, last_n: int = 10) -> List[dict]:
   
    doc = await get_session(session_id)
    if not doc:
        return []
    messages = doc.get("messages", [])
    return messages[-last_n:]


async def get_user_sessions(user_id: str, limit: int = 20) -> List[dict]:
    db       = get_db()
    cursor   = db.chat_sessions.find(
        {"user_id": user_id}
    ).sort("updated_at", -1).limit(limit)
    sessions = await cursor.to_list(limit)
    for s in sessions:
        s["_id"] = str(s["_id"])
    return sessions




async def save_weekly_plan(user_id: str, plan: dict) -> str:
    db  = get_db()
    plan["user_id"]    = user_id
    plan["created_at"] = datetime.utcnow()
    result = await db.weekly_plans.insert_one(plan)
    return str(result.inserted_id)


async def get_current_plan(user_id: str) -> Optional[dict]:

    db  = get_db()
    doc = await db.weekly_plans.find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    )
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


async def get_all_plans(user_id: str) -> List[dict]:
    db     = get_db()
    cursor = db.weekly_plans.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(10)
    plans  = await cursor.to_list(10)
    for p in plans:
        p["_id"] = str(p["_id"])
    return plans




async def log_progress(user_id: str, data: dict) -> str:
    db  = get_db()
    data["user_id"] = user_id
    if "date" not in data:
        data["date"] = datetime.utcnow()
    result = await db.progress_logs.insert_one(data)
    return str(result.inserted_id)


async def get_progress_last_n_days(user_id: str, days: int = 7) -> List[dict]:
    db        = get_db()
    since     = datetime.utcnow() - timedelta(days=days)
    cursor    = db.progress_logs.find(
        {"user_id": user_id, "date": {"$gte": since}}
    ).sort("date", -1)
    logs = await cursor.to_list(days)
    for l in logs:
        l["_id"] = str(l["_id"])
    return logs


async def get_weight_history(user_id: str, days: int = 30) -> List[dict]:

    db    = get_db()
    since = datetime.utcnow() - timedelta(days=days)
    cursor = db.progress_logs.find(
        {"user_id": user_id, "date": {"$gte": since}, "weight_kg": {"$exists": True}},
        {"date": 1, "weight_kg": 1}
    ).sort("date", 1)
    logs = await cursor.to_list(days)
    for l in logs:
        l["_id"] = str(l["_id"])
    return logs




async def search_exercises(
    muscle:    Optional[str] = None,
    body_part: Optional[str] = None,
    equipment: Optional[str] = None,
    limit:     int = 5
) -> List[dict]:
  
    db    = get_db()
    query = {}

    if muscle:
        query["$or"] = [
            {"targetMuscles":    {"$regex": muscle, "$options": "i"}},
            {"secondaryMuscles": {"$regex": muscle, "$options": "i"}},
            {"bodyParts":        {"$regex": muscle, "$options": "i"}},
            {"name":             {"$regex": muscle, "$options": "i"}},
        ]
    if body_part:
        query["bodyParts"] = {"$regex": body_part, "$options": "i"}
    if equipment:
        query["equipments"] = {"$regex": equipment, "$options": "i"}

    cursor = db.exercises.find(query).limit(limit)
    exs    = await cursor.to_list(limit)
    for e in exs:
        e["_id"] = str(e["_id"])
    return exs


async def get_exercise_by_id(exercise_id: str) -> Optional[dict]:
    db  = get_db()
    doc = await db.exercises.find_one({"exerciseId": exercise_id})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc



async def save_feedback(feedback: dict) -> str:
    db       = get_db()
    feedback["created_at"] = datetime.utcnow()
    result   = await db.feedback_logs.insert_one(feedback)
    return str(result.inserted_id)


async def get_positive_feedbacks(limit: int = 100) -> List[dict]:
  
    db     = get_db()
    cursor = db.feedback_logs.find(
        {"rating": 1}
    ).sort("created_at", -1).limit(limit)
    docs = await cursor.to_list(limit)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs



async def save_training_sample(data: dict) -> str:
    db  = get_db()
    data["created_at"] = datetime.utcnow()
    result = await db.training_data.insert_one(data)
    return str(result.inserted_id)


async def get_training_dataset(category: Optional[str] = None, min_quality: float = 0.7) -> List[dict]:
    db    = get_db()
    query = {"quality_score": {"$gte": min_quality}}
    if category:
        query["category"] = category
    cursor = db.training_data.find(query).sort("quality_score", -1)
    docs   = await cursor.to_list(None)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs



async def create_schedule_item(user_id: str, item: dict) -> dict:
    db = get_db()
    item["user_id"] = user_id
    item["created_at"] = datetime.utcnow()
    result = await db.user_schedules.insert_one(item)
    item["id"] = str(result.inserted_id)
    item.pop("_id", None)
    return item

async def get_user_schedule(user_id: str) -> List[dict]:
    db = get_db()
    cursor = db.user_schedules.find({"user_id": user_id})
    items = await cursor.to_list(None)
    for i in items:
        i["id"] = str(i.pop("_id"))
    return items

async def update_schedule_item(item_id: str, user_id: str, data: dict) -> bool:
    db = get_db()
    result = await db.user_schedules.update_one(
        {"_id": ObjectId(item_id), "user_id": user_id},
        {"$set": data}
    )
    return result.modified_count > 0

async def delete_schedule_item(item_id: str, user_id: str) -> bool:
    db = get_db()
    result = await db.user_schedules.delete_one(
        {"_id": ObjectId(item_id), "user_id": user_id}
    )
    return result.deleted_count > 0


# ──────────────────────────────────────────────
# Wearable Integration CRUD (Strava / Fitbit)
# ──────────────────────────────────────────────

async def upsert_wearable_connection(user_id: str, provider: str, token_data: dict) -> dict:
    db = get_db()
    now = datetime.utcnow()
    update_fields = {
        "provider":          provider,
        "provider_user_id":  token_data.get("provider_user_id", ""),
        "access_token":      token_data.get("access_token"),
        "refresh_token":     token_data.get("refresh_token"),
        "token_expires_at":  token_data.get("expires_at"),
        "connected":         True,
        "last_sync":         now,
        "updated_at":        now,
    }
    await db.wearable_connections.update_one(
        {"user_id": user_id, "provider": provider},
        {"$set": update_fields, "$setOnInsert": {"created_at": now}},
        upsert=True,
    )
    doc = await db.wearable_connections.find_one({"user_id": user_id, "provider": provider})
    if doc:
        doc["id"] = str(doc.pop("_id"))
    return doc

async def get_wearable_connection(user_id: str, provider: Optional[str] = None) -> Optional[dict]:
    db = get_db()
    query = {"user_id": user_id}
    if provider:
        query["provider"] = provider
        query["connected"] = True
    doc = await db.wearable_connections.find_one(query)
    if doc:
        doc["id"] = str(doc.pop("_id"))
    return doc

async def get_all_wearable_connections(user_id: str) -> list:
    db = get_db()
    cursor = db.wearable_connections.find({"user_id": user_id, "connected": True})
    docs = await cursor.to_list(10)
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs

async def update_wearable_tokens(user_id: str, provider: str, token_data: dict) -> bool:
    db = get_db()
    result = await db.wearable_connections.update_one(
        {"user_id": user_id, "provider": provider},
        {"$set": {
            "access_token":     token_data.get("access_token"),
            "refresh_token":    token_data.get("refresh_token"),
            "token_expires_at": token_data.get("expires_at"),
            "updated_at":       datetime.utcnow(),
        }},
    )
    return result.modified_count > 0

async def disconnect_wearable(user_id: str, provider: str) -> bool:
    db = get_db()
    result = await db.wearable_connections.update_one(
        {"user_id": user_id, "provider": provider},
        {"$set": {"connected": False}},
    )
    return result.modified_count > 0

async def delete_wearable_connection(user_id: str, provider: str) -> bool:
    db = get_db()
    result = await db.wearable_connections.delete_one(
        {"user_id": user_id, "provider": provider}
    )
    return result.deleted_count > 0

async def upsert_wearable_activity_log(user_id: str, normalized: dict) -> str:
    db = get_db()
    now = datetime.utcnow()
    provider = normalized.get("provider", "")
    provider_activity_id = normalized.get("provider_activity_id", "")

    if provider_activity_id:
        existing = await db.wearable_activity_logs.find_one({
            "user_id": user_id,
            "provider": provider,
            "provider_activity_id": provider_activity_id,
        })
        if existing:
            await db.wearable_activity_logs.update_one(
                {"_id": existing["_id"]},
                {"$set": {**normalized, "user_id": user_id, "created_at": now}},
            )
            return str(existing["_id"])

    normalized["user_id"] = user_id
    normalized["created_at"] = now
    result = await db.wearable_activity_logs.insert_one(normalized)
    return str(result.inserted_id)

async def get_wearable_activity_logs(user_id: str, days: int = 7, provider: Optional[str] = None) -> list:
    db = get_db()
    query = {"user_id": user_id}
    if provider:
        query["provider"] = provider
    cursor = db.wearable_activity_logs.find(query).sort("date", -1).limit(days * 5)
    logs = await cursor.to_list(days * 5)
    for l in logs:
        l["id"] = str(l.pop("_id"))
    return logs

async def get_wearable_activity_logs_since(user_id: str, since_date: str, provider: str) -> list:
    db = get_db()
    cursor = db.wearable_activity_logs.find({
        "user_id": user_id,
        "provider": provider,
        "date": {"$gte": since_date},
    }).sort("date", -1)
    logs = await cursor.to_list(200)
    for l in logs:
        l["id"] = str(l.pop("_id"))
    return logs
