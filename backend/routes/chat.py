from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
import os
import uuid
import shutil
from routes.auth import get_current_user
from db.schemas import ChatRequest, ChatResponse, SupportRequest, SupportResponse
from services.intent_router import classify_intent, route_to_service, detect_language
from routes.crud import get_profile, add_message, create_session, get_session_history, get_progress_last_n_days, get_session
from services.llm_service import generate_response, format_history
from services.rag_services import retrieve_exercises, format_rag_context, build_exercise_response, _normalize_gif_url
from services.calculator_service import process_nutrition_intent
from services.plan_generator import generate_weekly_plan
from services.progress_service import analyze_progress
from routes.crud import get_user_sessions, delete_chat_session, update_session_title
from db.mongodb import get_db
from services.r2_upload import upload_to_r2
from bson import ObjectId

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
    if request.image_url:
        user_msg_doc["image_url"] = request.image_url
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
        first_name = current_user.get("first_name", "")
        name_part = f" {first_name} !" if first_name else " !"
        greetings = {
            "fr":     f"Bonjour{name_part} Je suis FitBot, votre coach IA. Comment puis-je vous aider aujourd'hui ?",
            "en":     f"Hello{name_part} I'm FitBot, your AI coach. How can I help you today?",
            "ar":     f"مرحباً{name_part} أنا FitBot، مدربك الذكي. كيف يمكنني مساعدتك اليوم؟",
            "darija": f"Salam{name_part} Ana FitBot, coach dyalk. Kifash nqder n3awnek?",
        }
        reply_text = greetings.get(route_info["language"], greetings["fr"])
        
    elif service_name == "rag_service":
        muscle = classification.entities.get("muscle_group")
        eq = classification.entities.get("equipment")
        exercises = await retrieve_exercises(muscle_group=muscle, equipment=eq)

       
        if exercises:
            # Priority 1: Build response STRICTLY from database fields
            # NO LLM generation — database content is ground truth
            reply_text = build_exercise_response(exercises, language=route_info["language"])
            print(f"[SOURCE] EXERCISE_DATABASE — {len(exercises)} exercises used as authoritative response")
        else:
            # Priority 2/3: No database results — use LLM as last resort
            print(f"[SOURCE] NO_DATABASE_RESULTS — falling back to LLM for: '{request.message}'")
            context = format_rag_context(exercises)
            prompt = f"""L'utilisateur demande: {request.message}

Aucun exercice correspondant n'a été trouvé dans la base de données interne.

Context: {context}

IMPORTANT - RÈGLES STRICTES:
1. N'INVENTE RIEN. Tu n'as pas trouvé d'exercices dans la base de données.
2. Dis à l'utilisateur qu'aucun exercice spécifique n'a été trouvé pour sa demande.
3. Si l'utilisateur demande explicitement des conseils généraux, tu peux en donner, MAIS:
   - Ne jamais inventer de noms d'exercices, de descriptions, de bénéfices ou de liens GIF
   - Marque clairement les conseils généraux comme "Conseil général (hors base de données)"
4. Propose à l'utilisateur de reformuler sa demande ou de consulter d'autres groupes musculaires.

Réponds en {route_info['language']}."""
            sys_prompt = "Tu es FitBot, un coach fitness. Quand la base de données d'exercices ne contient pas de résultats, tu DOIS l'admettre et NE PAS inventer d'exercices, de descriptions, ou de liens. Sois honnête et utile."
            if request.image_url:
                prompt += f"\n\nThe user also shared this image: {request.image_url}"
            reply_text = await generate_response(prompt, sys_prompt)

        if exercises and exercises[0].get("gifUrl"):
            gif_url = _normalize_gif_url(exercises[0]["gifUrl"])
            
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
        first_name = current_user.get("first_name", "")
        name = f"the user's name is {first_name}" if first_name else "the user's name is not known"
        sys_inst = f"""Role: You are FitBot, an expert, encouraging, and highly intelligent fitness coach. Your primary goal is to help the user achieve their fitness milestones through personalized guidance.

User Context: {name}. You must always address them by their first name to foster a professional yet friendly and personal rapport.

Guidelines:
- Personalization: Use the user's first name naturally in your responses.
- Tone: Be supportive, motivating, and clear. Maintain a high-energy but professional tone.
- Intelligence: Provide evidence-based fitness advice. If the user shares data (weight, height, activity level), factor this into your recommendations.
- Clarity: Use structured formatting (bullet points, bold text, and tables) to make complex fitness plans easy to read.
- Real-time Awareness: Acknowledge the user's progress. If they have a streak or have hit a goal, celebrate it with them.
- Constraint: Keep your answers focused on fitness, nutrition, and wellness. If a question is outside these topics, politely steer the conversation back to fitness.

Communication Style:
- Be proactive. Instead of just answering questions, offer additional tips that could help the user improve their performance or recovery.
- If the user asks for a workout plan, always include a warm-up, the main exercises (with sets and reps), and a cool-down/recovery tip."""
        if request.image_url:
            prompt += f"\n\nThe user also shared this image for analysis: {request.image_url}\nAnalyze the image content if relevant to their fitness/nutrition/wellness query."
        if profile:
            prompt += f"\nUser Profile: Goal={profile['goal']}, Weight={profile['weight_kg']}kg, Height={profile['height_cm']}cm, Level={profile['level']}."
        reply_text = await generate_response(prompt, sys_inst)
        
    else:
        reply_text = "Je n'ai pas pu traiter votre demande."

    # 5. Generate and save title if it's the first interaction in this session
    if not history:
        title_prompt = f"Génère un titre très court (2 à 4 mots maximum) pour résumer cette demande: '{request.message}'. Réponds UNIQUEMENT avec le titre, sans guillemets."
        sys_prompt = "Tu es un assistant qui génère des titres de conversation ultra-courts."
        generated_title = await generate_response(title_prompt, sys_prompt)
        cleaned_title = generated_title.replace('"', '').replace("'", "").strip()
        await update_session_title(session_id, cleaned_title)

    
    asst_msg_doc = {
        "role": "assistant",
        "content": reply_text,
        "service": service_name
    }
    await add_message(session_id, asst_msg_doc)

    # Auto-title after 3 exchanges (6 messages = 3 user + 3 assistant)
    session_doc = await get_session(session_id)
    if session_doc:
        msg_count = len(session_doc.get("messages", []))
        if msg_count >= 6:
            recent = session_doc["messages"][-6:]
            context_text = " | ".join(m["content"][:80] for m in recent if "content" in m)
            title_prompt = f"Summarize this fitness chat in 3 to 5 words. Context: {context_text}. Reply with ONLY the title, no quotes."
            generated_title = await generate_response(title_prompt, "You are a concise chat summarizer.")
            cleaned = generated_title.replace('"', '').replace("'", "").strip()[:60]
            await update_session_title(session_id, cleaned)

    return ChatResponse(
        response=reply_text,
        session_id=session_id,
        intent=route_info["intent"],
        language=route_info["language"],
        gif_url=gif_url,
        image_url=request.image_url
    )
@router.post("/support", response_model=SupportResponse)
async def support_chat_endpoint(request: SupportRequest):
    """
    Public guest/support endpoint. No auth required.
    Uses a lightweight LLM call with a sales/support system prompt.
    Does NOT access user profiles, exercise RAG, or any biometric data.
    """
    language = detect_language(request.message)
    
    system_instruction = """Tu es un assistant commercial et support pour EliteFiT, un service de coaching fitness premium.

Ton rôle est de:
1. Répondre aux questions sur les services EliteFiT (tarifs, programmes, localisation, horaires)
2. Aider les visiteurs à comprendre comment commencer leur transformation
3. Encourager poliment la création de compte et l'inscription pour des conseils personnalisés
4. Fournir un support de base et répondre aux questions générales

RÈGLES STRICTES:
- Sois amical, enthousiaste et professionnel — sois un ambassadeur de la marque
- Ne donne PAS de conseils fitness personnalisés (tu n'as pas le profil de l'utilisateur)
- Si l'utilisateur demande des exercices, des programmes ou des conseils nutrition personnalisés, invite-le à créer un compte gratuitement
- Redirige vers /auth?mode=register pour l'inscription
- Réponds dans la langue de l'utilisateur (français, anglais, arabe ou darija)
- Reste concis (3-4 phrases max) et termine toujours par une note positive ou un call-to-action
- N'utilise PAS la base de données d'exercices ni le contexte RAG"""
    
    prompt = f"Message de l'utilisateur: {request.message}\n\nRéponds de manière utile et engageante en {language}."
    
    reply = await generate_response(prompt, system_instruction)
    
    return SupportResponse(response=reply)


_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    file_bytes = await file.read()
    content_type = file.content_type or "application/octet-stream"

    r2_url = await upload_to_r2(file_bytes, file.filename, content_type)
    if r2_url:
        return {"url": r2_url}

    uploads_dir = os.path.join(_BACKEND_DIR, "uploads")
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(uploads_dir, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    return {"url": f"/uploads/{filename}"}

async def add_assistant_message(session_id: str, content: str, service: str):
    doc = {
        "role": "assistant",
        "content": content,
        "service": service
    }
    await add_message(session_id, doc)

@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    sessions = await get_user_sessions(user_id)
    return {"sessions": sessions}

@router.delete("/session/{session_id}")
async def delete_session_endpoint(session_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    deleted = await delete_chat_session(session_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "success"}

@router.put("/session/{session_id}")
async def rename_session_endpoint(session_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    new_title = body.get("title")
    if not new_title or not new_title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    updated = await update_session_title(session_id, new_title.strip())
    if not updated:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "success", "title": new_title.strip()}

@router.put("/session/{session_id}/archive")
async def archive_session_endpoint(session_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    db = get_db()
    result = await db.chat_sessions.update_one(
        {"_id": ObjectId(session_id), "user_id": user_id},
        {"$set": {"archived": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "success", "archived": True}
