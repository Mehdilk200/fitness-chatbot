

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    if gender.lower() == "homme":
        return 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age)
    else:  
        return 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age)

def calculate_tdee(bmr: float, days_per_week: int) -> float:
    if days_per_week <= 1:
        multiplier = 1.2    
    elif days_per_week <= 3:
        multiplier = 1.375  
    elif days_per_week <= 5:
        multiplier = 1.55   
    elif days_per_week <= 6:
        multiplier = 1.725  
    else:
        multiplier = 1.9    
    return bmr * multiplier

def get_caloric_target(tdee: float, goal: str) -> int:
    target = tdee
    if goal == "perte_poids":
        target -= 500  
    elif goal == "musculation":
        target += 300  
    return int(target)

def calculate_macros(weight_kg: float, calories: int, goal: str) -> dict:
    if goal == "perte_poids":
        protein_g = weight_kg * 2.2
        fat_g = weight_kg * 0.9
    elif goal == "musculation":
        protein_g = weight_kg * 2.0
        fat_g = weight_kg * 1.0
    else:
        protein_g = weight_kg * 1.8
        fat_g = weight_kg * 1.0
        
    protein_cals = protein_g * 4.0
    fat_cals = fat_g * 9.0
    
    carb_cals = max(0, calories - protein_cals - fat_cals)
    carbs_g = carb_cals / 4.0

    return {
        "protein_g": round(protein_g, 1),
        "fat_g": round(fat_g, 1),
        "carbs_g": round(carbs_g, 1)
    }

def process_nutrition_intent(profile: dict, entities: dict) -> dict:
    """
    Retourne l'analyse calorique complète pour le contexte LLM.
    """
    bmr = calculate_bmr(profile["weight_kg"], profile["height_cm"], profile["age"], profile["gender"])
    tdee = calculate_tdee(bmr, profile.get("days_per_week", 3))
    
    goal = entities.get("goal") or profile["goal"]
    target_cals = get_caloric_target(tdee, goal)
    
    macros = calculate_macros(profile["weight_kg"], target_cals, goal)
    
    return {
        "bmr": int(bmr),
        "tdee": int(tdee),
        "target_calories": target_cals,
        "goal_applied": goal,
        "macros": macros
    }
