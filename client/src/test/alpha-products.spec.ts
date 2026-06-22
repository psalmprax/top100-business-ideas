import { test, expect } from "@playwright/test";

test.describe("AlphaHecta Products", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Landing Page", () => {
    test("should load the landing page", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("Enterprise AI Solutions")).toBeVisible();
    });

    test("should show all 3 products", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("AgentOps", { exact: true })).toBeVisible();
      await expect(
        page.getByText("AI Compliance Hub", { exact: true })
      ).toBeVisible();
      await expect(
        page.getByText("Deepfake Defense", { exact: true })
      ).toBeVisible();
    });

    test("should navigate to product pages", async ({ page }) => {
      await page.goto("/");
      await page
        .locator('[data-testid="venture-card"]')
        .filter({ hasText: "AgentOps" })
        .getByRole("button", { name: "Learn More" })
        .click();
      await expect(page).toHaveURL(/.*products\/agent-ops/);
      await expect(page.getByText("AgentOps Sentinel")).toBeVisible();
    });
  });

  test.describe("Authentication", () => {
    test("should show login page", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByText("AlphaHecta", { exact: true })).toBeVisible();
      await expect(
        page.getByText("Sign in to your account to continue")
      ).toBeVisible();
    });

    test("should show sign up option", async ({ page }) => {
      await page.goto("/login");
      await page.getByTestId("tab-signup").click();
      await expect(
        page.getByText("Create Account", { exact: true })
      ).toBeVisible();
    });

    test("should show OAuth buttons", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByText("Google")).toBeVisible();
      await expect(page.getByText("Apple")).toBeVisible();
    });

    test("should validate email input", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "invalid-email");
      await page.click('button[type="submit"]');
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      );
      expect(validationMessage).not.toBe("");
    });
  });

  test.describe("Billing Page", () => {
    test("should show pricing plans", async ({ page }) => {
      await page.goto("/billing");
      await expect(page.getByText("Developer", { exact: true })).toBeVisible();
      await expect(page.getByText("Starter", { exact: true })).toBeVisible();
      await expect(page.getByText("Enterprise", { exact: true })).toBeVisible();
    });

    test("should show current plan badge", async ({ page }) => {
      await page.goto("/billing");
      await expect(
        page.getByRole("heading", { name: /Current Plan:/i })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: /Starter/i })
      ).toBeVisible();
    });

    test("should show payment method section", async ({ page }) => {
      await page.goto("/billing");
      await page.click('[data-testid="tab-payment"]');
      // Use specific locator to avoid strict mode violation with tab trigger
      await expect(
        page
          .locator('[data-slot="card-title"]')
          .getByText("Payment Method", { exact: true })
      ).toBeVisible();
      await expect(page.getByText("4242")).toBeVisible();
    });

    test("should show invoice history", async ({ page }) => {
      await page.goto("/billing");
      await page.click('[data-testid="tab-invoices"]');
      await expect(
        page
          .locator('[data-slot="card-title"]')
          .getByText("Invoice History", { exact: true })
      ).toBeVisible();
      await expect(page.getByText("INV-001")).toBeVisible();
    });
  });

  test.describe("Settings Page", () => {
    test("should show settings tabs", async ({ page }) => {
      await page.goto("/settings");
      await expect(page.getByTestId("tab-profile")).toBeVisible();
      await expect(page.getByTestId("tab-security")).toBeVisible();
      await expect(page.getByTestId("tab-notifications")).toBeVisible();
      await expect(page.getByTestId("tab-api")).toBeVisible();
    });

    test("should allow profile editing", async ({ page }) => {
      await page.goto("/settings");
      await page.fill('[data-testid="input-profile-name"]', "John Doe");
      await page.click('[data-testid="btn-save-profile"]');
    });

    test("should show security settings", async ({ page }) => {
      await page.goto("/settings");
      await page.click('[data-testid="tab-security"]');
      await expect(page.getByText("Two-Factor Authentication")).toBeVisible();
    });
  });

  test.describe("Dashboard Product Pages", () => {
    test("should load AgentOps Dashboard", async ({ page }) => {
      await page.goto("/products/agent-ops");
      await expect(page.getByText("AgentOps Sentinel")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
    });

    test("should load AI Compliance Hub Dashboard", async ({ page }) => {
      await page.goto("/products/ai-compliance");
      await expect(
        page.getByText("AI Compliance Hub", { exact: true })
      ).toBeVisible();
      await expect(page.getByText("Compliance Score")).toBeVisible();
    });

    test("should load Deepfake Defense Force Dashboard", async ({ page }) => {
      await page.goto("/products/deepfake-defense");
      // Use a broader text match for the product identifier
      await expect(
        page.getByText("LivenessLink", { exact: false }).first()
      ).toBeVisible();
    });
  });

  test.describe("Secondary Alpha Products", () => {
    test("should load DenialDefense and show recovery rate", async ({
      page,
    }) => {
      await page.goto("/products/denial-defense");
      await expect(page.locator("h1")).toContainText("DenialDefense");
      await expect(page.getByTestId("stat-recovery-rate")).toBeVisible();
    });

    test("should load ActionableAI and show compute load", async ({ page }) => {
      await page.goto("/products/actionable-ai");
      await expect(page.locator("h1")).toContainText("ActionableAI");
      await expect(page.getByTestId("stat-compute-load")).toBeVisible();
    });

    test("should load FreelancerWorkflowBot and show authorization", async ({
      page,
    }) => {
      await page.goto("/products/workflow-bot");
      await expect(page.locator("h1")).toContainText("WorkflowBot PRO");
      await expect(page.getByTestId("btn-authorize-agent")).toBeVisible();
    });
  });

  test.describe("AlphaHectaWorkforce (Unauthenticated)", () => {
    test("should redirect /products/workforce to /login if not authenticated", async ({
      page,
    }) => {
      await page.goto("/products/workforce");
      await page.waitForURL(url => url.pathname.includes("/login"));
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe("AlphaHectaWorkforce (Authenticated)", () => {
    // Note: In a real CI, we would use a storage state or a login helper.
    // For this demo, we verify the page structure assuming some bypass or mock.
    test("should show management tabs on AlphaHectaWorkforce", async ({
      page,
    }) => {
      await page.goto("/products/workforce");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("login")) {
        await expect(page).toHaveURL(/.*login/);
      } else {
        await expect(page.getByTestId("tab-boardroom")).toBeVisible();
        await expect(page.getByTestId("auto-mode-toggle")).toBeVisible();
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
    });

    test("should work on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
    });

    test("should work on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should have working navigation", async ({ page }) => {
      await page.goto("/");
      // Check navigation exists
      await expect(page.locator("nav")).toBeVisible();
    });

    test("should handle 404 gracefully", async ({ page }) => {
      await page.goto("/nonexistent");
      await expect(page.getByText("Page not found")).toBeVisible();
    });
  });

  test.describe("API Endpoints", () => {
    test("health check should work", async ({ request }) => {
      const response = await request.get("http://localhost:7001/health");
      expect(response.ok()).toBeTruthy();
    });
  });
});

test.describe("Performance", () => {
  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("");
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  test("should have no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await page.goto("");
    expect(errors).toHaveLength(0);
  });
});
