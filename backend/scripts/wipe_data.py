import os
import sys

# Add backend directory to path so we can import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.database import query

def wipe_all_data():
    print("🗑️ Wiping all podcast data...")
    try:
        # Delete chat messages first (FK constraint)
        query("DELETE FROM chat_messages", fetch=False)
        # Delete all podcasts
        query("DELETE FROM podcasts", fetch=False)
        print("✅ Successfully deleted all podcasts and chat messages.")
    except Exception as e:
        print(f"❌ Error during wipe: {e}")

if __name__ == "__main__":
    wipe_all_data()
