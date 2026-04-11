"""Application configuration"""

import os
from typing import Optional


class Settings:
    """Application settings"""

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = ""  # Must be set via SECRET_KEY env var
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/alphaai"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # AI/ML Models
    DEEPFAKE_MODEL_PATH: str = "/models/deepfake"
    COMPLIANCE_MODEL_PATH: str = "/models/compliance"

    # External Services
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None

    def __init__(self):
        self.HOST = os.getenv("HOST", self.HOST)
        self.PORT = int(os.getenv("PORT", str(self.PORT)))
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", self.ENVIRONMENT)
        self.SECRET_KEY = os.getenv("SECRET_KEY", self.SECRET_KEY)
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY environment variable must be set")
        self.DATABASE_URL = os.getenv("DATABASE_URL", self.DATABASE_URL)
        self.REDIS_URL = os.getenv("REDIS_URL", self.REDIS_URL)
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", self.OPENAI_API_KEY)
        self.ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", self.ANTHROPIC_API_KEY)
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY", self.GROQ_API_KEY)
        self.DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", self.DEEPSEEK_API_KEY)
        self.GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", self.GOOGLE_API_KEY)


settings = Settings()
