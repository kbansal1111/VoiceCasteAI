import os
import tempfile
import aiofiles
from services.model_loader import ModelLoader, HAS_WHISPER
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

VOICE_ACTIONS = ["play", "pause", "rewind", "forward", "seek", "export", "unknown"]


async def transcribe(audio_bytes: bytes) -> str:
    """Transcribe audio bytes using Groq's cloud Whisper API."""
    # Write to temp file
    # We use .webm as it's common for browser recordings, or .wav
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    # 1. Try Local Whisper First
    if HAS_WHISPER:
        try:
            whisper_model = ModelLoader.get_whisper()
            if whisper_model:
                import asyncio
                loop = asyncio.get_event_loop()
                def run_whisper():
                    # Whisper requires ffmpeg to be installed
                    return whisper_model.transcribe(tmp_path)
                result = await loop.run_in_executor(None, run_whisper)
                return result["text"].strip()
        except Exception as e:
            print(f"WARNING: Local Whisper failed (possibly missing FFmpeg): {e}. Falling back to Groq.")

    # 2. Fallback to Groq Cloud Whisper
    try:
        with open(tmp_path, "rb") as audio_file:
            transcription = groq_client.audio.transcriptions.create(
                file=(os.path.basename(tmp_path), audio_file.read()),
                model="whisper-large-v3",
                response_format="verbose_json",
            )
            return transcription.text.strip()
    except Exception as e:
        print(f"ERROR: Transcription failed entirely: {e}")
        return "unknown command"
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


async def classify_command(transcription: str) -> str:
    """Use Groq to classify transcribed voice input into an action."""
    prompt = f"""You are a voice command classifier for a podcast player.
Classify the following transcribed voice command into exactly ONE of these actions:
- play (user wants to play/resume)
- pause (user wants to pause/stop)
- rewind (user wants to go back)
- forward (user wants to skip forward)
- seek (user wants to jump to a specific time)
- export (user wants to download/export)
- unknown (anything else)

Transcription: "{transcription}"

Respond with ONLY the action word, nothing else."""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=10,
    )
    action = response.choices[0].message.content.strip().lower()
    return action if action in VOICE_ACTIONS else "unknown"
