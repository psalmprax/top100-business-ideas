"""Health check endpoints"""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-ml-backend",
        "version": "1.0.0"
    }
