import sqlite3
import os

# Path to the database
DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")

def migrate():
    print(f"Connecting to database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        print("Adding global identification columns to 'agent' table...")
        
        # Add new columns with default values
        cursor.execute("ALTER TABLE agent ADD COLUMN environment TEXT DEFAULT 'production'")
        cursor.execute("ALTER TABLE agent ADD COLUMN provider TEXT DEFAULT 'openai'")
        cursor.execute("ALTER TABLE agent ADD COLUMN model TEXT DEFAULT 'gpt-4o'")
        cursor.execute("ALTER TABLE agent ADD COLUMN org_id TEXT")
        cursor.execute("ALTER TABLE agent ADD COLUMN control_webhook TEXT")
        cursor.execute("ALTER TABLE agent ADD COLUMN api_secret TEXT")
        
        # Generate initial secrets for existing agents if any
        import secrets
        cursor.execute("SELECT id FROM agent WHERE api_secret IS NULL")
        agents = cursor.fetchall()
        for agent_id, in agents:
            new_secret = secrets.token_urlsafe(32)
            cursor.execute("UPDATE agent SET api_secret = ? WHERE id = ?", (new_secret, agent_id))

        conn.commit()
        print("Migration successful!")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Columns already exist. Skipping.")
        else:
            print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
