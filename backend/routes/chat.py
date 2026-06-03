from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
import os
import uuid
import shutil
from routes.auth import get_current_user
from db.schemas import ChatRequest, ChatResponse
from services.intent_router import classify_intent, route_to_service
from routes.crud import get_profile, add_message, create_session, get_session_history, get_progress_last_n_days
from services.llm_service import generate_response, format_history
from services.rag_services import retrieve_exercises, format_rag_context
from services.calculator_service import process_nutrition_intent
from services.plan_generator import generate_weekly_plan
from services.progress_service import analyze_progress

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    session_id = request.session_id
    
    if not session_id:
        session_id = await create_session(user_id)

    # 1. Classification
    classification = classify_intent(request.message)
    route_info = route_to_service(classification)
    
    # 2. Add user message to history
    user_msg_doc = {
        "role": "user",
        "content": request.message,
        "intent": route_info["intent"],
        "language": route_info["language"]
    }
    await add_message(session_id, user_msg_doc)

    # 3. Gérer le contexte (Profile, History)
    profile = None
    if route_info["needs_profile"]:
        profile = await get_profile(user_id)
        if not profile:
            # Si le profil manque et on en a besoin, on bypass l'intent
            reply = "Veuillez compléter votre profil (poids, objectif...) pour que je puisse vous aider correctement."
            await add_assistant_message(session_id, reply, "fallback")
            return ChatResponse(response=reply, session_id=session_id, intent="unknown", language="fr")

    history = []
    if route_info["needs_history"]:
        history = await get_session_history(session_id)
        
    # 4. Exécuter le service
    service_name = route_info["service"]
    reply_text = ""
    gif_url = None
    
    if service_name == "direct_response":
        # Greeting — réponse dans la langue détectée
        greetings = {
            "fr":     "Bonjour ! Je suis FitBot, votre coach IA. Comment puis-je vous aider aujourd'hui ?",
            "en":     "Hello! I'm FitBot, your AI coach. How can I help you today?",
            "ar":     "مرحباً! أنا FitBot، مدربك الذكي. كيف يمكنني مساعدتك اليوم؟",
            "darija": "Salam! Ana FitBot, coach dyalk. Kifash nqder n3awnek?",
        }
        reply_text = greetings.get(route_info["language"], greetings["fr"])
        
    elif service_name == "rag_service":
        muscle = classification.entities.get("muscle_group")
        eq = classification.entities.get("equipment")
        exercises = await retrieve_exercises(muscle_group=muscle, equipment=eq)
        context = format_rag_context(exercises)
        
        prompt = f"Le joueur demande: {request.message}\nContext exercices: {context}\nRéponds en {route_info['language']} en proposant ces exercices avec des instructions claires."
        if profile:
            prompt += f"\nAttention: Niveau {profile.get('level')}."
            
        reply_text = await generate_response(prompt, "Tu es un expert musculation. Utilise le contexte fourni pour donner des exercices.")
        
        
        if exercises and exercises[0].get("gifUrl"):
            gif_url = exercises[0]["gifUrl"]
            
    elif service_name == "calculator_service":
        calc_data = process_nutrition_intent(profile, classification.entities)
        prompt = f"L'utilisateur demande un calcul. J'ai calculé: BMR={calc_data['bmr']}, TDEE={calc_data['tdee']}, Cible={calc_data['target_calories']} kcal. Macros: {calc_data['macros']}."
        reply_text = await generate_response(f"{request.message}\n\nDonnes système: {prompt}", "Tu es expert en nutrition sportive. Résume les calculs caloriques gentiment.")
        
    elif service_name == "plan_generator":
        reply_text = await generate_weekly_plan(profile, language=route_info['language'])
        
    elif service_name == "progress_service":
        logs = await get_progress_last_n_days(user_id)
        reply_text = await analyze_progress(logs, profile, language=route_info['language'])
        
    elif service_name == "llm_service":
        context_str = await format_history(history[:-1])             
        prompt = f"Historique context:\n{context_str}\n\nNouvelle demande: {request.message}"
        sys_inst = "Tu es FitBot, un coach sportif amical."
        if profile:
            prompt += f"\\nRappel Profil: Objectif {profile['goal']}, {profile['weight_kg']}kg."
        reply_text = await generate_response(prompt, sys_inst)
        
    else:
        reply_text = "Je n'ai pas pu traiter votre demande."

    
    asst_msg_doc = {
        "role": "assistant",
        "content": reply_text,
        "service": service_name
    }
    await add_message(session_id, asst_msg_doc)

    return ChatResponse(
        response=reply_text,
        session_id=session_id,
        intent=route_info["intent"],
        language=route_info["language"],
        gif_url=gif_url
    )
@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    
    uploads_dir = os.path.join(os.getcwd(), "uploads")
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
    
    
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(uploads_dir, filename)
    
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"url": f"/uploads/{filename}"}

async def add_assistant_message(session_id: str, content: str, service: str):
    doc = {
        "role": "assistant",
        "content": content,
        "service": service
    }
    await add_message(session_id, doc)
