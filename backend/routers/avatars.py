import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.database import query, query_one
from services.cache_service import get_job
from routers.auth import get_current_user

router = APIRouter()

# Avatar to GLB mapping
AVATAR_MAP = {
    "avatar-1": "/avatar/RobotExpressive.glb",
    "avatar-2": "/avatar/Michelle.glb",
    "avatar-3": "/avatar/Xbot.glb",
    "avatar-4": "/avatar/RobotExpressive.glb",
}


@router.get("/avatars")
async def list_avatars():
    """Return list of available local GLB avatars."""
    return [
        {"id": "avatar-1", "name": "Robot", "glb_url": "/avatar/RobotExpressive.glb"},
        {"id": "avatar-2", "name": "Michelle", "glb_url": "/avatar/Michelle.glb"},
        {"id": "avatar-3", "name": "Xbot", "glb_url": "/avatar/Xbot.glb"},
        {"id": "avatar-4", "name": "Robot Classic", "glb_url": "/avatar/RobotExpressive.glb"},
    ]
