"""Agent management endpoints"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from datetime import datetime

from app.core.models import (
    Agent, AgentCreate, AgentUpdate, AgentStatus
)
from app.core.database import get_session

router = APIRouter()


@router.get("", response_model=List[Agent])
async def list_agents(session: Session = Depends(get_session)):
    """List all agents"""
    agents = session.exec(select(Agent)).all()
    return agents


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str, session: Session = Depends(get_session)):
    """Get agent by ID"""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("", response_model=Agent)
async def create_agent(agent_data: AgentCreate, session: Session = Depends(get_session)):
    """Create a new agent"""
    new_agent = Agent.model_validate(agent_data)
    new_agent.status = AgentStatus.STOPPED
    new_agent.created_at = datetime.utcnow()
    new_agent.updated_at = datetime.utcnow()
    
    session.add(new_agent)
    session.commit()
    session.refresh(new_agent)
    return new_agent


@router.put("/{agent_id}", response_model=Agent)
async def update_agent(agent_id: str, agent_data: AgentUpdate, session: Session = Depends(get_session)):
    """Update an agent"""
    db_agent = session.get(Agent, agent_id)
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent_dict = agent_data.model_dump(exclude_unset=True)
    for key, value in agent_dict.items():
        setattr(db_agent, key, value)
    
    db_agent.updated_at = datetime.utcnow()
    session.add(db_agent)
    session.commit()
    session.refresh(db_agent)
    return db_agent


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str, session: Session = Depends(get_session)):
    """Delete an agent"""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    session.delete(agent)
    session.commit()
    return {"message": "Agent deleted successfully"}


@router.get("/metrics/agents")
async def get_agent_metrics(session: Session = Depends(get_session)):
    """Get aggregated agent metrics from DB"""
    agents = session.exec(select(Agent)).all()
    
    total_agents = len(agents)
    running = sum(1 for a in agents if a.status == AgentStatus.RUNNING)
    stopped = sum(1 for a in agents if a.status == AgentStatus.STOPPED)
    error = sum(1 for a in agents if a.status == AgentStatus.ERROR)
    
    return {
        "total_agents": total_agents,
        "running": running,
        "stopped": stopped,
        "error": error,
        "avg_cpu_usage": 45.5,
        "avg_memory_usage": 62.3
    }


@router.get("/metrics/agents/{agent_id}/history")
async def get_agent_history(agent_id: str, session: Session = Depends(get_session)):
    """Get agent metrics history"""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Return mock history data for now
    return {
        "agent_id": agent_id,
        "history": [
            {"timestamp": datetime.utcnow().isoformat(), "cpu": 45, "memory": 60},
            {"timestamp": datetime.utcnow().isoformat(), "cpu": 50, "memory": 65},
            {"timestamp": datetime.utcnow().isoformat(), "cpu": 42, "memory": 58},
        ]
    }


@router.get("/{agent_id}/roi")
async def get_agent_roi(agent_id: str, session: Session = Depends(get_session)):
    """Get calculated ROI and Downtime-to-Dollar loss for an agent"""
    from app.services.roi_service import roi_service
    
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    downtime_loss = roi_service.calculate_downtime_loss(agent)
    productivity_roi = roi_service.calculate_productivity_roi(agent)
    
    return {
        "agent_id": agent_id,
        "downtime_loss": downtime_loss,
        "productivity_roi": productivity_roi,
        "calculated_at": datetime.utcnow().isoformat()
    }
