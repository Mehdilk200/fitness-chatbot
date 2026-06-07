import os
from google import genai
from google.genai import types  

API_KEY = os.getenv("GEMINI_API_KEY")
_model_name = os.getenv("LLM_MODEL", "gemini-3.5-flash-lite")

client = None
if API_KEY:
   
    client = genai.Client(api_key=API_KEY).aio
else:
    print("WARNING: GEMINI_API_KEY is not set.")

async def generate_response(prompt: str, system_instruction: str = None) -> str:
    """
    Génère une réponse via Gemini en utilisant le prompt fourni.
    """
    if not client:
        return "Je suis désolé, le service IA n'est pas configuré. Veuillez définir GEMINI_API_KEY."

    try:
        
        config = None
        if system_instruction:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction
            )

  
        response = await client.models.generate_content(
            model=_model_name,
            contents=prompt,
            config=config
        )
        
        return response.text
        
    except Exception as e:
        print(f"LLM Error: {e}")
        return "Une erreur interne s'est produite lors de la génération de la réponse."

async def format_history(history_dicts: list) -> str:
    """Format history for context inclusion."""
    formatted = []
    for msg in history_dicts:
        role = "User" if msg["role"] == "user" else "Assistant"
        formatted.append(f"{role}: {msg['content']}")
    return "\n".join(formatted)