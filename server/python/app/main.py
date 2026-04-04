"""
Top100 Business Ideas - Python AI/ML Backend
FastAPI application for AI/ML processing
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import asyncio
from unittest.mock import MagicMock

# Configure logging early
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Real-First Hardening: Dependency Inventory
# Instead of masking missing libraries with MagicMock, we inventory them for the Vigilance dashboard.
DEPENDENCY_STATUS = {}
for mod in ["numpy", "torch", "transformers", "cv2", "PIL"]:
    try:
        __import__(mod)
        DEPENDENCY_STATUS[mod] = "INSTALLED"
    except ImportError:
        DEPENDENCY_STATUS[mod] = "MISSING"
        # We only mock if strictly necessary for the server to BOOT, 
        # but we log the technical debt.
        logger.warning(f"Technical Debt Detected: AI/ML library '{mod}' is MISSION CRITICAL but MISSING.")

from app.api import agents, compliance, deepfake, health, auth_verify, extended, enterprise, governance, venture, security, alerts, intelligence
from app.core.config import settings
from app.services.billing_service import billing_service 


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    logger.info("Starting Python AI/ML Backend...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Initialize database
    try:
        from app.core.database import init_db
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # In development, we might want to continue, but in production this is fatal
    
    # Start background services
    try:
        billing_service.start_budget_enforcement_loop()
        logger.info("Background monitor services started")
    except Exception as e:
        logger.error(f"Failed to start background services: {e}")

    yield
    
    logger.info("Shutting down Python AI/ML Backend...")


# Create FastAPI application
app = FastAPI(
    title="Top100 Business Ideas - AI/ML Backend",
    description="Python backend for AI/ML processing including deepfake detection and compliance analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(agents.router, prefix="/agents", tags=["Agents"])
app.include_router(compliance.router, prefix="/compliance", tags=["Compliance"])
app.include_router(deepfake.router, prefix="/deepfake", tags=["Deepfake"])
app.include_router(enterprise.router, tags=["Enterprise"])
app.include_router(auth_verify.router, prefix="/auth/verify", tags=["Liveness Authentication"])
app.include_router(extended.router, tags=["Extended API - Full Sync"])
app.include_router(governance.router, prefix="/governance", tags=["Governance & Advanced Features"])
app.include_router(venture.router, prefix="/venture", tags=["Venture"])
app.include_router(security.router, prefix="/security", tags=["Security"])
app.include_router(alerts.router, prefix="/agents", tags=["Alerts & Rules"])
app.include_router(intelligence.router, prefix="/intelligence", tags=["Intelligence"])


from app.core.database import init_db


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "ai-ml-backend",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
    )
