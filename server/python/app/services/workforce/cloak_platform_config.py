"""
CloakBrowser Platform Configuration for Data Scraper

Defines how each business data platform should be scraped via the CloakBrowser stealth engine.
Each platform has its own search URL patterns, data extraction strategies, and parsing rules.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class CloakPlatformConfig:
    """Configuration for a single platform's CloakBrowser scraping."""

    name: str
    id_prefix: str
    platform_label: str
    search_url_template: str
    scrape_endpoint: str = "/scrape/generic"
    timeout: float = 45.0
    max_results: int = 50
    max_retries: int = 2
    retry_backoff: float = 2.0
    category: str = "business"
    requires_scroll: bool = False
    wait_selector: Optional[str] = None
    extra_params: dict = field(default_factory=dict)


CLOAK_PLATFORMS: dict[str, CloakPlatformConfig] = {
    "google_maps": CloakPlatformConfig(
        name="Google Maps",
        id_prefix="cloak_gm",
        platform_label="Google Maps",
        search_url_template="https://www.google.com/maps/search/{query}/@{location}",
        scrape_endpoint="/scrape/generic",
        timeout=60.0,
        max_results=50,
        category="business",
        requires_scroll=True,
        wait_selector="[data-result-index]",
        extra_params={"extract": "listings"},
    ),
    "yelp": CloakPlatformConfig(
        name="Yelp",
        id_prefix="cloak_yp",
        platform_label="Yelp",
        search_url_template="https://www.yelp.com/search?find_desc={query}&find_loc={location}",
        scrape_endpoint="/scrape/generic",
        timeout=45.0,
        max_results=50,
        category="reviews",
        requires_scroll=True,
        wait_selector="[class*='businessName']",
        extra_params={"extract": "listings"},
    ),
    "linkedin": CloakPlatformConfig(
        name="LinkedIn",
        id_prefix="cloak_li",
        platform_label="LinkedIn",
        search_url_template="https://www.linkedin.com/search/results/companies/?keywords={query}",
        scrape_endpoint="/scrape/generic",
        timeout=40.0,
        max_results=50,
        category="professional",
        requires_scroll=True,
        wait_selector="[class*='entity-result']",
        extra_params={"extract": "listings"},
    ),
    "crunchbase": CloakPlatformConfig(
        name="Crunchbase",
        id_prefix="cloak_cb",
        platform_label="Crunchbase",
        search_url_template="https://www.crunchbase.com/textsearch?q={query}",
        scrape_endpoint="/scrape/generic",
        timeout=45.0,
        max_results=50,
        category="funding",
        requires_scroll=True,
        wait_selector="[class*='company-name']",
        extra_params={"extract": "listings"},
    ),
    "g2": CloakPlatformConfig(
        name="G2",
        id_prefix="cloak_g2",
        platform_label="G2",
        search_url_template="https://www.g2.com/search?query={query}",
        scrape_endpoint="/scrape/generic",
        timeout=40.0,
        max_results=50,
        category="reviews",
        requires_scroll=True,
        wait_selector="[class*='product-listing']",
        extra_params={"extract": "listings"},
    ),
    "trustpilot": CloakPlatformConfig(
        name="Trustpilot",
        id_prefix="cloak_tp",
        platform_label="Trustpilot",
        search_url_template="https://www.trustpilot.com/search?query={query}",
        scrape_endpoint="/scrape/generic",
        timeout=40.0,
        max_results=50,
        category="reviews",
        requires_scroll=True,
        wait_selector="[class*='companyCard']",
        extra_params={"extract": "listings"},
    ),
}


def get_platform_config(platform: str) -> Optional[CloakPlatformConfig]:
    """Retrieve a platform config by key."""
    return CLOAK_PLATFORMS.get(platform.lower())


def get_all_platform_keys() -> list[str]:
    """Return all available platform keys."""
    return list(CLOAK_PLATFORMS.keys())
