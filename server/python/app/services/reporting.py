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
        """
        # Ensure status is a string
        status_str = (
            str(check.status.value)
            if hasattr(check.status, "value")
            else str(check.status)
        )

        # Ensure findings is a list
        findings = check.findings
        if isinstance(findings, str):
            import json

            try:
                findings = json.loads(findings)
            except (ValueError, TypeError):
                findings = []

        return {
            "title": "Annex IV: Technical Documentation for AI System",
            "report_id": f"ANNEX-IV-{check.id}",
            "generated_at": datetime.utcnow().isoformat(),
            "compliance_status": status_str,
            "overall_score": f"{check.score}%",
            "sections": [
                {
                    "id": "1",
                    "title": "General Description of the AI System",
                    "content": f"AI System analyzed via URL: {check.id}. Purpose as per intended use case.",
                    "status": "Verified"
                    if int(check.score) > 80
                    else "Requires Review",
                },
                {
                    "id": "2",
                    "title": "Detailed Description of the Elements of the AI System",
                    "findings": [
                        f.get("description", "")
                        for f in findings
                        if f.get("severity") == "high"
                    ],
                    "status": "Evidence collected via GitHub Connector",
                },
                {
                    "id": "3",
                    "title": "Information about Monitoring and Control",
                    "findings": [
                        f.get("description", "")
                        for f in findings
                        if f.get("rule", "").startswith("Article 15")
                    ],
                    "status": "Review Required",
                },
                {
                    "id": "4",
                    "title": "Risk Management System",
                    "content": "Evaluation of human-in-the-loop and fail-safe mechanisms.",
                    "findings": [f.get("recommendation", "") for f in findings],
                    "status": "Under Evaluation",
                },
            ],
            "conclusion": "PASSED" if status_str == "passed" else "ACTION REQUIRED",
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
