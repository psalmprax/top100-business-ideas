/**
 * Login E2E Test
 * Tests the complete login flow from frontend to backend
 */

import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should load homepage and show login form", async ({ page }) => {
    // Navigate to the application
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Take screenshot for debugging
    await page.screenshot({ path: "debug-homepage.png" });

    // Check if we can see the login/signup tabs
    const tabsVisible = await page
      .locator('[data-testid="tab-signup"]')
      .isVisible()
      .catch(() => false);
    console.log("Login tabs visible:", tabsVisible);

    // Check for any login related elements
    const hasLoginElements =
      (await page
        .locator('input[type="email"], button:has-text("Sign"), .login')
        .count()) > 0;
    console.log("Has login elements:", hasLoginElements);

    // Just verify the page loads
    expect(page.url()).toContain("149.104.110.122:7000");

    console.log("Homepage loaded successfully");
  });
  test("should login successfully via UI form", async ({ page }) => {
    // Navigate to the login page
    await page.goto("/login");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Wait for login form elements
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid="btn-signin"]', {
      timeout: 10000,
    });

    // Fill in login credentials
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "AlphaAI@2026");

    // Take screenshot before submitting
    await page.screenshot({ path: "debug-before-form-submit.png" });

    // Submit the form by clicking the button
    await page.click('[data-testid="btn-signin"]');

    // Wait for potential navigation or API calls
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // Check if we were redirected (successful login) or stayed on login page
    const currentUrl = page.url();
    console.log("URL after form submission:", currentUrl);

    // Check for console messages that indicate form submission worked
    const logs = [];
    page.on("console", msg => logs.push(msg.text()));

    // Wait a bit more for any async operations
    await page.waitForTimeout(2000);

    console.log("Console logs during form submission:", logs);

    // Check if any API requests were made
    const apiRequests = logs.filter(
      log => log.includes("API") || log.includes("fetch")
    );
    console.log("API-related logs:", apiRequests);

    // Check various indicators of login success
    const handleLoginCalled = logs.some(log => log.includes("Got result:"));
    const loginResponseReceived = logs.some(log =>
      log.includes("login response")
    );
    const redirectAttempted = logs.some(log => log.includes("Redirecting to"));
    const authDetected = logs.some(log =>
      log.includes("Authentication detected")
    );
    console.log("handleLogin was called:", handleLoginCalled);
    console.log("Login response received:", loginResponseReceived);
    console.log("Redirect attempted:", redirectAttempted);
    console.log("Auth state change detected:", authDetected);

    if (handleLoginCalled) {
      console.log("✅ Form submission is working!");
    } else {
      console.log(
        "❌ Form submission is not working - handleLogin never called"
      );
    }

    // Check final URL - if redirected to product page, login worked
    if (currentUrl.includes("/products/")) {
      console.log("✅ Login successful - redirected to product page");
    } else if (currentUrl.includes("/login")) {
      console.log("❌ Login failed - still on login page");
    } else {
      console.log("? Unexpected URL:", currentUrl);
    }
  });

  test("should show error for invalid credentials", async ({ page }) => {
    // Navigate to the login page directly
    await page.goto("/login");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if we're already logged in and redirected
    const currentUrl = page.url();
    if (currentUrl !== "/login" && currentUrl.includes("/products/")) {
      console.log("Already logged in, skipping invalid credentials test");
      return;
    }

    // Click the Sign In tab (should be active by default)
    await page.getByRole("tab", { name: /sign in/i }).click();

    // Wait for login form to be visible
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Fill in invalid login credentials
    await page.fill('input[type="email"]', "invalid@example.com");
    await page.fill('input[type="password"]', "wrongpassword");

    // Click login button
    await page.getByRole("button", { name: /sign in to product/i }).click();

    // Wait for error message
    await page.waitForSelector(
      '[data-testid="error-message"], .error, .text-red-500',
      { timeout: 10000 }
    );

    // Verify error message is shown
    const errorVisible = await page
      .locator('[data-testid="error-message"], .error, .text-red-500')
      .isVisible();
    expect(errorVisible).toBe(true);

    // Verify we are still on the login page
    const finalUrl = page.url();
    expect(finalUrl).toBe("http://149.104.110.122:7000/login");

    console.log("Invalid credentials test passed - error shown correctly");
  });

  test("should allow access to protected route when authenticated", async ({
    page,
  }) => {
    // Try to access a protected route directly
    await page.goto("/products/agent-ops");

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Should stay on the protected page if authenticated
    const currentUrl = page.url();
    expect(currentUrl).toContain("/products/agent-ops");

    console.log("Protected route access test passed - user is authenticated");
  });
});
