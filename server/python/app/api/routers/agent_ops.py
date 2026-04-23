"""Agent operations endpoints"""

from typing import List, Dict
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select, func
from datetime import datetime

from app.core.models import Agent, AgentStatus, LLMUsageLog
from app.core.database import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.localization import localization_service

router = APIRouter()


@router.post("/{agent_id}/stop")
async def stop_agent(agent_id: str, session: AsyncSession = Depends(get_async_session)):
    """Stop a running agent"""
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent.status = AgentStatus.STOPPED
    agent.updated_at = datetime.utcnow()
    session.add(agent)
    await session.commit()

    return {"status": "success", "message": f"Agent {agent_id} stopped"}


@router.post("/{agent_id}/restart")
async def restart_agent(agent_id: str, session: AsyncSession = Depends(get_async_session)):
    """Restart an agent"""
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent.status = AgentStatus.RUNNING
    agent.updated_at = datetime.utcnow()
    session.add(agent)
    await session.commit()

    return {"status": "success", "message": f"Agent {agent_id} restarted"}


@router.get("/{agent_id}/logs")
async def get_agent_logs(
    agent_id: str, limit: int = 50, session: AsyncSession = Depends(get_async_session)
):
    """Get agent execution logs"""
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    result = await session.execute(
        select(LLMUsageLog)
        .where(LLMUsageLog.agent_id == agent_id)
        .order_by(LLMUsageLog.timestamp.desc())
        .limit(limit)
    )
    logs = result.scalars().all()

    return logs


@router.get("/metrics")
async def get_agent_ops_metrics(session: AsyncSession = Depends(get_async_session)):
    """Get aggregated agent operations metrics"""
    result = await session.execute(select(Agent))
    agents = result.scalars().all()

    total = len(agents)
    running = sum(1 for a in agents if a.status == AgentStatus.RUNNING)
    stopped = sum(1 for a in agents if a.status == AgentStatus.STOPPED)
    error = sum(1 for a in agents if a.status == AgentStatus.ERROR)

    requests_result = await session.execute(select(func.count(LLMUsageLog.id)))
    total_requests = requests_result.scalar() or 0
    
    cost_result = await session.execute(select(func.sum(LLMUsageLog.cost)))
    total_cost = cost_result.scalar() or 0.0

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
async def sync_locale(locale: str, session: AsyncSession = Depends(get_async_session)):
    """Synchronize locale across all agents"""
    result = await localization_service.sync_all(locale)
    return result


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str, session: AsyncSession = Depends(get_async_session)):
    """Permanently delete an agent"""
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    await session.delete(agent)
    await session.commit()
    return {"status": "success", "message": f"Agent {agent_id} permanently deleted"}


@router.post("/{agent_id}/export")
async def export_agent_config(agent_id: str, session: AsyncSession = Depends(get_async_session)):
    """Export agent configuration as JSON package"""
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Construct export package
    package = {
        "metadata": {
            "version": "1.0",
            "exported_at": datetime.utcnow().isoformat(),
            "origin": "AlphaHecta"
        },
        "agent": agent.dict()
    }

    return {"status": "success", "package": package}
