import os
import json
import logging
from typing import List, Dict, Optional
from bson import ObjectId
from routes.crud import search_exercises
from db.mongodb import get_db
from db.chroma import get_chroma_collection

# Config
CHROMA_ENABLED = os.getenv("CHROMA_ENABLED", "true").lower() == "true"
CHROMA_DISTANCE_THRESHOLD = float(os.getenv("CHROMA_DISTANCE_THRESHOLD", "0.6"))

# Debug logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [RAG] %(message)s")
logger = logging.getLogger("rag_services")


def _normalize_gif_url(raw_url: str) -> str:
    """Convert DB path /data/gifts/xxx.gif to frontend accessible /gifs/xxx.gif."""
    return raw_url.replace("/data/gifts/", "/gifs/")


async def retrieve_exercises(muscle_group: str = None, equipment: str = None, limit: int = 3) -> List[Dict]:
    """
    Retrieve exercises — tries ChromaDB semantic search first, falls back to MongoDB regex.
    Logs retrieval count, IDs, and source.
    """
    exercises = []
    source = "none"

    # Try ChromaDB vector search first
    if CHROMA_ENABLED:
        try:
            chroma_exercises = await search_chroma(muscle_group=muscle_group, equipment=equipment, limit=limit)
            if chroma_exercises:
                exercises = chroma_exercises
                source = "chromadb"
        except Exception as e:
            print(f"ChromaDB search failed, falling back to MongoDB: {e}")

    # Fallback to MongoDB if ChromaDB returned nothing or is disabled
    if not exercises and (muscle_group or equipment):
        # search_exercises now searches targetMuscles, secondaryMuscles, bodyParts, and name
        exercises = await search_exercises(muscle=muscle_group, equipment=equipment, limit=limit)
        source = "mongodb"

    # Debug logging
    ex_ids = [ex.get("exerciseId", str(ex.get("_id", "?"))) for ex in exercises]
    logger.info(f"SOURCE_SELECTED={source.upper()} | EXERCISE_COUNT={len(exercises)} | EXERCISE_IDS={ex_ids}")

    return exercises


async def search_chroma(muscle_group: str = None, equipment: str = None, limit: int = 3) -> List[Dict]:
    """Search exercises using ChromaDB vector similarity."""
    query_parts = []
    if muscle_group:
        query_parts.append(f"Target Muscles: {muscle_group}")
    if equipment:
        query_parts.append(f"Equipment needed: {equipment}")

    if not query_parts:
        return []

    query_text = ". ".join(query_parts)
    collection = get_chroma_collection("exercises")
    results = collection.query(
        query_texts=[query_text],
        n_results=limit,
        include=["metadatas", "distances"]
    )

    if not results or not results.get("ids") or not results["ids"][0]:
        return []

    exercises = []
    for i, doc_id in enumerate(results["ids"][0]):
        distance = results["distances"][0][i] if results.get("distances") else 0.0
        if distance > CHROMA_DISTANCE_THRESHOLD:
            continue
        metadata = results["metadatas"][0][i] if results.get("metadatas") else {}
        exercise = await get_exercise_by_mongodb_id(doc_id)
        if exercise:
            exercises.append(exercise)
        else:
            exercises.append({
                "exerciseId": doc_id,
                "name": metadata.get("name", "Unknown"),
                "targetMuscles": metadata.get("targetMuscles", "").split(", ") if metadata.get("targetMuscles") else [],
                "equipments": metadata.get("equipments", "").split(", ") if metadata.get("equipments") else [],
                "gifUrl": metadata.get("gifUrl", ""),
                "instructions": []
            })

    return exercises[:limit]


async def get_exercise_by_mongodb_id(doc_id: str) -> Optional[Dict]:
    """Look up an exercise in MongoDB by its _id (ObjectId)."""
    try:
        db = get_db()
        doc = await db.exercises.find_one({"_id": ObjectId(doc_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc
    except Exception as e:
        print(f"Error looking up exercise by _id {doc_id}: {e}")
        return None


def format_rag_context(exercises: List[Dict]) -> str:
    """Format exercises as rich text context for the LLM."""
    if not exercises:
        return "Aucun exercice spécifique trouvé dans la base de données."

    parts = []
    for ex in exercises:
        name = ex.get("name", "Exercice inconnu").title()
        muscle = ", ".join(ex.get("targetMuscles", [])).title()
        eq = ", ".join(ex.get("equipments", [])).title()
        body_parts = ", ".join(ex.get("bodyParts", [])).title()
        gif_url = _normalize_gif_url(ex.get("gifUrl", ""))
        instructions = " ".join(ex.get("instructions", []))

        parts.append(f"""
### {name}
* **Cible** : {muscle if muscle else 'Corps entier'}
* **Partie du corps** : {body_parts if body_parts else 'Général'}
* **Équipement** : {eq if eq else 'Poids du corps'}
* **Instructions** : {instructions}
![{name}]({gif_url})
""")

    return "\n".join(parts)


def build_exercise_response(exercises: List[Dict], language: str = "fr") -> str:
    """
    Build a structured response STRICTLY from database exercise fields.
    This is the authoritative source — NO LLM generation, NO hallucination allowed.

    Priority: Internal Exercise Database > RAG Documents > LLM (last resort)
    """
    if not exercises:
        return None  # Signal to caller that fallback is needed

    parts = []
    for i, ex in enumerate(exercises, 1):
        name = ex.get("name", "Exercice").title()
        target_muscles = ", ".join(ex.get("targetMuscles", []))
        secondary_muscles = ", ".join(ex.get("secondaryMuscles", []))
        body_parts = ", ".join(ex.get("bodyParts", []))
        equipments = ", ".join(ex.get("equipments", []))
        gif_url = _normalize_gif_url(ex.get("gifUrl", ""))
        instructions = ex.get("instructions", [])

        # Build exercise block using ONLY database fields
        block = f"""### {i}. {name}

"""

        # Target muscles
        if target_muscles:
            block += f"**Muscles ciblés :** {target_muscles}\n\n"

        # Secondary muscles
        if secondary_muscles:
            block += f"**Muscles secondaires :** {secondary_muscles}\n\n"

        # Equipment
        if equipments:
            block += f"**Équipement :** {equipments}\n\n"
        else:
            block += f"**Équipement :** Poids du corps\n\n"

        # Body parts
        if body_parts:
            block += f"**Partie du corps :** {body_parts}\n\n"

        if instructions:
            block += "**Instructions :**\n"
            for j, step in enumerate(instructions, 1):
                block += f"{j}. {step}\n"
            block += "\n"

        if gif_url:
            block += f"![{name}]({gif_url})\n"

        if i < len(exercises):
            block += "\n---\n"

        parts.append(block)

    return "\n".join(parts)
