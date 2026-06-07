
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, DESCENDING
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME",   "fitness_chatbot")

client = None
db     = None

print("MONGO_URL =", os.getenv("MONGO_URL"))

async def connect_db():
    global client, db
    # Use TLS only for Atlas connections (mongodb+srv://)
    if "mongodb+srv://" in MONGO_URL or "ssl=true" in MONGO_URL.lower() or "tls=true" in MONGO_URL.lower():
        client = AsyncIOMotorClient(MONGO_URL, tlsCAFile=certifi.where())
    else:
        client = AsyncIOMotorClient(MONGO_URL)
    db     = client[DB_NAME]
    await create_indexes()
    print(f" MongoDB connecté : {DB_NAME}")


async def disconnect_db():
    if client:
        client.close()
        print("MongoDB déconnecté")


async def create_indexes():
    """Crée tous les index nécessaires"""

    # users
    await db.users.create_indexes([
        IndexModel([("email", ASCENDING)], unique=True),
    ])

    # user_profiles
    await db.user_profiles.create_indexes([
        IndexModel([("user_id", ASCENDING)], unique=True),
    ])

    # chat_sessions
    await db.chat_sessions.create_indexes([
        IndexModel([("user_id", ASCENDING)]),
        IndexModel([("created_at", DESCENDING)]),
    ])

    # weekly_plans
    await db.weekly_plans.create_indexes([
        IndexModel([("user_id", ASCENDING), ("week_start", DESCENDING)]),
    ])

    # progress_logs
    await db.progress_logs.create_indexes([
        IndexModel([("user_id", ASCENDING), ("date", DESCENDING)]),
    ])

    # exercises 
    await db.exercises.create_indexes([
        IndexModel([("exerciseId", ASCENDING)], unique=True),
        IndexModel([("targetMuscles", ASCENDING)]),
        IndexModel([("bodyParts", ASCENDING)]),
        IndexModel([("equipments", ASCENDING)]),
    ])

    # feedback_logs 
    await db.feedback_logs.create_indexes([
        IndexModel([("user_id", ASCENDING)]),
        IndexModel([("message_id", ASCENDING)]),
    ])

    # training_data 
    await db.training_data.create_indexes([
        IndexModel([("category", ASCENDING)]),
        IndexModel([("quality_score", DESCENDING)]),
    ])

    print(" Index MongoDB créés")


def get_db():
    return db
