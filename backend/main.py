import os
from contextlib import asynccontextmanager
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from services.model_loader import ModelLoader
from routers import auth, podcasts, chat, voice, avatars
import podcast_worker

# ─── Socket.io server ──────────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False
)

# Give pipeline access to sio (avoids circular import)
podcast_worker.set_sio(sio)


@sio.event
async def connect(sid, environ):
    print(f"WebSocket connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"WebSocket disconnected: {sid}")


@sio.event
async def subscribe_job(sid, data):
    """Client subscribes to a job room to receive progress updates."""
    job_id = data.get("job_id")
    if job_id:
        await sio.enter_room(sid, f"job_{job_id}")
        print(f"Client {sid} subscribed to job_{job_id}")
        await sio.emit("subscribed", {"job_id": job_id}, to=sid)


@sio.event
async def unsubscribe_job(sid, data):
    job_id = data.get("job_id")
    if job_id:
        await sio.leave_room(sid, f"job_{job_id}")


# ─── FastAPI lifespan ───────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting VoiceCast AI Backend...")
    # In a multi-worker production environment, we do NOT preload models 
    # to avoid extreme RAM exhaustion (4 workers = 4x local ML models in memory).
    # Services will instead lazy-load them on demand via ModelLoader
    if os.getenv("RAILWAY_ENVIRONMENT") != "production":
        ModelLoader.preload_all()
    else:
        print("⚡ Operating in Production Mode: Models will lazy-load on demand to save memory.")
    print("✅ All systems ready!")
    yield
    print("🛑 Shutting down...")


# ─── FastAPI app ────────────────────────────────────────────────

app = FastAPI(
    title="VoiceCast AI API",
    version="1.0.0",
    lifespan=lifespan
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:3001", "http://localhost:4028"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(podcasts.router, prefix="/api", tags=["podcasts"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(voice.router, prefix="/api", tags=["voice"])
app.include_router(avatars.router, prefix="/api", tags=["avatars"])


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "whisper": ModelLoader._whisper is not None,
        "tts": ModelLoader._tts is not None,
    }


# ─── Mount Socket.io ────────────────────────────────────────────
socket_app = socketio.ASGIApp(sio, app)
