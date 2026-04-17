"""
Workforce operations: Fiscal Requests, Jobs, and Content Factory
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlmodel import Session, select, desc

from app.services.workforce.base import BaseWorkforceService
from app.core.models.workforce_models import (
    FiscalRequest,
    WorkforceJob,
    WorkforceContent,
    WorkforceAcquisition,
    WorkforceSkill
)

logger = logging.getLogger(__name__)


class OperationsService(BaseWorkforceService):
    """Service for workforce fiscal governance and production operations"""

    async def get_fiscal_requests(self, session: Session) -> List[FiscalRequest]:
        """Fetch all persistent spending approval requests"""
        return session.exec(
            select(FiscalRequest).order_by(desc(FiscalRequest.created_at))
        ).all()

    async def create_fiscal_request(
        self, purpose: str, amount: str, priority: str, session: Session
    ) -> FiscalRequest:
        """Create a new persistent spending approval request"""
        request = FiscalRequest(
            purpose=purpose,
            amount=amount,
            priority=priority,
            status="PENDING",
            created_at=datetime.utcnow()
        )
        session.add(request)
        session.commit()
        session.refresh(request)
        return request

    async def approve_fiscal_request(
        self, id: str, status: str, session: Session
    ) -> Optional[FiscalRequest]:
        """Approve or deny a spending request"""
        request = session.get(FiscalRequest, id)
        if not request:
            return None
        
        request.status = status
        session.add(request)
        session.commit()
        session.refresh(request)
        return request

    async def get_jobs(self, session: Session) -> List[WorkforceJob]:
        """Fetch the live job feed from persistence"""
        return session.exec(
            select(WorkforceJob).order_by(desc(WorkforceJob.created_at))
        ).all()

    async def get_acquisitions(self, session: Session) -> List[WorkforceAcquisition]:
        """Fetch growth acquisition wins"""
        return session.exec(
            select(WorkforceAcquisition).order_by(desc(WorkforceAcquisition.won_at))
        ).all()

    async def get_content_drafts(self, session: Session) -> List[WorkforceContent]:
        """Fetch content factory drafts"""
        return session.exec(
            select(WorkforceContent).order_by(desc(WorkforceContent.created_at))
        ).all()

    async def get_skills(self, session: Session) -> List[WorkforceSkill]:
        """Fetch the workforce skills marketplace"""
        return session.exec(
            select(WorkforceSkill).order_by(WorkforceSkill.name)
        ).all()
