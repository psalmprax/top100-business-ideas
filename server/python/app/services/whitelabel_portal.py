"""
White-label Portal Service for Alpha Products
Multi-tenant partner/reseller portal with custom branding.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import uuid
import logging

logger = logging.getLogger(__name__)


class PortalTier(str, Enum):
    STARTER = "starter"
    GROWTH = "growth"
    ENTERPRISE = "enterprise"


class PortalStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"


class Tenant:
    """Represents a white-label tenant (partner/reseller)."""
    
    def __init__(
        self,
        tenant_id: str,
        name: str,
        tier: PortalTier,
        branding: Dict[str, Any],
    ):
        self.tenant_id = tenant_id
        self.name = name
        self.tier = tier
        self.branding = branding
        self.status = PortalStatus.PENDING
        self.created_at = datetime.utcnow()
        self.subtenants: List[str] = []
        self.api_usage = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tenant_id": self.tenant_id,
            "name": self.name,
            "tier": self.tier.value,
            "status": self.status.value,
            "branding": self.branding,
            "created_at": self.created_at.isoformat(),
            "subtenant_count": len(self.subtenants),
            "api_usage": self.api_usage,
        }


class WhiteLabelPortal:
    """
    White-label portal service for partners and resellers.
    Supports custom branding, multi-tenant management, and aggregated analytics.
    """
    
    def __init__(self):
        self.tenants: Dict[str, Tenant] = {}
        self.brand_templates = self._init_brand_templates()
        
        # Initialize demo tenant
        self._init_demo_tenant()
    
    def _init_brand_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize brand customization templates."""
        
        return {
            "default": {
                "primary_color": "#0066FF",
                "secondary_color": "#1A1A2E",
                "accent_color": "#00D4FF",
                "logo_url": None,
                "favicon_url": None,
                "company_name": "My Company",
                "support_email": "support@example.com",
                "custom_css": None,
            },
            "dark": {
                "primary_color": "#6366F1",
                "secondary_color": "#0F172A",
                "accent_color": "#22D3EE",
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
    
    def _init_demo_tenant(self):
        """Initialize a demo tenant."""
        
        demo_tenant = Tenant(
            tenant_id="tenant-demo",
            name="CyberShield Partners",
            tier=PortalTier.ENTERPRISE,
            branding=self.brand_templates["default"],
        )
        demo_tenant.status = PortalStatus.ACTIVE
        
        self.tenants[demo_tenant.tenant_id] = demo_tenant
    
    def create_tenant(
        self,
        name: str,
        tier: PortalTier,
        branding: Optional[Dict[str, Any]] = None,
    ) -> Tenant:
        """Create a new white-label tenant."""
        
        tenant_id = str(uuid.uuid4())[:8]
        
        # Use default branding if not provided
        if branding is None:
            branding = self.brand_templates["default"].copy()
        
        tenant = Tenant(tenant_id, name, tier, branding)
        
        self.tenants[tenant_id] = tenant
        
        logger.info(f"Created white-label tenant: {tenant_id}")
        
        return tenant
    
    def update_tenant_branding(
        self,
        tenant_id: str,
        branding: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Update tenant branding settings."""
        
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return {"error": "Tenant not found"}
        
        tenant.branding.update(branding)
        
        return tenant.to_dict()
    
    def add_subtenant(
        self,
        tenant_id: str,
        subtenant_name: str,
    ) -> Optional[Dict[str, Any]]:
        """Add a subtenant (client) under a partner."""
        
        parent = self.tenants.get(tenant_id)
        if not parent:
            return {"error": "Tenant not found"}
        
        # Check tier limits
        subtenant_limits = {
            PortalTier.STARTER: 5,
            PortalTier.GROWTH: 25,
            PortalTier.ENTERPRISE: -1,  # Unlimited
        }
        
        limit = subtenant_limits.get(parent.tier, 5)
        
        if limit > 0 and len(parent.subtenants) >= limit:
            return {"error": f"Subtenant limit ({limit}) reached for {parent.tier.value} tier"}
        
        subtenant_id = str(uuid.uuid4())[:8]
        parent.subtenants.append(subtenant_id)
        
        # Create subtenant
        subtenant = Tenant(
            tenant_id=subtenant_id,
            name=subtenant_name,
            tier=PortalTier.STARTER,
            branding=parent.branding.copy(),
        )
        subtenant.status = PortalStatus.ACTIVE
        
        self.tenants[subtenant_id] = subtenant
        
        return {
            "subtenant_id": subtenant_id,
            "parent_tenant": tenant_id,
            "name": subtenant_name,
            "created": True,
        }
    
    def get_tenant_dashboard(
        self,
        tenant_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Get aggregated dashboard data for a tenant."""
        
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return None
        
        # Calculate aggregated stats
        all_tenants = [tenant] + [
            self.tenants.get(st, Tenant("x", "x", PortalTier.STARTER, {}))
            for st in tenant.subtenants
        ]
        
        total_usage = sum(t.api_usage for t in all_tenants)
        active_subtenants = sum(1 for t in all_tenants if t.status == PortalStatus.ACTIVE)
        
        return {
            "tenant_id": tenant_id,
            "name": tenant.name,
            "tier": tenant.tier.value,
            "branding": tenant.branding,
            "stats": {
                "total_api_calls": total_usage,
                "active_subtenants": active_subtenants,
                "total_subtenants": len(tenant.subtenants),
            },
            "subscription": {
                "status": "active",
                "renewal_date": "2026-04-01",
            },
        }
    
    def get_tenant_portal_url(self, tenant_id: str) -> Optional[str]:
        """Get the white-label portal URL for a tenant."""
        
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return None
        
        # Generate white-label URL
        # In production, would map to custom domain
        return f"https://{tenant.name.lower().replace(' ', '-')}.alphaai.example.com"
    
    def record_api_usage(self, tenant_id: str, calls: int = 1):
        """Record API usage for a tenant."""
        
        tenant = self.tenants.get(tenant_id)
        if tenant:
            tenant.api_usage += calls
    
    def list_tenants(self, tier: Optional[PortalTier] = None) -> List[Dict[str, Any]]:
        """List all tenants, optionally filtered by tier."""
        
        tenants = list(self.tenants.values())
        
        if tier:
            tenants = [t for t in tenants if t.tier == tier]
        
        return [t.to_dict() for t in tenants]
    
    def get_portal_tiers(self) -> List[Dict[str, Any]]:
        """Get available portal tiers and their features."""
        
        return [
            {
                "tier": PortalTier.STARTER.value,
                "name": "Starter",
                "price": 99,
                "features": [
                    "Up to 5 subtenants",
                    "Basic branding",
                    "Email support",
                    "1,000 API calls/month",
                ],
                "limits": {
                    "subtenants": 5,
                    "api_calls": 1000,
                },
            },
            {
                "tier": PortalTier.GROWTH.value,
                "name": "Growth",
                "price": 299,
                "features": [
                    "Up to 25 subtenants",
                    "Full branding customization",
                    "Priority support",
                    "10,000 API calls/month",
                    "Custom domain",
                ],
                "limits": {
                    "subtenants": 25,
                    "api_calls": 10000,
                },
            },
            {
                "tier": PortalTier.ENTERPRISE.value,
                "name": "Enterprise",
                "price": 999,
                "features": [
                    "Unlimited subtenants",
                    "Full white-label",
                    "Dedicated support",
                    "Unlimited API calls",
                    "Custom domain + SSL",
                    "SLA guarantee",
                ],
                "limits": {
                    "subtenants": -1,
                    "api_calls": -1,
                },
            },
        ]


# Singleton instance
whitelabel_portal = WhiteLabelPortal()
