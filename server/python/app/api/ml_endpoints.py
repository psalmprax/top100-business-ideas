"""
ML Inference API Endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging

from app.services.ml_inference import inference_service, get_inference_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ml", tags=["ml"])


class InferenceRequest(BaseModel):
    """Request model for inference"""

    model_name: str = Field(..., description="Name of the model to use")
    input_data: Dict[str, Any] = Field(..., description="Input data for inference")
    use_cache: bool = Field(default=True, description="Whether to use caching")


class BatchInferenceRequest(BaseModel):
    """Request model for batch inference"""

    model_name: str
    inputs: List[Dict[str, Any]]


class InferenceResponse(BaseModel):
    """Response model for inference"""

    result: Dict[str, Any]
    model: str
    timestamp: str
    inference_time_ms: int
    cached: bool = False


@router.post("/infer", response_model=InferenceResponse)
async def run_inference(request: InferenceRequest):
    """
    Run inference on a single input
    """
    try:
        service = await get_inference_service()

        # Validate model exists
        model_info = service.get_model_info(request.model_name)
        if not model_info:
            raise HTTPException(
                status_code=404, detail=f"Model '{request.model_name}' not found"
            )

        # Run inference
        result = await service.infer(
            model_name=request.model_name,
            input_data=request.input_data,
            use_cache=request.use_cache,
        )

        return InferenceResponse(
            result=result,
            model=result["model"],
            timestamp=result["timestamp"],
            inference_time_ms=result.get("inference_time_ms", 0),
            cached=False,  # Could check cache status
        )

    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch")
async def run_batch_inference(request: BatchInferenceRequest):
    """
    Run inference on multiple inputs
    """
    try:
        service = await get_inference_service()

        # Validate model
        model_info = service.get_model_info(request.model_name)
        if not model_info:
            raise HTTPException(
                status_code=404, detail=f"Model '{request.model_name}' not found"
            )

        # Run batch inference
        results = await service.batch_infer(
            model_name=request.model_name, inputs=request.inputs
        )

        return {"model": request.model_name, "count": len(results), "results": results}

    except Exception as e:
        logger.error(f"Batch inference error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def list_models():
    """
    List all available models
    """
    service = await get_inference_service()
    return service.list_models()


@router.get("/models/{model_name}")
async def get_model_info(model_name: str):
    """
    Get information about a specific model
    """
    service = await get_inference_service()
    model_info = service.get_model_info(model_name)

    if not model_info:
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")

    return model_info


@router.get("/cache/stats")
async def get_cache_stats():
    """
    Get cache statistics
    """
    service = await get_inference_service()
    return service.get_cache_stats()


@router.delete("/cache")
async def clear_cache():
    """
    Clear the inference cache
    """
    service = await get_inference_service()
    service.clear_cache()
    return {"status": "cache_cleared"}


# Product-specific endpoints


@router.post("/agent-ops/classify")
async def classify_agent_operation(task_description: str, context: Optional[str] = ""):
    """
    Classify an agent operation and get optimization suggestions
    """
    service = await get_inference_service()

    result = await service.infer(
        model_name="agent-ops",
        input_data={"task_description": task_description, "context": context},
    )

    return result


@router.post("/ai-compliance/check")
async def check_compliance(document: str, regulations: List[str] = ["GDPR", "AI_ACT"]):
    """
    Check a document for AI compliance
    """
    service = await get_inference_service()

    result = await service.infer(
        model_name="ai-compliance",
        input_data={"document": document, "regulations": regulations},
    )

    return result


@router.post("/deepfake/detect")
async def detect_deepfake(media_url: str, media_type: str = "video"):
    """
    Detect if media is a deepfake
    """
    service = await get_inference_service()

    result = await service.infer(
        model_name="deepfake-defense",
        input_data={"media_url": media_url, "media_type": media_type},
    )

    return result


@router.get("/health")
async def get_ml_health():
    """
    Get ML service health status including model availability and device info
    """
    service = await get_inference_service()
    health = service.get_health_status()

    models = service.list_models()

    return {
        "status": "healthy" if health["torch_available"] else "degraded",
        "ml_backend": health,
        "models": models,
    }
