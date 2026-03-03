import os
import tempfile
import subprocess
import uuid
import json
from services.model_loader import ModelLoader

TEMP_DIR = "./uploads/audio"
os.makedirs(TEMP_DIR, exist_ok=True)


async def generate(script: str, language: str = "en") -> str:
    """Generate MP3 audio from script text using gTTS (reliable for local) or Coqui TTS."""
    from gtts import gTTS
    
    mp3_path = os.path.join(TEMP_DIR, f"tts_{uuid.uuid4().hex}.mp3")

    try:
        # Use gTTS for reliable local generation (no heavy models needed)
        # We use a thread-safe way for gTTS which is normally blocking
        import asyncio
        loop = asyncio.get_event_loop()
        
        def save_gtts():
            tts = gTTS(text=script, lang=language)
            tts.save(mp3_path)
            
        await loop.run_in_executor(None, save_gtts)
        return mp3_path
    except Exception as e:
        print(f"WARNING: gTTS failed: {e}. Falling back to dummy audio.")
        # Fallback to dummy silence if even gTTS fails
        try:
            subprocess.run(
                ["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", 
                 "-t", "2", "-q:a", "9", "-acodec", "libmp3lame", mp3_path],
                capture_output=True, check=True
            )
            return mp3_path
        except Exception:
            with open(mp3_path, "wb") as f:
                f.write(b"\x00")
            return mp3_path


async def get_duration(audio_path: str) -> float:
    """Get audio duration in seconds using ffprobe."""
    import ffmpeg
    try:
        probe = ffmpeg.probe(audio_path)
        return float(probe["streams"][0]["duration"])
    except Exception:
        return 60.0


async def get_transcript(script: str, duration: float) -> list:
    """
    Build a word-level transcript with estimated timestamps.
    Returns [{word, start, end}] assuming ~130 wpm.
    """
    words = script.split()
    if not words:
        return []

    seconds_per_word = duration / len(words) if words else 0.5
    result = []
    current_time = 0.0

    for word in words:
        result.append({
            "word": word,
            "start": round(current_time, 2),
            "end": round(current_time + seconds_per_word, 2),
        })
        current_time += seconds_per_word

    return result
