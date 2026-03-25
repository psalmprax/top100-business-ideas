"""Database configuration and engine setup"""

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
import os
from app.core.config import settings
from app.core.models import ComplianceArticle, Agent, AgentStatus, DeepfakeAnalysis, DeepfakeThreat, CustomModel, MediaType, AnalysisResult

# Database connection string
DATABASE_URL = settings.DATABASE_URL

# Fallback: use SQLite for development if no DATABASE_URL is provided or if it's the default placeholder
if DATABASE_URL == "postgresql://localhost:5432/top100ideas" or not DATABASE_URL:
    DATABASE_URL = "sqlite:///./app.db"

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

def init_db():
    """Initialize database and create tables with retry logic"""
    import time
    max_retries = 10
    retry_interval = 2
    
    for i in range(max_retries):
        try:
            SQLModel.metadata.create_all(engine)
            # Seed initial data
            seed_compliance_articles()
            seed_agents()
            seed_deepfake_data()
            return  # Success
        except Exception as e:
            if i < max_retries - 1:
                print(f"Database not ready, retrying in {retry_interval}s... ({i+1}/{max_retries}): {e}")
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
                "scan_type": "Policy Check"
            },
            {
                "article": "Article 6",
                "title": "Classification Rules",
                "description": "Classification of AI systems as unacceptable, high, limited, or minimal risk based on intended purpose.",
                "risk": "high",
                "evidence": "Risk classification matrix, system registration",
                "remediation": "N/A - Classification completed",
                "integration_type": "Use Case Registry",
                "scan_type": "Classification"
            },
            {
                "article": "Article 7",
                "title": "High-Risk List",
                "description": "AI systems in critical sectors (biometrics, employment, education, law enforcement) require strict compliance.",
                "risk": "high",
                "evidence": "Sector classification, use case documentation",
                "remediation": "Complete conformity assessment",
                "integration_type": "Sector API",
                "scan_type": "Risk Assessment"
            },
            {
                "article": "Article 8",
                "title": "Compliance Requirements",
                "description": "High-risk systems must implement risk management, data governance, transparency, and human oversight.",
                "risk": "high",
                "evidence": "Risk management system, data governance policy",
                "remediation": "Implement missing controls",
                "integration_type": "CI/CD Pipeline",
                "scan_type": "Control Audit"
            },
            {
                "article": "Article 9",
                "title": "Quality Management",
                "description": "High-risk systems require quality management system (QMS) following harmonized standards.",
                "risk": "high",
                "evidence": "QMS documentation, quality manual",
                "remediation": "Complete QMS implementation",
                "integration_type": "Quality System",
                "scan_type": "QMS Validation"
            },
            {
                "article": "Article 10",
                "title": "Data Governance",
                "description": "Training data must be subject to appropriate data governance and management practices.",
                "risk": "high",
                "evidence": "Data governance framework, training data audit",
                "remediation": "Implement data governance controls",
                "integration_type": "Data Lake",
                "scan_type": "Data Audit"
            }
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
                "details": {"reason": "Non-natural eye blinking patterns", "model": "Facial Artifact Scanner v4"}
            },
            {
                "media_url": "https://alpha-cdn.com/a/cfo_voice_auth.wav",
                "media_type": MediaType.AUDIO,
                "result": AnalysisResult.REAL,
                "confidence": 94,
                "details": {"reason": "Natural frequency distribution", "model": "FFT Audio Frequency Analyzer"}
            }
        ]

        for data in analyses_data:
            analysis = DeepfakeAnalysis(**data)
            session.add(analysis)

        # Sample Threats
        threats_data = [
            {
                "type": "injection",
                "severity": "critical",
                "description": "Attempted live video injection during board meeting"
            },
            {
                "type": "bypass",
                "severity": "high",
                "description": "Identity bypass attempt on core banking API"
            }
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
                "status": "deployed"
            },
            {
                "name": "FFT Audio Frequency Analyzer",
                "base_architecture": "ResNet-50-Audio",
                "version": "2.1.0",
                "accuracy": 0.975,
                "status": "deployed"
            }
        ]

        for data in models_data:
            model = CustomModel(**data)
            session.add(model)

        session.commit()

