"""Webhook management endpoints"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select

from app.core.models import WebhookConfig, WebhookExecution
from app.core.database import get_session
from app.services.webhook_service import webhook_service

router = APIRouter()


@router.get("", response_model=List[WebhookConfig])
async def list_webhooks(session: Session = Depends(get_session)):
    """List all webhook configurations"""
    return session.exec(select(WebhookConfig)).all()


@router.post("", response_model=WebhookConfig)
async def create_webhook(
    webhook: WebhookConfig, session: Session = Depends(get_session)
):
    """Create a new webhook configuration"""
    session.add(webhook)
    session.commit()
    session.refresh(webhook)
    return webhook


@router.put("/{webhook_id}", response_model=WebhookConfig)
async def update_webhook(
    webhook_id: str, webhook_update: dict, session: Session = Depends(get_session)
):
    """Update an existing webhook configuration"""
    webhook = session.get(WebhookConfig, webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    for key, value in webhook_update.items():
        setattr(webhook, key, value)

    session.add(webhook)
    session.commit()
    session.refresh(webhook)
    return webhook


@router.delete("/{webhook_id}")
async def delete_webhook(webhook_id: str, session: Session = Depends(get_session)):
    """Delete a webhook configuration"""
    webhook = session.get(WebhookConfig, webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    session.delete(webhook)
    session.commit()
    return {"message": "Webhook deleted successfully"}


@router.get("/{webhook_id}/executions", response_model=List[WebhookExecution])
async def get_webhook_executions(
    webhook_id: str, session: Session = Depends(get_session)
):
    """Get execution history for a webhook"""
    return session.exec(
        select(WebhookExecution).where(WebhookExecution.webhook_id == webhook_id)
    ).all()


@router.post("/{webhook_id}/test")
async def test_webhook(webhook_id: str, session: Session = Depends(get_session)):
    """Test a webhook configuration by sending a test payload"""
    webhook = session.get(WebhookConfig, webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    result = await webhook_service.test_webhook(webhook)
    return result
