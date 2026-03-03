import os

try:
    import whisper
    HAS_WHISPER = True
except ImportError:
    HAS_WHISPER = False
    print("ℹ️  Local 'whisper' module not found. Using Cloud Whisper (Groq) for voice commands.")

try:
    from TTS.api import TTS
    HAS_TTS = True
except ImportError:
    HAS_TTS = False
    print("ℹ️  Local 'TTS' module not found. Using Cloud TTS (gTTS) for audio generation.")


IS_PROD = os.getenv("RAILWAY_ENVIRONMENT") == "production"

MODEL_DIR = "/app/models_cache" if IS_PROD else "./models_cache"

os.makedirs(MODEL_DIR, exist_ok=True)
os.environ["TTS_HOME"] = MODEL_DIR


class ModelLoader:
    _whisper = None
    _tts = None

    @classmethod
    def get_whisper(cls):
        if not HAS_WHISPER:
            return None
            
        if cls._whisper is None:
            print(f"Loading Whisper from {MODEL_DIR}")
            cls._whisper = whisper.load_model(
                "base",
                download_root=f"{MODEL_DIR}/whisper"
            )
            print("Whisper ready!")
        return cls._whisper

    @classmethod
    def get_tts(cls):
        if not HAS_TTS:
            return None
            
        if cls._tts is None:
            print(f"Loading TTS from {MODEL_DIR}")
            cls._tts = TTS(
                model_name="tts_models/en/ljspeech/tacotron2-DDC",
                progress_bar=False,
                gpu=False
            )
            print("TTS ready!")
        return cls._tts

    @classmethod
    def preload_all(cls):
        print("=" * 40)
        print(f"Environment: {'Production' if IS_PROD else 'Development'}")
        print(f"Model directory: {MODEL_DIR}")
        print("Loading all models...")
        cls.get_whisper()
        cls.get_tts()
        print("All models ready!")
        print("=" * 40)
