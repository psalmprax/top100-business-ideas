import { test, expect, Page } from '@playwright/test';

test.describe('AlphaAI Products', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    describe('Landing Page', () => {
        test('should load the landing page', async ({ page }) => {
            await expect(page).toHaveTitle(/AlphaAI/i);
            await expect(page.locator('h1')).toBeVisible();
        });

        test('should show all 3 products', async ({ page }) => {
            await expect(page.getByText('Agent Ops')).toBeVisible();
            await expect(page.getByText('AI Compliance')).toBeVisible();
            await expect(page.getByText('Deepfake Defense')).toBeVisible();
        });

        test('should navigate to product pages', async ({ page }) => {
            await page.click('text=Agent Ops');
            await expect(page).toHaveURL(/.*products\/agent-ops/);
            await expect(page.locator('h1')).toContainText('Agent Ops');
        });
    });

    describe('Authentication', () => {
        test('should show login page', async ({ page }) => {
            await page.goto('http://localhost:3000/login');
            await expect(page.locator('h1')).toContainText('Sign In');
        });

        test('should show sign up option', async ({ page }) => {
            await page.goto('http://localhost:3000/login');
            await expect(page.getByText('Sign up')).toBeVisible();
        });

        test('should show OAuth buttons', async ({ page }) => {
            await page.goto('http://localhost:3000/login');
            await expect(page.getByText('Continue with Google')).toBeVisible();
            await expect(page.getByText('Continue with GitHub')).toBeVisible();
        });

        test('should validate email input', async ({ page }) => {
            await page.goto('http://localhost:3000/login');
            await page.fill('input[type="email"]', 'invalid-email');
            await page.click('button[type="submit"]');
            // Should show validation error
        });
    });

    describe('Billing Page', () => {
        test('should show pricing plans', async ({ page }) => {
            await page.goto('http://localhost:3000/billing');
            await expect(page.getByText('Developer')).toBeVisible();
            await expect(page.getByText('Growth')).toBeVisible();
            await expect(page.getByText('Enterprise')).toBeVisible();
        });

        test('should show current plan badge', async ({ page }) => {
            await page.goto('http://localhost:3000/billing');
            await expect(page.getByText('Active')).toBeVisible();
        });

        test('should show payment method section', async ({ page }) => {
            await page.goto('http://localhost:3000/billing');
            await expect(page.getByText('Payment Method')).toBeVisible();
        });

        test('should show invoice history', async ({ page }) => {
            await page.goto('http://localhost:3000/billing');
            await expect(page.getByText('Invoice History')).toBeVisible();
        });
    });

    describe('Settings Page', () => {
        test('should show settings tabs', async ({ page }) => {
            await page.goto('http://localhost:3000/settings');
            await expect(page.getByText('Profile')).toBeVisible();
            await expect(page.getByText('Security')).toBeVisible();
            await expect(page.getByText('Notifications')).toBeVisible();
            await expect(page.getByText('Preferences')).toBeVisible();
            await expect(page.getByText('API Keys')).toBeVisible();
        });

        test('should allow profile editing', async ({ page }) => {
            await page.goto('http://localhost:3000/settings');
            await page.fill('#name', 'Test User');
            await page.click('text=Save Changes');
            await expect(page.getByText('Saved!')).toBeVisible();
        });
    });

    describe('Product Pages', () => {
        const products = [
            { path: '/products/agent-ops', name: 'Agent Ops' },
            { path: '/products/ai-compliance', name: 'AI Compliance' },
            { path: '/products/deepfake-defense', name: 'Deepfake Defense' },
        ];

        products.forEach(({ path, name }) => {
            test(`should load ${name} page`, async ({ page }) => {
                await page.goto(`http://localhost:3000${path}`);
                await expect(page.locator('h1')).toContainText(name);
            });

            test(`should show features section for ${name}`, async ({ page }) => {
                await page.goto(`http://localhost:3000${path}`);
                await expect(page.getByText('Features')).toBeVisible();
            });

            test(`should show pricing section for ${name}`, async ({ page }) => {
                await page.goto(`http://localhost:3000${path}`);
                await expect(page.getByText('Pricing')).toBeVisible();
            });

            test(`should show use cases for ${name}`, async ({ page }) => {
                await page.goto(`http://localhost:3000${path}`);
                await expect(page.getByText('Use Cases')).toBeVisible();
            });
        });
    });

    describe('Responsive Design', () => {
        test('should work on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('http://localhost:3000');
            await expect(page.locator('h1')).toBeVisible();
        });

        test('should work on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('http://localhost:3000');
            await expect(page.locator('h1')).toBeVisible();
        });

        test('should work on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('http://localhost:3000');
            await expect(page.locator('h1')).toBeVisible();
        });
    });

    describe('Navigation', () => {
        test('should have working navigation', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Check navigation exists
            await expect(page.locator('nav')).toBeVisible();
        });

        test('should handle 404 gracefully', async ({ page }) => {
            await page.goto('http://localhost:3000/nonexistent');
            await expect(page.getByText('Page not found')).toBeVisible();
        });
    });

    describe('API Endpoints', () => {
        test('health check should work', async ({ request }) => {
            const response = await request.get('http://localhost:8081/health');
            expect(response.ok()).toBeTruthy();
        });

        test('API should handle rate limiting', async ({ request }) => {
            // Make multiple rapid requests
            const promises = Array(150).fill(null).map(() =>
                request.get('http://localhost:8081/api/v1/products')
            );
            const responses = await Promise.all(promises);
            const tooManyRequests = responses.filter(r => r.status() === 429);
            expect(tooManyRequests.length).toBeGreaterThan(0);
        });
    });
});

test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('http://localhost:3000');
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(3000); // 3 seconds
    });

    test('should have no console errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        await page.goto('http://localhost:3000');
        expect(errors).toHaveLength(0);
    });
});
