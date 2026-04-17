from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.models import WebhookConfig, WebhookExecution
from app.core.database import get_async_session
from app.services.webhook_service import webhook_service

router = APIRouter()


@router.get("", response_model=List[WebhookConfig])
async def list_webhooks(session: AsyncSession = Depends(get_async_session)):
    """List all webhook configurations"""
    result = await session.execute(select(WebhookConfig))
    return result.scalars().all()


@router.post("", response_model=WebhookConfig)
async def create_webhook(
    webhook: WebhookConfig, session: AsyncSession = Depends(get_async_session)
):
    """Create a new webhook configuration"""
    session.add(webhook)
    await session.commit()
    await session.refresh(webhook)
    return webhook


@router.put("/{webhook_id}", response_model=WebhookConfig)
async def update_webhook(
    webhook_id: str, webhook_update: dict, session: AsyncSession = Depends(get_async_session)
):
    """Update an existing webhook configuration"""
    webhook = await session.get(WebhookConfig, webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    for key, value in webhook_update.items():
        setattr(webhook, key, value)

    session.add(webhook)
    await session.commit()
    await session.refresh(webhook)
    return webhook


@router.delete("/{webhook_id}")
async def delete_webhook(webhook_id: str, session: AsyncSession = Depends(get_async_session)):
    """Delete a webhook configuration"""
    webhook = await session.get(WebhookConfig, webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    await session.delete(webhook)
    await session.commit()
    return {"message": "Webhook deleted successfully"}


@router.get("/{webhook_id}/executions", response_model=List[WebhookExecution])
async def get_webhook_executions(
    webhook_id: str, session: AsyncSession = Depends(get_async_session)
):
    """Get execution history for a webhook"""
    result = await session.execute(
        select(WebhookExecution).where(WebhookExecution.webhook_id == webhook_id)
    )
    return result.scalars().all()


@router.post("/{webhook_id}/test")
async def test_webhook(webhook_id: str, session: AsyncSession = Depends(get_async_session)):
    """Test a webhook configuration by sending a test payload"""
    webhook = await session.get(WebhookConfig, webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    result = await webhook_service.test_webhook_async(session, webhook)
    return result
