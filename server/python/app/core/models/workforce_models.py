"""
Workforce Models - AI workforce and business operations models
"""

from sqlmodel import SQLModel, Field, Column, JSON, Relationship
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


class InteractionStatus(str, Enum):
    """Status of a workforce agent interaction"""

    PENDING = "pending"
    APPROVED = "approved"
    DISCARDED = "discarded"
    REFINED = "refined"


class WorkforceInteraction(SQLModel, table=True):
    """Persistent storage for Workforce Agent interactions for learning"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    agent_role: str
    task_description: str
    output_content: str
    user_feedback: InteractionStatus = Field(default=InteractionStatus.PENDING)
    feedback_notes: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class OutreachStatus(str, Enum):
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    SENT = "SENT"
    REPLIED = "REPLIED"
    CONVERTED = "CONVERTED"
    DISCARDED = "DISCARDED"


class WorkforceOutreach(SQLModel, table=True):
    """Persistent storage for Outreach message previews for human-in-the-loop approval"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    recipient_name: str
    recipient_company: str
    recipient_role: Optional[str] = None
    subject: str
    body: str
    status: OutreachStatus = Field(default=OutreachStatus.PENDING_APPROVAL)
    niche: str = Field(index=True)
    profile: str = Field(default="enterprise")
    score: float = Field(default=0.0)
    interaction_id: Optional[str] = Field(
        default=None, foreign_key="workforceinteraction.id"
    )
    is_auto_trigger: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class WorkforceMessage(SQLModel, table=True):
    """Persistent storage for multi-agent and user-to-agent dialogue"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    sender: str  # "user" or agent role (e.g., "Prospector")
    recipient: str = Field(default="all")  # "all" (group) or specific agent role
    content: str
    reasoning_path: Optional[str] = None  # Agent's internal dialogue/cross-reasoning
    is_group_chat: bool = Field(default=True)
    interaction_id: Optional[str] = Field(
        default=None, foreign_key="workforceinteraction.id"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WorkforceSkill(SQLModel, table=True):
    """Persistent storage for the Workforce Skills Marketplace"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    provider: str = Field(default="Alpha Proprietary")
    description: str
    marketing_description: Optional[str] = None
    powers_json: List[str] = Field(default=[], sa_column=Column(JSON))
    icon: str = Field(default="Zap")
    color: str = Field(default="bg-blue-500")
    repo_url: Optional[str] = None
    is_proprietary: bool = Field(default=True)
    price: str = Field(default="$0")
    jobs_completed: int = Field(default=0)
    status: str = Field(default="active")
    category: str = Field(default="general")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WorkforceJob(SQLModel, table=True):
    """Persistent storage for the Live Job Feed"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str
    client: str
    price: str
    status: str = Field(default="Auto-Accepted")
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WorkforceAcquisition(SQLModel, table=True):
    """Persistent storage for Growth Acquisition Wins"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    client: str
    value: str
    source: str
    won_at: datetime = Field(default_factory=datetime.utcnow)


class WorkforceContent(SQLModel, table=True):
    """Persistent storage for Content Factory drafts"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str
    type: str  # Blog, Case Study, LinkedIn
    status: str = Field(default="Ready")
    roi_metric: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WorkforceVenture(SQLModel, table=True):
    """Persistent Business Unit / Venture performance tracking"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    sector: str
    roi: float = Field(default=0.0)
    status: str = Field(default="BETA")  # PROFITABLE, SCALING, R&D, BETA
    trend: str = Field(default="up")  # up, down
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FiscalRequest(SQLModel, table=True):
    """Persistent spending approval request"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    purpose: str
    amount: str
    priority: str = Field(default="MEDIUM")  # LOW, MEDIUM, HIGH
    status: str = Field(default="PENDING")  # PENDING, APPROVED, DENIED
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WorkforceGoal(SQLModel, table=True):
    """Persistent Board Directives and KPIs"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    current_value: float
    target_value: float
    unit: str = Field(default="%")
    category: str = Field(default="revenue")  # revenue, burn_rate, roi, compliance
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MarketResearch(SQLModel, table=True):
    """Persistent Market Research from Paperclip Agent"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    topic: str = Field(index=True)
    confidence_score: int = Field(default=0)
    market_temperature: str = Field(default="Stable")
    competitors: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    swot: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    summary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProductStrategy(SQLModel, table=True):
    """Persistent Product Strategy from Hermes Agent"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    project: str = Field(index=True)
    strategy_score: int = Field(default=0)
    roadmap: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    ux_blueprint: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    recommendation: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Task(SQLModel, table=True):
    """Task management for workflow bot"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str
    status: str  # pending, in_progress, completed, cancelled
    priority: str  # low, medium, high
    assignee: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


class Client(SQLModel, table=True):
    """Client CRM for workflow bot"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    status: str  # prospect, active, inactive, churned
    industry: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_contact: Optional[datetime] = None


class ScheduleEvent(SQLModel, table=True):
    """Scheduled events and calendar for workflow bot"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    event_type: str  # meeting, call, deadline, reminder
    location: Optional[str] = None
    is_all_day: bool = False
    reminder_minutes: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Integration(SQLModel, table=True):
    """Third-party integrations for workflow bot"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    service: str  # stripe, slack, github, notion, calendly, zapier
    status: str  # disconnected, connecting, connected, error
    config: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_sync: Optional[datetime] = None


class BotSetting(SQLModel, table=True):
    """Workflow bot configuration settings"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str
    setting_key: str
    setting_value: Any = Field(sa_column=Column(JSON))
    setting_type: str  # boolean, string, number, json
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
