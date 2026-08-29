import sys
import os

# Set standard output encoding to utf-8 if possible
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from app.db.session import engine, SessionLocal
from app.db.base_class import Base
import app.models  # Ensures all ORM models are registered
from app.seed.seed_data import seed_db

def init_db():
    print("[*] Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("[+] Tables created successfully.")

    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
