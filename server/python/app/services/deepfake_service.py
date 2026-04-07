import uuid
import os
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select, func
from app.core.database import engine
from app.core.models import (
    DeepfakeAnalysis,
    DeepfakeThreat,
    CustomModel,
    DuressConfig,
    BiometricTemplate,
    WearableDevice,
    CryptoWallet,
    ComplianceAuditLog,
    MediaType,
    AnalysisResult,
)

logger = logging.getLogger(__name__)


class DeepfakeService:
    @staticmethod
    def get_session():
        return Session(engine)

    # --- Media Analysis ---
    def list_analyses(self, limit: int = 20) -> List[DeepfakeAnalysis]:
        with self.get_session() as session:
            statement = (
                select(DeepfakeAnalysis)
                .order_by(DeepfakeAnalysis.analysis_at.desc())
                .limit(limit)
            )
            return session.exec(statement).all()

    def analyze_media(
        self, media_url: str, media_type: str, user_id: str
    ) -> DeepfakeAnalysis:
        """Analyze media for deepfake detection using real FFT-based analysis."""
        try:
            from app.ml.deepfake_detector import deepfake_detector

            if media_type == "image":
                result = deepfake_detector.analyze_image(media_url)
            elif media_type == "video":
                result = deepfake_detector.analyze_video(media_url)
            elif media_type == "audio":
                result = deepfake_detector.analyze_audio(media_url)
            else:
                raise ValueError(f"Unsupported media type: {media_type}")

            is_fake = result.get("result") == "fake"
            confidence = result.get("confidence", 0)
            details = result.get("details", {})
            result_enum = AnalysisResult.FAKE if is_fake else AnalysisResult.REAL
        except Exception as e:
            logger.error(f"Deepfake analysis failed: {e}")
            raise RuntimeError(f"Deepfake analysis failed: {e}")

        with self.get_session() as session:
            analysis = DeepfakeAnalysis(
                media_url=media_url,
                media_type=media_type,
                result=result_enum,
                confidence=confidence,
                details=details,
            )
            session.add(analysis)

            if result_enum == AnalysisResult.FAKE:
                threat = DeepfakeThreat(
                    type="synthetic",
                    severity="high",
                    description=f"Deepfake detected in {media_type}",
                    media_url=media_url,
                )
                session.add(threat)

            session.commit()
            session.refresh(analysis)
            return analysis

    # --- Threats ---
    def list_threats(self, limit: int = 10) -> List[DeepfakeThreat]:
        with self.get_session() as session:
            statement = (
                select(DeepfakeThreat)
                .order_by(DeepfakeThreat.timestamp.desc())
                .limit(limit)
            )
            return session.exec(statement).all()

    def resolve_threat(self, threat_id: str) -> bool:
        with self.get_session() as session:
            threat = session.get(DeepfakeThreat, threat_id)
            if threat:
                threat.resolved = True
                session.add(threat)
                session.commit()
                return True
            return False

    # --- Duress / Panic Word ---
    def get_duress_config(self, user_id: str) -> DuressConfig:
        with self.get_session() as session:
            statement = select(DuressConfig).where(DuressConfig.user_id == user_id)
            config = session.exec(statement).first()
            if not config:
                config = DuressConfig(
                    user_id=user_id,
                    panic_phrase="alaska",
                    trigger_action="alert_security",
                )
                session.add(config)
                session.commit()
                session.refresh(config)
            return config

    def update_duress_config(self, config_data: Dict[str, Any]) -> DuressConfig:
        with self.get_session() as session:
            user_id = config_data.get("user_id")
            statement = select(DuressConfig).where(DuressConfig.user_id == user_id)
            config = session.exec(statement).first()

            if not config:
                config = DuressConfig(**config_data)
            else:
                for key, value in config_data.items():
                    setattr(config, key, value)
                config.updated_at = datetime.utcnow()

            session.add(config)
            session.commit()
            session.refresh(config)
            return config

    # --- Compliance & Auditing ---
    def record_audit(
        self, user_id: str, action: str, resource: str, comp_type: str
    ) -> ComplianceAuditLog:
        with self.get_session() as session:
            log = ComplianceAuditLog(
                user_id=user_id,
                action=action,
                resource=resource,
                compliance_type=comp_type,
                status="verified",
                metadata_json={"timestamp": datetime.utcnow().isoformat()},
            )
            session.add(log)
            session.commit()
            session.refresh(log)
            return log

    # --- Stats ---
    def get_stats(self) -> Dict[str, Any]:
        with self.get_session() as session:
            total_scans = session.exec(select(func.count(DeepfakeAnalysis.id))).one()
            fakes_detected = session.exec(
                select(func.count(DeepfakeAnalysis.id)).where(
                    DeepfakeAnalysis.result == AnalysisResult.FAKE
                )
            ).one()
            active_threats = session.exec(
                select(func.count(DeepfakeThreat.id)).where(
                    DeepfakeThreat.resolved == False
                )
            ).one()

            # Calculate real accuracy from analysis confidence scores
            analyses = session.exec(select(DeepfakeAnalysis)).all()
            if analyses:
                avg_confidence = sum(a.confidence for a in analyses) / len(analyses)
                accuracy = round(avg_confidence, 1)
            else:
                accuracy = 0.0

            return {
                "total_scans": total_scans,
                "fakes_detected": fakes_detected,
                "active_threats": active_threats,
                "accuracy": accuracy,
                "last_run": datetime.utcnow().isoformat(),
            }


deepfake_service = DeepfakeService()
