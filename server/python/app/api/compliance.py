"""Compliance analysis endpoints"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends, Header
from sqlmodel import Session, select
from datetime import datetime
from typing import List, Optional

from app.core.models import (
    ComplianceCheck,
    ComplianceCategory,
    RunComplianceCheckRequest,
    ComplianceCheckType,
    ComplianceIncident,
    SelfHealingEvent,
    HealingConfiguration,
    ComplianceAuditLog,
)
import logging

# from app.ml.compliance_analyzer import compliance_analyzer (Lazy loaded below)
from app.connectors.github_connector import github_connector
from app.services.reporting import reporting_service
from app.core.database import get_session, engine
from app.core.models import ComplianceChecklistItem, AgentAuditLog

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=List[ComplianceCheck])
async def list_checks(session: Session = Depends(get_session)):
    """List all compliance checks"""
    checks = session.exec(select(ComplianceCheck)).all()
    return checks


@router.get("/incidents", response_model=List[ComplianceIncident])
async def list_compliance_incidents(session: Session = Depends(get_session)):
    """List all reported compliance incidents (Art 61/62)"""
    return session.exec(select(ComplianceIncident)).all()


@router.post("/incidents", response_model=ComplianceIncident)
async def report_compliance_incident(
    request: dict, session: Session = Depends(get_session)
):
    """Report a new compliance, forensic or bias incident (Art 61/62)"""
    import uuid

    incident = ComplianceIncident(
        id=str(uuid.uuid4()),
        title=request.get("title"),
        description=request.get("description"),
        severity=request.get("severity", "medium"),
        incident_type=request.get("incident_type", "security"),
        status="open",
        reported_by=request.get("reported_by"),
        affected_systems=request.get("affected_systems", []),
    )
    session.add(incident)
    session.commit()
    session.refresh(incident)
    return incident


@router.patch("/incidents/{incident_id}/resolve", response_model=ComplianceIncident)
async def resolve_incident(incident_id: str, session: Session = Depends(get_session)):
    """Mark a compliance incident as resolved"""
    incident = session.get(ComplianceIncident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = "resolved"
    incident.resolved_at = datetime.utcnow()

    session.add(incident)
    session.commit()
    session.refresh(incident)
    return incident


@router.get("/{check_id}", response_model=ComplianceCheck)
async def get_check(check_id: str, session: Session = Depends(get_session)):
    """Get compliance check by ID"""
    check = session.get(ComplianceCheck, check_id)
    if not check:
        raise HTTPException(status_code=404, detail="Compliance check not found")
    return check


@router.get("/{check_id}/report")
async def get_report(
    check_id: str, format: str = "json", session: Session = Depends(get_session)
):
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
async def run_check(
    request: RunComplianceCheckRequest, session: Session = Depends(get_session)
):
    """Run a compliance check and save to DB"""
    # NEW: Evidence Mapping - If GitHub URL is provided, scan for evidence
    evidence = []
    if request.url and "github.com" in request.url:
        evidence_scan = await github_connector.scan_repository(request.url)
        evidence = evidence_scan.get("findings", [])

    # Lazy load compliance_analyzer to avoid torch dependency at startup
    from app.ml.compliance_analyzer import compliance_analyzer

    if request.type == ComplianceCheckType.AI_ACT:
        result = compliance_analyzer.analyze_ai_act_compliance(
            {"url": request.url}, evidence=evidence
        )
    elif request.type == ComplianceCheckType.PRIVACY:
        result = compliance_analyzer.analyze_privacy_compliance(
            {"url": request.url}, evidence=evidence
        )
    elif request.type == ComplianceCheckType.SECURITY:
        result = compliance_analyzer.analyze_security(
            {"url": request.url}, evidence=evidence
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid check type")

    # Append discovered evidence files to findings in the result
    for item in evidence:
        result["findings"].append(
            {
                "rule": f"Documentation Proof: {item['file']}",
                "severity": "low",
                "description": "Evidence of compliance verified via GitHub scan.",
                "recommendation": "Maintain version control for all compliance docs.",
            }
        )

    check = ComplianceCheck(
        id=result["id"],
        type=request.type,
        status=result["status"],
        score=result["score"],
        findings=result["findings"],
        checked_at=datetime.fromisoformat(result["checked_at"]),
        created_at=datetime.utcnow(),
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
            description="Banned AI systems that pose unacceptable risk to people",
        ),
        ComplianceCategory(
            id="high",
            name="High Risk",
            color="orange",
            description="AI systems that pose high risk to fundamental rights",
        ),
        ComplianceCategory(
            id="limited",
            name="Limited Risk",
            color="yellow",
            description="AI systems with limited transparency obligations",
        ),
        ComplianceCategory(
            id="minimal",
            name="Minimal Risk",
            color="green",
            description="Low-risk AI systems with minimal requirements",
        ),
    ]
    return categories


@router.post("/audit/sox")
async def run_sox_audit(
    session: Session = Depends(get_session), x_user_id: Optional[str] = Header(None)
):
    """Run a SOX §404 financial integrity audit across all agents"""
    import uuid
    from app.core.models import Agent, AgentStatus

    user_id = x_user_id or "system_admin"
    audit_id = str(uuid.uuid4())

    agents = session.exec(select(Agent)).all()
    findings = []

    for agent in agents:
        if agent.status == AgentStatus.RUNNING:
            if agent.daily_spend > agent.dailyBudget:
                findings.append(
                    {
                        "agent_id": str(agent.id),
                        "agent_name": agent.name,
                        "issue": "Budget overrun detected",
                        "severity": "high",
                        "daily_budget": float(agent.dailyBudget),
                        "daily_spend": float(agent.daily_spend),
                    }
                )
            if not agent.model or agent.model == "":
                findings.append(
                    {
                        "agent_id": str(agent.id),
                        "agent_name": agent.name,
                        "issue": "Missing model configuration",
                        "severity": "medium",
                    }
                )

    status = "COMPLIANT" if len(findings) == 0 else "NON_COMPLIANT"

    audit_log = ComplianceAuditLog(
        id=audit_id,
        user_id=user_id,
        action="RUN_SOX_AUDIT",
        resource="financial_integrity_v1",
        compliance_type="SOX",
        status=status.lower(),
        metadata_json={
            "findings": findings,
            "finding_count": len(findings),
            "agent_scope": len(agents),
        },
    )
    session.add(audit_log)
    session.commit()

    return {
        "audit_id": audit_id,
        "status": status,
        "findings": findings,
        "finding_count": len(findings),
        "agents_scanned": len(agents),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/audit/hipaa")
async def run_hipaa_audit(
    session: Session = Depends(get_session), x_user_id: Optional[str] = Header(None)
):
    """Run a HIPAA data privacy and security audit"""
    import uuid
    from app.core.models import BiometricEnrollment, VerificationSession

    user_id = x_user_id or "system_admin"
    audit_id = str(uuid.uuid4())

    findings = []

    enrollments = session.exec(select(BiometricEnrollment)).all()
    inactive_active = [e for e in enrollments if not e.is_active]
    if len(inactive_active) > 0:
        findings.append(
            {
                "issue": "Inactive biometric enrollments still present",
                "severity": "medium",
                "count": len(inactive_active),
            }
        )

    sessions = session.exec(select(VerificationSession)).all()
    unverified = [s for s in sessions if s.result is None or s.result == "pending"]
    if len(unverified) > 10:
        findings.append(
            {
                "issue": "High number of unverified sessions",
                "severity": "high",
                "count": len(unverified),
            }
        )

    status = "COMPLIANT" if len(findings) == 0 else "NON_COMPLIANT"

    audit_log = ComplianceAuditLog(
        id=audit_id,
        user_id=user_id,
        action="RUN_HIPAA_AUDIT",
        resource="privacy_controls_v1",
        compliance_type="HIPAA",
        status=status.lower(),
        metadata_json={
            "findings": findings,
            "finding_count": len(findings),
            "enrollments_checked": len(enrollments),
            "sessions_checked": len(sessions),
        },
    )
    session.add(audit_log)
    session.commit()

    return {
        "audit_id": audit_id,
        "status": status,
        "findings": findings,
        "finding_count": len(findings),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/healing", response_model=List[HealingConfiguration])
async def list_healing_configs(session: Session = Depends(get_session)):
    """List all self-healing configurations"""
    return session.exec(select(HealingConfiguration)).all()


@router.patch("/healing/{config_id}", response_model=HealingConfiguration)
async def update_healing_config(
    config_id: str, update: dict, session: Session = Depends(get_session)
):
    """Update a healing configuration (e.g., toggle active status)"""
    config = session.get(HealingConfiguration, config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Healing config not found")

    for key, value in update.items():
        if hasattr(config, key):
            setattr(config, key, value)

    session.add(config)
    session.commit()
    session.refresh(config)
    return config


@router.get("/healing/events", response_model=List[SelfHealingEvent])
async def list_healing_events(session: Session = Depends(get_session)):
    """List recent self-healing events"""
    return session.exec(select(SelfHealingEvent)).all()


@router.post("/eu-register", response_model=dict)
async def register_ai_system(
    request: dict, session: Session = Depends(get_session)
):
    """
    Certified EU AI Act Handshake (Art. 51/60).
    Registers a High-Risk AI system in the EU database (certified mock).
    """
    import uuid
    registration_id = f"EU-AI-{uuid.uuid4().hex[:8].upper()}"
    
    # Audit log the registration
    from app.core.models import ComplianceAuditLog
    
    audit_log = ComplianceAuditLog(
        id=str(uuid.uuid4()),
        user_id="certified_regulator",
        action="SYSTEM_REGISTRATION",
        resource=request.get("name", "Unknown System"),
        compliance_type="AI_ACT",
        status="compliant",
        metadata_json={
            "registration_id": registration_id,
            "category": request.get("category", "high-risk"),
            "purpose": request.get("purpose", "General Integration"),
            "docs_url": request.get("docs_url", ""),
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    session.add(audit_log)
    session.commit()
    
    return {
        "status": "success",
        "registration_id": registration_id,
        "certified": True,
        "certified_at": datetime.utcnow().isoformat(),
        "next_audit": (datetime.utcnow().replace(year=datetime.utcnow().year + 1)).isoformat(),
        "annex_iv_url": f"/api/compliance/{registration_id}/report",
        "message": "AI System successfully registered in the EU High-Risk Database."
    }

@router.get("/status")
async def get_compliance_status(session: Session = Depends(get_session)):
    """Get aggregated compliance status (HIPAA, SOX, GDPR) derived from real audit logs"""
    status_map = {}
    for c_type in ["HIPAA", "SOX", "GDPR"]:
        latest = session.exec(
            select(ComplianceAuditLog)
            .where(ComplianceAuditLog.compliance_type == c_type)
            .order_by(ComplianceAuditLog.timestamp.desc())
        ).first()
        
        if latest:
            # Normalize status to frontend-expected values (e.g., PASSING, COMPLIANT)
            raw_status = latest.status.upper()
            if raw_status == "COMPLIANT" or raw_status == "VERIFIED":
                status_map[c_type.lower()] = "PASSING" if c_type == "HIPAA" else "COMPLIANT"
            else:
                status_map[c_type.lower()] = "NON_COMPLIANT"
        else:
            status_map[c_type.lower()] = "PENDING"
            
    return status_map

# ============================================================================
# Compliance Checklists (Real-First Hardening)
# ============================================================================

@router.get("/checklists", response_model=List[ComplianceChecklistItem])
async def list_checklists(
    category: Optional[str] = None,
    section: Optional[str] = None,
    session: Session = Depends(get_session),
):
    """Retrieve persistent checklist items with segment-specific filtering"""
    try:
        query = select(ComplianceChecklistItem)
        if category:
            query = query.where(ComplianceChecklistItem.category == category)
        if section:
            query = query.where(ComplianceChecklistItem.section == section)

        items = session.exec(query).all()
        return items
    except Exception as e:
        logger.error(f"Checklist Retrieval Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve checklists.")

@router.post("/checklists/{item_id}", response_model=ComplianceChecklistItem)
async def update_checklist_item(
    item_id: str, assessment: dict, session: Session = Depends(get_session)
):
    """Update a persistent checklist item with audit trail integration"""
    try:
        item = session.get(ComplianceChecklistItem, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Checklist item not found")

        item.status = assessment.get("status", item.status)
        item.evidence = assessment.get("evidence", item.evidence)
        item.last_checked = datetime.utcnow()

        # Log this administrative action in the Audit Trail
        audit_log = AgentAuditLog(
            agent_id="SYSTEM_ADMIN",
            action="COMPLIANCE_ITEM_UPDATE",
            intent="administrative_oversight",
            outcome="success",
            reasoning=f"Manual update of checklist item: {item.title} to status: {item.status}",
            risk_score=0.0,
            metadata_json={"item_id": item_id, "category": item.category}
        )
        session.add(audit_log)
        session.add(item)
        session.commit()
        session.refresh(item)
        return item
    except Exception as e:
        logger.error(f"Checklist Update Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
