"""
Growth Tools
Specialized tools for Growth Agents (Search, Scraping, Outreach).
"""

import logging
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

class GrowthTools:
    """Collection of tools for autonomous growth agents"""

    @staticmethod
    async def scrape_website(url: str) -> str:
        """Scrape text content from a URL"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    # Remove script and style elements
                    for script in soup(["script", "style"]):
                        script.decompose()
                    text = soup.get_text()
                    # Clean up whitespace
                    lines = (line.strip() for line in text.splitlines())
                    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                    text = '\n'.join(chunk for chunk in chunks if chunk)
                    return text[:5000] # Limit to 5000 characters
                return f"Error: Status code {response.status_code}"
        except Exception as e:
            logger.error(f"Scraping error for {url}: {e}")
            return f"Error: {e}"

    @staticmethod
    def identify_prospect_signals(text: str) -> List[Dict[str, Any]]:
        """Identify potential sales signals in text with intensity scoring"""
        signals = []
        triggers = [
            {"keyword": "compliance", "score": 0.4, "category": "General"},
            {"keyword": "regulation", "score": 0.5, "category": "General"},
            {"keyword": "EU AI Act", "score": 0.9, "category": "AI Compliance"},
            {"keyword": "ISO 42001", "score": 0.9, "category": "AI Compliance"},
            {"keyword": "deepfake", "score": 0.8, "category": "Deepfake Defense"},
            {"keyword": "synthetic media", "score": 0.7, "category": "Deepfake Defense"},
            {"keyword": "fraud prevention", "score": 0.6, "category": "Security"},
            {"keyword": "biometric", "score": 0.6, "category": "Security"},
            {"keyword": "SEC disclosure", "score": 0.9, "category": "High Profile"},
            {"keyword": "Fortune 500", "score": 1.0, "category": "High Profile"},
            {"keyword": "central bank", "score": 1.0, "category": "High Profile"},
            {"keyword": "government agency", "score": 1.0, "category": "High Profile"},
        ]

        text_lower = text.lower()
        for trigger in triggers:
            if trigger["keyword"].lower() in text_lower:
                signals.append(trigger)
        return signals

# Instances for tools
growth_tools = GrowthTools()
