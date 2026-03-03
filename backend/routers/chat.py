import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from services.database import query, query_one
from services import chat_service
from routers.auth import get_current_user

router = APIRouter()


class ChatRequest(BaseModel):
    podcast_id: str
    message: str
    blog_content: str = ""
    context_timestamp: float = 0.0


@router.post("/chat")
async def send_message(
    data: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    # Verify podcast belongs to user
    podcast = query_one(
        "SELECT id, blog_text FROM podcasts WHERE id=%s AND user_id=%s",
        (data.podcast_id, current_user["id"])
    )
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    # Use blog_text from DB if blog_content not provided
    context = data.blog_content or podcast.get("blog_text", "") or ""

    # Get conversation history
    history = query(
        """SELECT role, content FROM chat_messages
           WHERE podcast_id=%s ORDER BY created_at ASC LIMIT 20""",
        (data.podcast_id,)
    )
    history_list = [dict(h) for h in history]

    # Get AI response
    result = await chat_service.chat(
        message=data.message,
        blog_content=context,
        context_timestamp=data.context_timestamp,
        history=history_list
    )

    # Save user message
    query(
        """INSERT INTO chat_messages (id, podcast_id, role, content, timestamp_seconds)
           VALUES (%s, %s, 'user', %s, %s)""",
        (str(uuid.uuid4()), data.podcast_id, data.message, data.context_timestamp),
        fetch=False
    )

    # Save assistant message
    query(
        """INSERT INTO chat_messages (id, podcast_id, role, content, timestamp_seconds)
           VALUES (%s, %s, 'assistant', %s, %s)""",
        (str(uuid.uuid4()), data.podcast_id, result["reply"], data.context_timestamp),
        fetch=False
    )

    return result


@router.get("/chat/{podcast_id}/history")
async def get_history(
    podcast_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Verify ownership
    podcast = query_one(
        "SELECT id FROM podcasts WHERE id=%s AND user_id=%s",
        (podcast_id, current_user["id"])
    )
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    messages = query(
        """SELECT id, role, content, timestamp_seconds, created_at
           FROM chat_messages WHERE podcast_id=%s
           ORDER BY created_at ASC""",
        (podcast_id,)
    )
    return [dict(m) for m in messages]
