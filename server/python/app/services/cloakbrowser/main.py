"""
CloakBrowser — Stealth Business Data Scraping Service

Playwright-based headless browser with anti-detection for scraping
Google Maps, Yelp, LinkedIn, Crunchbase, G2, Trustpilot, and custom URLs.

Adapted from ettametta CloakBrowser for business intelligence use cases.
"""

import asyncio
import hashlib
import logging
import re
from contextlib import asynccontextmanager
from typing import Optional
from urllib.parse import urljoin, quote_plus

from fastapi import FastAPI, Query

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cloakbrowser")

# ── Browser Pool ──────────────────────────────────────────────

_browser = None
_playwright = None
_browser_lock = asyncio.Lock()
_scrape_semaphore = asyncio.Semaphore(3)  # Max 3 concurrent scrapes


async def get_browser():
    """Get or create browser with auto-recovery on crash."""
    global _browser, _playwright
    async with _browser_lock:
        if _browser is not None:
            try:
                if _browser.is_connected():
                    return _browser
                else:
                    logger.warning("[CloakBrowser] Browser disconnected, restarting...")
                    await _cleanup_browser()
            except Exception:
                logger.warning("[CloakBrowser] Browser check failed, restarting...")
                await _cleanup_browser()

        from playwright.async_api import async_playwright
        _playwright = await async_playwright().start()
        _browser = await _playwright.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-extensions",
                "--disable-background-networking",
                "--disable-sync",
                "--no-first-run",
                "--no-zygote",
                "--js-flags=--max-old-space-size=256",
            ],
        )
        logger.info("[CloakBrowser] Chromium launched")
        return _browser


async def _cleanup_browser():
    """Safely cleanup browser and playwright."""
    global _browser, _playwright
    try:
        if _browser:
            await _browser.close()
    except Exception:
        pass
    _browser = None
    try:
        if _playwright:
            await _playwright.stop()
    except Exception:
        pass
    _playwright = None


async def close_browser():
    """Shutdown browser on app exit."""
    global _browser
    async with _browser_lock:
        await _cleanup_browser()
    logger.info("[CloakBrowser] Browser closed")


# ── Stealth helpers ───────────────────────────────────────────

STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
Object.defineProperty(navigator, 'plugins', {get: () => [1,2,3,4,5]});
Object.defineProperty(navigator, 'languages', {get: () => ['en-US','en']});
window.chrome = {runtime: {}};
Object.defineProperty(navigator, 'platform', {get: () => 'Win32'});
"""


async def new_stealth_context(browser):
    context = await browser.new_context(
        viewport={"width": 1920, "height": 1080},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        locale="en-US",
        timezone_id="America/New_York",
        java_script_enabled=True,
        ignore_https_errors=True,
    )
    await context.add_init_script(STEALTH_JS)
    return context


async def _safe_close_context(context):
    """Close context without raising on already-closed browser."""
    try:
        await context.close()
    except Exception:
        pass


# ── Noise filtering ──────────────────────────────────────────

NOISE_TITLES = {
    "sign up", "log in", "login", "sign in", "register", "create account",
    "terms of service", "privacy policy", "cookie policy", "about us",
    "careers", "jobs", "blog", "help", "support", "faq", "contact us",
    "download", "settings", "profile", "explore", "home", "search",
    "sign in with google", "sign in with facebook", "forgot password",
}

NOISE_URL_PATTERNS = [
    "/about", "/careers", "/blog", "/help", "/support", "/terms",
    "/privacy", "/cookie", "/legal", "/contact", "/login", "/signup",
]


def is_noise(title: str, url: str = "") -> bool:
    """Check if a scraped item is noise."""
    t = title.strip().lower()
    if len(t) < 5 or t in NOISE_TITLES:
        return True
    if url:
        url_lower = url.lower()
        for pattern in NOISE_URL_PATTERNS:
            if pattern in url_lower:
                return True
    return False


# ── Google Maps Scraper ──────────────────────────────────────

async def scrape_google_maps(
    query: str, location: str = "", max_results: int = 50
) -> list[dict]:
    async with _scrape_semaphore:
        return await _scrape_google_maps_inner(query, location, max_results)


async def _scrape_google_maps_inner(
    query: str, location: str, max_results: int
) -> list[dict]:
    browser = await get_browser()
    context = await new_stealth_context(browser)
    page = await context.new_page()
    results = []

    try:
        search_query = quote_plus(f"{query} {location}".strip())
        url = f"https://www.google.com/maps/search/{search_query}"
        logger.info(f"[GoogleMaps] Scraping: {url}")

        await page.goto(url, wait_until="domcontentloaded", timeout=45000)

        # Wait for results to load
        for selector in ['[role="feed"]', '.Nv2PK', '[data-result-index]']:
            try:
                await page.wait_for_selector(selector, timeout=10000)
                break
            except Exception:
                continue

        await asyncio.sleep(2)

        # Scroll to load more results
        for _ in range(3):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await asyncio.sleep(1.5)

        # Extract business listings
        listings = await page.query_selector_all('.Nv2PK, [role="feed"] > div > div')
        if not listings:
            listings = await page.query_selector_all('a[href*="/maps/place/"]')

        for listing in listings[:max_results]:
            try:
                # Get business name
                name_el = await listing.query_selector('.qBF1Pd, .fontHeadlineSmall, [class*="title"]')
                name = await name_el.inner_text() if name_el else ""
                if not name or is_noise(name):
                    continue

                # Get rating
                rating_el = await listing.query_selector('.MW4etd, [role="img"][aria-label*="star"]')
                rating_text = await rating_el.inner_text() if rating_el else ""
                rating = 0.0
                if rating_text:
                    try:
                        rating = float(re.search(r'[\d.]+', rating_text).group())
                    except (AttributeError, ValueError):
                        pass

                # Get review count
                reviews_el = await listing.query_selector('.UY7F9, [aria-label*="review"]')
                reviews_text = await reviews_el.inner_text() if reviews_el else "0"
                reviews = int(re.sub(r'[^\d]', '', reviews_text) or '0')

                # Get category/type
                category_el = await listing.query_selector('.W4Efsd .W4Efsd span:last-child, [class*="category"]')
                category = await category_el.inner_text() if category_el else ""

                # Get address
                address_el = await listing.query_selector('.W4Efsd span[class*="address"], .Io6YTe')
                address = await address_el.inner_text() if address_el else ""

                # Get phone
                phone_el = await listing.query_selector('[data-item-id="phone"] .Io6YTe, [aria-label*="phone"]')
                phone = await phone_el.inner_text() if phone_el else ""

                # Get link
                link_el = await listing.query_selector('a[href*="/maps/place/"]')
                link = await link_el.get_attribute("href") if link_el else ""

                results.append({
                    "name": name.strip(),
                    "rating": rating,
                    "reviews": reviews,
                    "category": category.strip(),
                    "address": address.strip(),
                    "phone": phone.strip(),
                    "url": link,
                    "source": "google_maps",
                })
            except Exception as e:
                logger.debug(f"[GoogleMaps] Skip item: {e}")
                continue

        logger.info(f"[GoogleMaps] Found {len(results)} businesses for '{query}'")
    except Exception as e:
        logger.error(f"[GoogleMaps] Scrape failed: {e}")
        if "Target page, context or browser has been closed" in str(e):
            async with _browser_lock:
                await _cleanup_browser()
    finally:
        await _safe_close_context(context)

    return results


# ── Yelp Scraper ─────────────────────────────────────────────

async def scrape_yelp(
    query: str, location: str = "", max_results: int = 50
) -> list[dict]:
    async with _scrape_semaphore:
        return await _scrape_yelp_inner(query, location, max_results)


async def _scrape_yelp_inner(
    query: str, location: str, max_results: int
) -> list[dict]:
    browser = await get_browser()
    context = await new_stealth_context(browser)
    page = await context.new_page()
    results = []

    try:
        search_query = quote_plus(query)
        loc_query = quote_plus(location) if location else ""
        url = f"https://www.yelp.com/search?find_desc={search_query}&find_loc={loc_query}"
        logger.info(f"[Yelp] Scraping: {url}")

        await page.goto(url, wait_until="domcontentloaded", timeout=30000)

        # Wait for results
        for selector in ['[class*="businessName"]', '.container__09f24__21w3G', 'h3 a']:
            try:
                await page.wait_for_selector(selector, timeout=10000)
                break
            except Exception:
                continue

        await asyncio.sleep(2)

        # Scroll to load more
        for _ in range(2):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await asyncio.sleep(1.5)

        # Extract business cards
        cards = await page.query_selector_all('[class*="businessName"], .container__09f24__21w3G')
        if not cards:
            cards = await page.query_selector_all('h3 a[href*="/biz/"]')

        for card in cards[:max_results]:
            try:
                # Get name
                name_el = await card.query_selector('a[href*="/biz/"], .css-19v1rkv')
                name = await name_el.inner_text() if name_el else ""
                if not name or is_noise(name):
                    continue

                # Get link
                href = await name_el.get_attribute("href") if name_el else ""
                if href and not href.startswith("http"):
                    href = f"https://www.yelp.com{href}"

                # Get rating
                rating_el = await card.query_selector('[aria-label*="star rating"], .i-stars__09f24__M1AR7')
                rating_text = await rating_el.get_attribute("aria-label") if rating_el else ""
                rating = 0.0
                if rating_text:
                    match = re.search(r'(\d+\.?\d*)', rating_text)
                    if match:
                        rating = float(match.group(1))

                # Get review count
                review_el = await card.query_selector('.css-1h1j0y3, span[class*="reviewCount"]')
                review_text = await review_el.inner_text() if review_el else "0"
                reviews = int(re.sub(r'[^\d]', '', review_text) or '0')

                # Get category
                cat_el = await card.query_selector('.css-11bijt4, [class*="category"]')
                category = await cat_el.inner_text() if cat_el else ""

                # Get address
                addr_el = await card.query_selector('.css-1h1j0y3, address')
                address = await addr_el.inner_text() if addr_el else ""

                results.append({
                    "name": name.strip(),
                    "rating": rating,
                    "reviews": reviews,
                    "category": category.strip(),
                    "address": address.strip(),
                    "url": href,
                    "source": "yelp",
                })
            except Exception as e:
                logger.debug(f"[Yelp] Skip item: {e}")
                continue

        logger.info(f"[Yelp] Found {len(results)} businesses for '{query}'")
    except Exception as e:
        logger.error(f"[Yelp] Scrape failed: {e}")
        if "Target page, context or browser has been closed" in str(e):
            async with _browser_lock:
                await _cleanup_browser()
    finally:
        await _safe_close_context(context)

    return results


# ── LinkedIn Scraper ─────────────────────────────────────────

async def scrape_linkedin(
    query: str, max_results: int = 50
) -> list[dict]:
    async with _scrape_semaphore:
        return await _scrape_linkedin_inner(query, max_results)


async def _scrape_linkedin_inner(query: str, max_results: int) -> list[dict]:
    browser = await get_browser()
    context = await new_stealth_context(browser)
    page = await context.new_page()
    results = []

    try:
        search_query = quote_plus(query)
        url = f"https://www.linkedin.com/search/results/companies/?keywords={search_query}"
        logger.info(f"[LinkedIn] Scraping: {url}")

        await page.goto(url, wait_until="domcontentloaded", timeout=30000)

        # Wait for results
        for selector in ['.entity-result__title-text', '[class*="entity-result"]', '.reusable-search__result-container']:
            try:
                await page.wait_for_selector(selector, timeout=10000)
                break
            except Exception:
                continue

        await asyncio.sleep(2)

        # Scroll to load more
        for _ in range(2):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await asyncio.sleep(1.5)

        # Extract company cards
        cards = await page.query_selector_all('.entity-result, [class*="reusable-search__result-container"] > div')

        for card in cards[:max_results]:
            try:
                # Get company name
                name_el = await card.query_selector('.entity-result__title-text a span, .entity-result__title-text span')
                name = await name_el.inner_text() if name_el else ""
                if not name or is_noise(name):
                    continue

                # Get link
                link_el = await card.query_selector('.entity-result__title-text a')
                href = await link_el.get_attribute("href") if link_el else ""

                # Get industry
                industry_el = await card.query_selector('.entity-result__primary-subtitle, [class*="subline"]')
                industry = await industry_el.inner_text() if industry_el else ""

                # Get location
                location_el = await card.query_selector('.entity-result__secondary-subtitle, [class*="secondary-subtitle"]')
                location = await location_el.inner_text() if location_el else ""

                # Get employee count
                emp_el = await card.query_selector('[class*="entity-result__insights"] span')
                employees = await emp_el.inner_text() if emp_el else ""

                results.append({
                    "name": name.strip(),
                    "industry": industry.strip(),
                    "location": location.strip(),
                    "employees": employees.strip(),
                    "url": href,
                    "source": "linkedin",
                })
            except Exception as e:
                logger.debug(f"[LinkedIn] Skip item: {e}")
                continue

        logger.info(f"[LinkedIn] Found {len(results)} companies for '{query}'")
    except Exception as e:
        logger.error(f"[LinkedIn] Scrape failed: {e}")
        if "Target page, context or browser has been closed" in str(e):
            async with _browser_lock:
                await _cleanup_browser()
    finally:
        await _safe_close_context(context)

    return results


# ── Crunchbase Scraper ───────────────────────────────────────

async def scrape_crunchbase(
    query: str, max_results: int = 50
) -> list[dict]:
    async with _scrape_semaphore:
        return await _scrape_crunchbase_inner(query, max_results)


async def _scrape_crunchbase_inner(query: str, max_results: int) -> list[dict]:
    browser = await get_browser()
    context = await new_stealth_context(browser)
    page = await context.new_page()
    results = []

    try:
        search_query = quote_plus(query)
        url = f"https://www.crunchbase.com/textsearch?q={search_query}"
        logger.info(f"[Crunchbase] Scraping: {url}")

        await page.goto(url, wait_until="domcontentloaded", timeout=30000)

        # Wait for results
        for selector in ['.company-name', '[class*="company-name"]', 'a[href*="/organization/"]']:
            try:
                await page.wait_for_selector(selector, timeout=10000)
                break
            except Exception:
                continue

        await asyncio.sleep(2)

        # Scroll to load more
        for _ in range(2):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await asyncio.sleep(1.5)

        # Extract company cards
        cards = await page.query_selector_all('[class*="search-results"] tr, .company-name')

        for card in cards[:max_results]:
            try:
                # Get company name
                name_el = await card.query_selector('.company-name a, a[href*="/organization/"]')
                name = await name_el.inner_text() if name_el else ""
                if not name or is_noise(name):
                    continue

                # Get link
                href = await name_el.get_attribute("href") if name_el else ""
                if href and not href.startswith("http"):
                    href = f"https://www.crunchbase.com{href}"

                # Get description
                desc_el = await card.query_selector('.description, [class*="description"]')
                description = await desc_el.inner_text() if desc_el else ""

                # Get location
                location_el = await card.query_selector('[class*="location"], td:nth-child(3)')
                location = await location_el.inner_text() if location_el else ""

                # Get category
                cat_el = await card.query_selector('[class*="category"], td:nth-child(4)')
                category = await cat_el.inner_text() if cat_el else ""

                results.append({
                    "name": name.strip(),
                    "description": description.strip()[:200],
                    "location": location.strip(),
                    "category": category.strip(),
                    "url": href,
                    "source": "crunchbase",
                })
            except Exception as e:
                logger.debug(f"[Crunchbase] Skip item: {e}")
                continue

        logger.info(f"[Crunchbase] Found {len(results)} companies for '{query}'")
    except Exception as e:
        logger.error(f"[Crunchbase] Scrape failed: {e}")
        if "Target page, context or browser has been closed" in str(e):
            async with _browser_lock:
                await _cleanup_browser()
    finally:
        await _safe_close_context(context)

    return results


# ── G2 Scraper ───────────────────────────────────────────────

async def scrape_g2(query: str, max_results: int = 50) -> list[dict]:
    async with _scrape_semaphore:
        return await _scrape_g2_inner(query, max_results)


async def _scrape_g2_inner(query: str, max_results: int) -> list[dict]:
    browser = await get_browser()
    context = await new_stealth_context(browser)
    page = await context.new_page()
    results = []

    try:
        search_query = quote_plus(query)
        url = f"https://www.g2.com/search?query={search_query}"
        logger.info(f"[G2] Scraping: {url}")

        await page.goto(url, wait_until="domcontentloaded", timeout=30000)

        # Wait for results
        for selector in ['.product-listing', '[class*="product-listing"]', '.search-result']:
            try:
                await page.wait_for_selector(selector, timeout=10000)
                break
            except Exception:
                continue

        await asyncio.sleep(2)

        # Scroll to load more
        for _ in range(2):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await asyncio.sleep(1.5)

        # Extract product cards
        cards = await page.query_selector_all('.product-listing, [class*="product-listing"]')

        for card in cards[:max_results]:
            try:
                # Get product name
                name_el = await card.query_selector('h3 a, .product-name a')
                name = await name_el.inner_text() if name_el else ""
                if not name or is_noise(name):
                    continue

                # Get link
                href = await name_el.get_attribute("href") if name_el else ""
                if href and not href.startswith("http"):
                    href = f"https://www.g2.com{href}"

                # Get rating
                rating_el = await card.query_selector('[class*="rating"], .rating-value')
                rating_text = await rating_el.inner_text() if rating_el else "0"
                rating = 0.0
                match = re.search(r'(\d+\.?\d*)', rating_text)
                if match:
                    rating = float(match.group(1))

                # Get review count
                review_el = await card.query_selector('[class*="review-count"], .reviews-count')
                review_text = await review_el.inner_text() if review_el else "0"
                reviews = int(re.sub(r'[^\d]', '', review_text) or '0')

                # Get category
                cat_el = await card.query_selector('[class*="category"], .product-category')
                category = await cat_el.inner_text() if cat_el else ""

                results.append({
                    "name": name.strip(),
                    "rating": rating,
                    "reviews": reviews,
                    "category": category.strip(),
                    "url": href,
                    "source": "g2",
                })
            except Exception as e:
                logger.debug(f"[G2] Skip item: {e}")
                continue

        logger.info(f"[G2] Found {len(results)} products for '{query}'")
    except Exception as e:
        logger.error(f"[G2] Scrape failed: {e}")
        if "Target page, context or browser has been closed" in str(e):
            async with _browser_lock:
                await _cleanup_browser()
    finally:
        await _safe_close_context(context)

    return results


# ── Trustpilot Scraper ───────────────────────────────────────

async def scrape_trustpilot(query: str, max_results: int = 50) -> list[dict]:
    async with _scrape_semaphore:
        return await _scrape_trustpilot_inner(query, max_results)


async def _scrape_trustpilot_inner(query: str, max_results: int) -> list[dict]:
    browser = await get_browser()
    context = await new_stealth_context(browser)
    page = await context.new_page()
    results = []

    try:
        search_query = quote_plus(query)
        url = f"https://www.trustpilot.com/search?query={search_query}"
        logger.info(f"[Trustpilot] Scraping: {url}")

        await page.goto(url, wait_until="domcontentloaded", timeout=30000)

        # Wait for results
        for selector in ['.companyCard', '[class*="company-card"]', 'article']:
            try:
                await page.wait_for_selector(selector, timeout=10000)
                break
            except Exception:
                continue

        await asyncio.sleep(2)

        # Scroll to load more
        for _ in range(2):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await asyncio.sleep(1.5)

        # Extract company cards
        cards = await page.query_selector_all('.companyCard, [class*="company-card"], article')

        for card in cards[:max_results]:
            try:
                # Get company name
                name_el = await card.query_selector('h2 a, .company-name a, [class*="company-name"]')
                name = await name_el.inner_text() if name_el else ""
                if not name or is_noise(name):
                    continue

                # Get link
                href = await name_el.get_attribute("href") if name_el else ""
                if href and not href.startswith("http"):
                    href = f"https://www.trustpilot.com{href}"

                # Get rating
                rating_el = await card.query_selector('[class*="rating"], .star-rating')
                rating_text = await rating_el.get_attribute("data-rating") if rating_el else ""
                if not rating_text:
                    rating_text = await rating_el.inner_text() if rating_el else "0"
                rating = 0.0
                match = re.search(r'(\d+\.?\d*)', str(rating_text))
                if match:
                    rating = float(match.group(1))

                # Get review count
                review_el = await card.query_selector('[class*="review-count"], .reviews-count')
                review_text = await review_el.inner_text() if review_el else "0"
                reviews = int(re.sub(r'[^\d]', '', review_text) or '0')

                # Get category
                cat_el = await card.query_selector('[class*="category"], .company-category')
                category = await cat_el.inner_text() if cat_el else ""

                results.append({
                    "name": name.strip(),
                    "rating": rating,
                    "reviews": reviews,
                    "category": category.strip(),
                    "url": href,
                    "source": "trustpilot",
                })
            except Exception as e:
                logger.debug(f"[Trustpilot] Skip item: {e}")
                continue

        logger.info(f"[Trustpilot] Found {len(results)} companies for '{query}'")
    except Exception as e:
        logger.error(f"[Trustpilot] Scrape failed: {e}")
        if "Target page, context or browser has been closed" in str(e):
            async with _browser_lock:
                await _cleanup_browser()
    finally:
        await _safe_close_context(context)

    return results


# ── Generic Web Scraper ──────────────────────────────────────

async def scrape_web(
    url: str,
    platform: str = "generic",
    niche: str = "",
    max_results: int = 10,
    wait_selector: Optional[str] = None,
    scroll: bool = False,
) -> list[dict]:
    async with _scrape_semaphore:
        return await _scrape_web_inner(url, platform, niche, max_results, wait_selector, scroll)


async def _scrape_web_inner(
    url: str,
    platform: str,
    niche: str,
    max_results: int,
    wait_selector: Optional[str],
    scroll: bool,
) -> list[dict]:
    browser = await get_browser()
    context = await new_stealth_context(browser)
    page = await context.new_page()
    results = []

    try:
        logger.info(f"[Web:{platform}] Scraping: {url}")
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)

        if wait_selector:
            try:
                await page.wait_for_selector(wait_selector, timeout=10000)
            except Exception:
                logger.warning(f"[Web:{platform}] Wait selector {wait_selector} timed out")

        if scroll:
            for _ in range(3):
                await page.evaluate("window.scrollBy(0, window.innerHeight)")
                await asyncio.sleep(1.5)

        await asyncio.sleep(2)

        # Extract links and titles
        links = await page.query_selector_all("a[href]")
        seen_urls = set()
        for link in links:
            try:
                href = await link.get_attribute("href") or ""
                title = await link.inner_text()
                title = title.strip() if title else ""

                if is_noise(title, href) or href in seen_urls:
                    continue
                seen_urls.add(href)

                if href.startswith("/"):
                    href = urljoin(url, href)

                item_id = hashlib.md5(href.encode()).hexdigest()[:12]
                results.append({
                    "id": item_id,
                    "url": href,
                    "title": title[:200],
                    "source": platform,
                })

                if len(results) >= max_results:
                    break
            except Exception:
                continue

        logger.info(f"[Web:{platform}] Found {len(results)} items from {url}")
    except Exception as e:
        logger.error(f"[Web:{platform}] Scrape failed: {e}")
        if "Target page, context or browser has been closed" in str(e):
            async with _browser_lock:
                await _cleanup_browser()
    finally:
        await _safe_close_context(context)

    return results


# ── FastAPI app ───────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("[CloakBrowser] Starting stealth business data scraper service")
    yield
    await close_browser()
    logger.info("[CloakBrowser] Shutting down")


app = FastAPI(title="CloakBrowser Business Scraper", version="1.0.0", lifespan=lifespan)


@app.get("/health")
async def health():
    browser_ok = False
    try:
        if _browser and _browser.is_connected():
            browser_ok = True
    except Exception:
        pass
    return {"status": "ok", "service": "cloakbrowser", "browser_connected": browser_ok}


@app.post("/restart")
async def restart_browser():
    """Force restart the browser (admin endpoint)."""
    async with _browser_lock:
        await _cleanup_browser()
    return {"status": "restarted"}


@app.get("/scrape/google_maps")
async def scrape_google_maps_endpoint(
    query: str = Query(..., description="Search query"),
    location: str = Query("", description="Location"),
    max_results: int = Query(50, ge=1, le=100),
):
    try:
        results = await scrape_google_maps(query, location, max_results)
        return {"success": True, "results": results}
    except Exception as e:
        logger.exception(f"[GoogleMaps] Endpoint error: {e}")
        return {"success": False, "error": str(e), "results": []}


@app.get("/scrape/yelp")
async def scrape_yelp_endpoint(
    query: str = Query(..., description="Search query"),
    location: str = Query("", description="Location"),
    max_results: int = Query(50, ge=1, le=100),
):
    try:
        results = await scrape_yelp(query, location, max_results)
        return {"success": True, "results": results}
    except Exception as e:
        logger.exception(f"[Yelp] Endpoint error: {e}")
        return {"success": False, "error": str(e), "results": []}


@app.get("/scrape/linkedin")
async def scrape_linkedin_endpoint(
    query: str = Query(..., description="Search query"),
    max_results: int = Query(50, ge=1, le=100),
):
    try:
        results = await scrape_linkedin(query, max_results)
        return {"success": True, "results": results}
    except Exception as e:
        logger.exception(f"[LinkedIn] Endpoint error: {e}")
        return {"success": False, "error": str(e), "results": []}


@app.get("/scrape/crunchbase")
async def scrape_crunchbase_endpoint(
    query: str = Query(..., description="Search query"),
    max_results: int = Query(50, ge=1, le=100),
):
    try:
        results = await scrape_crunchbase(query, max_results)
        return {"success": True, "results": results}
    except Exception as e:
        logger.exception(f"[Crunchbase] Endpoint error: {e}")
        return {"success": False, "error": str(e), "results": []}


@app.get("/scrape/g2")
async def scrape_g2_endpoint(
    query: str = Query(..., description="Search query"),
    max_results: int = Query(50, ge=1, le=100),
):
    try:
        results = await scrape_g2(query, max_results)
        return {"success": True, "results": results}
    except Exception as e:
        logger.exception(f"[G2] Endpoint error: {e}")
        return {"success": False, "error": str(e), "results": []}


@app.get("/scrape/trustpilot")
async def scrape_trustpilot_endpoint(
    query: str = Query(..., description="Search query"),
    max_results: int = Query(50, ge=1, le=100),
):
    try:
        results = await scrape_trustpilot(query, max_results)
        return {"success": True, "results": results}
    except Exception as e:
        logger.exception(f"[Trustpilot] Endpoint error: {e}")
        return {"success": False, "error": str(e), "results": []}


@app.get("/scrape/web")
async def scrape_web_endpoint(
    url: str = Query(..., description="URL to scrape"),
    platform: str = Query("generic", description="Platform name"),
    niche: str = Query("", description="Search niche"),
    max_results: int = Query(10, ge=1, le=50),
    wait_selector: Optional[str] = Query(None, description="CSS selector to wait for"),
    scroll: bool = Query(False, description="Enable scroll loading"),
):
    try:
        results = await scrape_web(url, platform, niche, max_results, wait_selector, scroll)
        return {"success": True, "results": results}
    except Exception as e:
        logger.exception(f"[Web:{platform}] Endpoint error: {e}")
        return {"success": False, "error": str(e), "results": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
