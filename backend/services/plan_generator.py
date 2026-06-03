import json
from services.llm_service import generate_response
from services.calculator_service import calculate_bmr, calculate_tdee, get_caloric_target, calculate_macros

async def generate_weekly_plan(user_profile: dict, language: str = "fr") -> str:
    """
    Génère un programme sportif J1 à J7.
    """
    bmr = calculate_bmr(user_profile["weight_kg"], user_profile["height_cm"], user_profile["age"], user_profile["gender"])
    tdee = calculate_tdee(bmr, user_profile.get("days_per_week", 3))
    target_cals = get_caloric_target(tdee, user_profile["goal"])
    macros = calculate_macros(user_profile["weight_kg"], target_cals, user_profile["goal"])

    prompt = f"""
    Crée un programme d'entraînement sur 7 jours pour un profil avec:
    - Objectif: {user_profile['goal']}
    - Niveau: {user_profile.get('level', 'débutant')}
    - Équipement: {user_profile.get('equipment', 'salle')}
    - Jours par semaine d'entraînement souhaité: {user_profile.get('days_per_week', 3)} jours.
    
    Donne un programme réparti du Lundi au Dimanche avec les zones ciblées.
    Ensuite, ajoute ses macros cibles: Calories={target_cals}, Protéines={macros['protein_g']}g, Glucides={macros['carbs_g']}g, Lipides={macros['fat_g']}g.
    
    Réponds en langue: {language}. Sois structuré avec des emojis.
    """
    
    system_instruction = "Tu es un coach sportif professionnel. Retourne un programme clair structuré par jour (J1 à J7) avec mention des repos."
    
    return await generate_response(prompt, system_instruction)
