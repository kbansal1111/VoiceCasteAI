import os
import subprocess
import json
import ffmpeg

# Linux path (Railway production)
RHUBARB_LINUX = "/usr/local/bin/rhubarb"
IS_LINUX = os.name != "nt"


async def generate(audio_path: str) -> list:
    """Generate lip sync cues from audio. Uses Rhubarb on Linux, fallback on Windows."""
    if IS_LINUX and os.path.exists(RHUBARB_LINUX):
        return await _rhubarb(audio_path)
    else:
        print("Using Python fallback lip sync (Windows dev mode)")
        return _fallback(audio_path)


async def _rhubarb(audio_path: str) -> list:
    output = audio_path.replace(".mp3", "_lipsync.json")
    try:
        subprocess.run(
            [
                RHUBARB_LINUX,
                "-f", "json",
                "-o", output,
                audio_path,
                "--machineReadable",
                "--quiet"
            ],
            check=True,
            capture_output=True,
            timeout=120
        )
        with open(output) as f:
            data = json.load(f)
        if os.path.exists(output):
            os.remove(output)
        return data.get("mouthCues", [])
    except Exception as e:
        print(f"Rhubarb failed: {e}, falling back to Python fallback")
        return _fallback(audio_path)


def _fallback(audio_path: str) -> list:
    """
    Python phoneme fallback for Windows development.
    Cycles through Rhubarb-compatible viseme codes at ~12.5fps.
    """
    try:
        probe = ffmpeg.probe(audio_path)
        duration = float(probe["streams"][0]["duration"])
    except Exception:
        duration = 60.0

    # Standard Rhubarb viseme set
    visemes = ["X", "A", "B", "C", "D", "E", "F", "G", "H", "X"]
    result = []
    step = 0.08  # ~12.5 fps
    t = 0.0
    i = 0

    while t < duration:
        result.append({
            "start": round(t, 2),
            "end": round(min(t + step, duration), 2),
            "value": visemes[i % len(visemes)]
        })
        t += step
        i += 1

    return result
