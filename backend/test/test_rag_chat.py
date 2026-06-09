"""Test the full RAG exercise response as the chat endpoint would produce it."""

import asyncio
import os

os.environ.setdefault("HF_HOME", "/media/elmehdi-lakhial/USB_STORAGE22/.hf_cache")
os.environ.setdefault("CHROMA_ENABLED", "true")

import sys
sys.path.insert(0, os.path.dirname(__file__))

from db.chroma import get_chroma_collection
from services.rag_services import build_exercise_response


def simulate_chroma_search(muscle_group: str, equipment: str = None, limit: int = 3):
    """Simulate what search_chroma does, then build the response."""
    collection = get_chroma_collection("exercises")
    query_parts = []
    if muscle_group:
        query_parts.append(f"Target Muscles: {muscle_group}")
    if equipment:
        query_parts.append(f"Equipment needed: {equipment}")

    query_text = ". ".join(query_parts) if query_parts else muscle_group
    print(f"\n{'='*70}")
    print(f"Query: {query_text}")
    print(f"{'='*70}")

    results = collection.query(
        query_texts=[query_text],
        n_results=limit,
        include=["metadatas", "distances"]
    )

    if not results or not results.get("ids") or not results["ids"][0]:
        print("No results found.")
        return

    exercises = []
    for i, doc_id in enumerate(results["ids"][0]):
        distance = results["distances"][0][i]
        if distance > 0.6:
            continue
        metadata = results["metadatas"][0][i]
        ex = {
            "exerciseId": doc_id,
            "name": metadata.get("name", "Unknown"),
            "targetMuscles": metadata.get("targetMuscles", "").split(", ") if metadata.get("targetMuscles") else [],
            "secondaryMuscles": metadata.get("secondaryMuscles", "").split(", ") if metadata.get("secondaryMuscles") else [],
            "equipments": metadata.get("equipments", "").split(", ") if metadata.get("equipments") else [],
            "bodyParts": metadata.get("bodyParts", "").split(", ") if metadata.get("bodyParts") else [],
            "gifUrl": metadata.get("gifUrl", ""),
            "instructions": []
        }
        exercises.append(ex)
        print(f"  ✓ {ex['name']} (dist: {distance:.4f}) — {ex['targetMuscles']}")

    if exercises:
        print(f"\n{'-'*70}")
        print("BUILT EXERCISE RESPONSE:")
        print(f"{'-'*70}")
        response = build_exercise_response(exercises)
        print(response)
        print(f"\n{'='*70}")
        print(f"Total: {len(exercises)} exercises returned")
        print(f"{'='*70}")


if __name__ == "__main__":
    simulate_chroma_search("pectorals", "dumbbell")
    simulate_chroma_search("quadriceps")
    simulate_chroma_search("biceps")
    simulate_chroma_search("cardio")
