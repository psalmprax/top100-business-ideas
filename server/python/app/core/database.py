"""Database configuration and engine setup"""

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
import os
from app.core.config import settings

# Database connection string
DATABASE_URL = settings.DATABASE_URL

# Fallback: construct from components if it's the default or missing
if DATABASE_URL == "postgresql://localhost:5432/top100ideas" or not DATABASE_URL:
    db_user = os.getenv("DB_USER", "postgres")
    db_pass = os.getenv("DB_PASSWORD", "postgres")
    db_host = os.getenv("DB_HOST", "db")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "alphaai")
    DATABASE_URL = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

def init_db():
    """Initialize database and create tables"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for getting database sessions"""
    with Session(engine) as session:
        yield session

