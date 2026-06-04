import json
from typing import List, Dict
from routes.crud import search_exercises

async def retrieve_exercises(muscle_group: str = None, equipment: str = None, limit: int = 3) -> List[Dict]:
    """Retrieve exercises from MongoDB."""
    return await search_exercises(muscle=muscle_group, equipment=equipment, limit=limit)

def format_rag_context(exercises: List[Dict]) -> str:
    """Formate les exercices récupérés en texte enrichi pour le LLM."""
    if not exercises:
        return "Aucun exercice spécifique trouvé dans la base de données."

    context_parts = []
    for ex in exercises:
        name = ex.get("name", "Exercice inconnu").title()
        muscle = ", ".join(ex.get("targetMuscles", [])).title()
        eq = ", ".join(ex.get("equipments", [])).title()
        
        raw_url = ex.get("gifUrl", "")
        # Convert DB path '/data/gifts/xxx.gif' to frontend accessible '/gifs/xxx.gif'
        gif_url = raw_url.replace("/data/gifts/", "/gifs/")
        
        instructions = " ".join(ex.get("instructions", []))
        
        # We tell the LLM exactly how to format this exercise in Markdown
        context_parts.append(f"""
### {name}
* **Cible** : {muscle if muscle else 'Corps entier'}
* **Équipement** : {eq if eq else 'Poids du corps'}
* **Instructions** : {instructions}
![{name}]({gif_url})
""")
        
    return "\n".join(context_parts)
