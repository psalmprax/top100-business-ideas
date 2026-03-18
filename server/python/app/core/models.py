from sqlmodel import SQLModel, Field, Column, JSON
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid
import secrets


class AgentStatus(str, Enum):
    """Agent status enum"""
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"


class AgentType(str, Enum):
    """Agent type enum"""
    DATA_PROCESSING = "data_processing"
    CONTENT_GENERATION = "content_generation"
    ANALYSIS = "analysis"
    AUTOMATION = "automation"


class Agent(SQLModel, table=True):
    """Agent model with persistent storage"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    type: AgentType
    environment: str = Field(default="production")
    provider: str = Field(default="openai")
    model: str = Field(default="gpt-4o")
    org_id: Optional[str] = None
    control_webhook: Optional[str] = None
    api_secret: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    config: Optional[Dict[str, Any]] = Field(default={}, sa_column=Column(JSON))
    budget: float = Field(default=10.0)
    dailySpend: float = Field(default=0.0)
    metrics: Dict[str, Any] = Field(
        default={"costSaved": 0.0, "loopsPrevented": 0, "totalRequests": 0},
        sa_column=Column(JSON)
    )
    status: AgentStatus = Field(default=AgentStatus.STOPPED)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AgentCreate(SQLModel):
    """Agent creation model"""
    name: str
    type: AgentType
    environment: str = "production"
    provider: str = "openai"
    model: str = "gpt-4o"
    org_id: Optional[str] = None
    control_webhook: Optional[str] = None
    config: Optional[Dict[str, Any]] = {}
    budget: float = 10.0


class AgentUpdate(SQLModel):
    """Agent update model"""
    name: Optional[str] = None
    type: Optional[AgentType] = None
    environment: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    org_id: Optional[str] = None
    control_webhook: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    status: Optional[AgentStatus] = None
    budget: Optional[float] = None


# Compliance Models
class ComplianceCheckType(str, Enum):
    """Compliance check type"""
    AI_ACT = "ai_act"
    PRIVACY = "privacy"
    SECURITY = "security"


class ComplianceStatus(str, Enum):
    """Compliance status"""
    PASSED = "passed"
    FAILED = "failed"
    PENDING = "pending"
    REVIEW = "review"


class ComplianceCheck(SQLModel, table=True):
    """Compliance check model with persistent storage"""
    id: str = Field(primary_key=True)
    type: ComplianceCheckType
    status: ComplianceStatus = Field(default=ComplianceStatus.PENDING)
    score: int = Field(default=0)
    findings: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    checked_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ComplianceCategory(SQLModel):
    """Compliance category model"""
    id: str
    name: str
    color: str
    description: str


class RunComplianceCheckRequest(SQLModel):
    """Run compliance check request"""
    type: ComplianceCheckType
    url: Optional[str] = None


# Deepfake Models
class MediaType(str, Enum):
    """Media type"""
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"


class AnalysisResult(str, Enum):
    """Analysis result"""
    REAL = "real"
    FAKE = "fake"
    UNCERTAIN = "uncertain"


class DeepfakeAnalysis(SQLModel, table=True):
    """Deepfake analysis model with persistent storage"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    media_url: str
    media_type: MediaType
    result: AnalysisResult = Field(default=AnalysisResult.UNCERTAIN)
    confidence: int = Field(default=0)
    details: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    analysis_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AnalyzeDeepfakeRequest(SQLModel):
    """Analyze deepfake request"""
    media_url: str
    media_type: MediaType


class AuthenticationStatus(str, Enum):
    """Authentication session status"""
    PENDING = "pending"
    VERIFIED = "verified"
    FAILED = "failed"
    EXPIRED = "expired"


class HardwareChallenge(SQLModel, table=True):
    """FIDO2-style hardware challenge for active authentication"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str
    challenge: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    status: AuthenticationStatus = Field(default=AuthenticationStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime


class BiometricSignature(SQLModel, table=True):
    """Cryptographically signed proof of presence"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    challenge_id: str = Field(foreign_key="hardwarechallenge.id")
    signature: str
    hardware_id: str
    verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Auth Models
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


class User(UserBase, table=True):
    """User model with persistent storage"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    role: str = Field(default="user")
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Generic Response Models
class PaginatedResponse(SQLModel):
    """Paginated response"""
    data: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


class SuccessResponse(SQLModel):
    """Success response"""
    message: str
    data: Optional[Dict[str, Any]] = None


class ErrorResponse(SQLModel):
    """Error response"""
    error: str
    code: Optional[str] = None
    details: Optional[Any] = None
