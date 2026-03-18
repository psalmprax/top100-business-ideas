"""Database configuration and engine setup"""

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
import os

# SQLite database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# Create engine
# connect_args={"check_same_thread": False} is only required for SQLite
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
