import json
from typing import List, Dict
from routes.crud import search_exercises

async def retrieve_exercises(muscle_group: str = None, equipment: str = None, limit: int = 3) -> List[Dict]:
    """Retrieve exercises from MongoDB."""
    return await search_exercises(muscle=muscle_group, equipment=equipment, limit=limit)

def format_rag_context(exercises: List[Dict]) -> str:
    """Formate les exercices récupérés en texte pour le LLM."""
    if not exercises:
        return "Aucun exercice spécifique trouvé dans la base de données."

    context_parts = []
    for ex in exercises:
        name = ex.get("name", "Exercice inconnu")
        muscle = ", ".join(ex.get("targetMuscles", []))
        instructions = " ".join(ex.get("instructions", []))
        context_parts.append(f"- Nom: {name}\n  Muscle cible: {muscle}\n  Instructions: {instructions}")
    return "\n\n".join(context_parts)
