

from datetime import datetime, timedelta
from typing import Optional, List
from bson import ObjectId
from db.mongodb import get_db



async def create_user(email: str, password_hash: str) -> dict:
    db  = get_db()
    doc = {
        "email":         email,
        "password_hash": password_hash,
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
    item["_id"] = str(result.inserted_id)
    return item

async def get_user_schedule(user_id: str) -> List[dict]:
    db = get_db()
    cursor = db.user_schedules.find({"user_id": user_id})
    items = await cursor.to_list(None)
    for i in items:
        i["_id"] = str(i["_id"])
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
