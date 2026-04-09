from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.models.compliance_models import HealingConfiguration
from pydantic import BaseModel

router = APIRouter()

class HealingUpdate(BaseModel):
    auto_refine: bool = None
    safety_rollback: bool = None

@router.get("/healing/status")
async def get_healing_status(session: Session = Depends(get_session)):
    """Get current self-healing status and metrics"""
    from app.services.self_healing_manager import self_healing_manager
    return self_healing_manager.get_cluster_status()

@router.get("/healing/configs")
async def get_healing_configs(session: Session = Depends(get_session)):
    """List all healing configurations"""
    return session.exec(select(HealingConfiguration)).all()

@router.post("/healing/config")
async def update_healing_config(
    update: Dict[str, Any], session: Session = Depends(get_session)
):
    """Update self-healing configuration parameters with real database persistence."""
    statement = select(HealingConfiguration)
    config = session.exec(statement).first()

    if not config:
        config = HealingConfiguration(
            id="default",
            auto_refine=update.get("auto_refine", True),
            safety_rollback=update.get("safety_rollback", True),
            max_retries=3,
        )
    else:
        for key, value in update.items():
            if hasattr(config, key):
                setattr(config, key, value)
    
    session.add(config)
    session.commit()
    session.refresh(config)
    return {"status": "updated", "config": config}
