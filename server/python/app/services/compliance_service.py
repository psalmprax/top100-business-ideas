import re
import logging
from typing import Dict, Any, List
from datetime import datetime
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models import AgentAuditLog

logger = logging.getLogger(__name__)

class ComplianceService:
    """
    Real Compliance Scanning Service for HIPAA (PII) and SOX (Financial Integrity).
    Replaces simulations with authentic pattern matching and audit log analysis.
    """
    
    # HIPAA / PII Patterns
    PII_PATTERNS = {
        "email": r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
        "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
        "credit_card": r"\b(?:\d[ -]*?){13,16}\b",
        "phone": r"\b(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b"
    }

    async def scan_for_pii(self, text: str) -> Dict[str, Any]:
        """Perform real HIPAA PII scanning using regex patterns"""
        findings = []
        for label, pattern in self.PII_PATTERNS.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                findings.append({
                    "type": label,
                    "value": match.group(),
                    "position": match.start()
                })
        
        risk_score = min(len(findings) * 20, 100)
        status = "compliant" if risk_score < 20 else "risk_detected"
        
        return {
            "status": status,
            "risk_score": risk_score,
            "findings_count": len(findings),
            "findings": findings,
            "timestamp": datetime.now().isoformat()
        }

    async def audit_sox_compliance(self, days: int = 7) -> Dict[str, Any]:
        """
        Perform real SOX compliance audit by scanning AgentAuditLog for 
        sensitive financial operations and unauthorized changes.
        """
        try:
            with Session(engine) as session:
                # Scan for 'budget', 'billing', 'financial' in audit logs
                statement = select(AgentAuditLog).where(
                    AgentAuditLog.action.ilike("%budget%") | 
                    AgentAuditLog.action.ilike("%billing%") |
                    AgentAuditLog.action.ilike("%config%")
                )
                logs = session.exec(statement).all()
                
                violations = [log for log in logs if "unauthorized" in (log.details or "").lower()]
                
                return {
                    "status": "pass" if not violations else "fail",
                    "total_financial_events": len(logs),
                    "violations_detected": len(violations),
                    "violations": [v.id for v in violations[:10]],
                    "timestamp": datetime.now().isoformat(),
                    "message": f"SOX Audit complete. Analyzed {len(logs)} financial events."
                }
        except Exception as e:
            logger.error(f"SOX Audit Error: {e}")
            return {"status": "error", "message": str(e)}

# Singleton
compliance_service = ComplianceService()
