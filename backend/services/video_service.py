import os
import subprocess
import tempfile

TEMP_DIR = "./uploads/videos"
os.makedirs(TEMP_DIR, exist_ok=True)

# Map frontend avatar IDs to GLB filenames (for reference in metadata)
AVATAR_MAP = {
    "avatar-1": "RobotExpressive.glb",
    "avatar-2": "Michelle.glb",
    "avatar-3": "Xbot.glb",
    "avatar-4": "RobotExpressive.glb",
}


async def render(audio_path: str, avatar_type: str = "avatar-1") -> str:
    """
    Create a simple MP4 by combining audio with a static black frame.
    The actual 3D avatar rendering happens in the browser via AvatarCanvas.tsx.
    This video is uploaded to Cloudinary as a shareable/export artifact.
    """
    video_path = os.path.join(
        TEMP_DIR,
        f"video_{os.path.basename(audio_path).replace('.mp3', '.mp4')}"
    )

    # Create a simple black video with the audio track
    # Duration is derived from the audio
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "color=c=black:s=1280x720:r=30",
        "-i", audio_path,
        "-c:v", "libx264", "-preset", "fast",
        "-c:a", "aac", "-b:a", "128k",
        "-shortest",
        "-movflags", "+faststart",
        video_path
    ]

    try:
        import asyncio
        await asyncio.to_thread(subprocess.run, ["ffmpeg", "-version"], capture_output=True, check=True)
        await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True, timeout=300)
        return video_path
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"WARNING: FFmpeg missing or failed. Rendering will be skipped: {e}")
        if os.path.exists(video_path):
            os.remove(video_path)
        return None
