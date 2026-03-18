"""Compliance analysis endpoints"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from datetime import datetime

from app.core.models import (
    ComplianceCheck, ComplianceCategory, RunComplianceCheckRequest,
    ComplianceCheckType
)
import logging
from app.ml.compliance_analyzer import compliance_analyzer
from app.connectors.github_connector import github_connector
from app.services.reporting import reporting_service
from app.core.database import get_session

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=List[ComplianceCheck])
async def list_checks(session: Session = Depends(get_session)):
    """List all compliance checks"""
    checks = session.exec(select(ComplianceCheck)).all()
    return checks


@router.get("/{check_id}", response_model=ComplianceCheck)
async def get_check(check_id: str, session: Session = Depends(get_session)):
    """Get compliance check by ID"""
    check = session.get(ComplianceCheck, check_id)
    if not check:
        raise HTTPException(status_code=404, detail="Compliance check not found")
    return check


@router.get("/{check_id}/report")
async def get_report(check_id: str, format: str = "json", session: Session = Depends(get_session)):
    """Export compliance check as Annex IV Technical Folder"""
    try:
        check = session.get(ComplianceCheck, check_id)
        if not check:
            raise HTTPException(status_code=404, detail="Compliance check not found")
        
        report_data = reporting_service.generate_annex_iv_report(check)
        
        if format == "markdown":
            return {"markdown": reporting_service.format_as_markdown(report_data)}
        
        return report_data
    except Exception as e:
        logger.error(f"Error generating report for {check_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check", response_model=ComplianceCheck)
async def run_check(request: RunComplianceCheckRequest, session: Session = Depends(get_session)):
    """Run a compliance check and save to DB"""
    # NEW: Evidence Mapping - If GitHub URL is provided, scan for evidence
    evidence = []
    if request.url and "github.com" in request.url:
        evidence_scan = await github_connector.scan_repository(request.url)
        evidence = evidence_scan.get("findings", [])

    # Run the appropriate analysis based on check type, passing found evidence
    if request.type == ComplianceCheckType.AI_ACT:
        result = compliance_analyzer.analyze_ai_act_compliance({"url": request.url}, evidence=evidence)
    elif request.type == ComplianceCheckType.PRIVACY:
        result = compliance_analyzer.analyze_privacy_compliance({"url": request.url}, evidence=evidence)
    elif request.type == ComplianceCheckType.SECURITY:
        result = compliance_analyzer.analyze_security({"url": request.url}, evidence=evidence)
    else:
        raise HTTPException(status_code=400, detail="Invalid check type")
    
    # Append discovered evidence files to findings in the result
    for item in evidence:
        result["findings"].append({
            "rule": f"Documentation Proof: {item['file']}",
            "severity": "low",
            "description": "Evidence of compliance verified via GitHub scan.",
            "recommendation": "Maintain version control for all compliance docs."
        })
    
    check = ComplianceCheck(
        id=result["id"],
        type=request.type,
        status=result["status"],
        score=result["score"],
        findings=result["findings"],
        checked_at=datetime.fromisoformat(result["checked_at"]),
        created_at=datetime.utcnow()
    )
    
    session.add(check)
    session.commit()
    session.refresh(check)
    return check


@router.get("/categories")
async def get_categories():
    """Get AI Act compliance categories"""
    categories = [
        ComplianceCategory(
            id="unacceptable",
            name="Unacceptable Risk",
            color="red",
            description="Banned AI systems that pose unacceptable risk to people"
        ),
        ComplianceCategory(
            id="high",
            name="High Risk",
            color="orange",
            description="AI systems that pose high risk to fundamental rights"
        ),
        ComplianceCategory(
            id="limited",
            name="Limited Risk",
            color="yellow",
            description="AI systems with limited transparency obligations"
        ),
        ComplianceCategory(
            id="minimal",
            name="Minimal Risk",
            color="green",
            description="Low-risk AI systems with minimal requirements"
        ),
    ]
    return categories
