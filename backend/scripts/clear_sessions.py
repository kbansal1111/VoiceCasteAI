import os
import sys

# Add backend directory to path so we can import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.database import query

def clear_all_sessions():
    print("🧹 Starting session cleanup...")
    try:
        # Reset session_video_url for ALL podcasts
        query("UPDATE podcasts SET session_video_url = NULL", fetch=False)
        print("✅ Successfully cleared all session video links from the database.")
        print("   The physical files in Cloudinary remain, but the library is now clean.")
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")

if __name__ == "__main__":
    clear_all_sessions()
