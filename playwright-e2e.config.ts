import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./client/src/test",
  testMatch: ["**/*.spec.ts"],
  outputDir: "./client/src/test-results/runs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: [
    ["list"],
    ["json", { outputFile: "client/src/test-results/e2e-full-results.json" }],
  ],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: "http://localhost:7000",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-US",
    timezoneId: "America/New_York",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
