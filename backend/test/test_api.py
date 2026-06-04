import os
import sys
import pytest
from fastapi.testclient import TestClient
import main
import routes.auth as auth_module
import routes.exercises as exercises_module
import routes.profile as profile_module
import routes.schedule as schedule_module
import routes.chat as chat_module
import services.rag_services as rag_module
import services.llm_service as llm_module


ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)



@pytest.fixture(autouse=True)
def disable_db(monkeypatch):
    async def fake_connect_db():
        return None

    async def fake_disconnect_db():
        return None

    monkeypatch.setattr(main, "connect_db", fake_connect_db)
    monkeypatch.setattr(main, "disconnect_db", fake_disconnect_db)
    yield


@pytest.fixture
def client():
    with TestClient(main.app) as c:
        yield c


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_register_success(client, monkeypatch):
    async def fake_get_user_by_email(email):
        return None

    async def fake_create_user(email, password_hash):
        return {"_id": "test_user_id", "email": email, "password_hash": password_hash}

    monkeypatch.setattr(auth_module, "get_user_by_email", fake_get_user_by_email)
    monkeypatch.setattr(auth_module, "create_user", fake_create_user)

    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "secret123"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == "test_user_id"
    assert data["is_profile_complete"] is False
    assert "access_token" in data


def test_register_conflict(client, monkeypatch):
    async def fake_get_user_by_email(email):
        return {"_id": "existing_id", "email": email}

    monkeypatch.setattr(auth_module, "get_user_by_email", fake_get_user_by_email)

    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "secret123"}
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Email déjà utilisé"


def test_login_success(client, monkeypatch):
    from routes.auth import pwd_ctx

    password_hash = pwd_ctx.hash("secret123")

    async def fake_get_user_by_email(email):
        return {"_id": "test_user_id", "email": email, "password_hash": password_hash}

    async def fake_get_profile(user_id):
        return {"user_id": user_id, "age": 25, "weight_kg": 70.0, "height_cm": 175.0, "gender": "homme", "goal": "musculation", "level": "débutant", "equipment": "salle", "days_per_week": 4, "language": "fr", "updated_at": "2026-01-01T00:00:00"}

    monkeypatch.setattr(auth_module, "get_user_by_email", fake_get_user_by_email)
    monkeypatch.setattr(auth_module, "get_profile", fake_get_profile)

    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "secret123"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "test_user_id"
    assert "access_token" in data
    assert data["is_profile_complete"] is True


def test_login_invalid_credentials(client, monkeypatch):
    async def fake_get_user_by_email(email):
        return None

    monkeypatch.setattr(auth_module, "get_user_by_email", fake_get_user_by_email)

    response = client.post(
        "/api/auth/login",
        json={"email": "bad@example.com", "password": "wrong"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Email ou mot de passe incorrect"


def test_profile_me_returns_profile(client, monkeypatch):
    async def fake_get_current_user():
        return {"_id": "user123", "email": "test@example.com"}

    async def fake_get_profile(user_id):
        return {
            "user_id": user_id,
            "age": 25,
            "weight_kg": 70.0,
            "height_cm": 175.0,
            "gender": "homme",
            "goal": "musculation",
            "level": "débutant",
            "equipment": "salle",
            "days_per_week": 4,
            "language": "fr",
            "updated_at": "2026-01-01T00:00:00"
        }

    monkeypatch.setitem(main.app.dependency_overrides, auth_module.get_current_user, fake_get_current_user)
    monkeypatch.setattr(profile_module, "get_profile", fake_get_profile)

    response = client.get("/api/profile/me")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "user123"
    assert data["goal"] == "musculation"


def test_profile_update_create_new_profile(client, monkeypatch):
    async def fake_get_current_user():
        return {"_id": "user123", "email": "test@example.com"}

    async def fake_get_profile(user_id):
        return None

    async def fake_create_or_update_profile(user_id, data):
        return {"user_id": user_id, **data}

    monkeypatch.setitem(main.app.dependency_overrides, auth_module.get_current_user, fake_get_current_user)
    monkeypatch.setattr(profile_module, "get_profile", fake_get_profile)
    monkeypatch.setattr(profile_module, "create_or_update_profile", fake_create_or_update_profile)

    response = client.post(
        "/api/profile/update",
        json={
            "age": 26,
            "weight_kg": 72.0,
            "height_cm": 177.0,
            "gender": "homme",
            "goal": "musculation",
            "level": "intermédiaire",
            "equipment": "salle",
            "days_per_week": 4,
            "language": "fr"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "user123"
    assert data["age"] == 26
    assert data["goal"] == "musculation"


def test_exercises_search_endpoint(client, monkeypatch):
    async def fake_search_exercises(muscle=None, body_part=None, equipment=None, limit=10):
        return [{"exerciseId": "abc123", "name": "Push Up"}]

    monkeypatch.setattr(exercises_module, "search_exercises", fake_search_exercises)

    response = client.get("/api/exercises/search?muscle=pectorals")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()[0]["name"] == "Push Up"


def test_chat_rag_musculation_intent_returns_exercises(client, monkeypatch):
    """
    Test that a musculation-related message triggers the RAG service
    and returns exercise results in the response.
    """
    async def fake_get_current_user():
        return {"_id": "user123", "email": "test@example.com"}

    async def fake_create_session(user_id):
        return "session_rag_test_123"

    async def fake_add_message(session_id, message):
        return True

    async def fake_get_profile(user_id):
        return {
            "user_id": user_id,
            "age": 25,
            "weight_kg": 70.0,
            "height_cm": 175.0,
            "gender": "homme",
            "goal": "musculation",
            "level": "débutant",
            "equipment": "salle",
            "days_per_week": 4,
            "language": "fr",
            "updated_at": "2026-01-01T00:00:00"
        }

    async def fake_get_session_history(session_id):
        return []

    async def fake_update_session_title(session_id, title):
        return True

    # Mock RAG service — return mock exercise data
    async def fake_retrieve_exercises(muscle_group=None, equipment=None, limit=3):
        return [
            {
                "exerciseId": "bicep_curl_001",
                "name": "Dumbbell Bicep Curl",
                "gifUrl": "/data/gifts/dumbbell-bicep-curl.gif",
                "targetMuscles": ["biceps", "forearms"],
                "secondaryMuscles": [],
                "bodyParts": ["arms"],
                "equipments": ["dumbbell"],
                "instructions": ["Stand with a dumbbell in each hand.", "Curl the weights up towards your shoulders."]
            },
            {
                "exerciseId": "hammer_curl_002",
                "name": "Hammer Curl",
                "gifUrl": "/data/gifts/hammer-curl.gif",
                "targetMuscles": ["biceps", "brachialis"],
                "secondaryMuscles": [],
                "bodyParts": ["arms"],
                "equipments": ["dumbbell"],
                "instructions": ["Hold dumbbells with palms facing each other.", "Curl the weights while keeping palms facing in."]
            }
        ]

    # Set up all mocks — patch chat_module since it imported these functions locally
    monkeypatch.setitem(main.app.dependency_overrides, auth_module.get_current_user, fake_get_current_user)
    monkeypatch.setattr(chat_module, "create_session", fake_create_session)
    monkeypatch.setattr(chat_module, "get_profile", fake_get_profile)
    monkeypatch.setattr(chat_module, "add_message", fake_add_message)
    monkeypatch.setattr(chat_module, "get_session_history", fake_get_session_history)
    monkeypatch.setattr(chat_module, "update_session_title", fake_update_session_title)
    # Patch on chat_module because chat.py imports these into its own namespace
    monkeypatch.setattr(chat_module, "retrieve_exercises", fake_retrieve_exercises)

    response = client.post(
        "/api/chat",
        json={"message": "exercice pour les biceps"}
    )

    assert response.status_code == 200
    data = response.json()

    # Verify RAG response structure
    assert "response" in data
    assert data["intent"] == "musculation"
    assert data["language"] == "fr"
    assert data["session_id"] == "session_rag_test_123"

    # DATABASE-FIRST POLICY: Response must be built strictly from DB fields
    rag_response = data["response"]

    # Verify exercise names from the database mock data are present
    assert "Dumbbell Bicep Curl" in rag_response
    assert "Hammer Curl" in rag_response

    # Verify database fields are used (NOT LLM-generated content)
    assert "Muscles ciblés" in rag_response          # DB field: targetMuscles
    assert "biceps" in rag_response.lower()          # From mock DB data (lowercase from DB)
    assert "forearms" in rag_response.lower()        # From mock DB data
    assert "Équipement" in rag_response               # DB field: equipments
    assert "Dumbbell" in rag_response                 # From mock DB data
    assert "Instructions" in rag_response             # DB field: instructions
    assert "Stand with a dumbbell" in rag_response    # From mock DB instructions
    assert "Curl the weights" in rag_response         # From mock DB instructions

    # Verify NO LLM-generated content (no generic coaching advice)
    # The response should NOT contain coaching LLM-style text
    # (checking absence of common LLM hallucination patterns)
    for phrase in ["excellents exercices", "Voici 2"]:
        assert phrase not in rag_response, f"LLM-generated content detected: '{phrase}'"

    # Verify gif_url is populated and converted to the frontend-accessible path
    assert data["gif_url"] == "/gifs/dumbbell-bicep-curl.gif"


def test_chat_greeting_direct_response(client, monkeypatch):
    """
    Test that a greeting message returns a direct response without RAG/LLM.
    """
    async def fake_get_current_user():
        return {"_id": "user123", "email": "test@example.com"}

    async def fake_create_session(user_id):
        return "session_greeting_123"

    async def fake_add_message(session_id, message):
        return True

    async def fake_get_session_history(session_id):
        return []

    async def fake_update_session_title(session_id, title):
        return True

    monkeypatch.setitem(main.app.dependency_overrides, auth_module.get_current_user, fake_get_current_user)
    monkeypatch.setattr(chat_module, "create_session", fake_create_session)
    monkeypatch.setattr(chat_module, "add_message", fake_add_message)
    monkeypatch.setattr(chat_module, "get_session_history", fake_get_session_history)
    monkeypatch.setattr(chat_module, "update_session_title", fake_update_session_title)

    response = client.post(
        "/api/chat",
        json={"message": "bonjour"}
    )

    assert response.status_code == 200
    data = response.json()

    # Greeting should be direct response with FitBot introduction
    assert "FitBot" in data["response"] or "Bonjour" in data["response"]
    assert data["intent"] == "greeting"
    assert data["language"] == "fr"


def test_schedule_list_and_create(client, monkeypatch):
    async def fake_get_current_user():
        return {"_id": "user123", "email": "test@example.com"}

    async def fake_get_user_schedule(user_id):
        return []

    async def fake_create_schedule_item(user_id, item):
        return {"_id": "schedule123", "user_id": user_id, **item}

    monkeypatch.setitem(main.app.dependency_overrides, auth_module.get_current_user, fake_get_current_user)
    monkeypatch.setattr(schedule_module, "get_user_schedule", fake_get_user_schedule)
    monkeypatch.setattr(schedule_module, "create_schedule_item", fake_create_schedule_item)

    list_response = client.get("/api/schedule/")
    assert list_response.status_code == 200
    assert list_response.json() == []

    create_payload = {
        "muscle_group": "Pectoralis Major (Chest)",
        "day": "Mon",
        "start_time": "09:00",
        "end_time": "10:00",
        "color": "#c8f135"
    }

    create_response = client.post("/api/schedule/", json=create_payload)
    assert create_response.status_code == 201
    assert create_response.json()["user_id"] == "user123"
    assert create_response.json()["muscle_group"] == create_payload["muscle_group"]
