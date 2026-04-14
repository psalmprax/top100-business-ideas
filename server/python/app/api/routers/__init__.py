"""Router modules for domain-specific endpoints"""

from app.api.routers.webhooks import router as webhooks_router
from app.api.routers.multi_cloud import router as multi_cloud_router
from app.api.routers.self_healing import router as self_healing_router
from app.api.routers.agent_ops import router as agent_ops_router
from app.api.routers.budget import router as budget_router
from app.api.routers.workforce import router as workforce_router

__all__ = [
    "webhooks_router",
    "multi_cloud_router",
    "self_healing_router",
    "agent_ops_router",
    "budget_router",
    "workforce_router",
]
