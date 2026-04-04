from sqlmodel import Session, select
from datetime import datetime
from app.core.models import AlertConfig, DeepfakeAnalysis
import uuid

class BridgingService:
    """
    Bridging Service for Integrated Vigilance.
    Connects independent modules (Deepfake, Compliance) to the AgentOps Alerting system.
    """

    def trigger_deepfake_alert(self, analysis: DeepfakeAnalysis, session: Session):
        """
        Creates a system alert when a high-confidence deepfake is detected.
        """
        if analysis.result == "fake" and analysis.confidence >= 80:
            alert = AlertConfig(
                id=f"alert_{str(uuid.uuid4())[:8]}",
                name=f"CRITICAL: Deepfake Detected - {analysis.media_type}",
                type="security",
                threshold=80,
                limit=float(analysis.confidence),
                action="INVESTIGATE",
                priority="CRITICAL",
                is_active=True,
                channels=["slack", "dashboard"],
                recipients="security-ops@alpha-platform.ai",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(alert)
            session.commit()
            return alert
        return None

bridging_service = BridgingService()
