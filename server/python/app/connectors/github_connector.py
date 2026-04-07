"""GitHub Evidence Connector for ReguLens"""

import httpx
from typing import List, Dict, Any, Optional
import os
from datetime import datetime


class GitHubConnector:
    """Connects to GitHub to fetch compliance evidence"""

    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"

    async def scan_repository(self, repo_url: str) -> Dict[str, Any]:
        """Scans a repository for compliance-related files"""
        parts = repo_url.rstrip("/").split("/")
        if len(parts) < 2:
            return {"error": "Invalid repository URL"}

        owner, repo = parts[-2], parts[-1]

        evidence = {
            "repository": f"{owner}/{repo}",
            "findings": [],
            "scanned_at": datetime.utcnow().isoformat() + "Z",
        }

        compliance_files = [
            "ARCHITECTURE.md",
            "PRIVACY.md",
            "SECURITY.md",
            "DATA_GOVERNANCE.md",
            "BIAS_MITIGATION.md",
            "DATA_LINEAGE.md",
            "COMPLIANCE.md",
        ]

        async with httpx.AsyncClient(timeout=30.0) as client:
            for file in compliance_files:
                url = f"{self.base_url}/repos/{owner}/{repo}/contents/{file}"
                try:
                    resp = await client.get(url, headers=self.headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        evidence["findings"].append(
                            {
                                "file": file,
                                "status": "found",
                                "type": "documentation_evidence",
                                "sha": data.get("sha"),
                                "size": data.get("size"),
                            }
                        )
                    elif resp.status_code == 404:
                        evidence["findings"].append(
                            {
                                "file": file,
                                "status": "not_found",
                                "type": "documentation_evidence",
                            }
                        )
                except Exception as e:
                    evidence["findings"].append(
                        {"file": file, "status": "error", "error": str(e)}
                    )

        evidence["score"] = (
            len([f for f in evidence["findings"] if f["status"] == "found"])
            * 100
            // len(compliance_files)
        )
        return evidence

    async def get_workflow_runs(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """Fetches CI/CD workflow runs to prove 'Technical Logging' compliance"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"{self.base_url}/repos/{owner}/{repo}/actions/runs"
            try:
                resp = await client.get(url, headers=self.headers)
                if resp.status_code == 200:
                    data = resp.json()
                    return [
                        {
                            "id": run.get("id"),
                            "status": run.get("status"),
                            "conclusion": run.get("conclusion"),
                            "event": run.get("event"),
                            "branch": run.get("head_branch"),
                            "created_at": run.get("created_at"),
                        }
                        for run in data.get("workflow_runs", [])[:10]
                    ]
            except Exception:
                pass
        return []

    async def check_branch_protection(
        self, owner: str, repo: str, branch: str = "main"
    ) -> Dict[str, Any]:
        """Check if branch protection is enabled"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"{self.base_url}/repos/{owner}/{repo}/branches/{branch}/protection"
            try:
                resp = await client.get(url, headers=self.headers)
                if resp.status_code == 200:
                    return {"protected": True, "details": resp.json()}
            except Exception:
                pass
        return {"protected": False}


github_connector = GitHubConnector()
