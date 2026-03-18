"""
Training Modules Service for ReguLens
Interactive compliance training and certification tracking.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import uuid
import logging

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


class TrainingModule:
    """Represents a training module."""
    
    def __init__(
        self,
        module_id: str,
        title: str,
        description: str,
        module_type: ModuleType,
        duration_minutes: int,
        content: Dict[str, Any],
    ):
        self.module_id = module_id
        self.title = title
        self.description = description
        self.module_type = module_type
        self.duration_minutes = duration_minutes
        self.content = content
        self.created_at = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "module_id": self.module_id,
            "title": self.title,
            "description": self.description,
            "type": self.module_type.value,
            "duration_minutes": self.duration_minutes,
            "created_at": self.created_at.isoformat(),
        }


class TrainingProgress:
    """Tracks user progress through a training module."""
    
    def __init__(
        self,
        progress_id: str,
        user_id: str,
        module_id: str,
    ):
        self.progress_id = progress_id
        self.user_id = user_id
        self.module_id = module_id
        self.status = ModuleStatus.NOT_STARTED
        self.progress_percent = 0
        self.quiz_score = None
        self.started_at = None
        self.completed_at = None
        self.certified_at = None
        self.certificate_id = None


class TrainingService:
    """
    Training and certification service for AI Act compliance.
    Provides interactive modules and tracks completion.
    """
    
    def __init__(self):
        self.modules: Dict[str, TrainingModule] = {}
        self.user_progress: Dict[str, TrainingProgress] = {}
        self.certifications: Dict[str, Dict[str, Any]] = {}
        
        # Initialize demo modules
        self._init_modules()
    
    def _init_modules(self):
        """Initialize training modules."""
        
        modules = [
            TrainingModule(
                module_id="mod-001",
                title="EU AI Act Fundamentals",
                description="Introduction to the EU Artificial Intelligence Act and its requirements.",
                module_type=ModuleType.VIDEO,
                duration_minutes=30,
                content={
                    "video_url": "https://example.com/videos/ai-act-fundamentals",
                    "transcript": "...",
                    "chapters": [
                        {"time": 0, "title": "Introduction"},
                        {"time": 300, "title": "Risk Categories"},
                        {"time": 900, "title": "Compliance Requirements"},
                        {"time": 1500, "title": "Conclusion"},
                    ],
                },
            ),
            TrainingModule(
                module_id="mod-002",
                title="High-Risk AI Systems",
                description="Understanding requirements for high-risk AI systems under the AI Act.",
                module_type=ModuleType.INTERACTIVE,
                duration_minutes=45,
                content={
                    "sections": [
                        {"title": "Annex III Categories", "type": "content"},
                        {"title": "Conformity Assessment", "type": "interactive"},
                        {"title": "Technical Documentation", "type": "interactive"},
                    ],
                },
            ),
            TrainingModule(
                module_id="mod-003",
                title="Data Governance & Bias Detection",
                description="Learn to identify and mitigate bias in AI training data.",
                module_type=ModuleType.QUIZ,
                duration_minutes=25,
                content={
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is disparate impact?",
                            "options": [
                                "A measure of discrimination",
                                "A type of algorithm",
                                "A data format",
                            ],
                            "correct": 0,
                        },
                        {
                            "id": "q2",
                            "question": "Which Article covers data governance?",
                            "options": ["Article 10", "Article 5", "Article 14"],
                            "correct": 0,
                        },
                    ],
                },
            ),
            TrainingModule(
                module_id="mod-004",
                title="Technical Documentation Workshop",
                description="Hands-on workshop for creating AI Act technical documentation.",
                module_type=ModuleType.CASE_STUDY,
                duration_minutes=60,
                content={
                    "case_study": "A company deploying an AI-powered hiring system",
                    "tasks": [
                        "Identify risk category",
                        "Create model card",
                        "Document training data",
                        "Plan conformity assessment",
                    ],
                },
            ),
            TrainingModule(
                module_id="mod-005",
                title="Compliance Audit Simulation",
                description="Practice conducting a compliance audit.",
                module_type=ModuleType.AUDIT,
                duration_minutes=90,
                content={
                    "scenario": "Audit of an AI recruitment system",
                    "checklist": [
                        "Verify registration in EU database",
                        "Check technical documentation",
                        "Review data governance measures",
                        "Assess transparency requirements",
                    ],
                },
            ),
        ]
        
        for module in modules:
            self.modules[module.module_id] = module
    
    def list_modules(
        self,
        module_type: Optional[ModuleType] = None,
    ) -> List[Dict[str, Any]]:
        """List all available training modules."""
        
        modules = list(self.modules.values())
        
        if module_type:
            modules = [m for m in modules if m.module_type == module_type]
        
        return [m.to_dict() for m in modules]
    
    def get_module(self, module_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific module with full content."""
        
        module = self.modules.get(module_id)
        if not module:
            return None
        
        result = module.to_dict()
        result["content"] = module.content
        
        return result
    
    def start_module(
        self,
        user_id: str,
        module_id: str,
    ) -> Dict[str, Any]:
        """Start a training module for a user."""
        
        module = self.modules.get(module_id)
        if not module:
            return {"error": "Module not found"}
        
        # Create progress record
        progress_id = str(uuid.uuid4())
        progress = TrainingProgress(progress_id, user_id, module_id)
        progress.status = ModuleStatus.IN_PROGRESS
        progress.started_at = datetime.utcnow()
        
        self.user_progress[progress_id] = progress
        
        return {
            "progress_id": progress_id,
            "module_id": module_id,
            "status": progress.status.value,
            "started_at": progress.started_at.isoformat(),
            "content": module.content,
        }
    
    def update_progress(
        self,
        progress_id: str,
        progress_percent: int,
    ) -> Dict[str, Any]:
        """Update progress through a module."""
        
        progress = self.user_progress.get(progress_id)
        if not progress:
            return {"error": "Progress not found"}
        
        progress.progress_percent = progress_percent
        
        if progress_percent >= 100:
            progress.status = ModuleStatus.COMPLETED
            progress.completed_at = datetime.utcnow()
        
        return {
            "progress_id": progress_id,
            "progress_percent": progress_percent,
            "status": progress.status.value,
        }
    
    def submit_quiz(
        self,
        progress_id: str,
        answers: Dict[str, int],
    ) -> Dict[str, Any]:
        """Submit quiz answers and get score."""
        
        progress = self.user_progress.get(progress_id)
        if not progress:
            return {"error": "Progress not found"}
        
        module = self.modules.get(progress.module_id)
        if not module or module.module_type != ModuleType.QUIZ:
            return {"error": "Module is not a quiz"}
        
        # Calculate score
        content = module.content
        questions = content.get("questions", [])
        
        correct = 0
        total = len(questions)
        
        for question in questions:
            qid = question["id"]
            if qid in answers and answers[qid] == question["correct"]:
                correct += 1
        
        score = (correct / total * 100) if total > 0 else 0
        passed = score >= 70  # 70% to pass
        
        progress.quiz_score = score
        progress.status = ModuleStatus.COMPLETED if passed else ModuleStatus.IN_PROGRESS
        progress.completed_at = datetime.utcnow()
        
        # Generate certificate if passed
        if passed:
            progress.status = ModuleStatus.CERTIFIED
            progress.certified_at = datetime.utcnow()
            progress.certificate_id = str(uuid.uuid4())[:8]
            
            # Store certification
            self.certifications[progress.certificate_id] = {
                "certificate_id": progress.certificate_id,
                "user_id": progress.user_id,
                "module_id": progress.module_id,
                "score": score,
                "issued_at": progress.certified_at.isoformat(),
            }
        
        return {
            "progress_id": progress_id,
            "score": score,
            "passed": passed,
            "correct_answers": correct,
            "total_questions": total,
            "certificate_id": progress.certificate_id if passed else None,
        }
    
    def get_user_certifications(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all certifications for a user."""
        
        user_certs = [
            cert for cert in self.certifications.values()
            if cert["user_id"] == user_id
        ]
        
        return user_certs
    
    def verify_certificate(self, certificate_id: str) -> Optional[Dict[str, Any]]:
        """Verify a certificate by ID."""
        
        return self.certifications.get(certificate_id)
    
    def get_training_stats(self) -> Dict[str, Any]:
        """Get overall training statistics."""
        
        total_modules = len(self.modules)
        total_users = len(set(p.user_id for p in self.user_progress.values()))
        total_completions = sum(
            1 for p in self.user_progress.values()
            if p.status in [ModuleStatus.COMPLETED, ModuleStatus.CERTIFIED]
        )
        total_certs = len(self.certifications)
        
        return {
            "total_modules": total_modules,
            "total_enrolled": total_users,
            "total_completions": total_completions,
            "total_certifications": total_certs,
            "completion_rate": (total_completions / total_users * 100) if total_users > 0 else 0,
        }


# Singleton instance
training_service = TrainingService()
