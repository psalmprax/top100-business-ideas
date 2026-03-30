from sqlmodel import SQLModel, Field, Column, JSON, Relationship
from typing import List, Optional, Dict, Any
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    type: AgentType
    environment: str = Field(default="production")
    provider: str = Field(default="openai")
    model: str = Field(default="gpt-4o")
    org_id: Optional[str] = None
    control_webhook: Optional[str] = None
    tier: str = Field(default="industrial") # strategic, tactical, industrial
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
    tier: str = "industrial"
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
    tier: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    status: Optional[AgentStatus] = None
    budget: Optional[float] = None


# Connection & Integration Models
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    article_id: str  # e.g., "Article 5"
    connection_type: ConnectionType
    status: str = Field(default="connected")
    config: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ArticleScan(SQLModel, table=True):
    """Results of a compliance scan"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    article_id: str
    scan_type: str
    status: str = Field(default="completed")
    results: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    performed_at: datetime = Field(default_factory=datetime.utcnow)


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


# --- NEW AGENT OPS PERSISTENT MODELS ---

class WebhookConfig(SQLModel, table=True):
    """Persistent Webhook Subscription"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    url: str
    events: List[str] = Field(sa_column=Column(JSON))
    secret: Optional[str] = None
    enabled: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_triggered: Optional[datetime] = None
    trigger_count: int = Field(default=0)
    failure_count: int = Field(default=0)


class WebhookExecution(SQLModel, table=True):
    """Execution history for webhooks"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    webhook_id: str = Field(index=True)
    event_type: str
    payload: Dict[str, Any] = Field(sa_column=Column(JSON))
    status: str  # success, error, timeout
    status_code: Optional[int] = None
    error_message: Optional[str] = None
    duration_ms: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AlertConfig(SQLModel, table=True):
    """Persistent AI Alert rules"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    alert_type: str  # budget, failure, rate_limit, bias
    threshold: float
    limit: float = Field(default=100.0) # Budget limit in USD
    action: str = Field(default="pause") # notify, pause, terminate
    priority: str = Field(default="medium") # low, medium, high
    is_active: bool = Field(default=True)
    channels: List[str] = Field(sa_column=Column(JSON))  # slack, email, pagerduty
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    stage: str # finance, legal, crisis, etc.
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    agent_id: str
    event_type: str
    severity: str
    description: str
    action_taken: str
    resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ArticleStatus(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    modelId: str = Field(foreign_key="aimodel.id")
    article: str
    title: str
    status: str
    
    ai_model: Optional["AIModel"] = Relationship(back_populates="articles")


class BiasReport(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    modelId: str = Field(foreign_key="aimodel.id")
    biasCategory: str
    disparateImpact: float
    statisticalSignificance: float
    status: str
    details: str
    
    ai_model: Optional["AIModel"] = Relationship(back_populates="bias_reports")


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
    
    articles: List["ArticleStatus"] = Relationship(back_populates="ai_model", sa_relationship_kwargs={"lazy": "selectin", "cascade": "all, delete-orphan"})
    bias_reports: List["BiasReport"] = Relationship(back_populates="ai_model", sa_relationship_kwargs={"lazy": "selectin", "cascade": "all, delete-orphan"})


class AIModelCreate(SQLModel):
    """AI Model creation schema"""
    name: str
    riskCategory: str
    provider: str
    endpointUrl: Optional[str] = None
    apiKey: Optional[str] = None


class TrainingModule(SQLModel):
    id: Optional[str] = None
    title: str
    description: str
    category: str  # ai-act, gdpr, security, ethics
    duration_minutes: int
    content: str  # Markdown content
    quiz_questions: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    created_at: Optional[datetime] = None


class AgentAuditLog(SQLModel, table=True):
    """Comprehensive audit trail for agent actions"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    agent_id: str = Field(index=True)
    action: str
    intent: str
    outcome: str
    reasoning: Optional[str] = None
    risk_score: float = Field(default=0.0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))


# --- NEW DEEPFAKE TRAINING & MODEL PERSISTENCE ---

class TrainingStatus(str, Enum):
    """Status of a training job"""
    QUEUED = "queued"
    TRAINING = "training"
    COMPLETED = "completed"
    FAILED = "failed"


class TrainingJob(SQLModel, table=True):
    """Persistent Training Run"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    dataset_name: str
    dataset_file_path: str
    status: TrainingStatus = Field(default=TrainingStatus.QUEUED)
    progress: int = Field(default=0)
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None



class CustomModel(SQLModel, table=True):
    """Persistent Custom Neural Model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    base_architecture: str
    dataset_id: Optional[str] = None
    version: str = Field(default="1.0.0")
    accuracy: float = Field(default=0.0)
    status: str = Field(default="deployed")
    last_trained: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


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


class DeepfakeThreat(SQLModel, table=True):
    """Deepfake threat model for alerting and tracking"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    type: str  # injection, bypass, spoofing, synthetic
    severity: str  # low, medium, high, critical
    description: str
    media_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DuressConfig(SQLModel, table=True):
    """Persistent Duress/Silent Alarm configuration"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True, unique=True)
    panic_phrase: str
    silent_mode: bool = Field(default=True)
    trigger_action: str  # lock_account, alert_security, fake_data
    enabled: bool = Field(default=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BiometricTemplate(SQLModel, table=True):
    """Enrolled biometric templates for liveness comparison"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    type: str  # face, voice, fingerprint
    template_hash: str
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: Optional[datetime] = None
    cancellable: bool = Field(default=True)


class WearableDevice(SQLModel, table=True):
    """Registered wearable devices for hardware-backed liveness"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    name: str
    device_type: str  # vision_pro, apple_watch, android_wear
    status: str = Field(default="active")
    registered_at: datetime = Field(default_factory=datetime.utcnow)
    last_synced: Optional[datetime] = None


class CryptoWallet(SQLModel, table=True):
    """Protected cryptocurrency wallets requiring biometric consent"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    name: str
    wallet_address: str
    blockchain: str  # ethereum, solana, bitcoin
    protection_enabled: bool = Field(default=True)
    last_verified: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ComplianceAuditLog(SQLModel, table=True):
    """Persistent audit logs for HIPAA/SOX/GDPR compliance"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    action: str
    resource: str
    status: str = Field(default="verified")
    compliance_type: str  # HIPAA, SOX, Art. 14, GDPR
    metadata_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ComplianceArticle(SQLModel, table=True):
    """EU AI Act compliance article definition"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    article: str  # e.g., "Article 5"
    title: str
    description: str
    risk: str  # unacceptable, high, limited, minimal
    status: str = Field(default="pending")  # compliant, non_compliant, not_applicable, pending
    evidence: Optional[str] = None
    remediation: Optional[str] = None
    integration_type: Optional[str] = None  # Model Registry, Use Case Registry, etc.
    scan_type: Optional[str] = None  # Policy Check, Classification, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SLAAgreement(SQLModel, table=True):
    """Service Level Agreement configuration"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    sla_id: str = Field(foreign_key="slaagreement.id")
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    language_code: str  # en, es, fr, de, etc.
    region_code: str  # US, EU, APAC, etc.
    timezone: str
    currency: str
    compliance_framework: str  # GDPR, CCPA, PIPL, etc.
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HealingConfiguration(SQLModel, table=True):
    """Self-healing system configuration"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    healing_type: str  # node_restart, failover, rollback, etc.
    trigger_conditions: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    recovery_actions: List[str] = Field(default=[], sa_column=Column(JSON))
    cooldown_period: int  # minutes
    max_attempts: int
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StrategicInsight(SQLModel, table=True):
    """Business intelligence and strategic insights"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
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
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    category: str  # security, performance, compliance, ui
    setting_key: str
    setting_value: str
    setting_type: str  # string, number, boolean, json
    description: str
    requires_restart: bool = Field(default=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentVigilanceAlert(SQLModel, table=True):
    """Persistent security and budget alerts for AgentOps"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    agent_id: Optional[str] = Field(default=None, index=True)
    type: str  # budget_breach, loop_detected, unauthorized_access, tool_failure
    severity: str  # low, medium, high, critical
    description: str
    metadata_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentMemorySegment(SQLModel, table=True):
    """Persistent memory segments for agents"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    agent_id: str = Field(index=True)
    content: str
    importance: float = Field(default=1.0)
    context_type: str = Field(default="short_term")  # short_term, long_term, semantic
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SecurityKey(SQLModel, table=True):
    """Persistent rotated API keys and security credentials"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str  # "Main API Key", "Partner SDK", etc.
    key_hash: str
    prefix: str  # "sk_live_..."
    status: str = Field(default="active")  # active, revoked, rotated
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class OnPremDeployment(SQLModel, table=True):
    """On-premises deployment configuration"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    deployment_name: str
    kubernetes_version: str
    node_count: int
    storage_config: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    network_config: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    security_config: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    status: str = Field(default="provisioning")  # provisioning, active, maintenance, failed
    last_health_check: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Vendor(SQLModel, table=True):
    """Artificial Intelligence Vendor/Supply Chain model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    category: str  # software, hardware, consultancy, model_provider
    risk_level: str # low, medium, high, critical
    status: str = Field(default="vetted") # vetted, under_review, blocked
    contact_email: Optional[str] = None
    website: Optional[str] = None
    last_audit_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ComplianceIncident(SQLModel, table=True):
    """Regulatory or technical compliance incident log"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str
    description: str
    severity: str # low, medium, high, critical
    incident_type: str # security, privacy, bias, deepfake, ethics
    status: str = Field(default="open") # open, investigating, resolved, closed
    reported_by: Optional[str] = None
    affected_systems: List[str] = Field(default=[], sa_column=Column(JSON))
    remediation_steps: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None


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
    category: str = Field(default="revenue") # revenue, burn_rate, roi, compliance
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WorkforceVenture(SQLModel, table=True):
    """Persistent Business Unit / Venture performance tracking"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    sector: str
    roi: float = Field(default=0.0)
    status: str = Field(default="BETA") # PROFITABLE, SCALING, R&D, BETA
    trend: str = Field(default="up") # up, down
    created_at: datetime = Field(default_factory=datetime.utcnow)
