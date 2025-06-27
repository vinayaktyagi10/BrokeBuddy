import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent.parent / "users.db"
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = conn.cursor()

# Create table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    plaid_access_token TEXT
)
""")
conn.commit()
