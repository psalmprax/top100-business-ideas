"""
Compliance Models - EU AI Act and regulatory compliance models
"""

from sqlmodel import SQLModel, Field, Column, JSON, Relationship
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


class ComplianceCheckType(str, Enum):
    """Compliance check type"""

    AI_ACT = "ai_act"
    PRIVACY = "privacy"
    SECURITY = "security"
    DEEPFAKE = "deepfake"


class ComplianceStatus(str, Enum):
    """Compliance status"""

    PASSED = "passed"
    FAILED = "failed"
    PENDING = "pending"
    REVIEW = "review"
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"


class ComplianceCheck(SQLModel, table=True):
    """Compliance check model with persistent storage"""

    __tablename__ = "compliance_checks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    type: ComplianceCheckType
    status: ComplianceStatus = Field(default=ComplianceStatus.PENDING)
    score: int = Field(default=0)
    findings: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    checked_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ComplianceCategory(SQLModel, table=True):
    """Compliance category model with persistent storage"""

    __tablename__ = "compliance_categories"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    color: str
    description: str


class RunComplianceCheckRequest(SQLModel):
    """Run compliance check request"""

    type: ComplianceCheckType
    url: Optional[str] = None


class ConnectionType(str, Enum):
    """System connection types"""

    CI_CD = "ci_cd"
    MODEL_REGISTRY = "model_registry"
    DATA_STORE = "data_store"
    MONITORING = "monitoring"
    EU_DATABASE = "eu_database"
    REGULATORY_PORTAL = "regulatory_portal"
    VECTOR_DB = "vector_db"
    COMPUTE_CLUSTER = "compute_cluster"
    IDENTITY_IAM = "identity_iam"
    HUMAN_FEEDBACK = "human_feedback"
    LEGAL_REPOSITORY = "legal_repository"
    CLOUD_INFRA = "cloud_infra"
    AI_GATEWAY = "ai_gateway"
    DATA_LAKEHOUSE = "data_lakehouse"


class SystemConnection(SQLModel, table=True):
    """System connection model for compliance automation"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    article_id: str  # e.g., "Article 5"
    connection_type: ConnectionType
    status: str = Field(default="connected")
    config: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ArticleScan(SQLModel, table=True):
    """Results of a compliance scan"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    article_id: str
    scan_type: str
    status: str = Field(default="completed")
    results: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    performed_at: datetime = Field(default_factory=datetime.utcnow)


class ComplianceArticle(SQLModel, table=True):
    """EU AI Act compliance article definition"""

    __tablename__ = "compliance_articles"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    article: str  # e.g., "Article 5"
    title: str
    description: str
    risk: str  # unacceptable, high, limited, minimal
    status: str = Field(
        default="pending"
    )  # compliant, non_compliant, not_applicable, pending
    evidence: Optional[str] = None
    remediation: Optional[str] = None
    integration_type: Optional[str] = None  # Model Registry, Use Case Registry, etc.
    scan_type: Optional[str] = None  # Policy Check, Classification, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ArticleStatus(SQLModel, table=True):
    __tablename__ = "articlestatus"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    model_id: uuid.UUID = Field(foreign_key="ai_models.id")
    article: str
    title: str
    status: str

    ai_model: Optional["AIModel"] = Relationship(back_populates="articles")


class BiasReport(SQLModel, table=True):
    __tablename__ = "bias_reports"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    model_id: uuid.UUID = Field(foreign_key="ai_models.id")
    bias_category: str = Field(default="demographic")
    disparate_impact: float = Field(default=0.0)
    statistical_significance: float = Field(default=0.0)
    severity: str = Field(default="low")
    status: str
    details: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    ai_model: Optional["AIModel"] = Relationship(back_populates="bias_reports")


class ComplianceAuditLog(SQLModel, table=True):
    """Persistent audit logs for HIPAA/SOX/GDPR compliance"""

    __tablename__ = "compliance_audit_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)
    action: str
    resource: str
    status: str = Field(default="verified")
    compliance_type: str  # HIPAA, SOX, Art. 14, GDPR
    metadata_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ForensicTrace(SQLModel, table=True):
    """Execution traces from the digital workforce"""

    __tablename__ = "forensic_traces"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True, foreign_key="users.id")
    agent_id: uuid.UUID = Field(foreign_key="agents.id")
    action: str
    details: dict = Field(default={}, sa_column=Column(JSON))
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class GovernanceDecision(SQLModel, table=True):
    """Sovereign governance decisions / sign-offs"""

    __tablename__ = "governance_decisions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True, foreign_key="users.id")
    stage: int
    decision: str  # e.g., "Human override", "Autonomous"
    status: str = Field(default="REVIEW_REQUIRED")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SLAAgreement(SQLModel, table=True):
    """Service Level Agreement configuration"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    tier: str  # bronze, silver, gold, platinum
    uptime_guarantee: float  # percentage, e.g., 99.9
    response_time_sla: int  # seconds
    resolution_time_sla: int  # hours
    support_channels: List[str] = Field(default=[], sa_column=Column(JSON))
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SLAMetric(SQLModel, table=True):
    """SLA performance metrics"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    sla_id: uuid.UUID = Field(foreign_key="slaagreement.id")
    period_start: datetime
    period_end: datetime
    actual_uptime: float
    avg_response_time: int
    incidents_count: int
    breaches_count: int
    status: str  # compliant, breached
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PartnerIntegration(SQLModel, table=True):
    """External partner integrations"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    partner_type: str  # api, webhook, oauth, sso
    api_key: Optional[str] = None
    webhook_url: Optional[str] = None
    oauth_config: Optional[Dict[str, Any]] = Field(default={}, sa_column=Column(JSON))
    permissions: List[str] = Field(default=[], sa_column=Column(JSON))
    active: bool = Field(default=True)
    last_sync: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UsageForecast(SQLModel, table=True):
    """AI usage forecasting data"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    agent_id: Optional[str] = None
    forecast_period: str  # daily, weekly, monthly
    predicted_tokens: int
    predicted_cost: float
    confidence_level: float
    forecast_date: datetime
    actual_tokens: Optional[int] = None
    actual_cost: Optional[float] = None
    accuracy_score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ROIMetric(SQLModel, table=True):
    """Return on Investment calculations"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    period: str  # monthly, quarterly, yearly
    period_start: datetime
    period_end: datetime
    total_cost: float
    value_generated: float
    roi_percentage: float
    payback_period_months: float
    cost_savings: float
    efficiency_gains: float
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LocalizationConfig(SQLModel, table=True):
    """Multi-language and regional configuration"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    language_code: str  # en, es, fr, de, etc.
    region_code: str  # US, EU, APAC, etc.
    timezone: str
    currency: str
    compliance_framework: str  # GDPR, CCPA, PIPL, etc.
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HealingConfiguration(SQLModel, table=True):
    """Self-healing system configuration"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    healing_type: str  # node_restart, failover, rollback, etc.
    trigger_conditions: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    recovery_actions: List[str] = Field(default=[], sa_column=Column(JSON))
    cooldown_period: int  # minutes
    max_attempts: int
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StrategicInsight(SQLModel, table=True):
    """Business intelligence and strategic insights"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    insight_type: str  # market_trend, competitive_analysis, opportunity, risk
    title: str
    description: str
    confidence_score: float
    impact_level: str  # high, medium, low
    recommended_actions: List[str] = Field(default=[], sa_column=Column(JSON))
    data_sources: List[str] = Field(default=[], sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SystemSetting(SQLModel, table=True):
    """Global system configuration settings"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    category: str  # security, performance, compliance, ui
    setting_key: str
    setting_value: str
    setting_type: str  # string, number, boolean, json
    description: str
    requires_restart: bool = Field(default=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ComplianceChecklistItem(SQLModel, table=True):
    """Specific checklist items for compliance sections"""

    __tablename__ = "compliance_checklist_items"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    category: str  # gov, reg, tech, ops, infra, fin
    section: str  # monitoring, audits, sla, risk, regional, etc.
    title: str
    description: str
    status: str = Field(default="pending")  # pending, compliant, non_compliant
    evidence: Optional[str] = None
    last_checked: datetime = Field(default_factory=datetime.utcnow)


class ComplianceIncident(SQLModel, table=True):
    """Reported compliance, forensic or bias incidents (Art 61/62)"""

    __tablename__ = "compliance_incidents"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    description: str
    severity: str = Field(default="medium")  # low, medium, high, critical
    incident_type: str = Field(
        default="security"
    )  # security, compliance, bias, forensic
    status: str = Field(default="open")  # open, investigating, resolved, closed
    reported_by: str
    affected_systems: List[str] = Field(default=[], sa_column=Column(JSON))
    article72: bool = Field(default=False)
    reported_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None


class Vendor(SQLModel, table=True):
    """AI supply chain vendor model (EU AI Act Supply Chain Governance)"""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    category: str = Field(default="software")
    type: str = Field(default="software")  # Matches frontend type field
    risk_level: str = Field(default="low")
    compliance_status: str = Field(
        default="vetted", alias="complianceStatus"
    )  # Matches frontend complianceStatus
    status: str = Field(default="vetted")
    last_assessment: Optional[datetime] = Field(
        default=None, alias="lastAssessment"
    )  # Matches frontend lastAssessment
    contact_email: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


