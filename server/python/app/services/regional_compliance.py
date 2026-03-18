from typing import List, Dict, Any

class RegionalComplianceService:
    """
    Service for multi-jurisdictional compliance mapping for ReguLens.
    Supports China (MLPS), Canada (AIDA), and UK AI Safety rulesets.
    """

    def get_compliance_rules(self, jurisdiction: str) -> List[Dict[str, str]]:
        """Returns the compliance rules for a specific jurisdiction."""
        rules = {
            "CHINA": [
                {"id": "MLPS-1", "rule": "Data Residency", "description": "All AI training data for Chinese citizens must be stored within mainland China."},
                {"id": "MLPS-2", "rule": "Algorithm Filing", "description": "Algorithms with 'public opinion attributes' must be filed with the CAC."},
                {"id": "MLPS-3", "rule": "Real-name ID", "description": "AI generative services require real-name identity verification of users."}
            ],
            "CANADA": [
                {"id": "AIDA-1", "rule": "High-Impact Systems", "description": "Identify if AI system is 'High-Impact' as per AIDA Section 5."},
                {"id": "AIDA-2", "rule": "Bias Mitigation", "description": "Mandatory mitigation plans for systems that could cause discriminatory outcomes."},
                {"id": "AIDA-3", "rule": "Public Disclosure", "description": "Publication of system descriptions and risk management strategies."}
            ],
            "UK": [
                {"id": "UK-SAFETY-1", "rule": "Science-Led Safety", "description": "Alignment with UK AI Safety Institute's red-teaming standards."},
                {"id": "UK-SAFETY-2", "rule": "Pre-deployment Assessment", "description": "Mandatory safety evaluations for frontier models before public release."},
                {"id": "UK-SAFETY-3", "rule": "Transparency to Regulators", "description": "Sharing of safety testing results with relevant UK sectoral regulators."}
            ]
        }
        return rules.get(jurisdiction.upper(), [])

    def map_evidence_to_regulation(self, evidence: str, jurisdiction: str) -> Dict[str, Any]:
        """Maps a piece of evidence (e.g., GitHub repo) to a regional regulation."""
        rules = self.get_compliance_rules(jurisdiction)
        # Simplified mapping logic for demo
        return {
            "evidence": evidence,
            "jurisdiction": jurisdiction,
            "matched_rules": [rules[0]] if rules else [],
            "status": "Verified" if "secure" in evidence.lower() else "Requires Audit"
        }

regional_compliance = RegionalComplianceService()
