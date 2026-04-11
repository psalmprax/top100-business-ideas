"""
Agent Models - Domain-specific models for AI agent management
"""

from sqlmodel import SQLModel, Field, Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import uuid
import secrets


class AgentStatus(str, Enum):
    """Agent status enum"""

    RUNNING = "RUNNING"
    STOPPED = "STOPPED"
    ERROR = "ERROR"
    PAUSED = "PAUSED"


class AgentType(str, Enum):
    """Agent type enum"""

    data_processing = "data_processing"
    content_generation = "content_generation"
    analysis = "analysis"
    automation = "automation"
    langgraph = "langgraph"
    crewai = "crewai"
    autogen = "autogen"
    custom = "custom"
    openai = "openai"
    metagpt = "metagpt"
    pydanticai = "pydanticai"


class Agent(SQLModel, table=True):
    """Agent model with persistent storage"""

    __tablename__ = "agents"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    type: AgentType
    environment: str = Field(default="production")
    provider: str = Field(default="openai")
    model: str = Field(default="gpt-4o")
    org_id: Optional[str] = None
    control_webhook: Optional[str] = None
    persistent_memory: bool = Field(default=True)
    tier: str = Field(default="industrial")  # strategic, tactical, industrial
    api_secret: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    provider_api_key: Optional[str] = Field(default=None)
    config: Optional[Dict[str, Any]] = Field(default={}, sa_column=Column(JSON))
    budget: float = Field(default=10.0)
    daily_spend: float = Field(default=0.0)
    metrics: Dict[str, Any] = Field(
        default={"costSaved": 0.0, "loopsPrevented": 0, "totalRequests": 0},
        sa_column=Column(JSON),
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
    persistent_memory: bool = True
    tier: str = "industrial"
    provider_api_key: Optional[str] = None
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
    persistent_memory: Optional[bool] = None
    tier: Optional[str] = None
    provider_api_key: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    status: Optional[AgentStatus] = None
    budget: Optional[float] = None


class SkillInstall(SQLModel):
    """Marketplace skill installation request"""

    skill_id: uuid.UUID
    metadata: Optional[Dict[str, Any]] = {}


# Agent Operations Models


class WebhookConfig(SQLModel, table=True):
    """Persistent Webhook Subscription"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    url: str
    events: list[str] = Field(sa_column=Column(JSON))
    secret: Optional[str] = None
    enabled: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_triggered: Optional[datetime] = None
    trigger_count: int = Field(default=0)
    failure_count: int = Field(default=0)


class WebhookExecution(SQLModel, table=True):
    """Execution history for webhooks"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    webhook_id: uuid.UUID = Field(index=True)
    event_type: str
    payload: Dict[str, Any] = Field(sa_column=Column(JSON))
    status: str  # success, error, timeout
    status_code: Optional[int] = None
    error_message: Optional[str] = None
    duration_ms: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AlertConfig(SQLModel, table=True):
    """Persistent AI Alert rules"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    alert_type: str  # budget, failure, rate_limit, bias
    threshold: float
    limit: float = Field(default=100.0)  # Budget limit in USD
    action: str = Field(default="pause")  # notify, pause, terminate
    priority: str = Field(default="medium")  # low, medium, high
    is_active: bool = Field(default=True)
    channels: list[str] = Field(sa_column=Column(JSON))  # slack, email, pagerduty
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SovereignStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"


class SovereignStage(str, Enum):
    """Sovereign Matrix stages"""

    FINANCE = "finance"
    LEGAL = "legal"
    CRISIS = "crisis"
    RD = "rd"
    ETHICS = "ethics"


class SovereignRequest(SQLModel, table=True):
    """Human-in-the-loop approval request"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    stage: str  # finance, legal, crisis, etc.
    action: str
    reasoning: str
    context: Optional[str] = None
    status: SovereignStatus = Field(default=SovereignStatus.PENDING)
    reviewer: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MultiCloudStatus(SQLModel):
    """Multi-cloud provider status"""

    last_sync: datetime = Field(default_factory=datetime.utcnow)


class SelfHealingEvent(SQLModel, table=True):
    """Automated self-healing event log"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    agent_id: uuid.UUID
    event_type: str
    severity: str
    description: str
    action_taken: str
    resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentAuditLog(SQLModel, table=True):
    """Comprehensive audit trail for agent actions"""

    __tablename__ = "audit_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    agent_id: uuid.UUID = Field(index=True)
    action: str
    intent: str
    outcome: str
    reasoning: Optional[str] = None
    risk_score: float = Field(default=0.0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))


class AgentVigilanceAlert(SQLModel, table=True):
    """Persistent security and budget alerts for AgentOps"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    agent_id: Optional[str] = Field(default=None, index=True)
    type: str  # budget_breach, loop_detected, unauthorized_access, tool_failure
    severity: str  # low, medium, high, critical
    description: str
    metadata_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentMemorySegment(SQLModel, table=True):
    """Persistent memory segments for agents"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    agent_id: uuid.UUID = Field(index=True)
    content: str
    importance: float = Field(default=1.0)
    context_type: str = Field(default="short_term")  # short_term, long_term, semantic
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class OnPremDeployment(SQLModel, table=True):
    """On-premises deployment management"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    deployment_name: str
    kubernetes_version: str
    node_count: int = Field(default=1)
    status: str = Field(default="active")  # active, maintenance, offline
    last_health_check: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LLMUsageLog(SQLModel, table=True):
    """Granular log of all LLM requests for cost and performance auditing"""

    __tablename__ = "llm_usage_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    agent_id: Optional[uuid.UUID] = Field(default=None, index=True)
    provider: str = Field(index=True)
    model: str = Field(index=True)
    prompt_tokens: int = Field(default=0)
    completion_tokens: int = Field(default=0)
    total_tokens: int = Field(default=0)
    cost: float = Field(default=0.0)
    latency_ms: int = Field(default=0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="success")  # success, error, fallback
    error_message: Optional[str] = None
