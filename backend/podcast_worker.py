import asyncio
import json
import os
from services.database import query, query_one
from services.cache_service import update_job, set_job
from services import scraper_service, script_generator, tts_service
from services import lipsync_service, video_service, storage_service, cache_service

# sio is set from main.py to avoid circular imports
_sio = None


def set_sio(sio_instance):
    global _sio
    _sio = sio_instance


async def emit(job_id: str, podcast_id: str, stage: str, progress: int, message: str):
    """Emit Socket.io progress event and update DB + Redis."""
    data = {
        "job_id": job_id,
        "stage": stage,
        "progress": progress,
        "message": message,
    }

    if _sio:
        try:
            await _sio.emit("job:progress", data, room=f"job_{job_id}")
        except Exception as e:
            print(f"Socket emit error: {e}")

    # Update Redis job
    await update_job(job_id, {
        "status": "processing",
        "stage": stage,
        "progress": progress,
        "message": message,
    })

    # Update DB
    query(
        "UPDATE podcasts SET stage=%s, progress=%s WHERE id=%s",
        (stage, progress, podcast_id),
        fetch=False
    )


async def generate_podcast_pipeline(
    podcast_id: str,
    job_id: str,
    blog_url: str,
    blog_text: str,
    avatar_type: str,
    style: str,
    language: str,
    duration_target: int,
):
    audio_path = None
    video_path = None

    try:
        # ─── Stage 1: Scrape (0–15%) ───────────────────────────
        await emit(job_id, podcast_id, "scraping", 5, "Fetching blog content...")

        # Robustness: Check if blog_url is actually text instead of a URL
        if blog_url and not (blog_url.startswith("http://") or blog_url.startswith("https://")):
            if not blog_text:
                print(f"DEBUG: blog_url looks like text, treating as blog_text: {blog_url[:50]}...")
                blog_text = blog_url
                blog_url = None
            else:
                blog_url = None # It's junk, and we already have text

        if blog_url and not blog_text:
            blog_text = await scraper_service.scrape(blog_url)
            # Save scraped text to DB
            query(
                "UPDATE podcasts SET blog_text=%s WHERE id=%s",
                (blog_text, podcast_id),
                fetch=False
            )

        await emit(job_id, podcast_id, "scraping", 15, "Content ready!")

        # ─── Stage 2: Script (15–35%) ──────────────────────────
        await emit(job_id, podcast_id, "scripting", 20, "Writing podcast script with AI...")

        script = await cache_service.get_cached_script(blog_text)
        if not script:
            script = await script_generator.generate(
                blog_text, style, duration_target, language
            )
            await cache_service.cache_script(blog_text, script)

        await emit(job_id, podcast_id, "scripting", 35, "Script ready!")

        # ─── Stage 3: Audio TTS (35–55%) ───────────────────────
        await emit(job_id, podcast_id, "audio", 40, "Synthesizing voice with Coqui TTS...")

        audio_path = await tts_service.generate(script, language)
        duration = await tts_service.get_duration(audio_path)
        transcript = await tts_service.get_transcript(script, duration)

        await emit(job_id, podcast_id, "audio", 55, "Voice synthesis complete!")

        # ─── Stage 4: Lip Sync (55–70%) ────────────────────────
        await emit(job_id, podcast_id, "lipsync", 60, "Generating lip sync data...")

        lipsync = await lipsync_service.generate(audio_path)

        await emit(job_id, podcast_id, "lipsync", 70, "Lip sync ready!")

        # ─── Stage 5: Video Render (70–85%) ────────────────────
        await emit(job_id, podcast_id, "video", 75, "Rendering video with FFmpeg...")

        video_path = await video_service.render(audio_path, avatar_type)

        await emit(job_id, podcast_id, "video", 85, "Video rendered!")

        # ─── Stage 6: Upload (85–100%) ─────────────────────────
        await emit(job_id, podcast_id, "uploading", 88, "Uploading to Cloudinary...")

        audio_url = await storage_service.upload_audio(
            audio_path, f"{podcast_id}.mp3"
        )
        video_url = await storage_service.upload_video(
            video_path, f"{podcast_id}.mp4"
        )

        await emit(job_id, podcast_id, "uploading", 95, "Upload complete!")

        # ─── Save to DB ─────────────────────────────────────────
        query(
            """UPDATE podcasts SET
               status='ready', progress=100, stage='complete',
               script=%s, audio_url=%s, video_url=%s,
               lipsync_json=%s, transcript_json=%s,
               duration_seconds=%s
               WHERE id=%s""",
            (
                script, audio_url, video_url,
                json.dumps(lipsync),
                json.dumps(transcript),
                duration,
                podcast_id,
            ),
            fetch=False
        )

        # Update Redis job
        await set_job(job_id, {
            "job_id": job_id,
            "podcast_id": podcast_id,
            "status": "complete",
            "stage": "complete",
            "progress": 100,
            "message": "Podcast ready!",
            "audio_url": audio_url,
            "video_url": video_url,
        })

        # Emit completion event
        if _sio:
            await _sio.emit("job:complete", {
                "job_id": job_id,
                "podcast_id": podcast_id,
                "audio_url": audio_url,
                "video_url": video_url,
            }, room=f"job_{job_id}")

        print(f"✅ Podcast {podcast_id} complete!")

    except Exception as e:
        print(f"❌ Pipeline error for {podcast_id}: {e}")
        import traceback
        traceback.print_exc()

        query(
            "UPDATE podcasts SET status='failed', stage='error' WHERE id=%s",
            (podcast_id,),
            fetch=False
        )
        await set_job(job_id, {
            "job_id": job_id,
            "podcast_id": podcast_id,
            "status": "failed",
            "stage": "error",
            "progress": 0,
            "message": str(e),
        })

        if _sio:
            await _sio.emit("job:error", {
                "job_id": job_id,
                "error": str(e),
            }, room=f"job_{job_id}")

    finally:
        # Cleanup temp files
        for path in [audio_path, video_path]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass
