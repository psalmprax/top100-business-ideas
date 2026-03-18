"""
Shadow AI Detection & Remediation Service
Monitors and identifies unsanctioned AI tool usage across the enterprise.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)

class ShadowAIDetection:
    """Represents a detected instance of unsanctioned AI usage."""
    def __init__(
        self,
        detection_id: str,
        tool_name: str,
        vendor: str,
        department: str,
        risk_level: str,  # "low", "medium", "high", "critical"
        user_count: int = 1
    ):
        self.detection_id = detection_id
        self.tool_name = tool_name
        self.vendor = vendor
        self.department = department
        self.risk_level = risk_level
        self.user_count = user_count
        self.detected_at = datetime.utcnow()
        self.status = "detected"  # "detected", "investigating", "remediated", "approved"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.detection_id,
            "tool_name": self.tool_name,
            "vendor": self.vendor,
            "department": self.department,
            "risk_level": self.risk_level,
            "user_count": self.user_count,
            "detected_at": self.detected_at.isoformat(),
            "status": self.status
        }

class ShadowAIService:
    """Manages detection and remediation of Shadow AI."""
    def __init__(self):
        self.detections: Dict[str, ShadowAIDetection] = {}
        self._init_demo_data()

    def _init_demo_data(self):
        """Initialize with some realistic detections."""
        demo_detections = [
            ShadowAIDetection(str(uuid.uuid4()), "ChatGPT (Personal)", "OpenAI", "Marketing", "medium", 14),
            ShadowAIDetection(str(uuid.uuid4()), "Midjourney", "Midjourney Inc", "Design", "low", 5),
            ShadowAIDetection(str(uuid.uuid4()), "Unsanctioned Copilot", "GitHub", "Engineering (Team B)", "high", 3),
            ShadowAIDetection(str(uuid.uuid4()), "Clearview AI", "Clearview", "Legal", "critical", 1)
        ]
        for d in demo_detections:
            self.detections[d.detection_id] = d

    def list_detections(self, risk_level: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        results = list(self.detections.values())
        if risk_level:
            results = [d for d in results if d.risk_level == risk_level]
        if status:
            results = [d for d in results if d.status == status]
        return [d.to_dict() for d in results]

    def add_detection(self, tool_name: str, vendor: str, department: str, risk_level: str) -> Dict[str, Any]:
        detection_id = str(uuid.uuid4())
        detection = ShadowAIDetection(detection_id, tool_name, vendor, department, risk_level)
        self.detections[detection_id] = detection
        return detection.to_dict()

    def remediate(self, detection_id: str) -> Optional[Dict[str, Any]]:
        if detection_id in self.detections:
            self.detections[detection_id].status = "remediated"
            return self.detections[detection_id].to_dict()
        return None

    def get_stats(self) -> Dict[str, Any]:
        all_detections = list(self.detections.values())
        return {
            "total_detections": len(all_detections),
            "by_risk_level": {
                "critical": len([d for d in all_detections if d.risk_level == "critical"]),
                "high": len([d for d in all_detections if d.risk_level == "high"]),
                "medium": len([d for d in all_detections if d.risk_level == "medium"]),
                "low": len([d for d in all_detections if d.risk_level == "low"])
            },
            "by_status": {
                "detected": len([d for d in all_detections if d.status == "detected"]),
                "investigating": len([d for d in all_detections if d.status == "investigating"]),
                "remediated": len([d for d in all_detections if d.status == "remediated"])
            }
        }

# Singleton instance
shadow_ai_service = ShadowAIService()
