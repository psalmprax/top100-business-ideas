"""
Shadow AI Detection & Remediation Service
Monitors and identifies unsanctioned AI tool usage across the enterprise.
Uses database persistence - no demo data on startup.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import logging
from sqlmodel import Session, select, func
from app.core.database import engine
from app.core.models.service_models import (
    ShadowAIDetection,
    ShadowAIRiskLevel,
    ShadowAIStatus,
)

logger = logging.getLogger(__name__)


class ShadowAIService:
    """Manages detection and remediation of Shadow AI with database persistence."""

    def list_detections(
        self, risk_level: Optional[str] = None, status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List all detections, optionally filtered by risk level or status."""
        with Session(engine) as session:
            query = select(ShadowAIDetection)

            if risk_level:
                query = query.where(ShadowAIDetection.risk_level == risk_level)
            if status:
                query = query.where(ShadowAIDetection.status == status)

            detections = session.exec(query).all()
            return [d.to_dict() for d in detections]

    def add_detection(
        self,
        tool_name: str,
        vendor: str,
        department: str,
        risk_level: str,
        user_count: int = 1,
    ) -> Dict[str, Any]:
        """Add a new detection to the database."""
        detection_id = str(uuid.uuid4())

        with Session(engine) as session:
            detection = ShadowAIDetection(
                detection_id=detection_id,
                tool_name=tool_name,
                vendor=vendor,
                department=department,
                risk_level=risk_level,
                user_count=user_count,
                status=ShadowAIStatus.DETECTED,
            )
            session.add(detection)
            session.commit()

            logger.info(f"Added shadow AI detection: {detection_id} - {tool_name}")
            return detection.to_dict()

    def remediate(self, detection_id: str) -> Optional[Dict[str, Any]]:
        """Mark a detection as remediated."""
        with Session(engine) as session:
            detection = session.exec(
                select(ShadowAIDetection).where(
                    ShadowAIDetection.detection_id == detection_id
                )
            ).first()

            if detection:
                detection.status = ShadowAIStatus.REMEDIATED
                detection.remediated_at = datetime.utcnow()
                session.commit()
                return detection.to_dict()

            return None

    def get_detection(self, detection_id: str) -> Optional[Dict[str, Any]]:
        """Get a single detection by ID."""
        with Session(engine) as session:
            detection = session.exec(
                select(ShadowAIDetection).where(
                    ShadowAIDetection.detection_id == detection_id
                )
            ).first()

            if detection:
                return detection.to_dict()
            return None

    def update_detection_status(
        self, detection_id: str, status: str
    ) -> Optional[Dict[str, Any]]:
        """Update detection status."""
        with Session(engine) as session:
            detection = session.exec(
                select(ShadowAIDetection).where(
                    ShadowAIDetection.detection_id == detection_id
                )
            ).first()

            if detection:
                detection.status = status
                if status == ShadowAIStatus.REMEDIATED:
                    detection.remediated_at = datetime.utcnow()
                session.commit()
                return detection.to_dict()

            return None

    def get_stats(self) -> Dict[str, Any]:
        """Get aggregated statistics from database."""
        with Session(engine) as session:
            all_detections = session.exec(select(ShadowAIDetection)).all()

            return {
                "total_detections": len(all_detections),
                "by_risk_level": {
                    "critical": len(
                        [
                            d
                            for d in all_detections
                            if d.risk_level == ShadowAIRiskLevel.CRITICAL
                        ]
                    ),
                    "high": len(
                        [
                            d
                            for d in all_detections
                            if d.risk_level == ShadowAIRiskLevel.HIGH
                        ]
                    ),
                    "medium": len(
                        [
                            d
                            for d in all_detections
                            if d.risk_level == ShadowAIRiskLevel.MEDIUM
                        ]
                    ),
                    "low": len(
                        [
                            d
                            for d in all_detections
                            if d.risk_level == ShadowAIRiskLevel.LOW
                        ]
                    ),
                },
                "by_status": {
                    "detected": len(
                        [
                            d
                            for d in all_detections
                            if d.status == ShadowAIStatus.DETECTED
                        ]
                    ),
                    "investigating": len(
                        [
                            d
                            for d in all_detections
                            if d.status == ShadowAIStatus.INVESTIGATING
                        ]
                    ),
                    "remediated": len(
                        [
                            d
                            for d in all_detections
                            if d.status == ShadowAIStatus.REMEDIATED
                        ]
                    ),
                    "approved": len(
                        [
                            d
                            for d in all_detections
                            if d.status == ShadowAIStatus.APPROVED
                        ]
                    ),
                },
            }

    def delete_detection(self, detection_id: str) -> bool:
        """Delete a detection."""
        with Session(engine) as session:
            detection = session.exec(
                select(ShadowAIDetection).where(
                    ShadowAIDetection.detection_id == detection_id
                )
            ).first()

            if detection:
                session.delete(detection)
                session.commit()
                return True

            return False

    def approve_detection(self, detection_id: str) -> Optional[Dict[str, Any]]:
        """Approve a Shadow AI detection (mark as allowed)."""
        with Session(engine) as session:
            detection = session.exec(
                select(ShadowAIDetection).where(
                    ShadowAIDetection.detection_id == detection_id
                )
            ).first()

            if detection:
                detection.status = ShadowAIStatus.APPROVED
                session.commit()
                return detection.to_dict()

            return None


# Singleton instance
shadow_ai_service = ShadowAIService()
