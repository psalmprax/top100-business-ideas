"""Agent operations endpoints"""

from typing import List, Dict
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from datetime import datetime

from app.core.models import Agent, AgentStatus, LLMUsageLog
from app.core.database import get_session
from app.services.localization import localization_service

router = APIRouter()


@router.post("/{agent_id}/stop")
async def stop_agent(agent_id: str, session: Session = Depends(get_session)):
    """Stop a running agent"""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent.status = AgentStatus.STOPPED
    agent.updated_at = datetime.utcnow()
    session.add(agent)
    session.commit()

    return {"status": "success", "message": f"Agent {agent_id} stopped"}


@router.post("/{agent_id}/restart")
async def restart_agent(agent_id: str, session: Session = Depends(get_session)):
    """Restart an agent"""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent.status = AgentStatus.RUNNING
    agent.updated_at = datetime.utcnow()
    session.add(agent)
    session.commit()

    return {"status": "success", "message": f"Agent {agent_id} restarted"}


@router.get("/{agent_id}/logs")
async def get_agent_logs(
    agent_id: str, limit: int = 50, session: Session = Depends(get_session)
):
    """Get agent execution logs"""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    logs = session.exec(
        select(LLMUsageLog)
        .where(LLMUsageLog.agent_id == agent_id)
        .order_by(LLMUsageLog.timestamp.desc())
        .limit(limit)
    ).all()

    return logs


@router.get("/metrics")
async def get_agent_ops_metrics(session: Session = Depends(get_session)):
    """Get aggregated agent operations metrics"""
    agents = session.exec(select(Agent)).all()

    total = len(agents)
    running = sum(1 for a in agents if a.status == AgentStatus.RUNNING)
    stopped = sum(1 for a in agents if a.status == AgentStatus.STOPPED)
    error = sum(1 for a in agents if a.status == AgentStatus.ERROR)

    total_requests = session.exec(select(func.count(LLMUsageLog.id))).one()
    total_cost = session.exec(select(func.sum(LLMUsageLog.cost))).one() or 0.0

    return {
        "total_agents": total,
        "running": running,
        "stopped": stopped,
        "error": error,
        "total_requests": total_requests,
        "total_cost": float(total_cost),
        "calculated_at": datetime.utcnow().isoformat(),
    }


@router.post("/sync-locale")
async def sync_locale(locale: str, session: Session = Depends(get_session)):
    """Synchronize locale across all agents"""
    result = await localization_service.sync_all(locale)
    return result
