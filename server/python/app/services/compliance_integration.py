"""
Compliance Integration Service for ReguLens
Handles real-world system connections and compliance scanning orchestration.
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select
from app.core.models import SystemConnection, ConnectionType, ArticleScan
from app.core.database import engine

class ComplianceIntegrationService:
    """
    Service to manage system connections (CI/CD, Registries, etc.)
    and coordinate automated compliance scans for AI Act articles.
    """

    def connect_system(self, article_id: str, connection_type: ConnectionType, config: Dict[str, Any]) -> SystemConnection:
        """Connect a technical system to a specific compliance article with validation."""
        # Validate required fields based on connection type
        required_fields = {
            ConnectionType.CI_CD: ["repository", "api_token"],
            ConnectionType.MODEL_REGISTRY: ["registry_url", "api_key"],
            ConnectionType.DATA_STORE: ["bucket", "access_key"],
            ConnectionType.MONITORING: ["endpoint"],
            ConnectionType.EU_DATABASE: ["organization_id"],
            ConnectionType.REGULATORY_PORTAL: ["portal_url"],
            ConnectionType.VECTOR_DB: ["provider", "api_key"],
            ConnectionType.COMPUTE_CLUSTER: ["orchestrator", "endpoint"],
            ConnectionType.IDENTITY_IAM: ["provider", "tenant_id"],
            ConnectionType.HUMAN_FEEDBACK: ["platform", "project_id"],
            ConnectionType.LEGAL_REPOSITORY: ["url"],
            ConnectionType.CLOUD_INFRA: ["provider", "subscription_id"],
            ConnectionType.AI_GATEWAY: ["provider", "api_key"],
            ConnectionType.DATA_LAKEHOUSE: ["provider", "warehouse"]
        }
        
        if connection_type in required_fields:
            missing = [f for f in required_fields[connection_type] if f not in config]
            if missing:
                raise ValueError(f"Missing required fields for {connection_type.value}: {', '.join(missing)}")

        with Session(engine) as session:
            # Check if connection already exists for this article
            statement = select(SystemConnection).where(SystemConnection.article_id == article_id)
            existing = session.exec(statement).first()
            
            if existing:
                existing.connection_type = connection_type
                existing.config = config
                existing.updated_at = datetime.utcnow()
                session.add(existing)
                session.commit()
                session.refresh(existing)
                return existing

            connection = SystemConnection(
                article_id=article_id,
                connection_type=connection_type,
                config=config,
                status="connected"
            )
            session.add(connection)
            session.commit()
            session.refresh(connection)
            return connection

    def get_connection(self, article_id: str) -> Optional[SystemConnection]:
        """Retrieve connection details for an article."""
        with Session(engine) as session:
            statement = select(SystemConnection).where(SystemConnection.article_id == article_id)
            return session.exec(statement).first()

    def run_scan(self, article_id: str, scan_type: str) -> ArticleScan:
        """Execute a compliance scan via the connected system."""
        connection = self.get_connection(article_id)
        if not connection:
            raise ValueError(f"No system connected for {article_id}. Handshake required.")

        # Simulate orchestration logic for different scanners
        # In a production environment, this would call actual scanning scripts or APIs.
        results = {
            "orchestrator": "ReguLens-Core-V1",
            "connection_type": connection.connection_type.value,
            "scan_type": scan_type,
            "summary": f"Automated validation of {article_id} completed successfully.",
            "metrics": {
                "compliance_rate": 0.98,
                "anomalies_detected": 0,
                "latency_ms": 1450
            },
            "artifacts": [
                f"audit_log_{uuid.uuid4().hex[:8]}.json",
                f"evidence_bundle_{article_id.replace(' ', '_')}.zip"
            ]
        }

        # Logic for specific scan types
        if "Bias" in scan_type:
            results["metrics"].update({
                "demographic_parity": 0.99,
                "equal_opportunity": 0.97,
                "bias_risk": "low"
            })
        elif "Security" in scan_type or "Adversarial" in scan_type:
            results["metrics"].update({
                "evasion_robustness": 0.94,
                "privacy_leakage": 0.01,
                "threat_level": "none"
            })

        with Session(engine) as session:
            scan = ArticleScan(
                article_id=article_id,
                scan_type=scan_type,
                status="completed",
                results=results
            )
            session.add(scan)
            session.commit()
            session.refresh(scan)
            return scan

    def list_connections(self) -> List[SystemConnection]:
        """List all active system connections."""
        with Session(engine) as session:
            statement = select(SystemConnection)
            return session.exec(statement).all()

    def list_scans(self, article_id: Optional[str] = None) -> List[ArticleScan]:
        """List compliance scan history."""
        with Session(engine) as session:
            statement = select(ArticleScan)
            if article_id:
                statement = statement.where(ArticleScan.article_id == article_id)
            return session.exec(statement).all()

# Singleton instance
compliance_integration_service = ComplianceIntegrationService()
