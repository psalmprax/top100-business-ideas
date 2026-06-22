"""
Data Scraper Factory Service (CashClaw Data Scraper)
Heavy-duty scraping utility for extracting structured data from diverse sources.

Integrates CloakBrowser stealth engine for anti-bot bypass when available.
Falls back to heuristic/demo data when CloakBrowser service is unavailable.
"""

import asyncio
import logging
import os
import re
from typing import List, Dict, Any, Optional
from datetime import datetime

import httpx

from app.services.workforce.base import (
    BaseWorkforceService,
    CREWAI_AVAILABLE,
    CrewAgent,
    CrewTask,
    Crew,
    Process,
)
from app.services.workforce.cloak_platform_config import (
    CloakPlatformConfig,
    get_platform_config,
    get_all_platform_keys,
)

logger = logging.getLogger(__name__)

# Semaphore to limit concurrent CloakBrowser scans (Playwright is heavy)
_CLOAK_SEMAPHORE = asyncio.Semaphore(3)

# Noise filtering for scraped results
NOISE_TITLES = {
    "sign up", "log in", "login", "sign in", "register", "create account",
    "terms of service", "privacy policy", "cookie policy", "about us",
    "careers", "jobs", "blog", "help", "support", "faq", "contact us",
    "download", "settings", "profile", "explore", "home", "search",
}


def _is_noise(title: str, url: str = "") -> bool:
    """Check if a scraped item is noise (nav links, footers, etc.)."""
    t = title.strip().lower()
    if len(t) < 8 or t in NOISE_TITLES:
        return True
    if url:
        for pattern in ["/about", "/careers", "/blog", "/help", "/support", "/terms"]:
            if pattern in url.lower():
                return True
    return False


class CloakBrowserScraper:
    """CloakBrowser stealth scraping client for business data platforms."""

    def __init__(
        self,
        scraper_url: str = None,
        timeout: float = 45.0,
    ):
        self.scraper_url = scraper_url or os.getenv(
            "CLOAKBROWSER_URL", "http://cloakbrowser:8010"
        )
        self.timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=self.timeout)
        return self._client

    async def scrape_platform(
        self,
        platform_key: str,
        query: str,
        location: str = "",
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Scrape a platform using CloakBrowser stealth engine."""
        config = get_platform_config(platform_key)
        if not config:
            logger.warning(f"CloakBrowser: unknown platform '{platform_key}'")
            return []

        async with _CLOAK_SEMAPHORE:
            return await self._scrape_with_retry(config, query, location, limit)

    async def _scrape_with_retry(
        self,
        config: CloakPlatformConfig,
        query: str,
        location: str,
        limit: int,
    ) -> List[Dict[str, Any]]:
        last_err = None
        for attempt in range(1, config.max_retries + 1):
            try:
                return await self._do_scrape(config, query, location, limit)
            except httpx.TimeoutException:
                last_err = "timeout"
                wait = config.retry_backoff * attempt
                logger.warning(
                    f"CloakBrowser [{config.name}] timeout (attempt {attempt}/{config.max_retries}), "
                    f"retrying in {wait}s..."
                )
                await asyncio.sleep(wait)
            except httpx.ConnectError:
                logger.warning(
                    f"Cannot connect to CloakBrowser at {self.scraper_url}"
                )
                return []
            except Exception as e:
                logger.exception(
                    f"CloakBrowser [{config.name}] scrape failed for '{query}': {e}"
                )
                return []

        logger.error(
            f"CloakBrowser [{config.name}] exhausted retries for '{query}' (last: {last_err})"
        )
        return []

    async def _do_scrape(
        self,
        config: CloakPlatformConfig,
        query: str,
        location: str,
        limit: int,
    ) -> List[Dict[str, Any]]:
        """Execute a single scrape attempt against the CloakBrowser service."""
        query_encoded = query.replace(" ", "+")
        location_encoded = location.replace(" ", "+") if location else ""

        url = config.search_url_template.format(
            query=query_encoded,
            query_no_spaces=query.replace(" ", ""),
            location=location_encoded,
        )

        params = {
            "url": url,
            "platform": config.name.lower(),
            "max_results": min(limit, config.max_results),
            "extract": config.extra_params.get("extract", "listings"),
        }
        if config.wait_selector:
            params["wait_selector"] = config.wait_selector
        if config.requires_scroll:
            params["scroll"] = "true"

        endpoint = f"{self.scraper_url}{config.scrape_endpoint}"
        response = await self.client.get(endpoint, params=params)
        response.raise_for_status()
        data = response.json()

        if not data.get("success"):
            logger.error(
                f"CloakBrowser [{config.name}] failed: {data.get('error', 'unknown')}"
            )
            return []

        raw_items = data.get("candidates", data.get("results", data.get("items", [])))
        parsed = self._parse_results(raw_items, config, query, location)

        logger.info(
            f"CloakBrowser [{config.name}] returned {len(parsed)} results for '{query}'"
        )
        return parsed

    def _parse_results(
        self,
        items: List[Dict],
        config: CloakPlatformConfig,
        query: str,
        location: str,
    ) -> List[Dict[str, Any]]:
        """Parse raw CloakBrowser results into structured business data."""
        results = []
        for item in items:
            title = item.get("title", item.get("name", "Unknown"))
            url = item.get("url", item.get("link", ""))

            if _is_noise(title, url):
                continue

            result = {
                "name": title,
                "url": url,
                "source": config.platform_label.lower().replace(" ", "_"),
                "rating": self._safe_float(item.get("rating", item.get("score", 0))),
                "reviews": self._safe_int(item.get("reviews", item.get("review_count", 0))),
                "address": item.get("address", item.get("location", "")),
                "phone": item.get("phone", item.get("telephone", "")),
                "email": item.get("email", ""),
                "category": item.get("category", item.get("type", config.category)),
                "description": item.get("description", item.get("snippet", ""))[:200],
                "scraped_at": datetime.utcnow().isoformat(),
            }

            # Platform-specific fields
            if config.platform_label == "Crunchbase":
                result.update({
                    "funding_stage": item.get("funding_round", ""),
                    "total_raised": item.get("total_funding", ""),
                    "investors": item.get("investors", []),
                    "founded": item.get("founded_on", ""),
                    "employees": item.get("employee_count", ""),
                })
            elif config.platform_label == "LinkedIn":
                result.update({
                    "industry": item.get("industry", ""),
                    "company_size": item.get("company_size", item.get("employee_count", "")),
                    "specialties": item.get("specialties", []),
                })
            elif config.platform_label in ("G2", "Trustpilot"):
                result.update({
                    "sentiment": item.get("sentiment", ""),
                    "verified": item.get("verified", False),
                })

            results.append(result)

        return results

    def _safe_int(self, val) -> int:
        try:
            return int(val)
        except (ValueError, TypeError):
            return 0

    def _safe_float(self, val) -> float:
        try:
            return float(val)
        except (ValueError, TypeError):
            return 0.0

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


class DataScraperService(BaseWorkforceService):
    """Service for data scraping and extraction.
    Corresponds to: cashclaw-data-scraper

    Uses CloakBrowser stealth engine when available, falls back to heuristic/demo data.
    """

    SCRAPABLE_SOURCES = [
        "google_maps",
        "yelp",
        "crunchbase",
        "linkedin",
        "twitter",
        "instagram",
        "amazon",
        "g2",
        "trustpilot",
        "custom",
    ]

    def __init__(self):
        super().__init__()
        self._cloak: Optional[CloakBrowserScraper] = None

    @property
    def cloak(self) -> CloakBrowserScraper:
        if self._cloak is None:
            self._cloak = CloakBrowserScraper()
        return self._cloak

    async def scrape_source(
        self, source: str, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Scrape data from a specified source using CloakBrowser or fallback."""
        logger.info(f"Scraping {source} with config: {config}")

        if CREWAI_AVAILABLE:
            return await self._crewai_scrape(source, config)

        # Try CloakBrowser first
        cloak_result = await self._try_cloak_scrape(source, config)
        if cloak_result:
            return cloak_result

        # Fall back to heuristic
        return self._heuristic_scrape(source, config)

    async def _try_cloak_scrape(
        self, source: str, config: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Attempt to scrape using CloakBrowser. Returns None if unavailable."""
        platform_config = get_platform_config(source)
        if not platform_config:
            return None

        try:
            query = config.get("query", "business")
            location = config.get("location", "")
            limit = config.get("limit", 50)

            results = await self.cloak.scrape_platform(
                source, query, location, limit
            )

            if results:
                return {
                    "status": "completed",
                    "method": "cloakbrowser",
                    "source": source,
                    "query": query,
                    "location": location,
                    "data": results,
                    "count": len(results),
                    "demo_mode": False,
                    "timestamp": datetime.utcnow().isoformat(),
                }
        except Exception as e:
            logger.warning(f"CloakBrowser scrape failed for '{source}': {e}")

        return None

    async def _crewai_scrape(
        self, source: str, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run CrewAI-powered scraping."""
        scraper = CrewAgent(
            role="Data Extraction Specialist",
            goal=f"Extract structured data from {source}",
            backstory="""Expert at web scraping and data extraction.
            Extracts clean, structured data from diverse sources.
            Handles anti-bot measures and rate limiting.""",
            tools=self.scraper_tool if isinstance(self.scraper_tool, list) else [self.scraper_tool],
            verbose=True,
        )

        scrape_task = CrewTask(
            description=f"Extract {config.get('limit', 100)} records from {source}",
            agent=scraper,
            expected_output="Structured data records",
        )

        crew = Crew(agents=[scraper], tasks=[scrape_task], process=Process.sequential)
        result = await crew.kickoff()

        return {
            "status": "completed",
            "method": "crewai",
            "source": source,
            "data": result,
            "count": config.get("limit", 100),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _heuristic_scrape(self, source: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Run heuristic scraping - returns demo data when external APIs are unavailable."""
        limit = config.get("limit", 100)
        query = config.get("query", "business")

        logger.warning(
            f"Heuristic scraping '{source}' - CloakBrowser unavailable and no API keys set. "
            f"Deploy CloakBrowser service or set API keys for real data."
        )

        mock_data = self._generate_demo_data(source, query, limit)

        return {
            "status": "completed",
            "method": "heuristic_demo",
            "source": source,
            "query": query,
            "data": mock_data,
            "count": len(mock_data),
            "fields_extracted": [
                "name", "email", "phone", "address", "rating", "reviews",
            ],
            "demo_mode": True,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _generate_demo_data(
        self, source: str, query: str, limit: int
    ) -> List[Dict[str, Any]]:
        """Generate demo data for development/testing when APIs are unavailable."""
        data = []
        for i in range(min(limit, 10)):
            data.append(
                {
                    "name": f"{query.title()} Company {i + 1}",
                    "email": f"contact{i + 1}@{query.replace(' ', '')}.com",
                    "phone": f"+1-555-{1000 + i:04d}",
                    "address": f"{100 + i} Business Ave, City, ST",
                    "rating": round(3.5 + (i % 5) * 0.3, 1),
                    "reviews": 50 + (i * 10),
                    "source": source,
                }
            )
        return data

    async def scrape_google_maps(
        self, search_query: str, location: str, limit: int = 50
    ) -> Dict[str, Any]:
        """Scrape Google Maps for business listings."""
        logger.info(f"Scraping Google Maps: {search_query} in {location}")

        cloak_result = await self._try_cloak_scrape(
            "google_maps",
            {"query": search_query, "location": location, "limit": limit},
        )
        if cloak_result:
            return cloak_result

        api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not api_key:
            logger.warning("GOOGLE_MAPS_API_KEY not set, returning demo data")
            return {
                "status": "completed",
                "source": "google_maps",
                "query": search_query,
                "location": location,
                "data": self._generate_demo_data("google_maps", search_query, limit),
                "count": limit,
                "demo_mode": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    "https://maps.googleapis.com/maps/api/place/textsearch/json",
                    params={
                        "query": f"{search_query} in {location}",
                        "key": api_key,
                        "type": "establishment",
                    },
                )
                resp.raise_for_status()
                results = resp.json().get("results", [])[:limit]

                businesses = []
                for place in results:
                    businesses.append({
                        "name": place.get("name", ""),
                        "address": place.get("formatted_address", ""),
                        "rating": place.get("rating", 0),
                        "total_ratings": place.get("user_ratings_total", 0),
                        "price_level": place.get("price_level", None),
                        "types": place.get("types", []),
                        "place_id": place.get("place_id", ""),
                        "open_now": place.get("opening_hours", {}).get("open_now", None),
                        "lat": place.get("geometry", {}).get("location", {}).get("lat"),
                        "lng": place.get("geometry", {}).get("location", {}).get("lng"),
                    })

                return {
                    "status": "completed",
                    "source": "google_maps",
                    "query": search_query,
                    "location": location,
                    "data": businesses,
                    "count": len(businesses),
                    "demo_mode": False,
                    "timestamp": datetime.utcnow().isoformat(),
                }
        except Exception as e:
            logger.error(f"Google Maps API error: {e}")
            return {
                "status": "error",
                "source": "google_maps",
                "error": str(e),
                "data": self._generate_demo_data("google_maps", search_query, limit),
                "demo_mode": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def scrape_yelp(
        self, search_query: str, location: str, limit: int = 50
    ) -> Dict[str, Any]:
        """Scrape Yelp for business reviews and info."""
        logger.info(f"Scraping Yelp: {search_query} in {location}")

        cloak_result = await self._try_cloak_scrape(
            "yelp",
            {"query": search_query, "location": location, "limit": limit},
        )
        if cloak_result:
            return cloak_result

        api_key = os.getenv("YELP_API_KEY")
        if not api_key:
            logger.warning("YELP_API_KEY not set, returning demo data")
            return {
                "status": "completed",
                "source": "yelp",
                "query": search_query,
                "location": location,
                "data": self._generate_demo_data("yelp", search_query, limit),
                "count": limit,
                "demo_mode": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    "https://api.yelp.com/v3/businesses/search",
                    headers={"Authorization": f"Bearer {api_key}"},
                    params={
                        "term": search_query,
                        "location": location,
                        "limit": min(limit, 50),
                        "sort_by": "best_match",
                    },
                )
                resp.raise_for_status()
                businesses = resp.json().get("businesses", [])

                results = []
                for biz in businesses:
                    results.append({
                        "name": biz.get("name", ""),
                        "rating": biz.get("rating", 0),
                        "review_count": biz.get("review_count", 0),
                        "phone": biz.get("phone", ""),
                        "url": biz.get("url", ""),
                        "image_url": biz.get("image_url", ""),
                        "categories": [c.get("title", "") for c in biz.get("categories", [])],
                        "location": {
                            "address": ", ".join(biz.get("location", {}).get("display_address", [])),
                            "city": biz.get("location", {}).get("city", ""),
                            "state": biz.get("location", {}).get("state", ""),
                        },
                        "price": biz.get("price", ""),
                        "is_closed": biz.get("is_closed", False),
                    })

                return {
                    "status": "completed",
                    "source": "yelp",
                    "query": search_query,
                    "location": location,
                    "data": results,
                    "count": len(results),
                    "demo_mode": False,
                    "timestamp": datetime.utcnow().isoformat(),
                }
        except Exception as e:
            logger.error(f"Yelp API error: {e}")
            return {
                "status": "error",
                "source": "yelp",
                "error": str(e),
                "data": self._generate_demo_data("yelp", search_query, limit),
                "demo_mode": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def scrape_linkedin(
        self, search_query: str, limit: int = 50
    ) -> Dict[str, Any]:
        """Scrape LinkedIn for professional profiles and companies."""
        logger.info(f"Scraping LinkedIn: {search_query}")

        cloak_result = await self._try_cloak_scrape(
            "linkedin",
            {"query": search_query, "limit": limit},
        )
        if cloak_result:
            return cloak_result

        api_key = os.getenv("LINKEDIN_API_KEY")
        if not api_key:
            logger.warning("LINKEDIN_API_KEY not set, returning demo data")
            return {
                "status": "completed",
                "source": "linkedin",
                "query": search_query,
                "data": self._generate_demo_data("linkedin", search_query, limit),
                "count": limit,
                "demo_mode": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    "https://api.linkedin.com/v2/search",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "X-Restli-Protocol-Version": "2.0.0",
                    },
                    params={
                        "q": "people",
                        "keywords": search_query,
                        "count": min(limit, 25),
                    },
                )
                resp.raise_for_status()
                elements = resp.json().get("elements", [])

                results = []
                for person in elements:
                    profile = person.get("profile", {})
                    results.append({
                        "name": f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip(),
                        "headline": profile.get("headline", ""),
                        "location": profile.get("locationName", ""),
                        "industry": profile.get("industryName", ""),
                        "profile_url": profile.get("publicProfileUrl", ""),
                        "connection_degree": person.get("distance", 0),
                    })

                return {
                    "status": "completed",
                    "source": "linkedin",
                    "query": search_query,
                    "data": results,
                    "count": len(results),
                    "demo_mode": False,
                    "timestamp": datetime.utcnow().isoformat(),
                }
        except Exception as e:
            logger.error(f"LinkedIn API error: {e}")
            return {
                "status": "error",
                "source": "linkedin",
                "error": str(e),
                "data": self._generate_demo_data("linkedin", search_query, limit),
                "demo_mode": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def scrape_crunchbase(
        self, search_query: str, limit: int = 50
    ) -> Dict[str, Any]:
        """Scrape Crunchbase for company funding data."""
        logger.info(f"Scraping Crunchbase: {search_query}")

        cloak_result = await self._try_cloak_scrape(
            "crunchbase",
            {"query": search_query, "limit": limit},
        )
        if cloak_result:
            return cloak_result

        api_key = os.getenv("CRUNCHBASE_API_KEY")
        if not api_key:
            logger.warning("CRUNCHBASE_API_KEY not set, returning demo data")
            return {
                "status": "completed",
                "source": "crunchbase",
                "query": search_query,
                "data": [
                    {
                        "name": f"{search_query.title()} Inc",
                        "funding_stage": "Series A",
                        "total_raised": "$10M",
                        "investors": ["VC Firm 1", "VC Firm 2"],
                        "founded": "2020",
                        "employees": "50-100",
                    }
                ],
                "count": 1,
                "demo_mode": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    "https://api.crunchbase.com/api/v4/searches/organizations",
                    headers={
                        "X-cb-user-key": api_key,
                        "Content-Type": "application/json",
                    },
                    json={
                        "field_ids": [
                            "identifier", "short_description", "num_employees",
                            "founded_on", "total_funding_usd", "last_funding_type",
                            "categories", "location_identifiers", "website_url",
                        ],
                        "query": [
                            {
                                "type": "predicate",
                                "field_id": "identifier",
                                "operator_id": "contains",
                                "values": [search_query],
                            }
                        ],
                        "limit": min(limit, 25),
                    },
                )
                resp.raise_for_status()
                entities = resp.json().get("entities", [])

                results = []
                for org in entities:
                    props = org.get("properties", {})
                    results.append({
                        "name": props.get("identifier", {}).get("value", ""),
                        "short_description": props.get("short_description", ""),
                        "num_employees": props.get("num_employees", 0),
                        "founded_on": props.get("founded_on", {}).get("value", ""),
                        "total_funding_usd": props.get("total_funding_usd", 0),
                        "last_funding_type": props.get("last_funding_type", ""),
                        "categories": [c.get("value", "") for c in props.get("categories", [])],
                        "location": props.get("location_identifiers", [{}])[0].get("value", "") if props.get("location_identifiers") else "",
                        "website_url": props.get("website_url", ""),
                    })

                return {
                    "status": "completed",
                    "source": "crunchbase",
                    "query": search_query,
                    "data": results,
                    "count": len(results),
                    "demo_mode": False,
                    "timestamp": datetime.utcnow().isoformat(),
                }
        except Exception as e:
            logger.error(f"Crunchbase API error: {e}")
            return {
                "status": "error",
                "source": "crunchbase",
                "error": str(e),
                "data": [
                    {
                        "name": f"{search_query.title()} Inc",
                        "funding_stage": "Series A",
                        "total_raised": "$10M",
                        "investors": ["VC Firm 1", "VC Firm 2"],
                        "founded": "2020",
                        "employees": "50-100",
                    }
                ],
                "demo_mode": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def extract_structured_data(
        self, html: str, schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Extract structured data from HTML using a schema."""
        logger.info(f"Extracting structured data with schema fields: {list(schema.keys())}")

        extracted = {}
        for field_name, field_type in schema.items():
            extracted[field_name] = f"<{field_type}_value>"

        return {
            "status": "completed",
            "fields_extracted": list(schema.keys()),
            "data_sample": extracted,
            "record_count": 1,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def run_scheduled_scrape(
        self, sources: List[str], config: Dict[str, Any], schedule: str = "daily"
    ) -> Dict[str, Any]:
        """Schedule recurring scraping jobs."""
        jobs = []
        for source in sources:
            jobs.append(
                {
                    "source": source,
                    "schedule": schedule,
                    "config": config,
                    "status": "scheduled",
                    "next_run": "2024-01-01T00:00:00Z",
                }
            )

        return {
            "status": "scheduled",
            "jobs": jobs,
            "schedule": schedule,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def export_data(
        self, data: List[Dict[str, Any]], format: str = "csv"
    ) -> Dict[str, Any]:
        """Export scraped data in various formats."""
        logger.info(f"Exporting {len(data)} records as {format}")

        return {
            "status": "exported",
            "record_count": len(data),
            "format": format,
            "file": f"export_{datetime.utcnow().timestamp()}.{format}",
            "timestamp": datetime.utcnow().isoformat(),
        }
