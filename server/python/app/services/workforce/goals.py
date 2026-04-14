"""
Workforce goals, KPIs, and referral program functionality
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlmodel import Session, select, func

from app.services.workforce.base import BaseWorkforceService
from app.core.models import WorkforceGoal, WorkforceVenture

logger = logging.getLogger(__name__)


class GoalsService(BaseWorkforceService):
    """Service for workforce goals, KPIs, and referral programs"""

    async def get_status(self, session: Session) -> Dict[str, Any]:
        """Get overall workforce status and metrics"""
        total_goals = session.exec(select(func.count(WorkforceGoal.id))).one()
        completed_goals = session.exec(
            select(func.count(WorkforceGoal.id)).where(
                WorkforceGoal.status == "completed"
            )
        ).one()
        active_ventures = session.exec(
            select(func.count(WorkforceVenture.id)).where(
                WorkforceVenture.status == "active"
            )
        ).one()

        return {
            "total_goals": total_goals,
            "completed_goals": completed_goals,
            "active_ventures": active_ventures,
            "completion_rate": completed_goals / total_goals if total_goals > 0 else 0,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def list_goals(
        self, session: Session, status: Optional[str] = None
    ) -> List[WorkforceGoal]:
        """List workforce goals, optionally filtered by status"""
        query = select(WorkforceGoal).order_by(WorkforceGoal.created_at.desc())
        if status:
            query = query.where(WorkforceGoal.status == status)
        return session.exec(query).all()

    async def create_goal(self, goal: WorkforceGoal, session: Session) -> WorkforceGoal:
        """Create a new workforce goal"""
        goal.created_at = datetime.utcnow()
        goal.status = "active"
        session.add(goal)
        session.commit()
        session.refresh(goal)
        return goal

    async def update_goal(
        self, goal_id: str, updates: Dict[str, Any], session: Session
    ) -> Optional[WorkforceGoal]:
        """Update an existing workforce goal"""
        goal = session.get(WorkforceGoal, goal_id)
        if not goal:
            return None

        for key, value in updates.items():
            if hasattr(goal, key):
                setattr(goal, key, value)

        goal.updated_at = datetime.utcnow()
        session.add(goal)
        session.commit()
        session.refresh(goal)
        return goal

    async def activate_referral(
        self, referral_id: str, session: Session
    ) -> Dict[str, Any]:
        """Activate a referral program"""
        # In production, integrate with referral tracking system
        return {
            "status": "success",
            "referral_id": referral_id,
            "activated_at": datetime.utcnow().isoformat(),
            "message": "Referral program activated successfully",
        }

    async def list_ventures(self, session: Session) -> List[WorkforceVenture]:
        """List all workforce ventures"""
        return session.exec(
            select(WorkforceVenture).order_by(WorkforceVenture.created_at.desc())
        ).all()

    async def create_venture(
        self, venture: WorkforceVenture, session: Session
    ) -> WorkforceVenture:
        """Create a new workforce venture"""
        venture.created_at = datetime.utcnow()
        venture.status = "active"
        session.add(venture)
        session.commit()
        session.refresh(venture)
        return venture
