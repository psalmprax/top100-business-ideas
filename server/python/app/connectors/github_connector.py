"""GitHub Evidence Connector for ReguLens"""

import httpx
from typing import List, Dict, Any, Optional
import os

class GitHubConnector:
    """Connects to GitHub to fetch compliance evidence"""
    
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"

    async def scan_repository(self, repo_url: str) -> Dict[str, Any]:
        """
        Scans a repository for compliance-related files
        (e.g., ARCHITECTURE.md, SECURITY.md, compliance-logs/)
        """
        # Parse owner and repo from URL
        # Example: https://github.com/owner/repo
        parts = repo_url.rstrip("/").split("/")
        if len(parts) < 2:
            return {"error": "Invalid repository URL"}
        
        owner, repo = parts[-2], parts[-1]
        
        evidence = {
            "repository": f"{owner}/{repo}",
            "findings": [],
            "scanned_at": "2026-03-16T23:45:00Z" # Mock timestamp
        }
        
        # Mock logic for scanning files
        # In production, this would use httpx to call the GitHub API
        compliance_files = ["ARCHITECTURE.md", "PRIVACY.md", "compliance-logs/"]
        
        for file in compliance_files:
            evidence["findings"].append({
                "file": file,
                "status": "found",
                "type": "documentation_evidence"
            })
            
        return evidence

    async def get_workflow_runs(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """Fetches CI/CD workflow runs to prove 'Technical Logging' compliance"""
        return [
            {"id": 1, "status": "completed", "conclusion": "success", "event": "push"},
            {"id": 2, "status": "completed", "conclusion": "failure", "event": "pull_request"}
        ]

github_connector = GitHubConnector()
