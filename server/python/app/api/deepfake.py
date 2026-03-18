"""Deepfake detection endpoints"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from datetime import datetime
import uuid

from app.core.models import (
    DeepfakeAnalysis, AnalyzeDeepfakeRequest, MediaType, AnalysisResult,
    HardwareChallenge, BiometricSignature
)
from app.ml.deepfake_detector import deepfake_detector
from app.services.authlink_service import authlink_service
from app.core.database import get_session
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/challenge", response_model=HardwareChallenge)
async def create_auth_challenge(user_id: str, session: Session = Depends(get_session)):
    """Initialize a hardware-backed biometric challenge (FIDO2)"""
    try:
        challenge = authlink_service.create_challenge(user_id, session)
        return challenge
    except Exception as e:
        logger.error(f"Error creating challenge: {e}")
        raise HTTPException(status_code=500, detail="Failed to create challenge")


@router.post("/verify", response_model=BiometricSignature)
async def verify_auth_signature(
    challenge_id: str, 
    signature: str, 
    hardware_id: str, 
    session: Session = Depends(get_session)
):
    """Verify a hardware-signed biometric signature (Proof of Life)"""
    try:
        sig = authlink_service.verify_signature(challenge_id, signature, hardware_id, session)
        return sig
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error verifying signature: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during verification")


@router.post("/analyze", response_model=DeepfakeAnalysis)
async def analyze(request: AnalyzeDeepfakeRequest, session: Session = Depends(get_session)):
    """Analyze media for deepfake detection and save to DB"""
    # Run the appropriate analysis based on media type
    if request.media_type == MediaType.IMAGE:
        result = deepfake_detector.analyze_image(request.media_url)
    elif request.media_type == MediaType.VIDEO:
        result = deepfake_detector.analyze_video(request.media_url)
    elif request.media_type == MediaType.AUDIO:
        result = deepfake_detector.analyze_audio(request.media_url)
    else:
        raise HTTPException(status_code=400, detail="Invalid media type")
    
    analysis = DeepfakeAnalysis(
        id=str(uuid.uuid4()),
        media_url=request.media_url,
        media_type=request.media_type,
        result=result["result"],
        confidence=result["confidence"],
        details=result["details"],
        analysis_at=datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    
    session.add(analysis)
    session.commit()
    session.refresh(analysis)
    return analysis


@router.get("/analyses", response_model=List[DeepfakeAnalysis])
async def list_analyses(session: Session = Depends(get_session)):
    """List all analyses"""
    analyses = session.exec(select(DeepfakeAnalysis)).all()
    return analyses


@router.get("/analyses/{analysis_id}", response_model=DeepfakeAnalysis)
async def get_analysis(analysis_id: str, session: Session = Depends(get_session)):
    """Get analysis by ID"""
    analysis = session.get(DeepfakeAnalysis, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.get("/stats")
async def get_stats(session: Session = Depends(get_session)):
    """Get aggregated statistics from DB"""
    analyses = session.exec(select(DeepfakeAnalysis)).all()
    
    total = len(analyses)
    real = sum(1 for a in analyses if a.result == AnalysisResult.REAL)
    fake = sum(1 for a in analyses if a.result == AnalysisResult.FAKE)
    uncertain = sum(1 for a in analyses if a.result == AnalysisResult.UNCERTAIN)
    
    images = sum(1 for a in analyses if a.media_type == MediaType.IMAGE)
    videos = sum(1 for a in analyses if a.media_type == MediaType.VIDEO)
    audio = sum(1 for a in analyses if a.media_type == MediaType.AUDIO)
    
    avg_confidence = sum(a.confidence for a in analyses) / total if total > 0 else 0
    
    return {
        "total": total,
        "real": real,
        "fake": fake,
        "uncertain": uncertain,
        "by_type": {
            "image": images,
            "video": videos,
            "audio": audio
        },
        "avg_confidence": round(avg_confidence, 2),
        "accuracy": 94.5  # Mock accuracy
    }
