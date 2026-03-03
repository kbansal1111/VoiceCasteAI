import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from services import voice_service
from routers.auth import get_current_user

router = APIRouter()


@router.post("/voice-command")
async def voice_command(
    audio: UploadFile = File(...),
    podcast_id: str = Form(default=""),
    current_user: dict = Depends(get_current_user)
):
    """Transcribe voice audio with Whisper and classify command with Groq."""
    if audio.content_type not in [
        "audio/webm", "audio/ogg", "audio/wav",
        "audio/mpeg", "audio/mp4", "audio/mp3", "application/octet-stream"
    ]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format: {audio.content_type}"
        )

    audio_bytes = await audio.read()
    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio file is too small")

    transcription = await voice_service.transcribe(audio_bytes)
    action = await voice_service.classify_command(transcription)

    return {
        "action": action,
        "transcription": transcription,
        "podcast_id": podcast_id,
    }


@router.post("/voice-interrupt")
async def voice_interrupt(
    audio: UploadFile = File(...),
    podcast_id: str = Form(...),
    context_timestamp: float = Form(default=0.0),
    current_user: dict = Depends(get_current_user)
):
    """Handle voice interruption: transcribe, get LLM reply, and generate TTS."""
    if audio.content_type not in [
        "audio/webm", "audio/ogg", "audio/wav",
        "audio/mpeg", "audio/mp4", "audio/mp3", "application/octet-stream"
    ]:
        raise HTTPException(status_code=400, detail="Unsupported audio format")

    audio_bytes = await audio.read()
    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio file is too small")

    # 1. Transcribe
    transcription = await voice_service.transcribe(audio_bytes)
    
    # 2. Get Podcast Context
    from services.database import query_one
    podcast = query_one(
        "SELECT blog_text FROM podcasts WHERE id=%s AND user_id=%s",
        (podcast_id, current_user["id"])
    )
    context = podcast["blog_text"] if podcast else ""
    
    # 3. Get LLM Reply (Prompted to be brief for speech)
    from services import chat_service
    prompt = f"{transcription} (Note to AI: The user just interrupted the podcast. Respond conversationally, factually, and very briefly (under 30 words) suitable for text-to-speech. Do not say 'Ah', 'Um' or use markdown.)"
    result = await chat_service.chat(
        message=prompt,
        blog_content=context,
        context_timestamp=context_timestamp,
        history=[]
    )
    reply_text = result["reply"]
    
    # 4. Generate TTS
    from services import tts_service
    mp3_path = await tts_service.generate(reply_text)
    filename = os.path.basename(mp3_path)
    
    # Return the URL to stream the audio directly
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8001")
    audio_url = f"{backend_url}/api/tts-audio/{filename}"
    
    # Also save the chat message so it appears in the chat history
    import uuid
    from services.database import query
    query(
        "INSERT INTO chat_messages (id, podcast_id, role, content, timestamp_seconds) VALUES (%s, %s, 'user', %s, %s)",
        (str(uuid.uuid4()), podcast_id, transcription, context_timestamp), fetch=False
    )
    query(
        "INSERT INTO chat_messages (id, podcast_id, role, content, timestamp_seconds) VALUES (%s, %s, 'assistant', %s, %s)",
        (str(uuid.uuid4()), podcast_id, reply_text, context_timestamp), fetch=False
    )
    
    return {
        "transcription": transcription,
        "reply": reply_text,
        "audio_url": audio_url
    }


@router.get("/tts-audio/{filename}")
async def get_tts_audio(filename: str):
    """Serve a local TTS audio file."""
    file_path = os.path.join("./uploads/audio", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio not found")
    return FileResponse(file_path, media_type="audio/mpeg")
