"""Database configuration and engine setup"""

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
import os
from app.core.config import settings
from app.core.models import ComplianceArticle

# Database connection string
DATABASE_URL = settings.DATABASE_URL

# Fallback: construct from components if it's the default or missing
if DATABASE_URL == "postgresql://localhost:5432/top100ideas" or not DATABASE_URL:
    db_user = os.getenv("DB_USER", "postgres")
    db_pass = os.getenv("DB_PASSWORD", "postgres")
    db_host = os.getenv("DB_HOST", "db")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "alphaai")
    DATABASE_URL = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

def init_db():
    """Initialize database and create tables"""
    SQLModel.metadata.create_all(engine)

    # Seed initial data
    seed_compliance_articles()

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

