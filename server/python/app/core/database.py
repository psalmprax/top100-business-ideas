"""Database configuration and engine setup"""

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
import os
from app.core.config import settings
from app.core.models import (
    ComplianceArticle,
    Agent,
    AgentStatus,
    DeepfakeAnalysis,
    DeepfakeThreat,
    CustomModel,
    MediaType,
    AnalysisResult,
    FiscalRequest,
    WorkforceGoal,
    WorkforceVenture,
    DuressConfig,
    BiometricTemplate,
    WearableDevice,
    CryptoWallet,
    ComplianceAuditLog,
    AgentVigilanceAlert,
    AgentMemorySegment,
    SecurityKey,
    SystemSetting,
    BusinessIdea,
    WorkforceSkill,
    WorkforceJob,
    WorkforceAcquisition,
    WorkforceContent,
    ForensicTrace,
    GovernanceDecision,
)

# Database connection string
DATABASE_URL = settings.DATABASE_URL

# Create engine
engine = create_engine(DATABASE_URL)


def init_db():
    """Initialize database and create tables with retry logic"""
    import time

    max_retries = 10
    retry_interval = 2

    for i in range(max_retries):
        try:
            SQLModel.metadata.create_all(engine)

            SQLModel.metadata.create_all(engine)

            # Manual Migration block removed. Using Alembic for dialect-agnostic migrations.
            # Refer to alembic/versions/a1b2c3d4e5f6_initial_agnostic_hardening.py

            # Seed initial data only when explicitly requested
            if os.getenv("SEED_DATABASE", "false").lower() == "true":
                seed_compliance_articles()
                seed_agents()
                seed_deepfake_data()
                seed_workforce_data()
                seed_agent_ops_data()
                seed_business_ideas()
            return  # Success
        except Exception as e:
            if i < max_retries - 1:
                print(
                    f"Database not ready, retrying in {retry_interval}s... ({i + 1}/{max_retries}): {e}"
                )
                time.sleep(retry_interval)
            else:
                raise e


def get_session():
    """Dependency for getting database sessions"""
    with Session(engine) as session:
        yield session


def seed_compliance_articles():
    """Seed the database with EU AI Act compliance articles"""
    with Session(engine) as session:
        # Check if articles already exist
        existing_count = session.query(ComplianceArticle).count()
        if existing_count > 0:
            return  # Already seeded

        # EU AI Act Articles
        articles_data = [
            {
                "article": "Article 5",
                "title": "Prohibited Practices",
                "description": "AI systems that deploy subliminal techniques, exploit vulnerabilities, or enable social scoring are prohibited.",
                "risk": "unacceptable",
                "evidence": "System audit logs, policy documentation",
                "remediation": "N/A - Currently compliant",
                "integration_type": "Model Registry",
                "scan_type": "Policy Check",
            },
            {
                "article": "Article 6",
                "title": "Classification Rules",
                "description": "Classification of AI systems as unacceptable, high, limited, or minimal risk based on intended purpose.",
                "risk": "high",
                "evidence": "Risk classification matrix, system registration",
                "remediation": "N/A - Classification completed",
                "integration_type": "Use Case Registry",
                "scan_type": "Classification",
            },
            {
                "article": "Article 7",
                "title": "High-Risk List",
                "description": "AI systems in critical sectors (biometrics, employment, education, law enforcement) require strict compliance.",
                "risk": "high",
                "evidence": "Sector classification, use case documentation",
                "remediation": "Complete conformity assessment",
                "integration_type": "Sector API",
                "scan_type": "Risk Assessment",
            },
            {
                "article": "Article 8",
                "title": "Compliance Requirements",
                "description": "High-risk systems must implement risk management, data governance, transparency, and human oversight.",
                "risk": "high",
                "evidence": "Risk management system, data governance policy",
                "remediation": "Implement missing controls",
                "integration_type": "CI/CD Pipeline",
                "scan_type": "Control Audit",
            },
            {
                "article": "Article 9",
                "title": "Quality Management",
                "description": "High-risk systems require quality management system (QMS) following harmonized standards.",
                "risk": "high",
                "evidence": "QMS documentation, quality manual",
                "remediation": "Complete QMS implementation",
                "integration_type": "Quality System",
                "scan_type": "QMS Validation",
            },
            {
                "article": "Article 10",
                "title": "Data Governance",
                "description": "Training data must be subject to appropriate data governance and management practices.",
                "risk": "high",
                "evidence": "Data governance framework, training data audit",
                "remediation": "Implement data governance controls",
                "integration_type": "Data Lake",
                "scan_type": "Data Audit",
            },
        ]

        for article_data in articles_data:
            article = ComplianceArticle(**article_data)
            session.add(article)

        session.commit()


def seed_agents():
    """Seed the database with sample agents"""
    with Session(engine) as session:
        # Check if agents already exist
        existing_count = session.query(Agent).count()
        if existing_count > 0:
            return  # Already seeded

        # Sample agents
        agents_data = [
            {
                "name": "Customer Support Agent",
                "type": "langgraph",
                "environment": "production",
                "provider": "openai",
                "model": "gpt-4-turbo",
                "budget": 50.0,
                "dailySpend": 32.5,
                "tier": "strategic",
                "status": AgentStatus.RUNNING,
                "config": {
                    "provider": "openai",
                    "model": "gpt-4-turbo",
                    "maxTokens": 4000,
                    "temperature": 0.7,
                    "rules": [
                        {
                            "id": "1",
                            "name": "Loop Prevention",
                            "type": "loop_prevention",
                            "enabled": True,
                            "config": {"maxIterations": 10, "semanticCheck": True},
                        },
                        {
                            "id": "2",
                            "name": "Semantic Cost Cap",
                            "type": "semantic_cost_cap",
                            "enabled": True,
                            "config": {"maxSpend": 50, "preserveState": True},
                        },
                    ],
                },
                "metrics": {
                    "totalRequests": 15420,
                    "totalTokens": 2840000,
                    "totalCost": 142.5,
                    "avgLatencyMs": 1250,
                    "errorRate": 0.02,
                    "loopCount": 3,
                    "cacheHits": 4230,
                    "loopsPrevented": 47,
                    "costSaved": 892.3,
                },
            },
            {
                "name": "Research Agent",
                "type": "crewai",
                "environment": "production",
                "provider": "anthropic",
                "model": "claude-3-opus",
                "budget": 5.0,
                "dailySpend": 4.2,
                "tier": "strategic",
                "status": AgentStatus.RUNNING,
                "config": {
                    "provider": "anthropic",
                    "model": "claude-3-opus",
                    "maxTokens": 8000,
                    "temperature": 0.8,
                    "rules": [
                        {
                            "id": "3",
                            "name": "Daily Budget Cap",
                            "type": "budget_cap",
                            "enabled": True,
                            "config": {"maxSpend": 5},
                        },
                    ],
                },
                "metrics": {
                    "totalRequests": 2340,
                    "totalTokens": 1250000,
                    "totalCost": 89.2,
                    "avgLatencyMs": 2800,
                    "errorRate": 0.01,
                    "loopCount": 0,
                    "cacheHits": 890,
                    "loopsPrevented": 12,
                    "costSaved": 156.4,
                },
            },
        ]

        for agent_data in agents_data:
            agent = Agent(**agent_data)
            session.add(agent)

        session.commit()


def seed_deepfake_data():
    """Seed the database with deepfake analysis data and threats"""
    with Session(engine) as session:
        # Check if data already exists
        if session.query(DeepfakeAnalysis).count() > 0:
            return

        # Sample Analyses
        analyses_data = [
            {
                "media_url": "https://alpha-cdn.com/v/ceo_interview_01.mp4",
                "media_type": MediaType.VIDEO,
                "result": AnalysisResult.FAKE,
                "confidence": 98,
                "details": {
                    "reason": "Non-natural eye blinking patterns",
                    "model": "Facial Artifact Scanner v4",
                },
            },
            {
                "media_url": "https://alpha-cdn.com/a/cfo_voice_auth.wav",
                "media_type": MediaType.AUDIO,
                "result": AnalysisResult.REAL,
                "confidence": 94,
                "details": {
                    "reason": "Natural frequency distribution",
                    "model": "FFT Audio Frequency Analyzer",
                },
            },
        ]

        for data in analyses_data:
            analysis = DeepfakeAnalysis(**data)
            session.add(analysis)

        # Sample Threats
        threats_data = [
            {
                "type": "injection",
                "severity": "critical",
                "description": "Attempted live video injection during board meeting",
            },
            {
                "type": "bypass",
                "severity": "high",
                "description": "Identity bypass attempt on core banking API",
            },
        ]

        for data in threats_data:
            threat = DeepfakeThreat(**data)
            session.add(threat)

        # Sample Custom Models
        models_data = [
            {
                "name": "Facial Artifact Scanner",
                "base_architecture": "EfficientNet-v2",
                "version": "4.2.0",
                "accuracy": 0.992,
                "status": "deployed",
            },
            {
                "name": "FFT Audio Frequency Analyzer",
                "base_architecture": "ResNet-50-Audio",
                "version": "2.1.0",
                "accuracy": 0.975,
                "status": "deployed",
            },
        ]

        for data in models_data:
            model = CustomModel(**data)
            session.add(model)

        # 4. Seed Duress Configs
        if session.query(DuressConfig).count() == 0:
            session.add(
                DuressConfig(
                    user_id="default_user",
                    panic_phrase="alaska",
                    silent_mode=True,
                    trigger_action="alert_security",
                    enabled=True,
                )
            )

        # 5. Seed Biometric Templates
        if session.query(BiometricTemplate).count() == 0:
            session.add(
                BiometricTemplate(
                    user_id="default_user",
                    type="face",
                    template_hash="sha256:7f83b1...",
                    cancellable=True,
                )
            )

        # 6. Seed Wearable Devices
        if session.query(WearableDevice).count() == 0:
            session.add(
                WearableDevice(
                    user_id="default_user",
                    name="Vision Pro 1",
                    device_type="vision_pro",
                    status="active",
                )
            )

        # 7. Seed Crypto Wallets
        if session.query(CryptoWallet).count() == 0:
            session.add(
                CryptoWallet(
                    user_id="default_user",
                    name="Alpha Vault",
                    wallet_address="0x71C765...d897",
                    blockchain="ethereum",
                    protection_enabled=True,
                )
            )

        # 8. Seed Compliance Audit Logs
        if session.query(ComplianceAuditLog).count() == 0:
            session.add(
                ComplianceAuditLog(
                    user_id="admin_01",
                    action="Data Access",
                    resource="Biometric_DB_v4",
                    compliance_type="HIPAA",
                    status="verified",
                )
            )

        session.commit()


def seed_workforce_data():
    """Seed the database with initial workforce ventures, goals and fiscal requests"""
    with Session(engine) as session:
        # 1. Seed Ventures
        if session.query(WorkforceVenture).count() == 0:
            ventures = [
                {
                    "name": "Alpha Compliance",
                    "sector": "LegalTech",
                    "roi": 420.0,
                    "status": "PROFITABLE",
                    "trend": "up",
                },
                {
                    "name": "Deepfake Defense",
                    "sector": "Cybersecurity",
                    "roi": 180.0,
                    "status": "SCALING",
                    "trend": "up",
                },
                {
                    "name": "Agentic Ops",
                    "sector": "Infrastructure",
                    "roi": -12.4,
                    "status": "R&D",
                    "trend": "down",
                },
                {
                    "name": "Web3 Sentinel",
                    "sector": "DeFi",
                    "roi": 45.0,
                    "status": "BETA",
                    "trend": "up",
                },
            ]
            for v in ventures:
                session.add(WorkforceVenture(**v))

        # 2. Seed Goals
        if session.query(WorkforceGoal).count() == 0:
            goals = [
                {
                    "name": "Revenue Growth Target",
                    "current_value": 42.5,
                    "target_value": 85.0,
                    "unit": "%",
                    "category": "revenue",
                },
                {
                    "name": "Net Burn Rate Limit",
                    "current_value": 310.0,
                    "target_value": 250.0,
                    "unit": "$/hr",
                    "category": "burn_rate",
                },
                {
                    "name": "Compliance Coverage",
                    "current_value": 92.0,
                    "target_value": 100.0,
                    "unit": "%",
                    "category": "compliance",
                },
                {
                    "name": "Autonomous Decisions",
                    "current_value": 1240,
                    "target_value": 5000,
                    "unit": "count",
                    "category": "operations",
                },
            ]
            for g in goals:
                session.add(WorkforceGoal(**g))

        # 3. Seed Fiscal Requests
        if session.query(FiscalRequest).count() == 0:
            requests = [
                {
                    "purpose": "Cloud Compute Overages",
                    "amount": "$2,500",
                    "priority": "HIGH",
                    "status": "PENDING",
                },
                {
                    "purpose": "Marketing Campaign Alpha",
                    "amount": "$1,200",
                    "priority": "MEDIUM",
                    "status": "APPROVED",
                },
                {
                    "purpose": "Hiring: Senior AI Dev",
                    "amount": "$15,000",
                },
            ]
            for r in requests:
                session.add(FiscalRequest(**r))

        # 5. Forensic Traces (Operations History)
        if session.query(ForensicTrace).count() == 0:
            traces = [
                {
                    "user_id": "e8b5c731-15f7-4a00-9e96-e13768d57d00",
                    "agent_id": "marketing-alpha",
                    "action": "Market Intelligence Scan",
                    "details": "High demand detected for 'Sovereign Compliance' services in EU.",
                },
                {
                    "user_id": "e8b5c731-15f7-4a00-9e96-e13768d57d00",
                    "agent_id": "sales-omega",
                    "action": "Lead List Generation",
                    "details": "120 high-intent leads generated from Sentinel network.",
                },
                {
                    "user_id": "e8b5c731-15f7-4a00-9e96-e13768d57d00",
                    "agent_id": "legal-council",
                    "action": "Contract Analysis",
                    "details": "MiCA compliance risk identified in new partnership agreement.",
                },
            ]
            for t in traces:
                session.add(ForensicTrace(**t))

        # 6. Governance Decisions
        if session.query(GovernanceDecision).count() == 0:
            decisions = [
                {
                    "user_id": "e8b5c731-15f7-4a00-9e96-e13768d57d00",
                    "stage": 1,
                    "decision": "Autonomous",
                    "status": "FULLY_AUTONOMOUS",
                },
                {
                    "user_id": "e8b5c731-15f7-4a00-9e96-e13768d57d00",
                    "stage": 2,
                    "decision": "Human override",
                    "status": "REVIEW_REQUIRED",
                },
                {
                    "user_id": "e8b5c731-15f7-4a00-9e96-e13768d57d00",
                    "stage": 5,
                    "decision": "Waiting for signature",
                    "status": "REVIEW_REQUIRED",
                },
            ]
            for d in decisions:
                session.add(GovernanceDecision(**d))

        session.commit()


def seed_agent_ops_data():
    """Seed the database with AgentOps security and configuration data"""
    with Session(engine) as session:
        # Check if data already exists
        if session.query(AgentVigilanceAlert).count() > 0:
            return

        # 1. System Settings (Governance & Privacy)
        settings_data = [
            {
                "category": "security",
                "setting_key": "pii_redaction",
                "setting_value": "true",
                "setting_type": "boolean",
                "description": "Enable automatic PII redaction on all agent logs",
            },
            {
                "category": "security",
                "setting_key": "zero_knowledge_logging",
                "setting_value": "true",
                "setting_type": "boolean",
                "description": "Ensure logs are encrypted with user-only keys",
            },
            {
                "category": "compliance",
                "setting_key": "gdpr_forgotten",
                "setting_value": "false",
                "setting_type": "boolean",
                "description": "Enable automated Right to be Forgotten workflows",
            },
            {
                "category": "compliance",
                "setting_key": "mica_guard",
                "setting_value": "true",
                "setting_type": "boolean",
                "description": "Enable Crypto Asset Guard rails for MiCA compliance",
            },
            {
                "category": "ui",
                "setting_key": "roi_forecast_multiplier",
                "setting_value": "8.4",
                "setting_type": "number",
                "description": "Historical ROI multiplier for dashboard forecasting",
            },
        ]
        for s in settings_data:
            session.add(SystemSetting(**s))

        # 2. Vigilance Alerts (Real Alerts from the backend)
        alerts_data = [
            {
                "type": "budget_breach",
                "severity": "critical",
                "description": "Marketing Agent exceeded daily token budget by 15%",
                "metadata_json": {"excess": 15.2, "agent_id": "marketing-01"},
            },
            {
                "type": "loop_detected",
                "severity": "high",
                "description": "Recursive loop detected in Research Agent chain. Execution halted.",
                "metadata_json": {"iterations": 45, "stack_depth": 12},
            },
            {
                "type": "unauthorized_access",
                "severity": "medium",
                "description": "Anomalous IP detected attempting to rotate security keys.",
                "metadata_json": {"ip": "REDACTED", "geo": "unknown"},
            },
        ]
        for a in alerts_data:
            session.add(AgentVigilanceAlert(**a))

        # 3. Security Keys
        keys_data = [
            {
                "name": "Main Production Key",
                "prefix": "sk_live_v1_",
                "key_hash": "hashed_key_val_01",
                "status": "active",
            },
            {
                "name": "Partner SDK Key",
                "prefix": "sk_sdk_v4_",
                "key_hash": "hashed_key_val_02",
                "status": "rotated",
            },
        ]
        for k in keys_data:
            session.add(SecurityKey(**k))

        session.commit()


def seed_business_ideas():
    """Seed the database with the Top 100 Business Ideas dataset"""
    with Session(engine) as session:
        # Check if already seeded
        if session.query(BusinessIdea).count() > 0:
            return

        ideas = [
            # AI & Technology
            {
                "rank": 1,
                "title": "Autonomous AI Legal Auditor",
                "category": "AI & Technology",
                "market": "US/EU",
                "description": "Cross-border AI compliance auditing for enterprise LLM deployments.",
                "earning_potential": "$2M - $5M ARR",
                "rollout_speed": "4-6 months",
                "trend": "Explosive",
            },
            {
                "rank": 2,
                "title": "Synthetic Data Factory",
                "category": "AI & Technology",
                "market": "Global",
                "description": "High-fidelity privacy-preserving dataset generation for medical AI training.",
                "earning_potential": "$1.5M - $4M ARR",
                "rollout_speed": "3-5 months",
                "trend": "Explosive",
            },
            {
                "rank": 3,
                "title": "Agentic Security Mesh",
                "category": "Cybersecurity",
                "market": "US/Global",
                "description": "Distributed AI agents that physically verify hardware identity before cloud sync.",
                "earning_potential": "$3M - $8M ARR",
                "rollout_speed": "6-8 months",
                "trend": "Explosive",
            },
            # HealthTech
            {
                "rank": 4,
                "title": "Bio-Metric Wearable Guard",
                "category": "HealthTech",
                "market": "US",
                "description": "Real-time biometric liveness verification for critical infrastructure access.",
                "earning_potential": "$1M - $3M ARR",
                "rollout_speed": "4-5 months",
                "trend": "High Growth",
            },
            {
                "rank": 5,
                "title": "Longevity Intelligence Hub",
                "category": "HealthTech",
                "market": "Global",
                "description": "AI-driven biological age tracking and personalized intervention protocols.",
                "earning_potential": "$5M - $12M ARR",
                "rollout_speed": "6-9 months",
                "trend": "High Growth",
            },
            # FinTech
            {
                "rank": 6,
                "title": "Crypto Asset Recovery Bot",
                "category": "FinTech",
                "market": "Global",
                "description": "Self-healing automated recovery for compromised DeFi wallets.",
                "earning_potential": "$500K - $2M ARR",
                "rollout_speed": "2-3 months",
                "trend": "Steady",
            },
            {
                "rank": 7,
                "title": "Real-Time VAT Compliance AI",
                "category": "FinTech",
                "market": "EU",
                "description": "Automated VAT calculation and filing for cross-border e-commerce.",
                "earning_potential": "$2M - $6M ARR",
                "rollout_speed": "4-6 months",
                "trend": "High Growth",
            },
        ]

        # Generate more ideas to reach 100 for a realistic production dataset
        categories = [
            "AI & Technology",
            "HealthTech",
            "FinTech",
            "CleanTech",
            "EdTech",
            "PropTech",
            "LogisticsTech",
            "Cybersecurity",
            "RegTech",
            "AgriTech",
        ]
        trends = ["Explosive", "High Growth", "Steady"]
        markets = ["US", "EU", "Global", "UK", "Canada"]

        for i in range(8, 101):
            cat = categories[i % len(categories)]
            trend = trends[i % len(trends)]
            market = markets[i % len(markets)]
            ideas.append(
                {
                    "rank": i,
                    "title": f"{cat} Innovation {i}",
                    "category": cat,
                    "market": market,
                    "description": f"Next-generation {cat} solution focused on {market} market efficiencies.",
                    "earning_potential": f"${100 * i}K - ${300 * i}K ARR",
                    "rollout_speed": f"{i % 12 + 1} months",
                    "trend": trend,
                }
            )

        for idea_data in ideas:
            idea = BusinessIdea(**idea_data)
            session.add(idea)

        session.commit()
