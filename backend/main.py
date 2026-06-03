

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()  

from db.mongodb import connect_db, disconnect_db
from routes.auth      import router as auth_router
from routes.chat      import router as chat_router
from routes.exercises import router as exercises_router
from routes.profile   import router as profile_router
from routes.schedule  import router as schedule_router



@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()



app = FastAPI(
    title       = "FitBot API",
    description = "Chatbot fitness — RAG + LLM",
    version     = "1.0.0",
    lifespan    = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = [
        "*",
        "null",                          
        "http://localhost:2332",
        "http://127.0.0.1:2332",
        "http://localhost:5500",        
        "http://127.0.0.1:5500",
        "http://localhost:5173",          
    ],
    allow_credentials = False,          
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)



app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(exercises_router)
app.include_router(profile_router)
app.include_router(schedule_router)



GIFS_DIR = os.path.join(os.path.dirname(__file__), "gifs")
if os.path.exists(GIFS_DIR):
    app.mount("/gifs", StaticFiles(directory=GIFS_DIR), name="gifs")


UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "src")
if os.path.exists(FRONTEND_DIR):
    app.mount("/app", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Redirect to frontend"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/app/index.html")