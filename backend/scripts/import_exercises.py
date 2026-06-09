import os
import sys
import json
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME",   "fitness_chatbot")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
GIFS_DIR = os.path.join(DATA_DIR, "gifts")

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

async def main():
    print(f"Connecting to {MONGO_URL} database: {DB_NAME}")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Load metadata
    equipments_data = load_json("equipments.json")
    muscles_data = load_json("muscles.json")
    body_parts_data = load_json("bodyParts.json")
    
    eq_list = [x["name"].lower() for x in equipments_data if "name" in x]
    mu_list = [x["name"].lower() for x in muscles_data if "name" in x]
    bp_list = [x["name"].lower() for x in body_parts_data if "name" in x]
    
    print(f"Loaded {len(eq_list)} equipments, {len(mu_list)} muscles, {len(bp_list)} body parts.")
    
    if not os.path.exists(GIFS_DIR):
        print(f"Error: GIFs directory not found at {GIFS_DIR}")
        return
        
    gif_files = [f for f in os.listdir(GIFS_DIR) if f.endswith(".gif")]
    print(f"Found {len(gif_files)} gif files.")
    
    exercises_to_insert = []
    
    for filename in gif_files:
        # e.g. "Dumbbell-Bench-Press.gif"
        raw_name = filename.replace(".gif", "")
        # Split by dash to analyze words, and replace dash with space for display
        name_display = raw_name.replace("-", " ")
        name_lower = name_display.lower()
        
        # Match equipments
        matched_eq = [eq for eq in eq_list if eq in name_lower]
        if not matched_eq and "bodyweight" in name_lower:
            matched_eq.append("body weight")
        elif not matched_eq:
            # Default to body weight if no equipment matched, but only if it sounds like bodyweight
            pass 
            
        # Match muscles
        matched_mu = [mu for mu in mu_list if mu in name_lower]
        
        # Match body parts
        matched_bp = [bp for bp in bp_list if bp in name_lower]
        
        doc = {
            "name": name_display,
            "exerciseId": raw_name,
            "gifUrl": f"/data/gifts/{filename}",  # Just an example path, can be served by fastapi static
            "targetMuscles": matched_mu,
            "secondaryMuscles": [],
            "bodyParts": matched_bp,
            "equipments": matched_eq,
            "instructions": ["Perform the exercise with correct form. Check the animation for details."]
        }
        exercises_to_insert.append(doc)
        
    if exercises_to_insert:
        # Clear existing collection first if we want a fresh start, or use bulk operations
        await db.exercises.delete_many({})
        print("Cleared existing exercises collection.")
        
        # Insert all
        await db.exercises.insert_many(exercises_to_insert)
        print(f"Successfully inserted {len(exercises_to_insert)} exercises into MongoDB.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
