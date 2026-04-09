"""
Training Modules Service for ReguLens
Interactive compliance training and certification tracking.
Uses database persistence - loads from DB, no demo data on startup.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import uuid
import logging
import os
import json
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models.ai_models import TrainingModule as DBTrainingModule
from app.core.models.ai_models import TrainingProgress as DBTrainingProgress

logger = logging.getLogger(__name__)


class ModuleStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CERTIFIED = "certified"
    EXPIRED = "expired"


class ModuleType(str, Enum):
    VIDEO = "video"
    INTERACTIVE = "interactive"
    QUIZ = "quiz"
    CASE_STUDY = "case_study"
    AUDIT = "audit"


class TrainingService:
    """Training service using database persistence."""

    def list_modules(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all training modules from database."""
        with Session(engine) as session:
            query = select(DBTrainingModule)

            if category:
                query = query.where(DBTrainingModule.category == category)

            modules = session.exec(query).all()
            return [self._module_to_dict(m) for m in modules]

    def get_module(self, module_id: str) -> Optional[Dict[str, Any]]:
        """Get a module by ID."""
        with Session(engine) as session:
            try:
                module_uuid = uuid.UUID(module_id)
                module = session.exec(
                    select(DBTrainingModule).where(DBTrainingModule.id == module_uuid)
                ).first()

                if module:
                    return self._module_to_dict(module)
            except ValueError:
                # Try finding by string match on title
                module = session.exec(
                    select(DBTrainingModule).where(
                        DBTrainingModule.title.contains(module_id)
                    )
                ).first()

                if module:
                    return self._module_to_dict(module)

            return None

    def create_module(
        self,
        title: str,
        description: str,
        category: str,
        duration_minutes: int,
        content: str = "",
        quiz_questions: List[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Create a new training module."""
        with Session(engine) as session:
            module = DBTrainingModule(
                title=title,
                description=description,
                category=category,
                duration_minutes=duration_minutes,
                content=content,
                quiz_questions=quiz_questions or [],
            )
            session.add(module)
            session.commit()
            session.refresh(module)

            logger.info(f"Created training module: {module.id}")
            return self._module_to_dict(module)

    def update_module(
        self,
        module_id: str,
        updates: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Update a module."""
        with Session(engine) as session:
            try:
                module_uuid = uuid.UUID(module_id)
                module = session.exec(
                    select(DBTrainingModule).where(DBTrainingModule.id == module_uuid)
                ).first()
            except ValueError:
                return None

            if not module:
                return None

            if "title" in updates:
                module.title = updates["title"]
            if "description" in updates:
                module.description = updates["description"]
            if "category" in updates:
                module.category = updates["category"]
            if "duration_minutes" in updates:
                module.duration_minutes = updates["duration_minutes"]
            if "content" in updates:
                module.content = updates["content"]
            if "quiz_questions" in updates:
                module.quiz_questions = updates["quiz_questions"]

            session.commit()
            session.refresh(module)

            return self._module_to_dict(module)

    def delete_module(self, module_id: str) -> bool:
        """Delete a module."""
        with Session(engine) as session:
            try:
                module_uuid = uuid.UUID(module_id)
                module = session.exec(
                    select(DBTrainingModule).where(DBTrainingModule.id == module_uuid)
                ).first()

                if module:
                    session.delete(module)
                    session.commit()
                    return True
            except ValueError:
                pass

            return False

    def get_user_progress(
        self, user_id: str, module_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get user progress for a specific module."""
        with Session(engine) as session:
            try:
                user_uuid = uuid.UUID(user_id)
                module_uuid = uuid.UUID(module_id)

                progress = session.exec(
                    select(DBTrainingProgress).where(
                        DBTrainingProgress.user_id == user_uuid,
                        DBTrainingProgress.module_id == module_uuid,
                    )
                ).first()

                if progress:
                    return self._progress_to_dict(progress)
            except ValueError:
                pass

            return None

    def get_user_all_progress(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all progress for a user."""
        with Session(engine) as session:
            try:
                user_uuid = uuid.UUID(user_id)
                progress_list = session.exec(
                    select(DBTrainingProgress).where(
                        DBTrainingProgress.user_id == user_uuid
                    )
                ).all()

                return [self._progress_to_dict(p) for p in progress_list]
            except ValueError:
                return []

    def start_module(self, user_id: str, module_id: str) -> Dict[str, Any]:
        """Start a module for a user."""
        with Session(engine) as session:
            try:
                user_uuid = uuid.UUID(user_id)
                module_uuid = uuid.UUID(module_id)

                # Check if progress exists
                progress = session.exec(
                    select(DBTrainingProgress).where(
                        DBTrainingProgress.user_id == user_uuid,
                        DBTrainingProgress.module_id == module_uuid,
                    )
                ).first()

                if not progress:
                    progress = DBTrainingProgress(
                        user_id=user_uuid,
                        module_id=module_uuid,
                        status=ModuleStatus.IN_PROGRESS,
                        progress_percent=0,
                        started_at=datetime.utcnow(),
                    )
                    session.add(progress)
                else:
                    progress.status = ModuleStatus.IN_PROGRESS
                    progress.started_at = datetime.utcnow()

                session.commit()
                session.refresh(progress)

                return self._progress_to_dict(progress)
            except ValueError as e:
                logger.error(f"Invalid UUID: {e}")
                return {"error": "Invalid user or module ID"}

    def update_progress(
        self,
        user_id: str,
        module_id: str,
        progress_percent: int,
    ) -> Optional[Dict[str, Any]]:
        """Update user progress for a module."""
        with Session(engine) as session:
            try:
                user_uuid = uuid.UUID(user_id)
                module_uuid = uuid.UUID(module_id)

                progress = session.exec(
                    select(DBTrainingProgress).where(
                        DBTrainingProgress.user_id == user_uuid,
                        DBTrainingProgress.module_id == module_uuid,
                    )
                ).first()

                if progress:
                    progress.progress_percent = progress_percent
                    if progress_percent >= 100:
                        progress.status = ModuleStatus.COMPLETED
                        progress.completed_at = datetime.utcnow()
                    else:
                        progress.status = ModuleStatus.IN_PROGRESS

                    session.commit()
                    session.refresh(progress)

                    return self._progress_to_dict(progress)
            except ValueError:
                pass

            return None

    def complete_module(
        self,
        user_id: str,
        module_id: str,
        quiz_score: Optional[float] = None,
    ) -> Optional[Dict[str, Any]]:
        """Mark a module as completed."""
        with Session(engine) as session:
            try:
                user_uuid = uuid.UUID(user_id)
                module_uuid = uuid.UUID(module_id)

                progress = session.exec(
                    select(DBTrainingProgress).where(
                        DBTrainingProgress.user_id == user_uuid,
                        DBTrainingProgress.module_id == module_uuid,
                    )
                ).first()

                if progress:
                    progress.status = ModuleStatus.COMPLETED
                    progress.progress_percent = 100
                    progress.completed_at = datetime.utcnow()
                    progress.quiz_score = quiz_score

                    if quiz_score and quiz_score >= 70:
                        progress.status = ModuleStatus.CERTIFIED
                        progress.certified_at = datetime.utcnow()
                        progress.certificate_id = str(uuid.uuid4())[:8]

                    session.commit()
                    session.refresh(progress)

                    return self._progress_to_dict(progress)
            except ValueError:
                pass

            return None

    def get_stats(self) -> Dict[str, Any]:
        """Get training statistics."""
        with Session(engine) as session:
            total_modules = session.exec(select(DBTrainingModule)).count()
            total_progress = session.exec(select(DBTrainingProgress)).count()
            completed = session.exec(
                select(DBTrainingProgress).where(
                    DBTrainingProgress.status == ModuleStatus.COMPLETED
                )
            ).count()
            certified = session.exec(
                select(DBTrainingProgress).where(
                    DBTrainingProgress.status == ModuleStatus.CERTIFIED
                )
            ).count()

            return {
                "total_modules": total_modules,
                "total_enrollments": total_progress,
                "completed": completed,
                "certified": certified,
                "completion_rate": round(completed / total_progress * 100, 1)
                if total_progress > 0
                else 0,
            }

    def _module_to_dict(self, module: DBTrainingModule) -> Dict[str, Any]:
        return {
            "id": str(module.id),
            "title": module.title,
            "description": module.description,
            "category": module.category,
            "duration_minutes": module.duration_minutes,
            "content": module.content,
            "quiz_questions": module.quiz_questions or [],
            "created_at": module.created_at.isoformat() if module.created_at else None,
        }

    def _progress_to_dict(self, progress: DBTrainingProgress) -> Dict[str, Any]:
        return {
            "id": str(progress.id),
            "user_id": str(progress.user_id),
            "module_id": str(progress.module_id),
            "status": progress.status,
            "progress_percent": progress.progress_percent,
            "quiz_score": progress.quiz_score,
            "started_at": progress.started_at.isoformat()
            if progress.started_at
            else None,
            "completed_at": progress.completed_at.isoformat()
            if progress.completed_at
            else None,
            "certified_at": progress.certified_at.isoformat()
            if progress.certified_at
            else None,
            "certificate_id": progress.certificate_id,
        }


# Singleton instance
training_service = TrainingService()
