"""
White Label Portal Service
Manages multi-tenant white-label configurations with database persistence.
"""

from typing import Dict, Any, List, Optional
import uuid
import logging
from datetime import datetime
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models.service_models import (
    WhiteLabelTenant,
    WhiteLabelTier,
    WhiteLabelStatus,
)

logger = logging.getLogger(__name__)

DEFAULT_BRANDING = {
    "default": {
        "primary_color": "#3B82F6",
        "secondary_color": "#FFFFFF",
        "accent_color": "#0EA5E9",
        "logo_url": None,
        "company_name": "My Company",
        "theme": "light",
    },
    "dark": {
        "primary_color": "#3B82F6",
        "secondary_color": "#1E293B",
        "accent_color": "#0EA5E9",
        "logo_url": None,
        "company_name": "My Company",
        "theme": "dark",
    },
    "light": {
        "primary_color": "#3B82F6",
        "secondary_color": "#FFFFFF",
        "accent_color": "#0EA5E9",
        "logo_url": None,
        "company_name": "My Company",
        "theme": "light",
    },
}


class WhiteLabelPortalService:
    """Manages white-label tenant configurations with database persistence."""

    def __init__(self):
        self.brand_templates = DEFAULT_BRANDING

    def list_tenants(self) -> List[Dict[str, Any]]:
        """List all tenants from database."""
        with Session(engine) as session:
            tenants = session.exec(select(WhiteLabelTenant)).all()
            return [self._tenant_to_dict(t) for t in tenants]

    def get_tenant(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Get a tenant by ID."""
        with Session(engine) as session:
            tenant = session.exec(
                select(WhiteLabelTenant).where(WhiteLabelTenant.tenant_id == tenant_id)
            ).first()

            if tenant:
                return self._tenant_to_dict(tenant)
            return None

    def create_tenant(
        self,
        name: str,
        tier: str = "starter",
        branding: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Create a new white-label tenant."""
        tenant_id = str(uuid.uuid4())[:8]

        if branding is None:
            branding = self.brand_templates["default"].copy()

        with Session(engine) as session:
            tenant = WhiteLabelTenant(
                tenant_id=tenant_id,
                name=name,
                tier=tier,
                status=WhiteLabelStatus.PENDING,
                primary_color=branding.get("primary_color", "#3B82F6"),
                secondary_color=branding.get("secondary_color", "#FFFFFF"),
                accent_color=branding.get("accent_color", "#0EA5E9"),
                logo_url=branding.get("logo_url"),
                company_name=branding.get("company_name", name),
            )
            session.add(tenant)
            session.commit()
            session.refresh(tenant)

            logger.info(f"Created white-label tenant: {tenant_id}")
            return self._tenant_to_dict(tenant)

    def update_tenant(
        self,
        tenant_id: str,
        updates: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Update tenant settings."""
        with Session(engine) as session:
            tenant = session.exec(
                select(WhiteLabelTenant).where(WhiteLabelTenant.tenant_id == tenant_id)
            ).first()

            if not tenant:
                return {"error": "Tenant not found"}

            # Update allowed fields
            if "name" in updates:
                tenant.name = updates["name"]
            if "tier" in updates:
                tenant.tier = updates["tier"]
            if "status" in updates:
                tenant.status = updates["status"]
            if "primary_color" in updates:
                tenant.primary_color = updates["primary_color"]
            if "secondary_color" in updates:
                tenant.secondary_color = updates["secondary_color"]
            if "accent_color" in updates:
                tenant.accent_color = updates["accent_color"]
            if "logo_url" in updates:
                tenant.logo_url = updates["logo_url"]
            if "company_name" in updates:
                tenant.company_name = updates["company_name"]

            tenant.updated_at = datetime.utcnow()
            session.commit()
            session.refresh(tenant)

            return self._tenant_to_dict(tenant)

    def update_tenant_branding(
        self,
        tenant_id: str,
        branding: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Update tenant branding settings."""
        return self.update_tenant(tenant_id, branding)

    def delete_tenant(self, tenant_id: str) -> bool:
        """Delete a tenant."""
        with Session(engine) as session:
            tenant = session.exec(
                select(WhiteLabelTenant).where(WhiteLabelTenant.tenant_id == tenant_id)
            ).first()

            if tenant:
                session.delete(tenant)
                session.commit()
                return True

            return False

    def activate_tenant(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Activate a tenant."""
        return self.update_tenant(tenant_id, {"status": WhiteLabelStatus.ACTIVE})

    def suspend_tenant(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Suspend a tenant."""
        return self.update_tenant(tenant_id, {"status": WhiteLabelStatus.SUSPENDED})

    def _tenant_to_dict(self, tenant: WhiteLabelTenant) -> Dict[str, Any]:
        return {
            "tenant_id": tenant.tenant_id,
            "name": tenant.name,
            "tier": tenant.tier,
            "status": tenant.status,
            "branding": {
                "primary_color": tenant.primary_color,
                "secondary_color": tenant.secondary_color,
                "accent_color": tenant.accent_color,
                "logo_url": tenant.logo_url,
                "company_name": tenant.company_name,
            },
            "created_at": tenant.created_at.isoformat() if tenant.created_at else None,
            "updated_at": tenant.updated_at.isoformat() if tenant.updated_at else None,
        }


# Singleton instance
white_label_service = WhiteLabelPortalService()
