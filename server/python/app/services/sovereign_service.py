"""
Sovereign HI-T-L Orchestration Service
Handles escalation to human operators for high-stakes decisions.
"""

import uuid
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum

from sqlmodel import Session, select
from app.core.database import engine
from app.core.models import SovereignRequest, SovereignStatus, SovereignStage

logger = logging.getLogger(__name__)

# Enums are imported from app.core.models


class SovereignService:
    """
    Manages the "Sovereign Bridge" for Human-in-the-Loop decision making.
    Prevents autonomous agents from executing high-stakes actions without review.
    """

    def __init__(self):
        # Persistence handled via SQLModel
        # Predefined stages as seen in the Sovereign Matrix
        self.stages = {
            SovereignStage.FINANCE: {"level": "review_required", "status": "healthy"},
            SovereignStage.LEGAL: {"level": "review_required", "status": "healthy"},
            SovereignStage.CRISIS: {"level": "fully_autonomous", "status": "healthy"},
            SovereignStage.RD: {"level": "fully_autonomous", "status": "healthy"},
            SovereignStage.ETHICS: {"level": "review_required", "status": "healthy"},
        }

    async def request_approval(
        self, stage: str, action: str, reasoning: str, context: Optional[str] = None
    ) -> str:
        """
        Create a new approval request and notify human operators.
        """
        with Session(engine) as session:
            db_request = SovereignRequest(
                stage=stage,
                action=action,
                reasoning=reasoning,
                context=context,
                status=SovereignStatus.PENDING,
            )
            session.add(db_request)
            session.commit()
            session.refresh(db_request)

            # Notify via webhook service
            try:
                from app.services.webhook_service import webhook_service

                await webhook_service.trigger_event(
                    "sovereign.escalation",
                    {
                        "request_id": db_request.id,
                        "stage": stage,
                        "action": action,
                        "reasoning": reasoning,
                    },
                )
            except Exception as e:
                logger.warning(f"Webhook notification failed: {e}")

            logger.info(
                f"[SOVEREIGN ESCALATION] Stage: {stage} | Action: {action} | RequestID: {db_request.id}"
            )

            return db_request.id

    def get_request(self, request_id: str) -> Optional[SovereignRequest]:
        with Session(engine) as session:
            return session.get(SovereignRequest, request_id)

    def list_pending_requests(
        self, stage: Optional[str] = None
    ) -> List[SovereignRequest]:
        with Session(engine) as session:
            statement = select(SovereignRequest).where(
                SovereignRequest.status == SovereignStatus.PENDING
            )
            if stage:
                statement = statement.where(SovereignRequest.stage == stage)
            return session.exec(statement).all()

    def process_response(
        self, request_id: str, approved: bool, reviewer: str = "human-operator"
    ) -> bool:
        """
        Handle a response from a human operator.
        """
        with Session(engine) as session:
            db_request = session.get(SovereignRequest, request_id)
            if not db_request:
                return False

            status = SovereignStatus.APPROVED if approved else SovereignStatus.DENIED
            db_request.status = status
            db_request.reviewer = reviewer
            db_request.updated_at = datetime.utcnow()

            session.add(db_request)
            session.commit()

            logger.info(
                f"[SOVEREIGN RESPONSE] Request: {request_id} | Status: {status.value} | Reviewer: {reviewer}"
            )
            return True

    def get_status(self) -> Dict[str, Any]:
        """
        Return the current state of the Sovereign Matrix.
        """
        return {
            "stages": self.stages,
            "pending_count": len(self.list_pending_requests()),
            "last_updated": datetime.utcnow().isoformat(),
        }


# Singleton instance
sovereign_service = SovereignService()
