"""
Shadow AI Detection & Remediation Service
Monitors and identifies unsanctioned AI tool usage across the enterprise.
Uses database persistence - no demo data on startup.
Auto-detection capabilities for finding Shadow AI in network traffic.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import logging
import re
import os
from sqlmodel import Session, select, func
from app.core.database import engine
from app.core.models.service_models import (
    ShadowAIDetection,
    ShadowAIRiskLevel,
    ShadowAIStatus,
)

logger = logging.getLogger(__name__)

# Known Shadow AI tool signatures for auto-detection
SHADOW_AI_SIGNATURES = {
    "chatgpt": {
        "pattern": r"(chatgpt|openai|gpt-3|gpt-4|chat\.openai\.com)",
        "risk": "HIGH",
        "category": "Generative AI",
    },
    "claude": {
        "pattern": r"(claude\.ai|anthropic|claude-3)",
        "risk": "HIGH",
        "category": "Generative AI",
    },
    "midjourney": {
        "pattern": r"(midjourney|discord\.com.*MJ)",
        "risk": "MEDIUM",
        "category": "Image Generation",
    },
    "notion-ai": {
        "pattern": r"(notion\.ai|notion.so.*ai)",
        "risk": "MEDIUM",
        "category": "Productivity",
    },
    "github-copilot": {
        "pattern": r"(github\.com.*copilot|copilot\.github)",
        "risk": "MEDIUM",
        "category": "Code Assistant",
    },
    "bard": {
        "pattern": r"(bard\.google|gemini\.google)",
        "risk": "HIGH",
        "category": "Generative AI",
    },
    "character-ai": {
        "pattern": r"(character\.ai)",
        "risk": "MEDIUM",
        "category": "Chatbot",
    },
    "perplexity": {
        "pattern": r"(perplexity\.ai)",
        "risk": "MEDIUM",
        "category": "Search AI",
    },
    "jasper-ai": {
        "pattern": r"(jasper\.ai)",
        "risk": "MEDIUM",
        "category": "Marketing AI",
    },
    "copy-ai": {
        "pattern": r"(copy\.ai)",
        "risk": "MEDIUM",
        "category": "Copywriting",
    },
}


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

    def auto_detect(
        self, url: str, source_ip: str = None, user_email: str = None
    ) -> Optional[Dict[str, Any]]:
        """Auto-detect Shadow AI from URL/hostname and optionally source IP or user."""
        url_lower = url.lower()

        for tool_name, signature in SHADOW_AI_SIGNATURES.items():
            if re.search(signature["pattern"], url_lower):
                risk_level = signature["risk"]
                category = signature["category"]

                # Check if already detected
                existing = self.list_detections(status="DETECTED")
                for d in existing:
                    if d.get("tool_name", "").lower() == tool_name:
                        logger.info(f"Shadow AI already detected: {tool_name}")
                        return None

                # Add new detection
                return self.add_detection(
                    tool_name=tool_name,
                    vendor=category,
                    department="Auto-Detected",
                    risk_level=risk_level,
                    user_count=1,
                )

        return None

    def scan_proxy_logs(self, log_entries: List[str]) -> List[Dict[str, Any]]:
        """Scan proxy/web server logs for Shadow AI usage."""
        detected = []

        for entry in log_entries:
            result = self.auto_detect(entry)
            if result:
                detected.append(result)

        return detected

    def generate_detection_report(self) -> Dict[str, Any]:
        """Generate a comprehensive detection report."""
        with Session(engine) as session:
            all_detections = session.exec(select(ShadowAIDetection)).all()

            by_status = {
                "detected": len(
                    [d for d in all_detections if d.status == ShadowAIStatus.DETECTED]
                ),
                "investigating": len(
                    [
                        d
                        for d in all_detections
                        if d.status == ShadowAIStatus.INVESTIGATING
                    ]
                ),
                "remediated": len(
                    [d for d in all_detections if d.status == ShadowAIStatus.REMEDIATED]
                ),
                "approved": len(
                    [d for d in all_detections if d.status == ShadowAIStatus.APPROVED]
                ),
            }

            by_risk = {
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
                    [d for d in all_detections if d.risk_level == ShadowAIRiskLevel.LOW]
                ),
            }

            return {
                "total_detections": len(all_detections),
                "by_status": by_status,
                "by_risk": by_risk,
                "generated_at": datetime.utcnow().isoformat(),
            }


# Singleton instance
shadow_ai_service = ShadowAIService()
