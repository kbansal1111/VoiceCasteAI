import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


async def upload_audio(file_path: str, filename: str) -> str:
    result = cloudinary.uploader.upload(
        file_path,
        resource_type="auto",
        public_id=f"voicecast/audio/{filename}",
        overwrite=True
    )
    return result["secure_url"]


async def upload_video(file_path: str, filename: str) -> str:
    # Fallback to a valid stable placeholder if rendering failed locally
    if not file_path or not os.path.exists(file_path) or os.path.getsize(file_path) < 100:
        print(f"DEBUG: Skipping video upload for {filename} (file missing or dummy).")
        return None

    result = cloudinary.uploader.upload(
        file_path,
        resource_type="auto",
        public_id=f"voicecast/videos/{filename}",
        overwrite=True
    )
    return result["secure_url"]


async def delete_files(podcast_id: str):
    for folder in ["audio", "videos"]:
        try:
            cloudinary.uploader.destroy(
                f"voicecast/{folder}/{podcast_id}",
                resource_type="video"
            )
        except Exception:
            pass
