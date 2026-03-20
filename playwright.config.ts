/**
 * Playwright Configuration for E2E Testing
 * AlphaAI - Enterprise AI Solutions
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // Test directory
    testDir: './client/src/test',
    testMatch: ['**/*.spec.ts'],

    // Output directory for test results
    outputDir: './client/src/test-results/runs',

    // Fully parallel execution
    fullyParallel: true,

    // Fail build on CI if tests fail
    forbidOnly: !!process.env.CI,

    // Retry failed tests
    retries: process.env.CI ? 2 : 0,

    // Workers (parallel processes)
    workers: process.env.CI ? 1 : undefined,

    // Reporter
    reporter: [
        ['html', { outputFolder: 'client/src/test-results/html' }],
        ['json', { outputFile: 'client/src/test-results/results.json' }],
        ['list'],
    ],

    // Global timeout
    timeout: 30000,

    // Expect timeout
    expect: {
        timeout: 5000,
    },

    // Shared settings for all projects
    use: {
        // Base URL - frontend runs on port 3000
        baseURL: process.env.TEST_BASE_URL || 'http://localhost:7000',

        // Collect traces on failure
        trace: 'on-first-retry',

        // Collect videos on failure
        video: 'retain-on-failure',

        // Screenshots
        screenshot: 'only-on-failure',

        // Locale
        locale: 'en-US',

        // Timezone
        timezoneId: 'America/New_York',
    },

    // Projects (different browser configurations)
    projects: [
        // Desktop browsers - run chromium first as it's fastest
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Firefox and Webkit can be run manually with: npx playwright test --project=firefox
        // {
        //     name: 'firefox',
        //     use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] },
        // },

        // Mobile emulation - can be run manually
        // {
        //     name: 'Mobile Chrome',
        //     use: { ...devices['Pixel 5'] },
        // },
    ],

    // Local dev server - commented out since we run services manually
    // webServer: {
    //     command: 'cd client && pnpm dev',
    //     url: 'http://localhost:3000',
    //     reuseExistingServer: !process.env.CI,
    //     timeout: 120 * 1000,
    // },
});
