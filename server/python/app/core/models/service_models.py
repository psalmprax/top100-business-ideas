"""
Additional service models for Shadow AI, White Label, and Edge services.
"""

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ShadowAIRiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ShadowAIStatus(str, Enum):
    DETECTED = "detected"
    INVESTIGATING = "investigating"
    REMEDIATED = "remediated"
    APPROVED = "approved"


class ShadowAIDetection(SQLModel, table=True):
    __tablename__ = "shadow_ai_detections"

    id: Optional[int] = Field(default=None, primary_key=True)
    detection_id: str = Field(index=True, unique=True)
    tool_name: str
    vendor: str
    department: str
    risk_level: str = Field(default="medium")
    user_count: int = Field(default=1)
    status: str = Field(default="detected")
    detected_at: datetime = Field(default=datetime.utcnow)
    remediated_at: Optional[datetime] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.detection_id,
            "tool_name": self.tool_name,
            "vendor": self.vendor,
            "department": self.department,
            "risk_level": self.risk_level,
            "user_count": self.user_count,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None,
            "status": self.status,
        }


class WhiteLabelTier(str, Enum):
    STARTER = "starter"
    GROWTH = "growth"
    ENTERPRISE = "enterprise"


class WhiteLabelStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"


class WhiteLabelTenant(SQLModel, table=True):
    __tablename__ = "white_label_tenants"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: str = Field(index=True, unique=True)
    name: str
    tier: str = Field(default="starter")
    status: str = Field(default="pending")
    primary_color: str = Field(default="#3B82F6")
    secondary_color: str = Field(default="#FFFFFF")
    accent_color: str = Field(default="#0EA5E9")
    logo_url: Optional[str] = None
    company_name: str = Field(default="My Company")
    created_at: datetime = Field(default=datetime.utcnow)
    updated_at: datetime = Field(default=datetime.utcnow)


class EdgeDeviceStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    ERROR = "error"


class EdgeDeviceType(str, Enum):
    PLC_CONTROLLER = "plc_controller"
    VISION_SYSTEM = "vision_system"
    ROBOT_CONTROLLER = "robot_controller"
    INDUSTRIAL_CONTROLLER = "industrial_controller"
    GATEWAY = "gateway"
    SENSOR = "sensor"


class EdgeDevice(SQLModel, table=True):
    __tablename__ = "edge_devices"

    id: Optional[int] = Field(default=None, primary_key=True)
    device_id: str = Field(index=True, unique=True)
    location: str
    device_type: str = Field(default="industrial_controller")
    status: str = Field(default="active")
    firmware_version: Optional[str] = None
    last_seen: datetime = Field(default=datetime.utcnow)
    metadata_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default=datetime.utcnow)


class EdgeAuditLog(SQLModel, table=True):
    __tablename__ = "edge_audit_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    device_id: str = Field(index=True)
    log_type: str
    event_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    timestamp: datetime = Field(default=datetime.utcnow)
