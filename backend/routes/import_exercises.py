

import asyncio
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL     = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME       = os.getenv("DB_NAME",   "fitness_chatbot")
EXERCISES_FILE = os.getenv("EXERCISES_FILE", "../data/exercises.json")


async def import_exercises():
    client = AsyncIOMotorClient(MONGO_URL)
    db     = client[DB_NAME]

    with open(EXERCISES_FILE, "r", encoding="utf-8") as f:
        exercises = json.load(f)

    print(f" {len(exercises)} exercices trouvés dans le JSON")

    inserted = 0
    updated  = 0
    errors   = 0

    for ex in exercises:
        try:
            ex["imported_at"] = datetime.utcnow()

            result = await db.exercises.update_one(
                {"exerciseId": ex["exerciseId"]},
                {"$set": ex},
                upsert=True
            )

            if result.upserted_id:
                inserted += 1
            else:
                updated += 1

        except Exception as e:
            print(f" Erreur sur {ex.get('exerciseId', '?')}: {e}")
            errors += 1

    print(f"\n Import terminé:")
    print(f"   Insérés : {inserted}")
    print(f"   Mis à jour : {updated}")
    print(f"   Erreurs : {errors}")

    client.close()


if __name__ == "__main__":
    asyncio.run(import_exercises())
