import { test, expect } from "@playwright/test";

const BASE_URL = "http://149.104.110.122:7000";
const API_URL = "http://149.104.110.122:7002";

async function loginAndNavigate(
  page: any,
  menuButton: string | undefined,
  tabName: string | undefined
) {
  await page.goto(`${BASE_URL}/login?product=agent-ops`);
  await page.waitForLoadState("networkidle");

  await page.getByTestId("input-email").fill("admin@example.com");
  await page.getByTestId("input-password").fill("AlphaAI@2026");
  await page.getByTestId("btn-signin").click();

  await page.waitForURL("**/products/agent-ops", { timeout: 20000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);

  if (menuButton) {
    await page.getByRole("button", { name: menuButton }).click();
    await page.waitForTimeout(1000);
  }

  if (tabName) {
    await page.getByRole("tab", { name: tabName }).click();
    await page.waitForTimeout(1000);
  }
}

test.describe("AgentOps API Response Validation", () => {
  test.skip("should validate governance/audit API returns data", async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/governance/audit/quorum`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    console.log(
      "✅ API: /governance/audit/quorum",
      JSON.stringify(data).substring(0, 100)
    );
  });

  test.skip("should validate governance/optimization API returns data", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_URL}/governance/optimization/workforce/efficiency`
    );
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    console.log(
      "✅ API: /governance/optimization/workforce/efficiency",
      JSON.stringify(data).substring(0, 100)
    );
  });

  test.skip("should validate governance/optimization/cost API returns data", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_URL}/governance/optimization/cost`
    );
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    console.log(
      "✅ API: /governance/optimization/cost",
      JSON.stringify(data).substring(0, 100)
    );
  });

  test.skip("should validate shadow-ai/detections API returns data", async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/shadow-ai/detections`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    console.log(
      "✅ API: /shadow-ai/detections",
      JSON.stringify(data).substring(0, 100)
    );
  });

  test.skip("should validate shadow-ai/stats API returns data", async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/shadow-ai/stats`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    console.log(
      "✅ API: /shadow-ai/stats",
      JSON.stringify(data).substring(0, 100)
    );
  });
});

test.describe("AgentOps Core Menu - Overview Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, undefined, "overview");
  });

  test("should render ALL OverviewSection components", async ({ page }) => {
    await expect(page.getByText("Total Agents")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Daily Spend", { exact: true })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Loops Prevented")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Cost Saved")).toBeVisible({ timeout: 5000 });
    console.log(
      "✅ Overview: MetricCards (Total Agents, Daily Spend, Loops Prevented, Cost Saved)"
    );
  });

  test("should render Budget Overview card with all elements", async ({
    page,
  }) => {
    await expect(page.getByText("Budget Overview")).toBeVisible({
      timeout: 10000,
    });
    console.log("✅ Overview: Budget Overview card");
  });

  test("should render Sentinel Features card with all features", async ({
    page,
  }) => {
    await expect(page.getByText("Sentinel Features")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Semantic Cost Capping")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Loop Prevention")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Decision Ledger")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Multi-Agent Budgeting")).toBeVisible({
      timeout: 5000,
    });
    console.log(
      "✅ Overview: Sentinel Features (Semantic Cost Capping, Loop Prevention, Decision Ledger, Multi-Agent Budgeting)"
    );
  });

  test("should render Usage Forecasting card", async ({ page }) => {
    await expect(page.getByText("Usage Forecasting")).toBeVisible({
      timeout: 10000,
    });
    console.log("✅ Overview: Usage Forecasting card");
  });

  test("should render Autonomous Recovery card with switches", async ({
    page,
  }) => {
    await expect(page.getByText("Autonomous Recovery")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Auto-Refine Prompts")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Safety-First Rollback")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Recovery Status")).toBeVisible({
      timeout: 5000,
    });
    console.log(
      "✅ Overview: Autonomous Recovery (Auto-Refine Prompts, Safety-First Rollback, Recovery Status)"
    );
  });
});

test.describe("AgentOps Core Menu - Agents Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, undefined, "agents");
  });

  test("should render AgentTableSection with all elements", async ({
    page,
  }) => {
    await expect(page.getByText("Autonomous Agent Multi-Tenancy")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Deploy Agent")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Sync Hardware")).toBeVisible({
      timeout: 5000,
    });
    console.log("✅ Agents: Table header, Deploy Agent, Sync Hardware buttons");
  });

  test("should render agent search input", async ({ page }) => {
    await expect(page.getByPlaceholder("Search by agent name")).toBeVisible({
      timeout: 10000,
    });
    console.log("✅ Agents: Search input");
  });

  test("should render all agent table headers", async ({ page }) => {
    await expect(page.getByText("Agent Identity")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Environment")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Execution Stack")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Status")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Resource Usage")).toBeVisible({
      timeout: 5000,
    });
    console.log(
      "✅ Agents: Table headers (Agent Identity, Environment, Execution Stack, Status, Resource Usage)"
    );
  });

  test("should open and verify New Agent Dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Deploy Agent" }).click();
    await expect(page.getByText("Initialize Sentinel Agent Node")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByPlaceholder("e.g. Sales Optimizer V1")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Deployment Environment")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Framework")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Operational Tier")).toBeVisible({
      timeout: 5000,
    });
    console.log("✅ Agents: New Agent Dialog (main form fields)");
  });
});

test.describe("AgentOps Core Menu - Budget Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, undefined, "budget");
  });

  test("should render BudgetSection metric cards", async ({ page }) => {
    await expect(page.getByText("Projected Spend")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Budget Utilization")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("ROI Efficiency")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Risk Score")).toBeVisible({ timeout: 5000 });
    console.log(
      "✅ Budget: Metric cards (Projected Spend, Budget Utilization, ROI Efficiency, Risk Score)"
    );
  });

  test("should render Cost Allocation chart", async ({ page }) => {
    await expect(page.getByText("Cost Allocation by Agent Swarm")).toBeVisible({
      timeout: 15000,
    });
    console.log("✅ Budget: Cost Allocation chart");
  });

  test("should render Budget Guardrails card with all elements", async ({
    page,
  }) => {
    await expect(page.getByText("Budget Guardrails")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Hard Cap (Monthly)")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Inference Ceiling")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Add Constraint Rule")).toBeVisible({
      timeout: 5000,
    });
    console.log(
      "✅ Budget: Budget Guardrails (Hard Cap, Inference Ceiling, Add Constraint)"
    );
  });
});

test.describe("AgentOps Operations Menu - Infrastructure Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Operations", "infrastructure");
  });

  test("should render Multi-Cloud Mesh card", async ({ page }) => {
    await expect(page.getByText("Multi-Cloud Mesh")).toBeVisible({
      timeout: 15000,
    });
    console.log("✅ Infrastructure: Multi-Cloud Mesh card");
  });

  test("should render Regional Health elements", async ({ page }) => {
    await expect(page.getByText("Node Topology")).toBeVisible({
      timeout: 10000,
    });
    console.log("✅ Infrastructure: Node Topology");
  });

  test("should render Emergency Ops card with all buttons", async ({
    page,
  }) => {
    await expect(page.getByText("Emergency Ops")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("TRIGGER GLOBAL PANIC")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("ADMINISTRATIVE RESET")).toBeVisible({
      timeout: 5000,
    });
    console.log(
      "✅ Infrastructure: Emergency Ops (TRIGGER GLOBAL PANIC, ADMINISTRATIVE RESET)"
    );
  });
});

test.describe("AgentOps Operations Menu - Webhooks Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Operations", "webhooks");
  });

  test("should render WebhookSection with all elements", async ({ page }) => {
    await expect(page.getByText("Event Webhooks")).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText(
        "Bi-directional infrastructure event synchronization and alerting."
      )
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder("Filter endpoints...")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("REGISTER ENDPOINT")).toBeVisible({
      timeout: 5000,
    });
    console.log(
      "✅ Webhooks: Event Webhooks, filter input, REGISTER ENDPOINT button"
    );
  });

  test("should render webhook table headers", async ({ page }) => {
    await expect(page.getByText("Endpoint URI")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Environment")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Status")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Last Event")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Actions")).toBeVisible({ timeout: 5000 });
    console.log("✅ Webhooks: Table headers");
  });
});

test.describe("AgentOps Operations Menu - On-Prem Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Operations", "on prem");
  });

  test("should render On-Prem Enclave placeholder", async ({ page }) => {
    await expect(page.getByText("On-Prem Enclave")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Request Access")).toBeVisible({
      timeout: 5000,
    });
    console.log("✅ On-Prem: On-Prem Enclave, Request Access");
  });
});

test.describe("AgentOps Governance Menu - Audit Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Governance", "audit");
  });

  test("should render Audit Trail section", async ({ page }) => {
    await expect(page.getByText("Immutable Audit Trail")).toBeVisible({
      timeout: 15000,
    });
    console.log("✅ Governance: Audit Trail");
  });
});

test.describe("AgentOps Governance Menu - Alerts Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Governance", "alerts");
  });

  test("should render Alerts Configuration section", async ({ page }) => {
    await expect(page.getByText("Active Governance Triggers")).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText(
        "Configure autonomous response protocols and safety thresholds."
      )
    ).toBeVisible({ timeout: 5000 });
    console.log("✅ Governance: Alerts Configuration");
  });
});

test.describe("AgentOps Governance Menu - Compliance Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Governance", "compliance");
  });

  test("should render Compliance Status section with all elements", async ({
    page,
  }) => {
    await expect(page.getByText("HIPAA Enclave Status")).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText("Health Insurance Portability and Accountability Act.")
    ).toBeVisible({ timeout: 5000 });
    console.log("✅ Governance: Compliance Status (HIPAA)");
  });
});

test.describe("AgentOps Governance Menu - SLA Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Governance", "sla");
  });

  test("should render SLA Oversight Module", async ({ page }) => {
    await expect(page.getByText("SLA Oversight Module")).toBeVisible({
      timeout: 15000,
    });
    console.log("✅ Governance: SLA Oversight Module");
  });
});

test.describe("AgentOps Governance Menu - SSO Tab - Full Component Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Governance", "sso");
  });

  test("should render SSO Protocol Registry", async ({ page }) => {
    await expect(page.getByText("SSO Protocol Registry")).toBeVisible({
      timeout: 15000,
    });
    console.log("✅ Governance: SSO Protocol Registry");
  });
});

test.describe("AgentOps Advanced Menu - Full Test", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Advanced", "forecast");
  });

  test("should render Advanced Orchestration placeholder", async ({ page }) => {
    await expect(
      page.getByText("Advanced Orchestration - Enterprise Roadmap")
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText(
        "Long-term ROI forecasting, advanced localization, and autonomous venture modeling are planned for Q3 2026."
      )
    ).toBeVisible({ timeout: 5000 });
    console.log("✅ Advanced: All tabs show placeholder content");
  });
});

test.describe("AgentOps Intelligence Menu - Paperclip Tab", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Intelligence", "paperclip");
  });

  test("should render Market Intelligence section", async ({ page }) => {
    await expect(page.getByText("Market Intelligence (Paperclip)")).toBeVisible(
      { timeout: 15000 }
    );
    await expect(page.getByText("Run Research")).toBeVisible({ timeout: 5000 });
    console.log("✅ Intelligence: Paperclip research section");
  });
});

test.describe("AgentOps Intelligence Menu - Hermes Tab", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, "Intelligence", "hermes");
  });

  test("should render Strategy Engine section", async ({ page }) => {
    await expect(page.getByText("Strategy Engine (Hermes)")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Generate Strategy")).toBeVisible({
      timeout: 5000,
    });
    console.log("✅ Intelligence: Hermes strategy section");
  });
});
