"""
Supply Chain Audit Connector for ReguLens
Audits Tier-2/3 vendors for AI Act compliance.
"""

import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import logging
import asyncio

from app.core.models.compliance_models import Vendor, ComplianceStatus as DBComplianceStatus
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class VendorRiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SupplyChainAudit:
    """
    Manages AI supply chain compliance auditing.
    Checks Tier-2/3 vendors for required documentation and risk factors.
    """

    def __init__(self):
        self.audit_history: List[Dict[str, Any]] = []

    async def audit_vendor(self, session: AsyncSession, vendor: Vendor) -> Dict[str, Any]:
        """
        Perform compliance audit on a vendor.
        Checks for required documentation and compliance evidence.
        """
        issues = []
        documents = {}
        
        # Derive Tier based on category or type (Tier-1: llm, Tier-2: supporting, Tier-3: infra)
        tier = 3
        v_type = (vendor.type or vendor.category).lower()
        if v_type in ["llm", "foundation_model", "primary_ai"]:
            tier = 1
        elif v_type in ["vector_db", "embedding", "agent_framework"]:
            tier = 2

        # Check for AI Act Article 11 technical documentation
        required_docs = {
            1: [
                "model_card",
                "training_data_summary",
                "privacy_policy",
                "security_assessment",
            ],
            2: ["api_documentation", "data_processing_agreement", "sla_terms"],
            3: ["infrastructure_security", "encryption_policy"],
        }

        tier_docs = required_docs.get(tier, [])

        # Real document checks via HTTP if website is available
        found_docs = []
        if vendor.website:
            found_docs = await self.check_vendor_documents(vendor)

        for doc_type in tier_docs:
            if doc_type in found_docs:
                documents[doc_type] = {"status": "found", "verified": True}
            else:
                documents[doc_type] = {"status": "missing"}
                issues.append(f"Missing required document: {doc_type}")

        # Determine risk level based on issues
        issue_count = len(issues)
        if issue_count == 0:
            vendor.compliance_status = DBComplianceStatus.PASSED
            vendor.risk_level = "low"
        elif issue_count <= 2:
            vendor.compliance_status = DBComplianceStatus.PENDING
            vendor.risk_level = "medium"
        else:
            vendor.compliance_status = DBComplianceStatus.FAILED
            vendor.risk_level = "high" if tier == 1 else "critical"

        vendor.status = vendor.compliance_status
        vendor.last_assessment = datetime.utcnow()
        vendor.updated_at = datetime.utcnow()
        
        session.add(vendor)

        # Record audit to history
        audit_record = {
            "vendor_id": str(vendor.id),
            "name": vendor.name,
            "timestamp": vendor.last_assessment.isoformat(),
            "compliance_status": vendor.compliance_status.value,
            "risk_level": vendor.risk_level,
            "issues_found": issues,
            "documents_found": list(documents.keys()),
        }
        self.audit_history.append(audit_record)

        return audit_record

    def get_supply_chain_risk_report(self, vendors: List[Vendor]) -> Dict[str, Any]:
        """Generate a comprehensive risk report for the supply chain."""
        tier_stats = {
            1: {"total": 0, "high_risk": 0},
            2: {"total": 0, "high_risk": 0},
            3: {"total": 0, "high_risk": 0},
        }

        critical_vendors = []

        for vendor in vendors:
            # Derive Tier for stats
            tier = 3
            v_type = (vendor.type or vendor.category).lower()
            if v_type in ["llm", "foundation_model", "primary_ai"]:
                tier = 1
            elif v_type in ["vector_db", "embedding", "agent_framework"]:
                tier = 2
            
            tier_stats[tier]["total"] += 1

            if vendor.risk_level in ["high", "critical"]:
                tier_stats[tier]["high_risk"] += 1
                critical_vendors.append(
                    {
                        "vendor_id": str(vendor.id),
                        "name": vendor.name,
                        "tier": tier,
                        "risk_level": vendor.risk_level,
                        "compliance_status": vendor.compliance_status.value,
                    }
                )

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "total_vendors": len(vendors),
            "tier_statistics": tier_stats,
            "critical_vendors": critical_vendors,
            "article_11_compliance": "Review technical documentation requirements for all Tier-1 vendors",
            "article_10_compliance": "Verify training data governance for all model providers",
        }

    async def check_vendor_documents(self, vendor: Vendor) -> List[str]:
        """Check vendor website for compliance documents"""
        found = []
        doc_urls = [
            ("/privacy", "privacy_policy"),
            ("/security", "security_assessment"),
            ("/trust", "model_card"),
            ("/privacy-policy", "privacy_policy"),
            ("/legal", "data_processing_agreement"),
        ]

        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            for path, doc_type in doc_urls:
                url = vendor.website + path
                if not url.startswith("http"):
                    url = "https://" + url
                try:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        found.append(doc_type)
                except Exception:
                    pass

        return found


# Singleton instance
supply_chain_audit = SupplyChainAudit()
