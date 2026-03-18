/**
 * AlphaAI - E2E Tests
 * Comprehensive tests for the company website and products
 */

import { test, expect } from '@playwright/test';

test.describe('AlphaAI Company Website', () => {

    test.describe('Homepage', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
        });

        test('should load the homepage', async ({ page }) => {
            // Check page title
            await expect(page).toHaveTitle(/AlphaAI/);

            // Check hero section
            await expect(page.locator('h1')).toContainText('Enterprise AI Solutions');

            // Check navigation exists
            await expect(page.locator('header nav')).toBeVisible();
        });

        test('should display company logo', async ({ page }) => {
            const logo = page.locator('header').getByText('AlphaAI');
            await expect(logo).toBeVisible();
        });

        test('should show products section', async ({ page }) => {
            // Scroll to products section
            const productsSection = page.locator('#products');
            await productsSection.scrollIntoViewIfNeeded();

            // Check products are displayed
            await expect(page.getByText('AgentOps')).toBeVisible();
            await expect(page.getByText('AI Compliance Hub')).toBeVisible();
            await expect(page.getByText('Deepfake Defense')).toBeVisible();
        });

        test('should show stats section', async ({ page }) => {
            await expect(page.getByText('99.9%')).toBeVisible();
            await expect(page.getByText('500+')).toBeVisible();
            await expect(page.getByText('50M+')).toBeVisible();
        });
    });

    test.describe('Navigation', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
        });

        test('should have working navigation links', async ({ page }) => {
            // Products link
            await page.click('text=Products');
            await expect(page.locator('#products')).toBeVisible();

            // Solutions link
            await page.click('text=Solutions');
            await expect(page.locator('#solutions')).toBeVisible();
        });

        test('should have Get Started button', async ({ page }) => {
            const ctaButton = page.locator('header').getByRole('button', { name: /Get Started/i });
            await expect(ctaButton).toBeVisible();
        });
    });

    test.describe('Product Pages', () => {

        test('AgentOps product page should load', async ({ page }) => {
            await page.goto('/products/agent-ops');

            // Check page title
            await expect(page.locator('h1')).toBeVisible();

            // Check dashboard elements exist
            await expect(page.locator('text=Total Agents')).toBeVisible({ timeout: 10000 });
        });

        test('AI Compliance product page should load', async ({ page }) => {
            await page.goto('/products/ai-compliance');

            // Check page title
            await expect(page.locator('h1')).toBeVisible();

            // Check dashboard elements
            await expect(page.locator('text=Compliance Score')).toBeVisible({ timeout: 10000 });
        });

        test('Deepfake Defense product page should load', async ({ page }) => {
            await page.goto('/products/deepfake-defense');

            // Check page title
            await expect(page.locator('h1')).toBeVisible();

            // Check dashboard elements
            await expect(page.locator('text=Total Analyses')).toBeVisible({ timeout: 10000 });
        });

        test('should navigate from homepage to product pages', async ({ page }) => {
            await page.goto('/');

            // Click on AgentOps product card
            await page.click('text=AgentOps >> nth=0');

            // Should navigate to product page
            await expect(page).toHaveURL(/\/products\/agent-ops/);
        });
    });

    test.describe('Legacy Routes', () => {

        test('should redirect /ventures/alpha-agent-ops to /products/agent-ops', async ({ page }) => {
            await page.goto('/ventures/alpha-agent-ops');
            await expect(page).toHaveURL(/\/products\/agent-ops/);
        });

        test('should redirect /ventures/alpha-ai-act-compliance to /products/ai-compliance', async ({ page }) => {
            await page.goto('/ventures/alpha-ai-act-compliance');
            await expect(page).toHaveURL(/\/products\/ai-compliance/);
        });

        test('should redirect /ventures/alpha-deepfake-defense to /products/deepfake-defense', async ({ page }) => {
            await page.goto('/ventures/alpha-deepfake-defense');
            await expect(page).toHaveURL(/\/products\/deepfake-defense/);
        });
    });

    test.describe('404 Page', () => {

        test('should show 404 for unknown routes', async ({ page }) => {
            await page.goto('/nonexistent-page');
            await expect(page.getByText('404')).toBeVisible();
        });
    });

    test.describe('API Connectivity', () => {

        test('should connect to Go API Gateway', async ({ request }) => {
            const response = await request.get('http://localhost:8081/health');
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.status).toBe('healthy');
        });

        test('should connect to Python ML Backend', async ({ request }) => {
            const response = await request.get('http://localhost:8000/health');
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.status).toBe('healthy');
        });
    });

    test.describe('Authentication', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/login');
        });

        test('should display login form', async ({ page }) => {
            await expect(page.locator('input[name="email"]')).toBeVisible();
            await expect(page.locator('input[name="password"]')).toBeVisible();
            await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
        });

        test('should show error for invalid credentials', async ({ page }) => {
            await page.fill('input[name="email"]', 'invalid@example.com');
            await page.fill('input[name="password"]', 'wrongpassword');
            await page.click('button[type="submit"]');
            // Should show error message
            await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 });
        });

        test('should login with valid credentials', async ({ page }) => {
            await page.fill('input[name="email"]', 'demo@alpha.ai');
            await page.fill('input[name="password"]', 'demo123');
            await page.click('button[type="submit"]');
            // Should redirect to home or dashboard
            await expect(page).toHaveURL(/(\/|\/home|\/settings)/, { timeout: 10000 });
        });

        test('should have OAuth2 login option', async ({ page }) => {
            await expect(page.getByText(/continue with google/i)).toBeVisible();
            await expect(page.getByText(/continue with microsoft/i)).toBeVisible();
        });
    });

    test.describe('Billing', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/billing');
        });

        test('should display pricing plans', async ({ page }) => {
            await expect(page.getByText('Developer')).toBeVisible();
            await expect(page.getByText('Starter')).toBeVisible();
            await expect(page.getByText('Professional')).toBeVisible();
            await expect(page.getByText('Enterprise')).toBeVisible();
        });

        test('should show pricing amounts', async ({ page }) => {
            await expect(page.getByText('$0')).toBeVisible();
            await expect(page.getByText('$499')).toBeVisible();
            await expect(page.getByText('$1,499')).toBeVisible();
            await expect(page.getByText('$2,500')).toBeVisible();
        });

        test('should allow plan selection', async ({ page }) => {
            // Click on Starter plan
            await page.click('text=Starter >> nth=0');
            // Should show checkout or upgrade dialog
            await expect(page.getByText(/upgrade to starter/i)).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Visual Regression', () => {
        test('homepage visual snapshot', async ({ page }) => {
            await page.goto('/');
            await expect(page.locator('h1')).toBeVisible();
            // Take screenshot for visual regression
            await expect(page).toHaveScreenshot('homepage.png', { maxDiffPixelRatio: 0.1 });
        });

        test('login page visual snapshot', async ({ page }) => {
            await page.goto('/login');
            await expect(page.locator('input[name="email"]')).toBeVisible();
            await expect(page).toHaveScreenshot('login.png', { maxDiffPixelRatio: 0.1 });
        });

        test('billing page visual snapshot', async ({ page }) => {
            await page.goto('/billing');
            await expect(page.getByText('Developer')).toBeVisible();
            await expect(page).toHaveScreenshot('billing.png', { maxDiffPixelRatio: 0.1 });
        });
    });

    test.describe('Mobile Responsiveness', () => {
        test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

        test('homepage mobile layout', async ({ page }) => {
            await page.goto('/');
            await expect(page.locator('h1')).toBeVisible();
            // Verify hamburger menu or mobile navigation exists
            const nav = page.locator('nav, header');
            await expect(nav).toBeVisible();
        });

        test('billing mobile layout', async ({ page }) => {
            await page.goto('/billing');
            // Should still show plans but in stacked layout
            await expect(page.getByText('Developer')).toBeVisible();
            // Check plans are accessible on mobile
            const pricingCards = page.locator('[class*="card"], [class*="plan"]');
            expect(await pricingCards.count()).toBeGreaterThan(0);
        });
    });
});
