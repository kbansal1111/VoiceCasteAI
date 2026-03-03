FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    ffmpeg wget unzip git curl \
    && rm -rf /var/lib/apt/lists/*

# Install Rhubarb Lip Sync for Linux
RUN wget -q https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip \
    && unzip Rhubarb-Lip-Sync-1.13.0-Linux.zip \
    && mv rhubarb /usr/local/bin/rhubarb \
    && chmod +x /usr/local/bin/rhubarb \
    && rm -rf *.zip Rhubarb-Lip-Sync-1.13.0-Linux

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p models_cache uploads/audio uploads/videos

# Pre-bake models into Docker image at BUILD time
# This means users never wait for model downloads at startup
RUN python -c "\
import whisper, os; \
from TTS.api import TTS; \
os.makedirs('./models_cache/whisper', exist_ok=True); \
os.environ['TTS_HOME'] = './models_cache'; \
print('Downloading Whisper base...'); \
whisper.load_model('base', download_root='./models_cache/whisper'); \
print('Downloading Coqui TTS...'); \
TTS(model_name='tts_models/en/ljspeech/tacotron2-DDC', progress_bar=True, gpu=False); \
print('All models baked into image!') \
"

EXPOSE 8000

CMD ["uvicorn", "main:socket_app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
