"""Compliance Analysis ML Module"""

import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)


class ComplianceAnalyzer:
    """
    AI Act compliance analyzer.
    Analyzes systems based on rules and evidence found.
    """
    
    def __init__(self, model_path: str = "/models/compliance"):
        self.model_path = model_path
        self.is_loaded = True # Mock loading for now
        
    def _calculate_score(self, evidence: List[Dict[str, Any]], check_type: str) -> int:
        """Calculates a deterministic score based on evidence findings"""
        if not evidence:
            return 45 # Base score with no evidence
            
        base_score = 60
        found_files = [e.get("file") for e in evidence if e.get("status") == "found"]
        
        if check_type == "ai_act":
            if "ARCHITECTURE.md" in found_files: base_score += 15
            if "PRIVACY.md" in found_files: base_score += 10
            if "SECURITY.md" in found_files: base_score += 10
        elif check_type == "privacy":
            if "PRIVACY.md" in found_files: base_score += 30
        
        return min(base_score, 100)

    def analyze_ai_act_compliance(self, system_info: Dict[str, Any], evidence: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analyze an AI system for EU AI Act compliance using evidence mapping"""
        score = self._calculate_score(evidence or [], "ai_act")
        
        findings = []
        found_files = [e.get("file") for e in evidence or [] if e.get("status") == "found"]
        
        # Article 11: Technical Documentation
        if "ARCHITECTURE.md" not in found_files:
            findings.append({
                "rule": "Article 11: Technical Documentation",
                "severity": "high",
                "description": "Missing foundational technical architecture documentation (Annex IV).",
                "recommendation": "Generate and maintain Article 11 compliant technical folder."
            })
            
        # Article 10: Data Governance
        findings.append({
            "rule": "Article 10: Data Governance",
            "severity": "medium",
            "description": "Evidence of data minimization and bias mitigation not found in repository logs.",
            "recommendation": "Implement automated data lineage and bias scanning."
        })
            
        status = "passed" if score >= 85 else "review" if score >= 60 else "failed"
        
        return {
            "id": f"check-{datetime.utcnow().timestamp()}",
            "type": "ai_act",
            "status": status,
            "score": score,
            "findings": findings,
            "checked_at": datetime.utcnow().isoformat()
        }
        
    def analyze_privacy_compliance(self, system_info: Dict[str, Any], evidence: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analyze for GDPR/privacy compliance"""
        score = self._calculate_score(evidence or [], "privacy")
        
        findings = []
        found_files = [e.get("file") for e in evidence or [] if e.get("status") == "found"]
        
        if "PRIVACY.md" not in found_files:
            findings.append({
                "rule": "GDPR Transparency",
                "severity": "high",
                "description": "Privacy policy not detected in core repository.",
                "recommendation": "Add high-visibility PRIVACY.md to root or docs folder."
            })
            
        return {
            "id": f"check-{datetime.utcnow().timestamp()}",
            "type": "privacy",
            "status": "passed" if score >= 80 else "review",
            "score": score,
            "findings": findings,
            "checked_at": datetime.utcnow().isoformat()
        }
        
    def analyze_security(self, system_info: Dict[str, Any], evidence: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analyze for security compliance"""
        score = self._calculate_score(evidence or [], "security")
        
        findings = []
        findings.append({
            "rule": "Article 15: Cyber-Security",
            "severity": "medium",
            "description": "Real-time vulnerability scanning metrics missing.",
            "recommendation": "Integrate GitHub Advanced Security or equivalent for automated scanning."
        })
            
        return {
            "id": f"check-{datetime.utcnow().timestamp()}",
            "type": "security",
            "status": "passed" if score >= 75 else "review",
            "score": score,
            "findings": findings,
            "checked_at": datetime.utcnow().isoformat()
        }


# Singleton instance
compliance_analyzer = ComplianceAnalyzer()
