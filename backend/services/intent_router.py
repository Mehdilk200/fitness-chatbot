

import re
from dataclasses import dataclass
from enum import Enum
from typing import Optional




class Intent(str, Enum):
    MUSCULATION   = "musculation"    
    NUTRITION     = "nutrition"      
    PLANNING      = "planning"       
    CALORIES      = "calories"       
    PROGRESS      = "progress"       
    CARDIO        = "cardio"         
    GENERAL       = "general"        
    GREETING      = "greeting"       
    UNKNOWN       = "unknown"        

@dataclass
class IntentResult:
    intent: Intent
    confidence: float          
    language: str              
    entities: dict             
    original_message: str

INTENT_KEYWORDS = {

    Intent.MUSCULATION: {
        "ar":     ["تمرين", "عضلة", "بايسبس", "تراي", "صدر", "ظهر", "كتف", "ساق", "بطن", "رياضة", "تدريب", "حديد"],
        "darija": ["tmrin", "3adla", "biceps", "triceps", "sder", "dher", "ktef", "rjel", "karch", "riyada", "tadrib", "hdid", "exercice"],
        "fr":     ["exercice", "muscle", "biceps", "triceps", "poitrine", "dos", "épaule", "jambe", "abdos", "entraînement", "musculation", "séance", "haltère", "barre", "pec", "quad", "mollet"],
        "en":     ["exercise", "muscle", "workout", "bicep", "tricep", "chest", "back", "shoulder", "leg", "abs", "training", "lift", "bench", "squat", "deadlift", "rep", "set"],
    },

    Intent.NUTRITION: {
        "ar":     ["أكل", "غذاء", "بروتين", "وجبة", "طعام", "تغذية", "كربوهيدرات", "دهون", "فيتامين"],
        "darija": ["makla", "protéine", "wjba", "t3am", "tghdhiya", "glucides", "lipides", "vitamin"],
        "fr":     ["manger", "alimentation", "protéine", "repas", "nourriture", "nutrition", "glucide", "lipide", "vitamine", "régime", "diète", "aliment", "menu", "recette"],
        "en":     ["eat", "food", "protein", "meal", "nutrition", "carb", "fat", "vitamin", "diet", "macro", "nutrient"],
    },

    Intent.CALORIES: {
        "ar":     ["سعرات", "كالوري", "وزن", "حرق", "دهون", "رجيم", "نزول وزن", "تخسيس"],
        "darija": ["calories", "wzen", "hrq", "dhn", "régime", "nzol wzen", "tkhsis", "kilo"],
        "fr":     ["calorie", "kcal", "poids", "brûler", "graisse", "perte de poids", "maigrir", "mincir", "bmi", "imc", "métabolisme", "tdee", "bmr"],
        "en":     ["calorie", "kcal", "weight", "burn", "fat", "lose weight", "bmi", "metabolism", "tdee", "bmr", "deficit"],
    },

    Intent.PLANNING: {
        "ar":     ["برنامج", "خطة", "أسبوع", "جدول", "يوم", "أيام", "روتين"],
        "darija": ["program", "khtta", "sbi3", "jdwl", "nhar", "iyam", "routine", "planning"],
        "fr":     ["programme", "plan", "semaine", "planning", "routine", "jour", "jours", "calendrier", "schedule", "hebdomadaire"],
        "en":     ["program", "plan", "week", "schedule", "routine", "day", "days", "split"],
    },

    Intent.PROGRESS: {
        "ar":     ["تقدم", "نتائج", "قياسات", "تتبع", "سجل", "إحصائيات"],
        "darija": ["ta9adom", "nta2ij", "9iyasat", "ttb3", "sjl", "stats"],
        "fr":     ["progrès", "résultats", "mesures", "suivi", "historique", "statistiques", "évolution", "bilan"],
        "en":     ["progress", "results", "measurements", "track", "history", "stats", "log"],
    },

    Intent.CARDIO: {
        "ar":     ["كارديو", "جري", "سباحة", "دراجة", "لياقة قلبية", "تحمل", "ركض"],
        "darija": ["cardio", "jri", "sb7a", "draja", "t7aml", "running"],
        "fr":     ["cardio", "course", "natation", "vélo", "endurance", "footing", "marche", "hiit", "tapis"],
        "en":     ["cardio", "run", "swim", "bike", "endurance", "jogging", "hiit", "treadmill", "cycling"],
    },

    Intent.GREETING: {
        "ar":     ["مرحبا", "أهلا", "السلام عليكم", "صباح الخير", "مساء الخير", "شكرا", "وداعا"],
        "darija": ["salam", "labas", "ahla", "sbah lkhir", "msa lkhir", "chokran", "kifash"],
        "fr":     ["bonjour", "bonsoir", "salut", "merci", "au revoir", "bonne nuit", "coucou"],
        "en":     ["hello", "hi", "hey", "thanks", "thank you", "bye", "goodbye", "good morning"],
    },
}


def detect_language(text: str) -> str:

    text_lower = text.lower().strip()
    words = re.findall(r'\b\w+\b', text_lower)

    arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text))
    if arabic_chars > len(text) * 0.25:
        return "ar"

    darija_strong = [
        "3tini", "3ndek", "3lash", "ta9adomi", "ta9adom", "bghit", "bghiti",
        "nkhes", "nchof", "khasni", "khoya", "labas", "safi", "daba", "bach",
        "mzyan", "bzzaf", "walo", "nhar", "sbi3", "chhal", "nakol", "nhre9",
        "wzen", "kilo", "tmrin", "rjel", "karch", "sder", "dhn", "9lb"
    ]
    
    darija_count = sum(1 for w in darija_strong if w in text_lower)
    if darija_count >= 1:
        return "darija"
    french_strong = [
        "je", "tu", "il", "elle", "nous", "vous", "les", "des", "une", "est",
        "pour", "avec", "dans", "sur", "moi", "mon", "ma", "mes", "ton", "ta",
        "ses", "notre", "votre", "leur", "qui", "que", "quoi", "combien",
        "comment", "pourquoi", "bonjour", "bonsoir", "merci", "crée", "donne",
        "montre", "calcule", "fais", "faire", "avoir", "être", "veux", "veut"
    ]
    
    french_count = sum(1 for w in french_strong if w in words)
    if french_count >= 1:
        return "fr"
    return "en"

def extract_entities(text: str, intent: Intent) -> dict:

    entities = {}
    text_lower = text.lower()

    day_patterns = [
        r'(\d+)\s*(?:jours?|days?|أيام|نهار|ايام)',
        r'(?:sur|pendant|for|خلال)\s*(\d+)',
    ]
    for pattern in day_patterns:
        match = re.search(pattern, text_lower)
        if match:
            entities["days"] = int(match.group(1))
            break
        
    weight_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:kg|kilo|كيلو)', text_lower)
    if weight_match:
        entities["weight_kg"] = float(weight_match.group(1))
    muscle_map = {
        "chest": ["chest", "poitrine", "pec", "sder", "صدر"],
        "back":  ["back", "dos", "dher", "ظهر", "lats", "dorsaux"],
        "legs":  ["leg", "jambe", "rjel", "ساق", "quad", "hamstring", "mollet"],
        "shoulders": ["shoulder", "épaule", "ktef", "كتف", "delt"],
        "arms":  ["arm", "bras", "bicep", "tricep", "dhira3", "ذراع"],
        "abs":   ["abs", "abdos", "abdomen", "karch", "بطن", "core"],
        "glutes":["glute", "fessier", "fesse", "masta", "مؤخرة"],
    }
    for muscle_group, keywords in muscle_map.items():
        if any(kw in text_lower for kw in keywords):
            entities["muscle_group"] = muscle_group
            break

    level_map = {
        "débutant":      ["débutant", "beginner", "mbtdi", "مبتدئ", "nouveau", "new"],
        "intermédiaire": ["intermédiaire", "intermediate", "mtwst", "متوسط"],
        "avancé":        ["avancé", "advanced", "mtqdm", "متقدم", "expert"],
    }
    for level, keywords in level_map.items():
        if any(kw in text_lower for kw in keywords):
            entities["level"] = level
            break

    goal_map = {
        "perte_poids":  ["perte", "maigrir", "mincir", "lose", "nzol", "تخسيس", "نزول"],
        "musculation":  ["muscle", "prendre", "gain", "zid", "زيادة", "كتلة"],
        "maintien":     ["maintien", "maintain", "tfadh", "حافظ"],
    }
    for goal, keywords in goal_map.items():
        if any(kw in text_lower for kw in keywords):
            entities["goal"] = goal
            break

    return entities

def classify_intent(message: str) -> IntentResult:
    
    language = detect_language(message)
    message_lower = message.lower().strip()
    words = re.findall(r'\b\w+\b', message_lower)

    greeting_exact = [
        "bonjour", "bonsoir", "salut", "hello", "hi", "hey", "coucou",
        "salam", "labas", "ahla", "merci", "thanks", "bye", "مرحبا", "أهلا"
    ]
    if len(words) <= 2 and any(g in message_lower for g in greeting_exact):
        return IntentResult(
            intent=Intent.GREETING,
            confidence=1.0,
            language=language,
            entities={},
            original_message=message,
        )

    cardio_exact = ["cardio", "كارديو", "hiit", "jogging", "running", "treadmill"]
    if any(c in message_lower for c in cardio_exact):
        return IntentResult(
            intent=Intent.CARDIO,
            confidence=1.0,
            language=language,
            entities=extract_entities(message, Intent.CARDIO),
            original_message=message,
        )

    nutrition_exact = ["protéine", "protein", "بروتين", "макро", "macro", "glucide", "lipide"]
    planning_words  = ["programme", "plan", "semaine", "برنامج", "jours", "planning"]
    if any(n in message_lower for n in nutrition_exact) and not any(p in message_lower for p in planning_words):
        return IntentResult(
            intent=Intent.NUTRITION,
            confidence=0.95,
            language=language,
            entities=extract_entities(message, Intent.NUTRITION),
            original_message=message,
        )

    scores = {intent: 0.0 for intent in Intent}

    for intent, lang_keywords in INTENT_KEYWORDS.items():
        
        all_keywords = []
        for kws in lang_keywords.values():
            all_keywords.extend(kws)

        matches = sum(1 for kw in all_keywords if kw.lower() in message_lower)

       
        first_words = message_lower.split()[:4]
        priority_matches = sum(
            1 for kw in all_keywords
            if any(kw.lower() in w for w in first_words)
        )

        scores[intent] = matches + (priority_matches * 0.5)

    
    best_intent = max(scores, key=scores.get)
    best_score  = scores[best_intent]


    if best_score == 0:
        best_intent = Intent.UNKNOWN

  
    total_score = sum(scores.values())
    confidence = (best_score / total_score) if total_score > 0 else 0.0
    confidence = min(confidence * 2, 1.0)  
    entities = extract_entities(message, best_intent)

    return IntentResult(
        intent=best_intent,
        confidence=round(confidence, 2),
        language=language,
        entities=entities,
        original_message=message,
    )


def route_to_service(result: IntentResult) -> dict:
   
    
    routing = {
        Intent.MUSCULATION: {
            "service":        "rag_service",
            "needs_profile":  True,
            "needs_history":  True,
            "context_needed": ["user_profile", "chat_history"],
            "description":    "Exercices musculation via RAG + exercises.json",
        },
        Intent.NUTRITION: {
            "service":        "llm_service",
            "needs_profile":  True,
            "needs_history":  False,
            "context_needed": ["user_profile"],
            "description":    "Conseils nutrition + calcul macros",
        },
        Intent.CALORIES: {
            "service":        "calculator_service",
            "needs_profile":  True,
            "needs_history":  False,
            "context_needed": ["user_profile"],
            "description":    "Calcul BMR/TDEE/déficit calorique",
        },
        Intent.PLANNING: {
            "service":        "plan_generator",
            "needs_profile":  True,
            "needs_history":  False,
            "context_needed": ["user_profile"],
            "description":    "Génération programme J1→J7",
        },
        Intent.PROGRESS: {
            "service":        "progress_service",
            "needs_profile":  True,
            "needs_history":  True,
            "context_needed": ["user_profile", "progress_logs"],
            "description":    "Affichage + analyse progrès",
        },
        Intent.CARDIO: {
            "service":        "llm_service",
            "needs_profile":  True,
            "needs_history":  False,
            "context_needed": ["user_profile"],
            "description":    "Conseils cardio + HIIT via LLM",
        },
        Intent.GENERAL: {
            "service":        "llm_service",
            "needs_profile":  False,
            "needs_history":  True,
            "context_needed": ["chat_history"],
            "description":    "Question générale fitness via LLM",
        },
        Intent.GREETING: {
            "service":        "direct_response",
            "needs_profile":  False,
            "needs_history":  False,
            "context_needed": [],
            "description":    "Réponse directe sans LLM",
        },
        Intent.UNKNOWN: {
            "service":        "llm_service",
            "needs_profile":  False,
            "needs_history":  True,
            "context_needed": ["chat_history"],
            "description":    "Fallback → LLM général",
        },
    }

    route = routing[result.intent].copy()
    route["intent"]    = result.intent.value
    route["language"]  = result.language
    route["entities"]  = result.entities
    route["confidence"]= result.confidence
    return route