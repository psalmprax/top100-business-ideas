import { test, expect } from '@playwright/test';

/**
 * Sentinel Hardening Integrity Test
 * 
 * This test enforces the 'Real-First' policy by failing if any 
 * 'Simulation Fallback' or '[API Fallback]' triggers are detected.
 */
test.describe('Sentinel Policy: Real-First Integrity', () => {

    test.beforeEach(async ({ page }) => {
        // Listen for API Fallback warnings in the console
        page.on('console', msg => {
            if (msg.text().includes('[API Fallback]') || msg.text().includes('Simulated')) {
                // Fail the test if a fallback is triggered
                throw new Error(`POL-VIOLATION: Simulation detected! Content: "${msg.text()}"`);
            }
        });
    });

    test('Agent Ops should only use real data', async ({ page }) => {
        // 1. Navigate to Agent Ops
        await page.goto('/agent-ops');

        // 2. Auth check - wait for the dashboard to load (assuming public demo or auto-login)
        // If login is required, we would perform it here.
        
        // 3. Verify core metrics are present
        const agentCount = page.locator('text=Total Agents');
        await expect(agentCount).toBeVisible();

        // 4. Specifically check for budget rules (the route I just hardened)
        const budgetTab = page.locator('button:has-text("Budget & Rules")');
        if (await budgetTab.isVisible()) {
            await budgetTab.click();
            
            // Wait for the list to load
            await page.waitForTimeout(1000);
            
            // Check for 'Simulation' text in the viewport
            const bodyText = await page.innerText('body');
            expect(bodyText).not.toContain('Simulated');
            expect(bodyText).not.toContain('Demo Mode');
        }
    });

    test('Workforce should only use real telemetry', async ({ page }) => {
        await page.goto('/workforce');
        
        // Wait for product cards
        const productStats = page.locator('text=Product Statistics');
        await expect(productStats).toBeVisible();

        // Assert no 'Fallback' or 'Placeholder' labels
        const bodyText = await page.innerText('body');
        expect(bodyText).not.toContain('Mock');
        expect(bodyText).not.toContain('Placeholder');
    });
});
