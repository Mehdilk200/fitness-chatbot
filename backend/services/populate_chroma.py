import asyncio
import json
import os
from dotenv import load_dotenv

load_dotenv()

from db.mongodb import get_db, connect_db, disconnect_db
from db.chroma import get_chroma_collection

async def main():
    await connect_db()
    db = get_db()
    
    collection = get_chroma_collection("exercises")
    
    print("Fetching exercises from MongoDB...")
    cursor = db.exercises.find({})
    exercises = await cursor.to_list(None)
    print(f"Found {len(exercises)} exercises.")
    
    docs = []
    metadatas = []
    ids = []
    
    for ex in exercises:
        name = ex.get("name", "Unknown")
        muscles = ", ".join(ex.get("targetMuscles", []))
        eq = ", ".join(ex.get("equipments", []))
        body = ", ".join(ex.get("bodyParts", []))
        
        # We create a rich text document for embedding
        doc_text = f"Exercise Name: {name}. Target Muscles: {muscles}. Body Parts: {body}. Equipment needed: {eq}."
        
        docs.append(doc_text)
        metadatas.append({
            "name": name,
            "targetMuscles": muscles,
            "equipments": eq,
            "gifUrl": ex.get("gifUrl", "")
        })
        ids.append(str(ex["_id"]))
        
    print("Adding to ChromaDB (this might take a minute as it generates embeddings)...")
    
    # Process in batches to avoid overwhelming memory
    batch_size = 100
    for i in range(0, len(docs), batch_size):
        batch_docs = docs[i:i+batch_size]
        batch_metas = metadatas[i:i+batch_size]
        batch_ids = ids[i:i+batch_size]
        
        collection.add(
            documents=batch_docs,
            metadatas=batch_metas,
            ids=batch_ids
        )
        print(f"Inserted batch {i//batch_size + 1}")
        
    print("Successfully populated ChromaDB!")
    
    await disconnect_db()

if __name__ == "__main__":
    asyncio.run(main())
