import psycopg2
from psycopg2.pool import ThreadedConnectionPool
from psycopg2.extras import RealDictCursor
import os
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

# Create a connection pool to handle up to 100 concurrent users safely
try:
    db_pool = ThreadedConnectionPool(
        minconn=1,
        maxconn=100,
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", 5432),
        dbname=os.getenv("DB_NAME", "voicecast_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "voicecast"),
        cursor_factory=RealDictCursor
    )
except Exception as e:
    print(f"Error initializing database connection pool: {e}")
    db_pool = None

@contextmanager
def get_db_connection():
    """Yields a database connection from the pool."""
    if not db_pool:
        raise Exception("Database connection pool is not initialized.")
    conn = db_pool.getconn()
    try:
        yield conn
    finally:
        db_pool.putconn(conn)


def query(sql, params=None, fetch=True):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            if fetch:
                conn.commit()
                return cur.fetchall()
            else:
                conn.commit()
                return cur.rowcount


def query_one(sql, params=None):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            conn.commit()
            return cur.fetchone()
