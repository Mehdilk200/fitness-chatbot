from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["ONNXRUNTIME_NUM_THREADS"] = "1"

load_dotenv()

from db.mongodb import connect_db, disconnect_db
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.exercises import router as exercises_router
from routes.profile import router as profile_router
from routes.schedule import router as schedule_router
from routes.debug import router as debug_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="FitBot API",
    description="Chatbot fitness — RAG + LLM",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "null","http://localhost:5173",
        "https://fitness-chatbot-production.up.railway.app",
        "http://localhost:2332",
        "http://127.0.0.1:2332",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(exercises_router)
app.include_router(profile_router)
app.include_router(schedule_router)

# Debug endpoints: only load when DEBUG=True (local development)
if os.getenv("DEBUG", "").lower() == "true":
    app.include_router(debug_router)
    print("🔧 Debug routes loaded at /api/debug/")


GIFS_DIR = os.path.join(os.path.dirname(__file__), "data", "gifts")
if os.path.exists(GIFS_DIR):
    app.mount("/gifs", StaticFiles(directory=GIFS_DIR), name="gifs")


UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


FRONTEND_BUILD_DIR = os.getenv(
    "FRONTEND_BUILD_DIR",
    os.path.join(os.path.dirname(__file__), "..", "interface", "dist"),
)

if os.path.exists(FRONTEND_BUILD_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="frontend")


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Redirect to frontend (if mounted)"""
    from fastapi.responses import RedirectResponse

    return RedirectResponse(url="/index.html")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", os.getenv("APP_PORT", "8000")))
    uvicorn.run(app, host="0.0.0.0", port=port)
