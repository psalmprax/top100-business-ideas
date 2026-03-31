"""Alert and Rule management endpoints"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from datetime import datetime
import uuid

from app.core.models import AlertConfig, AgentVigilanceAlert
from app.core.database import get_session

router = APIRouter()


@router.get("/alerts", response_model=List[AlertConfig])
async def list_alert_configs(session: Session = Depends(get_session)):
    """List all AI alert configurations (Rules)"""
    return session.exec(select(AlertConfig)).all()


@router.post("/alerts", response_model=AlertConfig)
async def create_alert_config(config: dict, session: Session = Depends(get_session)):
    """Create a new AI alert configuration"""
    new_config = AlertConfig(
        id=str(uuid.uuid4()),
        name=config.get("name"),
        alert_type=config.get("alert_type", "budget"),
        threshold=config.get("threshold", 0.0),
        limit=config.get("limit", 100.0),
        action=config.get("action", "pause"),
        priority=config.get("priority", "medium"),
        is_active=config.get("is_active", True),
        channels=config.get("channels", ["email"]),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(new_config)
    session.commit()
    session.refresh(new_config)
    return new_config


@router.put("/alerts/{alert_id}", response_model=AlertConfig)
async def update_alert_config(alert_id: str, update: dict, session: Session = Depends(get_session)):
    """Update an alert configuration"""
    config = session.get(AlertConfig, alert_id)
    if not config:
        raise HTTPException(status_code=404, detail="Alert config not found")
    
    for key, value in update.items():
        if hasattr(config, key):
            setattr(config, key, value)
    
    config.updated_at = datetime.utcnow()
    session.add(config)
    session.commit()
    session.refresh(config)
    return config


@router.patch("/alerts/{alert_id}", response_model=AlertConfig)
async def patch_alert_config(alert_id: str, update: dict, session: Session = Depends(get_session)):
    """Toggle or partially update an alert configuration"""
    return await update_alert_config(alert_id, update, session)


@router.delete("/alerts/{alert_id}")
async def delete_alert_config(alert_id: str, session: Session = Depends(get_session)):
    """Delete an alert configuration"""
    config = session.get(AlertConfig, alert_id)
    if not config:
        raise HTTPException(status_code=404, detail="Alert config not found")
    
    session.delete(config)
    session.commit()
    return {"message": "Alert configuration deleted"}


@router.get("/vigilance", response_model=List[AgentVigilanceAlert])
async def list_vigilance_alerts(session: Session = Depends(get_session)):
    """List all active agent vigilance alerts (Incidents)"""
    return session.exec(select(AgentVigilanceAlert).where(AgentVigilanceAlert.resolved == False)).all()


@router.post("/vigilance/{alert_id}/resolve")
async def resolve_vigilance_alert(alert_id: str, session: Session = Depends(get_session)):
    """Mark a vigilance alert as resolved"""
    alert = session.get(AgentVigilanceAlert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    session.add(alert)
    session.commit()
    return {"message": "Alert resolved"}
