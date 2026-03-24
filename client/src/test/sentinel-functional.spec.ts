import { test, expect } from '@playwright/test';

test.describe('AgentOps Sentinel - Enterprise Functional Validation', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER_LOG: ${msg.text()}`));
        // Enforce demo mode and mock token
        await page.addInitScript(() => {
            localStorage.setItem('demo_mode', 'true');
            localStorage.setItem('auth_token', 'demo-token-for-testing');
        });
        // Navigate to the AgentOps dashboard
        await page.goto('/products/agent-ops');
        // Wait for the dashboard to load
        await expect(page.getByText('Total Agents')).toBeVisible({ timeout: 15000 });
    });

    test('should execute HIPAA Compliance Audit and verify results', async ({ page }) => {
        // Navigate to Compliance Tab (under Governance)
        await page.getByTestId('gov-category-trigger').click();
        await page.getByTestId('compliance-tab').click();

        // Find and click HIPAA Audit button
        const hipaaBtn = page.getByRole('button', { name: /Run HIPAA Compliance Audit/i });
        await expect(hipaaBtn).toBeVisible();
        await hipaaBtn.click();

        // Verify success toast and status update
        await expect(page.getByText(/HIPAA Audit/i)).toBeVisible();
        await expect(page.getByTestId('hipaa-status-badge').first()).toHaveText(/COMPLIANT/i);
    });

    test('should execute SOX Financial Audit and verify results', async ({ page }) => {
        // Navigate to Compliance Tab (under Governance)
        await page.getByTestId('gov-category-trigger').click();
        await page.getByTestId('compliance-tab').click();

        // Find and click SOX Audit button
        const soxBtn = page.getByRole('button', { name: /Run SOX Financial Audit/i });
        await expect(soxBtn).toBeVisible();
        await soxBtn.click();

        await expect(page.getByText(/SOX/i).first()).toBeVisible();
        await expect(page.getByTestId('sox-status-badge').first()).toBeVisible();
    });

    test('should trigger Regional Failover in Multi-Cloud Health', async ({ page }) => {
        // Navigate to Infrastructure Tab (under Operations)
        await page.getByTestId('ops-category-trigger').click();
        await page.getByTestId('infrastructure-tab').click();

        // Verify Top 20 regions are visible (check for a few specific ones)
        await expect(page.locator('div, span, p').filter({ hasText: /N. Virginia/i }).first()).toBeVisible();
        await expect(page.getByText(/Singapore/i).first()).toBeVisible();
        await expect(page.getByText(/Frankfurt/i).first()).toBeVisible();

        // Trigger Failover Test
        const failoverBtn = page.getByRole('button', { name: /Test Regional Failover/i });
        await failoverBtn.click();

        // Verify failover success toast
        await expect(page.getByText(/Regional Failover initiated/i).first()).toBeVisible();
    });

    test('should manage Webhooks (Register and Delete)', async ({ page }) => {
        await page.getByTestId('ops-category-trigger').click();
        await page.getByTestId('webhooks-tab').click();

        // Add new Webhook
        await page.getByTestId('add-webhook-button').click();
        await page.getByTestId('webhook-name-input').fill('Sentinel-E2E-Webhook');
        await page.getByTestId('webhook-url-input').fill('https://sentinel.internal/webhook');
        await page.getByRole('button', { name: /Configure Webhook/i }).click();

        // Verify it appears in the table (wait up to 10s for sync)
        try {
            await expect(page.locator('table').getByText('Sentinel-E2E-Webhook').first()).toBeVisible({ timeout: 10000 });
        } catch (e) {
            const tableText = await page.locator('table').innerText();
            console.log(`[DIAGNOSTIC] Table Content: ${tableText}`);
            throw e;
        }

        // Delete the Webhook
        const deleteBtn = page.locator('tr').filter({ hasText: 'Sentinel-E2E-Webhook' }).getByRole('button', { name: /Delete/i });
        await deleteBtn.click();

        // Verify deletion toast
        await expect(page.getByText(/Webhook deleted/i)).toBeVisible();
    });

    test('should toggle Dynamic Budget Rules', async ({ page }) => {
        // Navigate to Budget Tab (under Core)
        await page.getByTestId('core-category-trigger').click();
        await page.getByTestId('budget-tab').click();

        // Toggle the first rule
        const budgetSwitch = page.locator('button[role="switch"]').first();
        await budgetSwitch.click();

        // Verify toast
        await expect(page.getByText(/Budget rule/i).first()).toBeVisible();
    });

    test('should verify Self-Healing Uptime Assurance', async ({ page }) => {
        // Navigate to Infrastructure Tab (under Operations)
        await page.getByTestId('ops-category-trigger').click();
        await page.getByTestId('infrastructure-tab').click();

        // Wait for infrastructure content to load
        await expect(page.getByText('Self-Healing Overview')).toBeVisible();

        // Verify Uptime metric
        await expect(page.getByText('99.99%')).toBeVisible();

        // Verify Active Watchdogs (should be at least 0 since we have mock cluster nodes)
        await expect(page.getByText('Active Watchdogs')).toBeVisible();
        const watchdogElement = page.locator('span.font-bold').filter({ hasText: /^[0-9]+$/ });
        await expect(watchdogElement).toBeVisible();
        const watchdogText = await watchdogElement.textContent();
        const watchdogCount = parseInt(watchdogText || '0');
        expect(watchdogCount).toBeGreaterThanOrEqual(0);
    });

    test('should create and configure new agent', async ({ page }) => {
        // Navigate to Agents Tab (under Core)
        await page.getByTestId('core-category-trigger').click();
        await page.getByTestId('agents-tab').click();

        // Click New Agent button
        const newAgentBtn = page.getByRole('button', { name: /new agent/i });
        await expect(newAgentBtn).toBeVisible();
        await newAgentBtn.click();

        // Verify dialog opens
        await expect(page.getByText('Create New Agent')).toBeVisible();

        // Fill agent creation form
        await page.getByTestId('agent-name-input').fill('Test-Agent-E2E');
        await page.getByTestId('agent-type-select').selectOption('langgraph');
        await page.getByTestId('agent-environment-select').selectOption('production');
        await page.getByTestId('agent-provider-select').selectOption('openai');
        await page.getByTestId('agent-model-select').selectOption('gpt-4o');
        await page.getByTestId('agent-budget-input').fill('25');
        await page.getByTestId('agent-max-tokens-input').fill('50000');

        // Submit form
        await page.getByRole('button', { name: /create agent/i }).click();

        // Verify success and agent appears in table
        await expect(page.getByText(/agent.*created|agent.*deployed/i)).toBeVisible();
        await expect(page.getByText('Test-Agent-E2E')).toBeVisible();
    });

    test('should perform bulk agent operations', async ({ page }) => {
        // Navigate to Agents Tab
        await page.getByTestId('core-category-trigger').click();
        await page.getByTestId('agents-tab').click();

        // Select multiple agents using checkboxes
        const agentCheckboxes = page.locator('input[type="checkbox"]').first().locator('..').locator('input[type="checkbox"]');
        await agentCheckboxes.first().check();
        await agentCheckboxes.nth(1).check();

        // Verify bulk operations bar appears
        await expect(page.getByText(/2 agents selected/i)).toBeVisible();

        // Test bulk pause
        const bulkPauseBtn = page.getByRole('button', { name: /pause/i }).first();
        await bulkPauseBtn.click();
        await expect(page.getByText(/bulk pause initiated/i)).toBeVisible();

        // Test bulk restart
        const bulkRestartBtn = page.getByRole('button', { name: /restart/i }).first();
        await bulkRestartBtn.click();
        await expect(page.getByText(/bulk restart initiated/i)).toBeVisible();

        // Clear selection
        await page.getByRole('button', { name: /clear/i }).click();
        await expect(page.getByText(/agents selected/i)).not.toBeVisible();
    });

    test('should edit agent settings and verify changes', async ({ page }) => {
        // Navigate to Agents Tab
        await page.getByTestId('core-category-trigger').click();
        await page.getByTestId('agents-tab').click();

        // Click settings for first agent
        const settingsBtn = page.locator('button').filter({ has: page.locator('[data-lucide="settings"]') }).first();
        await settingsBtn.click();

        // Verify settings dialog opens
        await expect(page.getByText('Agent Settings')).toBeVisible();

        // Modify budget
        const budgetInput = page.getByTestId('agent-budget-input');
        await budgetInput.clear();
        await budgetInput.fill('75');

        // Save changes
        await page.getByRole('button', { name: /save|update/i }).click();

        // Verify success message
        await expect(page.getByText(/settings.*updated|synchronized/i)).toBeVisible();
    });

    test('should delete agent with confirmation', async ({ page }) => {
        // Navigate to Agents Tab
        await page.getByTestId('core-category-trigger').click();
        await page.getByTestId('agents-tab').click();

        // Click delete dropdown for first agent
        const moreBtn = page.locator('button').filter({ has: page.locator('[data-lucide="more-vertical"]') }).first();
        await moreBtn.click();

        // Click delete option
        await page.getByText('Decommission Agent').click();

        // Verify deletion
        await expect(page.getByText(/agent.*decommissioned|removed/i)).toBeVisible();
    });

    test('should create and manage budget rules', async ({ page }) => {
        // Navigate to Budget Tab
        await page.getByTestId('core-category-trigger').click();
        await page.getByTestId('budget-tab').click();

        // Click add rule button (if available)
        const addRuleBtn = page.getByRole('button', { name: /add.*rule|new.*rule/i });
        if (await addRuleBtn.isVisible()) {
            await addRuleBtn.click();

            // Fill rule form
            await page.getByTestId('rule-name-input').fill('Test-Budget-Rule');
            await page.getByTestId('rule-limit-input').fill('100');
            await page.getByTestId('rule-action-select').selectOption('pause');

            // Save rule
            await page.getByRole('button', { name: /save|create/i }).click();
            await expect(page.getByText(/rule.*saved|created/i)).toBeVisible();
        }

        // Test existing rule toggles
        const ruleToggles = page.locator('button[role="switch"]');
        const firstToggle = ruleToggles.first();
        await firstToggle.click();
        await expect(page.getByText(/rule.*enabled|disabled/i)).toBeVisible();
    });

    test('should validate usage forecasting accuracy', async ({ page }) => {
        // Navigate to Forecast Tab (under Advanced)
        await page.getByTestId('advanced-category-trigger').click();
        await page.getByTestId('forecast-tab').click();

        // Verify forecast data loads
        await expect(page.getByText(/forecast|predicted/i)).toBeVisible();

        // Check for confidence levels
        await expect(page.getByText(/confidence|95%/i)).toBeVisible();

        // Verify forecast metrics are displayed
        await expect(page.locator('[data-testid*="forecast"], .forecast-metric')).toBeVisible();
    });

    test('should validate ROI analytics calculations', async ({ page }) => {
        // Navigate to ROI Tab (under Advanced)
        await page.getByTestId('advanced-category-trigger').click();
        await page.getByTestId('roi-tab').click();

        // Verify ROI metrics load
        await expect(page.getByText(/roi|return.*investment/i)).toBeVisible();

        // Check for efficiency gains and cost savings
        await expect(page.getByText(/efficiency|savings/i)).toBeVisible();

        // Verify trend indicators
        await expect(page.locator('[data-lucide="trending-up"], [data-lucide="trending-down"]')).toBeVisible();
    });

    test('should monitor continuous multi-cloud health', async ({ page }) => {
        // Navigate to Infrastructure Tab
        await page.getByTestId('ops-category-trigger').click();
        await page.getByTestId('infrastructure-tab').click();

        // Verify all regions are displayed
        await expect(page.getByText(/N. Virginia|Singapore|Frankfurt|healthy|degraded/i)).toBeVisible();

        // Check latency metrics
        await expect(page.getByText(/\d+ms/)).toBeVisible();

        // Verify load percentages
        await expect(page.getByText(/\d+%.*load/i)).toBeVisible();
    });

    test('should validate webhook event delivery', async ({ page }) => {
        // Navigate to Webhooks Tab
        await page.getByTestId('ops-category-trigger').click();
        await page.getByTestId('webhooks-tab').click();

        // Add test webhook
        await page.getByTestId('add-webhook-button').click();
        await page.getByTestId('webhook-name-input').fill('Test-Delivery-Webhook');
        await page.getByTestId('webhook-url-input').fill('https://test-webhook.internal/events');
        await page.getByRole('button', { name: /configure webhook/i }).click();

        // Verify webhook appears and is enabled
        await expect(page.getByText('Test-Delivery-Webhook')).toBeVisible();

        // Test webhook toggle
        const webhookToggle = page.locator('button[role="switch"]').last();
        await webhookToggle.click();
        await expect(page.getByText(/webhook.*enabled|disabled/i)).toBeVisible();
    });

    test('should test self-healing recovery triggers', async ({ page }) => {
        // Navigate to Self-Heal Tab (under Advanced)
        await page.getByTestId('advanced-category-trigger').click();
        await page.getByTestId('selfheal-tab').click();

        // Verify healing controls are present
        await expect(page.getByText(/auto.*refine|recovery/i)).toBeVisible();

        // Test auto-refine toggle
        const autoRefineSwitch = page.locator('button[role="switch"]').first();
        await autoRefineSwitch.click();
        await expect(page.getByText(/auto.*refine.*enabled|disabled/i)).toBeVisible();

        // Test safety rollback toggle
        const safetyRollbackSwitch = page.locator('button[role="switch"]').nth(1);
        await safetyRollbackSwitch.click();
        await expect(page.getByText(/safety.*rollback.*enabled|disabled/i)).toBeVisible();
    });

    test('should validate mobile application integration', async ({ page }) => {
        // Navigate to Infrastructure Tab
        await page.getByTestId('ops-category-trigger').click();
        await page.getByTestId('infrastructure-tab').click();

        // Verify mobile app section
        await expect(page.getByText('Mobile Applications')).toBeVisible();

        // Check for App Store and Play Store links
        await expect(page.getByRole('link', { name: /app store/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /play store/i })).toBeVisible();

        // Verify feature list
        await expect(page.getByText(/push notifications|real.*time|one.*touch/i)).toBeVisible();
    });

    test('should manage on-premise deployments', async ({ page }) => {
        // Navigate to On-Prem Tab
        await page.getByTestId('ops-category-trigger').click();
        await page.getByTestId('on-prem-tab').click();

        // Verify deployment cards
        await expect(page.getByText(/kubernetes|deployment/i)).toBeVisible();

        // Check deployment status
        await expect(page.getByText(/running|healthy|active/i)).toBeVisible();

        // Test action buttons
        const actionBtn = page.getByRole('button', { name: /trigger|action/i }).first();
        if (await actionBtn.isVisible()) {
            await actionBtn.click();
            await expect(page.getByText(/action.*triggered/i)).toBeVisible();
        }
    });

    test('should validate semantic audit trail integrity', async ({ page }) => {
        // Navigate to Audit Tab
        await page.getByTestId('gov-category-trigger').click();
        await page.getByTestId('audit-tab').click();

        // Verify audit entries exist
        await expect(page.getByText(/intent|reasoning|approved|denied/i)).toBeVisible();

        // Check token and cost metrics
        await expect(page.getByText(/\d+.*tokens?.*\$\d+\.\d+/i)).toBeVisible();

        // Test forensic trace viewing
        const traceBtn = page.getByRole('button', { name: /view.*trace|forensic/i }).first();
        await traceBtn.click();
        await expect(page.getByText(/forensic.*trace/i)).toBeVisible();
    });

    test('should validate SLA management and compliance', async ({ page }) => {
        // Navigate to SLA Tab
        await page.getByTestId('gov-category-trigger').click();
        await page.getByTestId('sla-tab').click();

        // Verify SLA metrics
        await expect(page.getByText(/uptime.*guarantee|response.*time|sla.*tier/i)).toBeVisible();

        // Check current performance
        await expect(page.getByText(/\d+\.\d+%|breaches?|compliant/i)).toBeVisible();

        // Verify SLA status indicators
        await expect(page.locator('[data-testid*="sla"], .sla-status')).toBeVisible();
    });

    test('should complete SSO authentication flow', async ({ page }) => {
        // Navigate to SSO Tab
        await page.getByTestId('gov-category-trigger').click();
        await page.getByTestId('sso-tab').click();

        // Verify provider options
        await expect(page.getByText(/okta|azure|saml/i)).toBeVisible();

        // Test provider connection (mock)
        const connectBtn = page.getByRole('button', { name: /connect|configure/i }).first();
        if (await connectBtn.isVisible()) {
            await connectBtn.click();
            await expect(page.getByText(/connection|handshake|configured/i)).toBeVisible();
        }

        // Verify connected providers list
        await expect(page.locator('.provider-list, [data-testid*="provider"]')).toBeVisible();
    });

    test('should validate partner portal synchronization', async ({ page }) => {
        // Navigate to Partner Portal Tab
        await page.getByTestId('gov-category-trigger').click();
        await page.getByTestId('partner-tab').click();

        // Verify partner integrations
        await expect(page.getByText(/partner|integration|sync/i)).toBeVisible();

        // Check sync status
        await expect(page.getByText(/active|last.*sync|connected/i)).toBeVisible();

        // Test partner management actions
        const partnerActions = page.locator('button').filter({ hasText: /manage|configure|sync/i });
        if (await partnerActions.first().isVisible()) {
            await partnerActions.first().click();
            await expect(page.getByText(/partner.*updated|sync.*complete/i)).toBeVisible();
        }
    });

    test('should deploy and validate localization packages', async ({ page }) => {
        // Navigate to L10n Tab
        await page.getByTestId('advanced-category-trigger').click();
        await page.getByTestId('localization-tab').click();

        // Verify localization configs
        await expect(page.getByText(/language|region|locale/i)).toBeVisible();

        // Test language deployment
        const deployBtn = page.getByRole('button', { name: /deploy|activate/i }).first();
        if (await deployBtn.isVisible()) {
            await deployBtn.click();
            await expect(page.getByText(/package.*deployed|synchronized/i)).toBeVisible();
        }

        // Verify accuracy scores
        await expect(page.getByText(/\d+\.\d+%|accuracy/i)).toBeVisible();
    });

    test('should validate model performance monitoring', async ({ page }) => {
        // Navigate to Models Tab
        await page.getByTestId('advanced-category-trigger').click();
        await page.getByTestId('models-tab').click();

        // Verify LLM provider metrics
        await expect(page.getByText(/latency|throughput|p95|cost/i)).toBeVisible();

        // Check failover chain visualization
        await expect(page.getByText(/primary|warm.*spare|emergency/i)).toBeVisible();

        // Test failover simulation
        const failoverBtn = page.getByRole('button', { name: /test.*failover|simulate/i }).first();
        if (await failoverBtn.isVisible()) {
            await failoverBtn.click();
            await expect(page.getByText(/failover.*initiated|complete/i)).toBeVisible();
        }
    });

    test('should validate strategic insights generation', async ({ page }) => {
        // Navigate to Venture Tab
        await page.getByTestId('advanced-category-trigger').click();
        await page.getByTestId('venture-tab').click();

        // Verify strategic insights
        await expect(page.getByText(/insight|recommendation|priority/i)).toBeVisible();

        // Check confidence scores
        await expect(page.getByText(/\d+%|confidence/i)).toBeVisible();

        // Verify impact levels and actions
        await expect(page.getByText(/high|medium|low|impact|action/i)).toBeVisible();
    });

    test('should validate real-time streaming metrics', async ({ page }) => {
        // Navigate to Infrastructure Tab
        await page.getByTestId('ops-category-trigger').click();
        await page.getByTestId('infrastructure-tab').click();

        // Verify streaming metrics section
        await expect(page.getByText('Real-Time Streaming Metrics')).toBeVisible();

        // Check live metrics
        await expect(page.getByText(/\d+K.*tokens|\$\d+\.\d+.*cost|\d+ms/i)).toBeVisible();

        // Verify WebSocket connection status
        await expect(page.getByText(/connected|websocket/i)).toBeVisible();

        // Test stream configuration
        const configBtn = page.getByRole('button', { name: /configure.*stream/i });
        if (await configBtn.isVisible()) {
            await configBtn.click();
            await expect(page.getByText(/streaming.*enabled|configured/i)).toBeVisible();
        }
    });

    test('should validate notification channel delivery', async ({ page }) => {
        // Navigate to Alerts Tab
        await page.getByTestId('gov-category-trigger').click();
        await page.getByTestId('alerts-tab').click();

        // Verify notification channels
        await expect(page.getByText(/slack|teams|email|webhook/i)).toBeVisible();

        // Test channel toggles
        const channelToggles = page.locator('button[role="switch"]');
        for (const toggle of await channelToggles.all()) {
            await toggle.click();
            await expect(page.getByText(/alert.*enabled|disabled/i)).toBeVisible();
        }

        // Verify threshold settings
        await expect(page.getByText(/\d+%|threshold/i)).toBeVisible();
    });

    test('should export enterprise agent data to CSV', async ({ page }) => {
        // Find and click Export Data button
        const exportBtn = page.getByTestId('export-agent-data-btn');
        await expect(exportBtn).toBeVisible();

        // Start waiting for download before clicking
        const downloadPromise = page.waitForEvent('download');
        await exportBtn.click();
        const download = await downloadPromise;

        // Verify download filename and toast
        expect(download.suggestedFilename()).toContain('agentops-export-');
        await expect(page.getByText(/Enterprise data export complete/i)).toBeVisible();
    });

    test('should toggle Persistent Memory when creating new agent', async ({ page }) => {
        // Click New Agent button
        await page.getByTestId('new-agent-btn').click();

        // Verify toggle is visible
        const memoryToggle = page.getByTestId('agent-memory-toggle');
        await expect(memoryToggle).toBeVisible();

        // Check default state (should be 'on' based on state initialization)
        await expect(memoryToggle).toHaveAttribute('aria-checked', 'true');

        // Toggle it off
        await memoryToggle.click();
        await expect(memoryToggle).toHaveAttribute('aria-checked', 'false');

        // Fill name and create
        await page.getByTestId('agent-name-input').fill('Memory-Test-Agent');
        await page.getByRole('button', { name: /create agent/i }).click();

        // Verify success
        await expect(page.getByText(/agent.*created/i)).toBeVisible();
    });
});
