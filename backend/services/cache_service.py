import redis as redis_client
import hashlib
import os
import json
from dotenv import load_dotenv

load_dotenv()

r = redis_client.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)


def get_hash(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


async def get_cached_script(blog_text: str):
    return r.get(f"script:{get_hash(blog_text)}")


async def cache_script(blog_text: str, script: str):
    r.setex(f"script:{get_hash(blog_text)}", 86400, script)


async def set_job(job_id: str, data: dict):
    r.setex(f"job:{job_id}", 3600, json.dumps(data))


async def get_job(job_id: str):
    data = r.get(f"job:{job_id}")
    return json.loads(data) if data else None


async def update_job(job_id: str, updates: dict):
    existing = await get_job(job_id)
    if existing:
        existing.update(updates)
        await set_job(job_id, existing)
