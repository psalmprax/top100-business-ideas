"""
Regulens AI Compliance Hub SDK
EU AI Act Compliance Tools

@package regulens
@version 1.0.0
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class RiskCategory(str):
    UNACCEPTABLE = "unacceptable"
    HIGH = "high"
    LIMITED = "limited"
    MINIMAL = "minimal"


class ScanStatus(str):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ComplianceStatus(str):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    NEEDS_REVIEW = "needs_review"


class RegulensClient:
    """
    Main SDK client for interacting with AI Compliance Hub
    """
    
    def __init__(
        self,
        api_key: str,
        endpoint: str = "https://api.regulens.dev",
        max_retries: int = 3
    ):
        """
        Initialize the Regulens client.
        
        Args:
            api_key: Your API key for authentication
            endpoint: Base URL for the API (default: https://api.regulens.dev)
            max_retries: Maximum number of retries for failed requests
        """
        self.api_key = api_key
        self.endpoint = endpoint
        
        # Setup session with retry logic
        self.session = requests.Session()
        retry_strategy = Retry(
            total=max_retries,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        })
    
    def _request(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
        """Make an API request with error handling."""
        url = f"{self.endpoint}{path}"
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[Regulens] API Error: {e}")
            raise
    
    def get_articles(self) -> List[Dict[str, Any]]:
        """Get all EU AI Act articles."""
        return self._request("GET", "/compliance/articles")
    
    def get_article(self, article_number: int) -> Dict[str, Any]:
        """Get a specific article by number."""
        return self._request("GET", f"/compliance/articles/{article_number}")
    
    def run_scan(
        self, 
        model_id: str, 
        articles: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Run a compliance scan on a model.
        
        Args:
            model_id: ID of the model to scan
            articles: Optional list of article numbers to scan
            
        Returns:
            Scan information
        """
        data = {
            "modelId": model_id,
        }
        if articles:
            data["articles"] = articles
        
        return self._request("POST", "/compliance/scans", json=data)
    
    def get_scan_results(self, scan_id: str) -> Dict[str, Any]:
        """Get scan results."""
        return self._request("GET", f"/compliance/scans/{scan_id}")
    
    def list_scans(self) -> List[Dict[str, Any]]:
        """List all scans."""
        return self._request("GET", "/compliance/scans")
    
    def register_model(
        self, 
        name: str, 
        version: str, 
        risk_category: str
    ) -> Dict[str, Any]:
        """
        Register a model for compliance tracking.
        
        Args:
            name: Model name
            version: Model version
            risk_category: Risk category (unacceptable, high, limited, minimal)
            
        Returns:
            Model information
        """
        return self._request("POST", "/models", json={
            "name": name,
            "version": version,
            "riskCategory": risk_category,
        })
    
    def get_model(self, model_id: str) -> Dict[str, Any]:
        """Get model information."""
        return self._request("GET", f"/models/{model_id}")
    
    def list_models(self) -> List[Dict[str, Any]]:
        """List all registered models."""
        return self._request("GET", "/models")
    
    def update_training_data(
        self, 
        model_id: str, 
        training_data: Dict[str, Any]
    ) -> None:
        """Update model training data info."""
        self._request(
            "PATCH", 
            f"/models/{model_id}/training-data", 
            json=training_data
        )
    
    def configure_integration(self, config: Dict[str, Any]) -> None:
        """Configure an integration."""
        self._request("POST", "/integrations", json=config)
    
    def list_integrations(self) -> List[Dict[str, Any]]:
        """List all integrations."""
        return self._request("GET", "/integrations")
    
    def test_integration(self, integration_id: str) -> Dict[str, Any]:
        """Test an integration."""
        return self._request("POST", f"/integrations/{integration_id}/test")
    
    def generate_report(self, model_id: str) -> Dict[str, Any]:
        """Generate a compliance report."""
        return self._request("POST", "/reports/generate", json={"modelId": model_id})
    
    def get_compliance_summary(self) -> Dict[str, Any]:
        """Get compliance summary dashboard."""
        return self._request("GET", "/compliance/summary")
    
    def get_risk_assessment(self, model_id: str) -> Dict[str, Any]:
        """Get risk assessment for a model."""
        return self._request("GET", f"/models/{model_id}/risk-assessment")


def create_client(
    api_key: str,
    endpoint: str = "https://api.regulens.dev"
) -> RegulensClient:
    """Convenience function to create a Regulens client."""
    return RegulensClient(api_key, endpoint)
