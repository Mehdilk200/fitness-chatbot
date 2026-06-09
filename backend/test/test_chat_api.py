"""Test RAG chat response using FastAPI TestClient — no uvicorn needed."""

import os, sys

os.environ["HF_HOME"] = "/media/elmehdi-lakhial/USB_STORAGE22/.hf_cache"
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from main import app
from fastapi.testclient import TestClient

EMAIL = "mehdi_lk_lk@gmail.com"
PASSWORD = "12345678"


def login(client):
    r = client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    print(f"Login status: {r.status_code}")
    if r.status_code == 200:
        token = r.json().get("access_token")
        print(f"Token: {token[:40]}...")
        return token
    print(f"Login failed: {r.text}")
    return None


def test_chat(client, token, message, session_id=None):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"message": message}
    if session_id:
        payload["session_id"] = session_id

    r = client.post("/api/chat", json=payload, headers=headers)
    print(f"\n{'='*70}")
    print(f"User: {message}")
    print(f"Status: {r.status_code}")

    if r.status_code == 200:
        body = r.json()
        print(f"Intent:  {body.get('intent')}")
        print(f"Lang:    {body.get('language')}")
        print(f"GIF URL: {body.get('gif_url')}")
        print(f"\n--- RESPONSE ---\n{body.get('response', '')[:2000]}")
        return body.get("session_id")
    else:
        print(f"Error: {r.text[:500]}")
        return None


if __name__ == "__main__":
    print("=" * 70)
    print("TESTING RAG CHAT RESPONSE")
    print("=" * 70)

    with TestClient(app, raise_server_exceptions=False) as client:
        token = login(client)
        if not token:
            sys.exit(1)

        session = test_chat(client, token, "I want chest exercises with dumbbell")
        test_chat(client, token, "Exercices pour les biceps", session)
        test_chat(client, token, "Quadriceps workout with barbell", session)
        test_chat(client, token, "Cardio exercises", session)
        test_chat(client, token, "Squat with barbell", session)
