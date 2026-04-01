"""
Duress Detection Service for Deepfake Defense
Detects and responds to coercion attempts during authentication.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import uuid
import logging
import random

logger = logging.getLogger(__name__)


class DuressType(str, Enum):
    VERBAL_COERCION = "verbal_coercion"
    PHYSICAL_THREAT = "physical_threat"
    ENVIRONMENTAL = "environmental"
    TECHNICAL_TAMPERING = "technical_tampering"


class DuressAlertLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DuressSession:
    """Represents a duress detection session."""

    def __init__(
        self,
        session_id: str,
        user_id: str,
        auth_method: str,
    ):
        self.session_id = session_id
        self.user_id = user_id
        self.auth_method = auth_method
        self.started_at = datetime.utcnow()
        self.alerts = []
        self.verdict = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "auth_method": self.auth_method,
            "started_at": self.started_at.isoformat(),
            "alerts": self.alerts,
            "verdict": self.verdict,
        }


class DuressDetectionService:
    """
    Duress detection service for biometric authentication.
    Detects coercion attempts and triggers silent alarms.
    """

    def __init__(self):
        self.sessions: Dict[str, DuressSession] = {}
        self.alert_history: List[Dict[str, Any]] = []
        self.duress_patterns = self._init_duress_patterns()

    def _init_duress_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize known duress patterns."""

        return {
            "panic_word": {
                "type": DuressType.VERBAL_COERCION,
                "description": "Coerced use of specific trigger phrase",
                "indicators": [
                    "unusual speech patterns",
                    "elevated stress markers",
                    "delayed response",
                ],
            },
            "forced_verification": {
                "type": DuressType.PHYSICAL_THREAT,
                "description": "Physical force used during verification",
                "indicators": [
                    "unnatural positioning",
                    "sudden movements",
                    "consistent direction",
                ],
            },
            "ambient_threat": {
                "type": DuressType.ENVIRONMENTAL,
                "description": "Threats in the environment",
                "indicators": [
                    "background voices",
                    "unusual silence",
                    "stress sounds",
                ],
            },
            "tampering": {
                "type": DuressType.TECHNICAL_TAMPERING,
                "description": "Device or system tampering",
                "indicators": [
                    "unauthorized_access_attempts",
                    "device_jailbreak",
                    "signal_interception",
                ],
            },
        }

    def create_session(
        self,
        user_id: str,
        auth_method: str = "biometric",
    ) -> DuressSession:
        """Create a new duress detection session."""

        session_id = str(uuid.uuid4())
        session = DuressSession(session_id, user_id, auth_method)

        self.sessions[session_id] = session

        logger.info(f"Created duress detection session: {session_id}")

        return session

    def analyze_voice(
        self,
        session_id: str,
        audio_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Analyze voice for duress indicators."""

        session = self.sessions.get(session_id)
        if not session:
            return {"error": "Session not found"}

        # Analyze audio for stress indicators
        # In production, would use ML models

        # Simulated analysis
        stress_level = audio_data.get("stress_level", 0.2)
        tremor_detected = audio_data.get("tremor_detected", False)
        speech_rate_anomaly = audio_data.get("speech_rate_anomaly", False)

        duress_probability = 0.0

        if stress_level > 0.7:
            duress_probability += 0.4

        if tremor_detected:
            duress_probability += 0.3

        if speech_rate_anomaly:
            duress_probability += 0.2

        is_duress = duress_probability > 0.6

        alert = {
            "type": DuressType.VERBAL_COERCION.value,
            "probability": duress_probability,
            "is_duress": is_duress,
            "indicators": {
                "stress_level": stress_level,
                "tremor_detected": tremor_detected,
                "speech_rate_anomaly": speech_rate_anomaly,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

        session.alerts.append(alert)

        if is_duress:
            self._trigger_duress_alert(session, alert)

        return alert

    def analyze_behavior(
        self,
        session_id: str,
        behavioral_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Analyze behavioral patterns for duress."""

        session = self.sessions.get(session_id)
        if not session:
            return {"error": "Session not found"}

        # Analyze behavioral biometrics
        # In production, would analyze typing patterns, mouse movements, etc.

        hesitation_patterns = behavioral_data.get("hesitation_patterns", False)
        unnatural_movements = behavioral_data.get("unnatural_movements", False)
        gaze_aversion = behavioral_data.get("gaze_aversion", False)

        duress_probability = 0.0

        if hesitation_patterns:
            duress_probability += 0.25

        if unnatural_movements:
            duress_probability += 0.35

        if gaze_aversion:
            duress_probability += 0.2

        is_duress = duress_probability > 0.5

        alert = {
            "type": DuressType.PHYSICAL_THREAT.value,
            "probability": duress_probability,
            "is_duress": is_duress,
            "indicators": {
                "hesitation_patterns": hesitation_patterns,
                "unnatural_movements": unnatural_movements,
                "gaze_aversion": gaze_aversion,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

        session.alerts.append(alert)

        if is_duress:
            self._trigger_duress_alert(session, alert)

        return alert

    def analyze_environment(
        self,
        session_id: str,
        environmental_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Analyze environment for duress indicators."""

        session = self.sessions.get(session_id)
        if not session:
            return {"error": "Session not found"}

        # Analyze environmental factors
        background_voices = environmental_data.get("background_voices", False)
        unusual_sounds = environmental_data.get("unusual_sounds", False)
        location_anomaly = environmental_data.get("location_anomaly", False)

        duress_probability = 0.0

        if background_voices:
            duress_probability += 0.3

        if unusual_sounds:
            duress_probability += 0.35

        if location_anomaly:
            duress_probability += 0.25

        is_duress = duress_probability > 0.6

        alert = {
            "type": DuressType.ENVIRONMENTAL.value,
            "probability": duress_probability,
            "is_duress": is_duress,
            "indicators": {
                "background_voices": background_voices,
                "unusual_sounds": unusual_sounds,
                "location_anomaly": location_anomaly,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

        session.alerts.append(alert)

        if is_duress:
            self._trigger_duress_alert(session, alert)

        return alert

    def check_duress_pin(
        self,
        session_id: str,
        pin: str,
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Check if entered PIN matches a registered duress PIN from the database.
        A duress PIN appears normal but triggers silent alarm.
        """
        from app.core.database import engine
        from app.core.models import DuressConfig

        is_duress_pin = False
        with Session(engine) as session:
            statement = select(DuressConfig).where(DuressConfig.user_id == user_id)
            config = session.exec(statement).first()
            if config and config.enabled and config.panic_phrase:
                # Check if the entered PIN matches the registered panic phrase/PIN
                is_duress_pin = pin == config.panic_phrase

        result = {
            "is_duress_pin": is_duress_pin,
            "verification": "passed" if not is_duress_pin else "passed_but_duress",
        }

        if is_duress_pin:
            # Create silent alert
            session = self.sessions.get(session_id)
            if session:
                alert = {
                    "type": "duress_pin",
                    "probability": 1.0,
                    "is_duress": True,
                    "indicators": {"duress_pin_entered": True},
                    "timestamp": datetime.utcnow().isoformat(),
                }
                session.alerts.append(alert)
                self._trigger_duress_alert(session, alert)

        return result

    def _trigger_duress_alert(
        self,
        session: DuressSession,
        alert: Dict[str, Any],
    ):
        """Trigger a duress alert."""

        # Determine alert level
        probability = alert.get("probability", 0)

        if probability > 0.8:
            level = DuressAlertLevel.CRITICAL
        elif probability > 0.6:
            level = DuressAlertLevel.HIGH
        elif probability > 0.4:
            level = DuressAlertLevel.MEDIUM
        else:
            level = DuressAlertLevel.LOW

        # Record alert
        alert_record = {
            "alert_id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "user_id": session.user_id,
            "type": alert["type"],
            "level": level.value,
            "probability": probability,
            "timestamp": datetime.utcnow().isoformat(),
        }

        self.alert_history.append(alert_record)

        # In production, would trigger:
        # - Silent notification to security
        # - Law enforcement notification
        # - Account lockdown
        # - Evidence preservation

        logger.warning(f"DURESS ALERT: User {session.user_id} - Level: {level.value}")

    def complete_session(self, session_id: str) -> Dict[str, Any]:
        """Complete a duress detection session."""

        session = self.sessions.get(session_id)
        if not session:
            return {"error": "Session not found"}

        # Calculate overall verdict
        if not session.alerts:
            session.verdict = {
                "is_duress": False,
                "confidence": 0.95,
                "alert_count": 0,
            }
        else:
            probabilities = [a["probability"] for a in session.alerts]
            avg_probability = sum(probabilities) / len(probabilities)
            max_probability = max(probabilities)

            # Use maximum probability for verdict
            is_duress = max_probability > 0.5

            session.verdict = {
                "is_duress": is_duress,
                "confidence": 1.0 - avg_probability
                if not is_duress
                else avg_probability,
                "alert_count": len(session.alerts),
                "max_probability": max_probability,
            }

        result = session.verdict.copy()
        result["session_id"] = session_id

        # Clean up
        del self.sessions[session_id]

        return result

    def get_alert_history(
        self,
        user_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Get duress alert history."""

        alerts = self.alert_history

        if user_id:
            alerts = [a for a in alerts if a["user_id"] == user_id]

        return alerts[-limit:]

    def get_duress_stats(self) -> Dict[str, Any]:
        """Get duress detection statistics."""

        total_alerts = len(self.alert_history)

        if total_alerts == 0:
            return {
                "total_alerts": 0,
                "confirmed_duress": 0,
                "false_positives": 0,
            }

        confirmed = sum(1 for a in self.alert_history if a["probability"] > 0.5)

        return {
            "total_alerts": total_alerts,
            "confirmed_duress": confirmed,
            "false_positives": total_alerts - confirmed,
            "detection_rate": (confirmed / total_alerts * 100),
        }


# Singleton instance
duress_detection_service = DuressDetectionService()
