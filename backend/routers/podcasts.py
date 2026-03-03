import os
import uuid
import json
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional
from services.database import query, query_one
from services.cache_service import get_job, set_job
from services.storage_service import delete_files
from routers.auth import get_current_user

router = APIRouter()


class GenerateRequest(BaseModel):
    blog_url: Optional[str] = None
    blog_text: Optional[str] = None
    avatar_type: str = "avatar-1"
    style: str = "professional"
    language: str = "en"
    duration_target: int = 5


@router.post("/podcasts/generate")
async def generate_podcast(
    data: GenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    if not data.blog_url and not data.blog_text:
        raise HTTPException(status_code=400, detail="Provide blog_url or blog_text")

    podcast_id = str(uuid.uuid4())
    job_id = str(uuid.uuid4())

    # Determine title from content
    title_text = (data.blog_text or data.blog_url or "Podcast")[:80]
    title = f"Podcast: {title_text[:60]}..."

    # Save podcast record to DB
    query_one(
        """INSERT INTO podcasts
           (id, user_id, title, status, stage, progress,
            voice_style, language, avatar_type, background, blog_url, blog_text)
           VALUES (%s, %s, %s, 'pending', 'queued', 0, %s, %s, %s, 'gradient-1', %s, %s)
           RETURNING id""",
        (podcast_id, current_user["id"], title,
         data.style, data.language, data.avatar_type,
         data.blog_url, data.blog_text)
    )

    # Initialize job in Redis
    await set_job(job_id, {
        "job_id": job_id,
        "podcast_id": podcast_id,
        "status": "pending",
        "stage": "queued",
        "progress": 0,
        "message": "Queued for processing"
    })

    # Start background pipeline (imported lazily to avoid circular imports)
    from podcast_worker import generate_podcast_pipeline
    background_tasks.add_task(
        generate_podcast_pipeline,
        podcast_id=podcast_id,
        job_id=job_id,
        blog_url=data.blog_url,
        blog_text=data.blog_text,
        avatar_type=data.avatar_type,
        style=data.style,
        language=data.language,
        duration_target=data.duration_target,
    )

    return {"job_id": job_id, "podcast_id": podcast_id}


@router.get("/podcasts")
async def list_podcasts(current_user: dict = Depends(get_current_user)):
    podcasts = query(
        """SELECT id, title, status, stage, progress, audio_url, video_url, session_video_url,
                  duration_seconds, avatar_type, language, created_at
           FROM podcasts WHERE user_id=%s
           ORDER BY created_at DESC""",
        (current_user["id"],)
    )
    return [dict(p) for p in podcasts]


@router.get("/podcasts/{podcast_id}")
async def get_podcast(podcast_id: str, current_user: dict = Depends(get_current_user)):
    podcast = query_one(
        """SELECT * FROM podcasts WHERE id=%s AND user_id=%s""",
        (podcast_id, current_user["id"])
    )
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    result = dict(podcast)
    # Parse JSON fields
    for field in ["lipsync_json", "transcript_json"]:
        if result.get(field) and isinstance(result[field], str):
            try:
                result[field] = json.loads(result[field])
            except Exception:
                pass
    return result


@router.delete("/podcasts/{podcast_id}")
async def delete_podcast(podcast_id: str, current_user: dict = Depends(get_current_user)):
    podcast = query_one(
        "SELECT id FROM podcasts WHERE id=%s AND user_id=%s",
        (podcast_id, current_user["id"])
    )
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    await delete_files(podcast_id)
    query("DELETE FROM podcasts WHERE id=%s", (podcast_id,), fetch=False)
    return {"message": "Podcast deleted"}


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/scrape")
async def scrape_url(
    data: dict
):
    """Scrape a blog URL and return the extracted text content."""
    url = data.get("url", "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    from services import scraper_service
    try:
        content = await scraper_service.scrape(url)
        return {"content": content, "length": len(content)}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
@router.post("/podcasts/upload-session")
async def upload_session(
    video: UploadFile = File(...),
    podcast_id: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Save a recorded interactive session video to Cloudinary."""
    # Verify podcast ownership
    podcast = query_one(
        "SELECT id FROM podcasts WHERE id=%s AND user_id=%s",
        (podcast_id, current_user["id"])
    )
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    # Save temp file
    temp_dir = "./uploads/sessions"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"session_{podcast_id}.webm")
    
    with open(temp_path, "wb") as f:
        f.write(await video.read())

    # Upload to Cloudinary as video
    from services import storage_service
    video_url = await storage_service.upload_video(temp_path, f"session_{podcast_id}.mp4")

    # Update DB
    query(
        "UPDATE podcasts SET session_video_url=%s WHERE id=%s",
        (video_url, podcast_id),
        fetch=False
    )

    # Cleanup
    if os.path.exists(temp_path):
        os.remove(temp_path)

    return {"status": "success", "url": video_url}


@router.delete("/podcasts/{podcast_id}/session")
async def delete_podcast_session(
    podcast_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Clear the session_video_url for a podcast."""
    podcast = query_one(
        "SELECT id FROM podcasts WHERE id=%s AND user_id=%s",
        (podcast_id, current_user["id"])
    )
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    query(
        "UPDATE podcasts SET session_video_url = NULL WHERE id=%s",
        (podcast_id,),
        fetch=False
    )
    return {"message": "Session video cleared"}
