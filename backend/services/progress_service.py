from services.llm_service import generate_response

async def analyze_progress(progress_logs: list, user_profile: dict, language: str = "fr") -> str:
    """
    Analyse les logs de progression et renvoie un retour constructif de coach.
    """
    if not progress_logs:
        return "Je ne vois aucun historique de progression pour le moment. Commencez par loguer votre poids et vos séances !"
        
    last_weight = progress_logs[0].get("weight_kg", user_profile["weight_kg"])
    initial_weight = user_profile["weight_kg"]
    
    trend = "stable"
    if last_weight < initial_weight:
        trend = "en baisse"
    elif last_weight > initial_weight:
        trend = "en hausse"
        
    logs_summary = []
    for log in progress_logs[:5]: # Take last 5 for context
        date_str = log['date'].strftime('%Y-%m-%d')
        w = log.get('weight_kg', 'N/A')
        c = log.get('calories_eaten', 'N/A')
        logs_summary.append(f"[{date_str}] Poids: {w}kg | Calories: {c}kcal")
        
    summary_text = "\n".join(logs_summary)
    
    prompt = f"""
    Profil initial: {user_profile['weight_kg']}kg, Objectif: {user_profile['goal']}.
    Poids actuel: {last_weight}kg (tendance: {trend}).
    
    Voici les derniers logs de sa semaine:
    {summary_text}
    
    Donne lui un feedback de coach sportif basé sur ces données. Sois encourageant et donne 1 conseil pratique.
    Réponds en langue: {language}.
    """
    
    system_instruction = "Tu es un dashboard vocal sportif. Donne une analyse concise de progression des logs de l'utilisateur."
    
    return await generate_response(prompt, system_instruction)
