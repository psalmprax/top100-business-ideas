"""
AI Models - Core AI model management and training models
"""

from sqlmodel import SQLModel, Field, Column, JSON, Relationship
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid


class AIModel(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    riskCategory: str
    status: str = "pending"
    complianceScore: float = 0.0
    lastAudit: Optional[datetime] = None
    nextAudit: Optional[datetime] = None
    provider: Optional[str] = None
    endpointUrl: Optional[str] = None
    apiKey: Optional[str] = None

    # Ethical Guardrails Configuration
    activeBiasMitigation: bool = Field(default=False)
    toxicLanguageFilter: bool = Field(default=False)
    promptPrivacyGuard: bool = Field(default=False)

    articles: List["ArticleStatus"] = Relationship(
        back_populates="ai_model",
        sa_relationship_kwargs={"lazy": "selectin", "cascade": "all, delete-orphan"},
    )
    bias_reports: List["BiasReport"] = Relationship(
        back_populates="ai_model",
        sa_relationship_kwargs={"lazy": "selectin", "cascade": "all, delete-orphan"},
    )


class AIModelCreate(SQLModel):
    """AI Model creation schema"""

    name: str
    riskCategory: str
    provider: str
    endpointUrl: Optional[str] = None
    apiKey: Optional[str] = None


class TrainingModule(SQLModel, table=True):
    """Educational training module for compliance and ethics"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str
    description: str
    category: str  # ai-act, gdpr, security, ethics
    duration_minutes: int
    content: str  # Markdown content
    quiz_questions: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TrainingProgress(SQLModel, table=True):
    """User progress through a training module"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    module_id: str = Field(foreign_key="trainingmodule.id")
    status: str = Field(
        default="not_started"
    )  # not_started, in_progress, completed, certified, expired
    progress_percent: int = Field(default=0)
    quiz_score: Optional[float] = Field(default=None)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    certified_at: Optional[datetime] = Field(default=None)
    certificate_id: Optional[str] = Field(default=None)


class WhiteLabelConfig(SQLModel, table=True):
    """White-label configuration for branded deployments"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    brand_name: str
    logo_url: str
    primary_color: str
    secondary_color: str
    custom_css: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BusinessIdea(SQLModel, table=True):
    """Persistent Business Idea for the Top 100 Report"""

    id: int = Field(default=None, primary_key=True)
    title: str
    category: str
    market: str
    description: str
    earning_potential: str
    rollout_speed: str
    trend: str  # Explosive, High Growth, Steady
    rank: int
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Subscription(SQLModel, table=True):
    """Persistent user subscription from Billing Engine"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    stripe_subscription_id: Optional[str] = Field(default=None, index=True)
    plan: str  # professional, enterprise, starter
    status: str = Field(default="active")  # active, canceled, past_due
    current_period_end: datetime
    cancel_at_period_end: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Invoice(SQLModel, table=True):
    """Persistent billing invoice from Stripe/Engine"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    stripe_invoice_id: Optional[str] = Field(default=None, index=True)
    invoice_number: str = Field(index=True)
    amount: float
    status: str = Field(default="paid")  # paid, open, void
    date: datetime = Field(default_factory=datetime.utcnow)
    pdf_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
