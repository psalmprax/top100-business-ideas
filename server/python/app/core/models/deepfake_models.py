"""
Deepfake Models - AI-generated content detection and biometric authentication models
"""

from sqlmodel import SQLModel, Field, Column, JSON
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


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
    __tablename__ = "verification_sessions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    media_url: str = Field(default="")
    media_type: MediaType = Field(default=MediaType.VIDEO)
    result: AnalysisResult = Field(default=AnalysisResult.UNCERTAIN)
    confidence: float = Field(default=0.0)
    details: Dict[str, Any] = Field(default={}, sa_column=Column("metadata_json", JSON))
    verified_at: datetime = Field(default_factory=datetime.utcnow)
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

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID
    challenge: str
    status: AuthenticationStatus = Field(default=AuthenticationStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime


class BiometricSignature(SQLModel, table=True):
    """Cryptographically signed proof of presence"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    challenge_id: uuid.UUID = Field(foreign_key="hardwarechallenge.id")
    signature: str
    hardware_id: uuid.UUID
    verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TrainingStatus(str, Enum):
    """Status of a training job"""

    QUEUED = "queued"
    TRAINING = "training"
    COMPLETED = "completed"
    FAILED = "failed"


class TrainingJob(SQLModel, table=True):
    """Persistent Training Run"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    dataset_name: str
    dataset_file_path: str
    status: TrainingStatus = Field(default=TrainingStatus.QUEUED)
    progress: int = Field(default=0)
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


class CustomModel(SQLModel, table=True):
    """Persistent Custom Neural Model"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    base_architecture: str
    dataset_id: Optional[str] = None
    version: str = Field(default="1.0.0")
    accuracy: float = Field(default=0.0)
    status: str = Field(default="deployed")
    last_trained: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DuressConfig(SQLModel, table=True):
    """Persistent Duress/Silent Alarm configuration"""
    __tablename__ = "duress_configs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True, unique=True, foreign_key="users.id")
    panic_phrase: str = Field(default="alaska")
    silent_mode: bool = Field(default=True)
    trigger_action: str = Field(default="alert_security")  # lock_account, alert_security, fake_data
    enabled: bool = Field(default=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BiometricTemplate(SQLModel, table=True):
    """Enrolled biometric templates for liveness comparison"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)
    type: str  # face, voice, fingerprint
    template_hash: str
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: Optional[datetime] = None
    cancellable: bool = Field(default=True)


class WearableDevice(SQLModel, table=True):
    """Registered wearable devices for hardware-backed liveness"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)
    name: str
    device_type: str  # vision_pro, apple_watch, android_wear
    status: str = Field(default="active")
    registered_at: datetime = Field(default_factory=datetime.utcnow)
    last_synced: Optional[datetime] = None


class CryptoWallet(SQLModel, table=True):
    """Protected cryptocurrency wallets requiring biometric consent"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)
    name: str
    wallet_address: str
    blockchain: str  # ethereum, solana, bitcoin
    protection_enabled: bool = Field(default=True)
    last_verified: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DeepfakeThreat(SQLModel, table=True):
    """Deepfake threat model for alerting and tracking"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    type: str  # injection, bypass, spoofing, synthetic
    severity: str  # low, medium, high, critical
    description: str
    media_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TravelKiosk(SQLModel, table=True):
    """Registered Travel Kiosks for hardware-backed compliance"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    location: str
    status: str = Field(default="online")
    last_ping: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class KioskVerificationSession(SQLModel, table=True):
    """Persistent Kiosk Verification Sessions for border control"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    session_id: str = Field(index=True, unique=True)
    kiosk_id: str
    kiosk_location: Optional[str] = None
    verification_level: str
    passenger_name: Optional[str] = None
    passenger_id: Optional[str] = None
    status: str = Field(default="pending")
    challenges_json: Optional[Dict[str, Any]] = Field(
        default={}, sa_column=Column(JSON)
    )
    challenge_results_json: Optional[Dict[str, Any]] = Field(
        default={}, sa_column=Column(JSON)
    )
    biometric_data_json: Optional[Dict[str, Any]] = Field(
        default={}, sa_column=Column(JSON)
    )
    final_result_json: Optional[Dict[str, Any]] = Field(
        default={}, sa_column=Column(JSON)
    )
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
