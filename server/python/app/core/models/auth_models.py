"""
Authentication Models - User management and auth-related models
"""

from sqlmodel import SQLModel, Field, Column, JSON
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class Token(SQLModel):
    """Token model"""

    access_token: str
    token_type: str


class TokenData(SQLModel):
    """Token data"""

    user_id: Optional[str] = None


class UserBase(SQLModel):
    """Base user model"""

    email: str
    name: str


class UserCreate(UserBase):
    """User creation model"""

    password: str
    company: Optional[str] = None


class User(UserBase, table=True):
    """User model with persistent storage"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    password_hash: str = Field(alias="password_hash")
    company: Optional[str] = None
    role: str = Field(default="user")
    stripe_customer_id: Optional[str] = None
    subscription_tier: str = Field(default="free")
    subscription_status: str = Field(default="active")
    allowed_products: List[str] = Field(default=[], sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PasswordReset(SQLModel, table=True):
    """Password reset token storage"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    token: str = Field(index=True, unique=True)
    expires_at: datetime
    used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SecurityKey(SQLModel, table=True):
    """Persistent rotated API keys and security credentials"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str  # "Main API Key", "Partner SDK", etc.
    key_hash: str
    prefix: str  # "sk_live_..."
    status: str = Field(default="active")  # active, revoked, rotated
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
