"""Reporting service for compliance analysis"""

from typing import Dict, Any, List
from datetime import datetime
from sqlmodel import Session
from app.core.models import ComplianceCheck


class ReportingService:
    """Generates compliance reports (Annex IV Technical Folder)"""

    def generate_annex_iv_report(self, check: ComplianceCheck) -> Dict[str, Any]:
        """
        Generates a structured report compatible with EU AI Act Annex IV (Technical Documentation)
        Enhanced with real-world evidence from persistence layer.
        """
        from sqlmodel import select, Session
        from app.core.database import engine
        from app.core.models import ComplianceChecklistItem, ComplianceAuditLog

        # Ensure status is a string
        status_str = (
            str(check.status.value)
            if hasattr(check.status, "value")
            else str(check.status)
        )

        findings = check.findings
        if isinstance(findings, str):
            import json
            try:
                findings = json.loads(findings)
            except (ValueError, TypeError):
                findings = []

        with Session(engine) as session:
            # Fetch Article 11 (Documentation) and Article 13 (Transparency) readiness
            checklists = session.exec(
                select(ComplianceChecklistItem).where(
                    ComplianceChecklistItem.category.in_(["docs", "risk", "audit-trail"])
                )
            ).all()
            
            # Fetch any recent administrative audit logs
            audit_logs = session.exec(
                select(ComplianceAuditLog).limit(5)
            ).all()

        docs_readiness = [c for c in checklists if c.category == "docs"]
        risk_readiness = [c for c in checklists if c.category == "risk"]
        audit_trail_status = [c for c in checklists if c.category == "audit-trail"]

        return {
            "title": "Annex IV: Technical Documentation for AI System",
            "report_id": f"ANNEX-IV-{check.id}",
            "generated_at": datetime.utcnow().isoformat(),
            "compliance_status": status_str,
            "overall_score": f"{check.score}%",
            "evidence_summary": {
                "documentation_ready": all(c.status == "compliant" for c in docs_readiness),
                "risk_management_verified": any(c.status == "compliant" for c in risk_readiness),
                "audit_logs_present": len(audit_logs) > 0
            },
            "sections": [
                {
                    "id": "1",
                    "title": "General Description of the AI System",
                    "content": f"AI System analyzed via URL: {check.id}. Purpose as per intended use case.",
                    "status": "Verified" if int(check.score) > 80 else "Requires Review",
                },
                {
                    "id": "2",
                    "title": "Technical Documentation (Article 11 Readiness)",
                    "findings": [f"{c.title}: {c.status.upper()}" for c in docs_readiness],
                    "status": "In Progress" if any(c.status == "pending" for c in docs_readiness) else "Ready",
                },
                {
                    "id": "3",
                    "title": "Risk Management System (Article 9)",
                    "findings": [f"{c.title}: {c.status.upper()}" for c in risk_readiness] + 
                                [f.get("description", "") for f in findings if f.get("severity") == "high"],
                    "status": "Critical Review Required" if any(c.status == "non_compliant" for c in risk_readiness) else "Verified",
                },
                {
                    "id": "4",
                    "title": "Transparency & Provision of Information (Article 13)",
                    "content": "Evaluation of human-in-the-loop and fail-safe mechanisms.",
                    "findings": [f.get("recommendation", "") for f in findings] + 
                                [f"{c.title}: {c.status.upper()}" for c in audit_trail_status],
                    "status": "Audit Trail Active" if len(audit_trail_status) > 0 else "No Audit Evidence",
                },
            ],
            "conclusion": "PASSED" if status_str == "passed" and all(c.status == "compliant" for c in docs_readiness) else "ACTION REQUIRED",
        }

    def format_as_markdown(self, report_data: Dict[str, Any]) -> str:
        """Formats the Annex IV report as a clean Markdown document"""
        md = f"# {report_data['title']}\n\n"
        md += f"**Report ID:** {report_data['report_id']}  \n"
        md += f"**Generated At:** {report_data['generated_at']}  \n"
        md += f"**Compliance Status:** {report_data['compliance_status'].upper()}  \n"
        md += f"**Overall Score:** {report_data['overall_score']}\n\n"

        md += "## Executive Conclusion\n"
        md += f"**{report_data['conclusion']}**\n\n"

        for section in report_data["sections"]:
            md += f"## {section['id']}. {section['title']}\n"
            md += f"*Status: {section['status']}*\n\n"
            if "content" in section:
                md += f"{section['content']}\n\n"
            if "findings" in section and section["findings"]:
                md += "### Key Findings / Recommendations\n"
                for finding in section["findings"]:
                    md += f"- {finding}\n"
                md += "\n"

        return md


reporting_service = ReportingService()
