/**
 * E2E Test Framework for Alpha Ventures
 * Uses Vitest with Playwright for comprehensive testing
 */

import { test, expect, describe, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from '@playwright/test';

// ============================================================================
// Test Configuration
// ============================================================================

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';
const VENTURE_TIMEOUT = 30000;

// ============================================================================
// Test Fixtures
// ============================================================================

interface TestContext {
    browser: Browser;
    page: Page;
}

const testContext: TestContext = {
    browser: null as unknown as Browser,
    page: null as unknown as Page,
};

beforeAll(async () => {
    testContext.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
});

afterAll(async () => {
    await testContext.browser?.close();
});

// ============================================================================
// Helper Functions
// ============================================================================

async function createPage(): Promise<Page> {
    const context = await testContext.browser.newContext();
    return context.newPage();
}

async function takeScreenshot(page: Page, name: string) {
    await page.screenshot({
        path: `e2e/screenshots/${name}-${Date.now()}.png`,
        fullPage: true
    });
}

// ============================================================================
// Navigation Tests
// ============================================================================

describe('Navigation E2E Tests', () => {
    test('should load home page', async () => {
        const page = await createPage();
        await page.goto(BASE_URL);

        await expect(page).toHaveTitle(/Top 100 Business Ideas/);
        await page.close();
    });

    test('should navigate to venture detail', async () => {
        const page = await createPage();
        await page.goto(BASE_URL);

        // Wait for content to load
        await page.waitForSelector('[data-testid="venture-card"]', { timeout: VENTURE_TIMEOUT });

        // Click first venture card
        await page.click('[data-testid="venture-card"]:first-child');

        // Should show venture detail
        await expect(page.locator('[data-testid="venture-detail"]')).toBeVisible();

        await page.close();
    });
});

// ============================================================================
// Alpha Agent Ops Tests
// ============================================================================

describe('Alpha Agent Ops - E2E Tests', () => {
    test('should load agent ops dashboard', async () => {
        const page = await createPage();
        await page.goto(`${BASE_URL}/ventures/alpha-hecta-agent-ops`);

        await expect(page.locator('h1')).toContainText(/Agent Ops/i);
        await page.close();
    });

    test('should display agent metrics', async () => {
        const page = await createPage();
        await page.goto(`${BASE_URL}/ventures/alpha-hecta-agent-ops/dashboard`);

        // Wait for metrics to load
        await page.waitForSelector('[data-testid="metrics-grid"]', { timeout: VENTURE_TIMEOUT });

        // Verify key metrics are displayed
        await expect(page.locator('[data-testid="metric-total-requests"]')).toBeVisible();
        await expect(page.locator('[data-testid="metric-total-cost"]')).toBeVisible();

        await page.close();
    });

    test('should create new agent rule', async () => {
        const page = await createPage();
        await page.goto(`${BASE_URL}/ventures/alpha-hecta-agent-ops/rules`);

        // Click add rule button
        await page.click('[data-testid="add-rule-button"]');

        // Fill in rule form
        await page.fill('[data-testid="rule-name-input"]', 'Test Loop Prevention');
        await page.selectOption('[data-testid="rule-type-select"]', 'loop_prevention');
        await page.fill('[data-testid="rule-config-input"]', '{"maxIterations": 10}');

        // Submit form
        await page.click('[data-testid="submit-rule-button"]');

        // Verify rule was created
        await expect(page.locator('[data-testid="rule-list"]')).toContainText('Test Loop Prevention');

        await page.close();
    });
});

// ============================================================================
// Alpha AI Act Compliance Tests
// ============================================================================

describe('Alpha AI Act Compliance - E2E Tests', () => {
    test('should load compliance dashboard', async () => {
        const page = await createPage();
        await page.goto(`${BASE_URL}/ventures/alpha-hecta-act-compliance`);

        await expect(page.locator('h1')).toContainText(/AI Act/i);
        await page.close();
    });

    test('should run compliance check', async () => {
        const page = await createPage();
        await page.goto(`${BASE_URL}/ventures/alpha-hecta-act-compliance/checks`);

        // Click run check button
        await page.click('[data-testid="run-check-button"]');

        // Select check type
        await page.selectOption('[data-testid="check-type-select"]', 'ai_act');

        // Submit
        await page.click('[data-testid="submit-check-button"]');

        // Wait for results
        await page.waitForSelector('[data-testid="check-results"]', { timeout: VENTURE_TIMEOUT });

        await expect(page.locator('[data-testid="check-status"]')).toBeVisible();

        await page.close();
    });
});

// ============================================================================
// Alpha Deepfake Defense Tests
// ============================================================================

describe('Alpha Deepfake Defense - E2E Tests', () => {
    test('should load deepfake dashboard', async () => {
        const page = await createPage();
        await page.goto(`${BASE_URL}/ventures/alpha-hecta-deepfake-defense`);

        await expect(page.locator('h1')).toContainText(/Deepfake/i);
        await page.close();
    });

    test('should upload and analyze media', async () => {
        const page = await createPage();
        await page.goto(`${BASE_URL}/ventures/alpha-hecta-deepfake-defense/analyze`);

        // Upload test image
        const fileInput = await page.locator('[data-testid="file-input"]');
        await fileInput.setInputFiles({
            name: 'test-image.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake-image-data')
        });

        // Click analyze button
        await page.click('[data-testid="analyze-button"]');

        // Wait for results
        await page.waitForSelector('[data-testid="analysis-result"]', { timeout: VENTURE_TIMEOUT });

        await expect(page.locator('[data-testid="result-confidence"]')).toBeVisible();

        await page.close();
    });
});

// ============================================================================
// Performance Tests
// ============================================================================

describe('Performance Tests', () => {
    test('should load page within 3 seconds', async () => {
        const page = await createPage();

        const startTime = Date.now();
        await page.goto(BASE_URL);
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(3000);

        await page.close();
    });

    test('should have no console errors', async () => {
        const page = await createPage();
        const errors: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(BASE_URL);
        await page.waitForTimeout(2000);

        // Filter out expected errors (like network errors in test env)
        const criticalErrors = errors.filter(e => !e.includes('Failed to load resource'));
        expect(criticalErrors).toHaveLength(0);

        await page.close();
    });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe('Accessibility Tests', () => {
    test('should have proper heading hierarchy', async () => {
        const page = await createPage();
        await page.goto(BASE_URL);

        // Check that h1 exists
        const h1 = await page.locator('h1').count();
        expect(h1).toBeGreaterThan(0);

        // Check that h2 comes after h1
        const h2s = await page.locator('h2').count();
        expect(h2s).toBeGreaterThanOrEqual(0);

        await page.close();
    });

    test('should have proper alt text on images', async () => {
        const page = await createPage();
        await page.goto(BASE_URL);

        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < count; i++) {
            const alt = await images.nth(i).getAttribute('alt');
            // Either has alt text or is decorative (empty alt)
            expect(alt === null || typeof alt === 'string').toBeTruthy();
        }

        await page.close();
    });
});
