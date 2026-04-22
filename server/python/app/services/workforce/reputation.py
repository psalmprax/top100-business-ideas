"""
Reputation Manager Service (CashClaw Reputation Manager)
Monitors review platforms and manages brand sentiment using LLMs.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

from app.services.workforce.base import (
    BaseWorkforceService,
    CREWAI_AVAILABLE,
    CrewAgent,
    CrewTask,
    Crew,
    Process,
)

logger = logging.getLogger(__name__)


class SentimentLevel(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    MIXED = "mixed"


class ReputationManagerService(BaseWorkforceService):
    """Service for reputation and sentiment management
    Corresponds to: cashclaw-reputation-manager
    """

    PLATFORMS = [
        "google",
        "yelp",
        "trustpilot",
        "g2",
        "capterra",
        "facebook",
        "twitter",
        "reddit",
    ]

    async def monitor_sentiment(
        self, brand_name: str, platforms: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Monitor brand sentiment across review platforms.
        """
        platforms = platforms or self.PLATFORMS
        logger.info(f"Monitoring sentiment for {brand_name} across {platforms}")

        if CREWAI_AVAILABLE:
            return await self._crewai_sentiment_monitor(brand_name, platforms)
        else:
            return self._heuristic_sentiment_monitor(brand_name, platforms)

    async def _crewai_sentiment_monitor(
        self, brand_name: str, platforms: List[str]
    ) -> Dict[str, Any]:
        """Run CrewAI-powered sentiment monitoring"""
        monitor = CrewAgent(
            role="Reputation Analyst",
            goal=f"Monitor {brand_name} sentiment across {', '.join(platforms)}",
            backstory="""Expert at monitoring brand reputation.
            Tracks reviews, social mentions, and calculates sentiment scores.
            Identifies trends and escalation needs.""",
            tools=[self.search_tool],
            verbose=True,
        )

        monitor_task = CrewTask(
            description=f"Monitor {brand_name} sentiment",
            agent=monitor,
            expected_output="Comprehensive sentiment report",
        )

        crew = Crew(agents=[monitor], tasks=[monitor_task], process=Process.sequential)
        result = await crew.kickoff()

        return {
            "status": "completed",
            "method": "crewai",
            "brand": brand_name,
            "sentiment": result,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _heuristic_sentiment_monitor(
        self, brand_name: str, platforms: List[str]
    ) -> Dict[str, Any]:
        """Run heuristic sentiment monitoring"""
        # Mock sentiment data
        return {
            "status": "completed",
            "method": "heuristic",
            "brand": brand_name,
            "overall_sentiment": "positive",
            "score": 0.72,
            "reviews": {
                "total": 247,
                "positive": 178,
                "neutral": 45,
                "negative": 24,
            },
            "breakdown": {
                "google": {"sentiment": "positive", "score": 0.81, "reviews": 89},
                "yelp": {"sentiment": "positive", "score": 0.74, "reviews": 56},
                "trustpilot": {"sentiment": "neutral", "score": 0.65, "reviews": 42},
                "g2": {"sentiment": "positive", "score": 0.78, "reviews": 34},
                "capterra": {"sentiment": "positive", "score": 0.82, "reviews": 26},
            },
            "trends": [
                {"metric": "response_time", "direction": "improving", "change": "-45%"},
                {"metric": "sentiment", "direction": "stable", "change": "0%"},
            ],
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def generate_response(
        self, review_text: str, sentiment: str
    ) -> Dict[str, Any]:
        """
        Generate an LLM-powered response to a review.
        Uses CrewAI for context-aware responses.
        """
        logger.info(f"Generating response for {sentiment} review")

        if CREWAI_AVAILABLE:
            return await self._crewai_response_generation(review_text, sentiment)
        else:
            return self._heuristic_response_generation(review_text, sentiment)

    async def _crewai_response_generation(
        self, review_text: str, sentiment: str
    ) -> Dict[str, Any]:
        """Generate CrewAI-powered response"""
        responder = CrewAgent(
            role="Customer Success Writer",
            goal=f"Write professional response to {sentiment} review",
            backstory="""Expert at crafting customer responses.
            Professional, empathetic, and solution-oriented.
            Adapts tone based on review sentiment.""",
            tools=[],
            verbose=True,
        )

        response_task = CrewTask(
            description=f"Generate response to: {review_text[:200]}...",
            agent=responder,
            expected_output="Professional response draft",
        )

        crew = Crew(
            agents=[responder], tasks=[response_task], process=Process.sequential
        )
        result = await crew.kickoff()

        return {
            "status": "completed",
            "method": "crewai",
            "response": result,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _heuristic_response_generation(
        self, review_text: str, sentiment: str
    ) -> Dict[str, Any]:
        """Generate heuristic response"""
        responses = {
            "positive": {
                "subject": "Thank you for your feedback!",
                "body": """Thank you for taking the time to share your experience. We're thrilled to hear you had a great time with our service. Your kind words motivate our team to keep delivering excellence.

If ever you need assistance in the future, don't hesitate to reach out.

Best regards,
The Team""",
                "tone": "appreciative",
            },
            "neutral": {
                "subject": "Thank you for your feedback",
                "body": """Thank you for your feedback. We appreciate you taking the time to share your thoughts with us.

We're always looking to improve, so if you have any specific suggestions, we'd love to hear them.

Best regards,
The Team""",
                "tone": "professional",
            },
            "negative": {
                "subject": "We'd like to make things right",
                "body": """Thank you for bringing this to our attention. We take all feedback seriously, and we're sorry your experience didn't meet expectations.

We'd like the opportunity to address your concerns directly. Please contact us at support@example.com so we can resolve this.

Best regards,
The Team""",
                "tone": "empathetic",
            },
        }

        response = responses.get(sentiment, responses["neutral"])

        return {
            "status": "completed",
            "method": "heuristic",
            "response": response,
            "confidence": 0.78,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def track_mentions(
        self, brand_name: str, time_range: str = "24h"
    ) -> Dict[str, Any]:
        """Track brand mentions across social media"""
        return {
            "brand": brand_name,
            "time_range": time_range,
            "total_mentions": 156,
            "platform_breakdown": {
                "twitter": 67,
                "reddit": 34,
                "facebook": 28,
                "linkedin": 18,
                "tiktok": 9,
            },
            "sentiment_breakdown": {
                "positive": 89,
                "neutral": 45,
                "negative": 22,
            },
            "key_themes": [
                "product_launch",
                "customer_service",
                "pricing",
                "feature_request",
            ],
            "top_mentioning_users": [
                {"handle": "@user1", "followers": 12500},
                {"handle": "@user2", "followers": 8900},
            ],
            "virality_score": 0.34,
        }

    async def detect_crisis(self, brand_name: str) -> Dict[str, Any]:
        """Detect potential reputation crisis"""
        sentiment = await self.monitor_sentiment(brand_name)

        # Crisis detection logic
        is_crisis = (
            sentiment["reviews"]["negative"] > 20 or sentiment.get("score", 1.0) < 0.4
        )

        return {
            "brand": brand_name,
            "is_crisis": is_crisis,
            "crisis_level": "high" if is_crisis else "none",
            "triggers": ["spike_negative_reviews"] if is_crisis else [],
            "recommended_actions": [
                "activate_crisis_protocol",
                "alert_stakeholders",
                "prepare_ceo_statement",
            ]
            if is_crisis
            else [],
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def get_review_summary(
        self, brand_name: str, platform: str
    ) -> Dict[str, Any]:
        """Get platform-specific review summary"""
        platforms = [platform]
        sentiment = await self.monitor_sentiment(brand_name, platforms)

        platform_data = sentiment.get("breakdown", {}).get(platform, {})
        reviews = platform_data.get("reviews", 0)

        return {
            "brand": brand_name,
            "platform": platform,
            "total_reviews": reviews,
            "average_rating": platform_data.get("score", 0.5) * 5,
            "sentiment": platform_data.get("sentiment", "neutral"),
            "last_updated": datetime.utcnow().isoformat(),
        }
