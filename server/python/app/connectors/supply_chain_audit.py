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

logger = logging.getLogger(__name__)


class VendorRiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ComplianceStatus(str, Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PENDING = "pending"
    UNKNOWN = "unknown"


class Vendor:
    """Represents a vendor in the AI supply chain."""

    def __init__(
        self,
        vendor_id: str,
        name: str,
        tier: int,  # 1, 2, or 3
        service_type: str,  # e.g., "llm_provider", "embedding", "vector_db"
        website: Optional[str] = None,
    ):
        self.vendor_id = vendor_id
        self.name = name
        self.tier = tier
        self.service_type = service_type
        self.website = website
        self.compliance_status = ComplianceStatus.UNKNOWN
        self.risk_level = VendorRiskLevel.LOW
        self.last_audit = None
        self.documents = {}
        self.issues = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "vendor_id": self.vendor_id,
            "name": self.name,
            "tier": self.tier,
            "service_type": self.service_type,
            "website": self.website,
            "compliance_status": self.compliance_status.value,
            "risk_level": self.risk_level.value,
            "last_audit": self.last_audit.isoformat() if self.last_audit else None,
            "documents": self.documents,
            "issues": self.issues,
        }


class SupplyChainAudit:
    """
    Manages AI supply chain compliance auditing.
    Tracks Tier-2/3 vendors and their compliance status.
    """

    def __init__(self):
        self.vendors: Dict[str, Vendor] = {}
        self.audit_history: List[Dict[str, Any]] = []

        # Initialize with common AI vendors
        self._init_common_vendors()

    def _init_common_vendors(self):
        """Initialize common AI vendors for demonstration."""
        common_vendors = [
            # Tier 1 - Primary LLM providers
            Vendor("v-openai", "OpenAI", 1, "llm_provider", "https://openai.com"),
            Vendor(
                "v-anthropic", "Anthropic", 1, "llm_provider", "https://anthropic.com"
            ),
            Vendor("v-google", "Google AI", 1, "llm_provider", "https://ai.google"),
            Vendor(
                "v-aws",
                "AWS Bedrock",
                1,
                "llm_provider",
                "https://aws.amazon.com/bedrock",
            ),
            # Tier 2 - Supporting services
            Vendor("v-cohere", "Cohere", 2, "embedding_provider", "https://cohere.com"),
            Vendor(
                "v-huggingface",
                "Hugging Face",
                2,
                "model_hub",
                "https://huggingface.co",
            ),
            Vendor(
                "v-pinecone", "Pinecone", 2, "vector_database", "https://pinecone.io"
            ),
            Vendor(
                "v-weaviate", "Weaviate", 2, "vector_database", "https://weaviate.io"
            ),
            # Tier 3 - Infrastructure
            Vendor(
                "v-cloudflare",
                "Cloudflare",
                3,
                "cdn_infrastructure",
                "https://cloudflare.com",
            ),
            Vendor("v-mongo", "MongoDB", 3, "database", "https://mongodb.com"),
        ]

        for vendor in common_vendors:
            self.vendors[vendor.vendor_id] = vendor

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
                try:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        found.append(doc_type)
                except Exception:
                    pass

        return found

    def add_vendor(
        self,
        vendor_id: str,
        name: str,
        tier: int,
        service_type: str,
        website: Optional[str] = None,
    ) -> bool:
        """Add a vendor to the supply chain."""
        if vendor_id in self.vendors:
            logger.warning(f"Vendor {vendor_id} already exists")
            return False

        vendor = Vendor(vendor_id, name, tier, service_type, website)
        self.vendors[vendor_id] = vendor
        return True

    def remove_vendor(self, vendor_id: str) -> bool:
        """Remove a vendor from the supply chain."""
        if vendor_id in self.vendors:
            del self.vendors[vendor_id]
            return True
        return False

    async def audit_vendor(self, vendor_id: str) -> Dict[str, Any]:
        """
        Perform compliance audit on a vendor.
        Checks for required documentation and compliance evidence.
        """
        vendor = self.vendors.get(vendor_id)
        if not vendor:
            return {"error": f"Vendor {vendor_id} not found"}

        issues = []
        documents = {}
        risk_factors = []

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

        tier_docs = required_docs.get(vendor.tier, [])

        # Real document checks via HTTP
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
            vendor.compliance_status = ComplianceStatus.COMPLIANT
            vendor.risk_level = VendorRiskLevel.LOW
        elif issue_count <= 2:
            vendor.compliance_status = ComplianceStatus.PENDING
            vendor.risk_level = VendorRiskLevel.MEDIUM
        else:
            vendor.compliance_status = ComplianceStatus.NON_COMPLIANT
            vendor.risk_level = (
                VendorRiskLevel.HIGH if vendor.tier == 1 else VendorRiskLevel.CRITICAL
            )

        vendor.documents = documents
        vendor.issues = issues
        vendor.last_audit = datetime.utcnow()

        # Record audit
        audit_record = {
            "vendor_id": vendor_id,
            "timestamp": vendor.last_audit.isoformat(),
            "compliance_status": vendor.compliance_status.value,
            "risk_level": vendor.risk_level.value,
            "issues_found": issues,
            "documents_found": list(documents.keys()),
        }
        self.audit_history.append(audit_record)

        return audit_record

    async def audit_all_vendors(self) -> Dict[str, Any]:
        """Audit all vendors in the supply chain."""
        results = {
            "total_vendors": len(self.vendors),
            "audited": 0,
            "compliant": 0,
            "non_compliant": 0,
            "pending": 0,
            "vendors": [],
        }

        for vendor_id in self.vendors:
            audit_result = await self.audit_vendor(vendor_id)
            results["audited"] += 1

            if "error" not in audit_result:
                status = audit_result["compliance_status"]
                if status == ComplianceStatus.COMPLIANT.value:
                    results["compliant"] += 1
                elif status == ComplianceStatus.NON_COMPLIANT.value:
                    results["non_compliant"] += 1
                else:
                    results["pending"] += 1

                results["vendors"].append(
                    {
                        "vendor_id": vendor_id,
                        "name": self.vendors[vendor_id].name,
                        "tier": self.vendors[vendor_id].tier,
                        "compliance_status": status,
                        "risk_level": audit_result["risk_level"],
                        "issues_count": len(audit_result.get("issues_found", [])),
                    }
                )

        results["compliance_rate"] = (
            results["compliant"] / results["total_vendors"] * 100
            if results["total_vendors"] > 0
            else 0
        )

        return results

    def get_supply_chain_risk_report(self) -> Dict[str, Any]:
        """Generate a comprehensive risk report for the supply chain."""
        tier_stats = {
            1: {"total": 0, "high_risk": 0},
            2: {"total": 0, "high_risk": 0},
            3: {"total": 0, "high_risk": 0},
        }

        critical_vendors = []

        for vendor in self.vendors.values():
            tier_stats[vendor.tier]["total"] += 1

            if vendor.risk_level in [VendorRiskLevel.HIGH, VendorRiskLevel.CRITICAL]:
                tier_stats[vendor.tier]["high_risk"] += 1
                critical_vendors.append(
                    {
                        "vendor_id": vendor.vendor_id,
                        "name": vendor.name,
                        "tier": vendor.tier,
                        "risk_level": vendor.risk_level.value,
                        "compliance_status": vendor.compliance_status.value,
                        "issues": vendor.issues,
                    }
                )

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "total_vendors": len(self.vendors),
            "tier_statistics": tier_stats,
            "critical_vendors": critical_vendors,
            "recommendations": self._generate_recommendations(tier_stats),
            "article_11_compliance": "Review technical documentation requirements for all Tier-1 vendors",
            "article_10_compliance": "Verify training data governance for all model providers",
        }

    def _generate_recommendations(self, tier_stats: Dict) -> List[str]:
        """Generate recommendations based on audit results."""
        recommendations = []

        if tier_stats[1]["high_risk"] > 0:
            recommendations.append(
                f"URGENT: {tier_stats[1]['high_risk']} Tier-1 vendors require immediate attention"
            )

        if tier_stats[2]["high_risk"] > 0:
            recommendations.append(
                f"Review {tier_stats[2]['high_risk']} Tier-2 vendor compliance gaps"
            )

        if not recommendations:
            recommendations.append(
                "Supply chain compliance looks good - continue monitoring"
            )

        return recommendations


# Singleton instance
supply_chain_audit = SupplyChainAudit()
