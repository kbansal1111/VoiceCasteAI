"""
Initialize the VoiceCast AI PostgreSQL database schema.
Run this once before starting the backend for the first time.
Usage: python init_db.py
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


def init_db():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", 5432),
        dbname=os.getenv("DB_NAME", "voicecast_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "voicecast"),
    )
    cur = conn.cursor()

    print("Creating tables...")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email       VARCHAR(255) UNIQUE NOT NULL,
            name        VARCHAR(255) NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at  TIMESTAMPTZ DEFAULT NOW()
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS podcasts (
            id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title               TEXT NOT NULL,
            status              VARCHAR(50) DEFAULT 'pending',
            stage               VARCHAR(50) DEFAULT 'queued',
            progress            INTEGER DEFAULT 0,
            script              TEXT,
            audio_url           TEXT,
            video_url           TEXT,
            lipsync_json        TEXT,
            transcript_json     TEXT,
            duration_seconds    FLOAT,
            voice_style         VARCHAR(50) DEFAULT 'professional',
            language            VARCHAR(10) DEFAULT 'en',
            avatar_type         VARCHAR(50) DEFAULT 'avatar-1',
            background          VARCHAR(100) DEFAULT 'gradient-1',
            blog_url            TEXT,
            blog_text           TEXT,
            session_video_url   TEXT,
            created_at          TIMESTAMPTZ DEFAULT NOW()
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            podcast_id          UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
            role                VARCHAR(20) NOT NULL,
            content             TEXT NOT NULL,
            timestamp_seconds   FLOAT DEFAULT 0,
            created_at          TIMESTAMPTZ DEFAULT NOW()
        );
    """)

    # Indexes
    cur.execute("CREATE INDEX IF NOT EXISTS idx_podcasts_user_id ON podcasts(user_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_chat_podcast_id ON chat_messages(podcast_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_podcasts_status ON podcasts(status);")

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database initialized successfully!")
    print("   Tables created: users, podcasts, chat_messages")


if __name__ == "__main__":
    init_db()
