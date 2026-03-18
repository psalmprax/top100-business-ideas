"""
LivenessLink Deepfake Defense SDK
Biometric Authentication & Fraud Prevention

@package livenesslink
@version 1.0.0
"""

import base64
import io
from datetime import datetime
from typing import Any, BinaryIO, Dict, List, Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class LivenessLinkClient:
    """
    Main SDK client for interacting with Deepfake Defense
    """
    
    def __init__(
        self,
        api_key: str,
        endpoint: str = "https://api.livenesslink.dev",
        max_retries: int = 3
    ):
        """
        Initialize the LivenessLink client.
        
        Args:
            api_key: Your API key for authentication
            endpoint: Base URL for the API (default: https://api.livenesslink.dev)
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
        })
    
    def _request(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
        """Make an API request with error handling."""
        url = f"{self.endpoint}{path}"
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[LivenessLink] API Error: {e}")
            raise
    
    def _prepare_file(self, file_data: Any) -> Dict[str, Any]:
        """Prepare file data for upload."""
        if isinstance(file_data, str):
            # Base64 encoded string
            return base64.b64decode(file_data)
        elif isinstance(file_data, bytes):
            return file_data
        elif hasattr(file_data, 'read'):
            # File-like object
            return file_data.read()
        else:
            raise ValueError("Invalid file data type")
    
    def create_liveness_session(self) -> Dict[str, Any]:
        """Create a new liveness session."""
        return self._request("POST", "/liveness/sessions")
    
    def submit_liveness_proof(
        self, 
        session_id: str, 
        image_data: Any
    ) -> Dict[str, Any]:
        """
        Submit liveness proof (image/video).
        
        Args:
            session_id: Session ID from create_liveness_session
            image_data: Image data (bytes, base64 string, or file-like object)
            
        Returns:
            Liveness verification result
        """
        files = {"image": self._prepare_file(image_data)}
        return self._request(
            "POST", 
            f"/liveness/sessions/{session_id}/verify",
            files=files
        )
    
    def get_liveness_result(self, session_id: str) -> Dict[str, Any]:
        """Get liveness session result."""
        return self._request("GET", f"/liveness/sessions/{session_id}")
    
    def create_verification_session(self, user_id: str) -> Dict[str, Any]:
        """Create a verification session."""
        return self._request("POST", "/verification/sessions", json={"userId": user_id})
    
    def submit_verification(
        self, 
        session_id: str, 
        selfie_data: Any, 
        document_data: Any
    ) -> Dict[str, Any]:
        """
        Submit verification data (selfie + document).
        
        Args:
            session_id: Session ID from create_verification_session
            selfie_data: Selfie image data
            document_data: Document image data
            
        Returns:
            Verification result
        """
        files = {
            "selfie": self._prepare_file(selfie_data),
            "document": self._prepare_file(document_data),
        }
        return self._request(
            "POST", 
            f"/verification/sessions/{session_id}/verify",
            files=files
        )
    
    def get_verification_result(self, session_id: str) -> Dict[str, Any]:
        """Get verification result."""
        return self._request("GET", f"/verification/sessions/{session_id}")
    
    def enroll_biometric(
        self, 
        user_id: str, 
        biometric_type: str, 
        biometric_data: Any
    ) -> Dict[str, Any]:
        """
        Enroll user biometric.
        
        Args:
            user_id: User ID
            biometric_type: Type (face, voice, iris)
            biometric_data: Biometric data
            
        Returns:
            Biometric template information
        """
        files = {"biometric": self._prepare_file(biometric_data)}
        return self._request(
            "POST", 
            f"/biometrics/{user_id}/enroll",
            files=files,
            params={"type": biometric_type}
        )
    
    def get_biometric_templates(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's biometric templates."""
        return self._request("GET", f"/biometrics/{user_id}")
    
    def delete_biometric_template(
        self, 
        user_id: str, 
        template_id: str
    ) -> None:
        """Delete a biometric template."""
        self._request("DELETE", f"/biometrics/{user_id}/{template_id}")
    
    def get_fraud_alerts(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        severity: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get fraud alerts."""
        params = {}
        if start_date:
            params["startDate"] = start_date.isoformat()
        if end_date:
            params["endDate"] = end_date.isoformat()
        if severity:
            params["severity"] = severity
        return self._request("GET", "/fraud/alerts", params=params)
    
    def get_analytics_summary(self) -> Dict[str, Any]:
        """Get analytics summary."""
        return self._request("GET", "/analytics/summary")
    
    def get_verification_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get verification history for a user."""
        return self._request("GET", f"/verification/history/{user_id}")
    
    def configure_webhook(self, url: str, events: List[str]) -> None:
        """Configure webhook."""
        self._request("POST", "/webhooks", json={"url": url, "events": events})
    
    def test_webhook(self, webhook_id: str) -> Dict[str, Any]:
        """Test a webhook."""
        return self._request("POST", f"/webhooks/{webhook_id}/test")


def create_client(
    api_key: str,
    endpoint: str = "https://api.livenesslink.dev"
) -> LivenessLinkClient:
    """Convenience function to create a LivenessLink client."""
    return LivenessLinkClient(api_key, endpoint)
