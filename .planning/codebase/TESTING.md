# Testing Patterns

**Analysis Date:** 2026-04-09

## Test Framework

**Unit Testing:**

- Vitest (v2.1.4) - configured in `package.json`
- Run: `pnpm test` (or `pnpm test:run`)
- UI mode: `pnpm test:ui`
- Coverage: `pnpm test:coverage`

**E2E Testing:**

- Playwright (v1.49.1)
- Config: `playwright.config.ts` in root
- Run: `pnpm test:e2e`

**Linting:**

- ESLint (v9.18.0) - `pnpm lint`
- TypeScript check - `pnpm check`

## Test File Organization

**Locations:**
| Type | Path | Pattern |
|------|------|----------|
| E2E (Playwright) | `client/src/tests/` | `*.spec.ts` |
| E2E (Playwright) | `client/src/test/` | `*.spec.ts`, `*.test.ts` |
| Unit (Vitest) | `client/src/test/` | `*.test.ts` |
| Python | `tests/` | `*.py` |

**Naming Conventions:**

- E2E: `login.spec.ts`, `e2e.spec.ts`, `sentinel-functional.spec.ts`
- Unit: `e2e.test.ts` (misnamed - contains e2e tests)

## Playwright Configuration

**Config File:** `playwright.config.ts`

```typescript
// Key settings
testDir: "./client/src/tests";
testMatch: ["**/*.spec.ts"];
outputDir: "./client/src/test-results/runs";
fullyParallel: true;
forbidOnly: !!process.env.CI; // Fail on .only in CI
retries: process.env.CI ? 2 : 0;
timeout: 30000;
expect: {
  timeout: 5000;
}
```

**Projects:**

- Chromium (default, runs first)
- Firefox and WebKit: commented out, can run manually
- Mobile emulation: available via config

**Reporters:**

- HTML: `client/src/test-results/html`
- JSON: `client/src/test-results/results.json`
- List: console output

**Base URL:**

- Default: `http://149.104.110.122:7000` (remote test server)
- Configurable via `TEST_BASE_URL` env var

## Test Structure

**E2E Suite Pattern:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/route");
  });

  test("should do something", async ({ page }) => {
    await page.fill('input[name="email"]', "test@example.com");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/destination/);
  });
});
```

**Authentication Tests:**

- Located in `client/src/tests/login.spec.ts`
- Covers: login form, invalid credentials, protected routes, session persistence
- Uses test credentials: `admin@example.com` / `AlphaAI@2026`

**Full E2E Coverage:**

- Located in `client/src/test/e2e.spec.ts` (~1100+ lines)
- Tests: Homepage, Navigation, Product Pages, Legacy Routes, 404 Page, API Connectivity, Authentication, Billing, Visual Regression, Mobile Responsiveness, Button/Dialog/Dropdown/Form interactions, Tabs Navigation, Keyboard Navigation, Toast Notifications, Error States, Accessibility

## Test Types

**Unit Tests:**

- Not extensively used
- Focus on utility functions and hooks
- Run via Vitest

**Integration Tests:**

- API proxy testing via E2E
- Go API Gateway health checks
- Python ML Backend health checks

**E2E Tests:**

- Full browser automation with Playwright
- Covers user flows end-to-end
- Visual regression testing with `toHaveScreenshot`
- Mobile viewport testing (iPhone SE: 375x667)

## Mocking

**What to Mock:**

- External APIs: Use Playwright's `request` API
- Browser APIs: Not extensively used

**What NOT to Mock:**

- Core business logic (tested via E2E)
- UI components (tested via E2E interaction)

**E2E Mocking Pattern:**

```typescript
test("API connectivity", async ({ request }) => {
  const response = await request.get("http://localhost:7001/health");
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.status).toBe("healthy");
});
```

## Fixtures and Factories

**Test Data:**

- Hardcoded in E2E test files
- Demo users: `admin@example.com`, `demo@alpha.ai`, `test@example.com`
- Passwords: `AlphaAI@2026`, `demo123`, `TestPassword123!`

**Example Test Data:**

```typescript
const testUser = {
  email: "test@example.com",
  password: "TestPassword123!",
};
```

## Coverage

**Requirements:** No explicit target enforced

**View Coverage:**

```bash
pnpm test:coverage
```

**Coverage output:** `./coverage/` directory

**Note:** Coverage configuration not explicitly set in `package.json` - Vitest defaults apply

## CI/CD Pipeline

**GitHub Actions:** `.github/workflows/ci-cd.yml`

**Jobs:**

1. **Lint & Type Check** - `pnpm lint`, `pnpm check`
2. **Unit Tests** - `pnpm test --run`, uploads to Codecov
3. **E2E Tests** - `pnpm test:e2e`, with Playwright browser install
4. **Build** - `pnpm build`
5. **Deploy** - Only on main branch
6. **Quality Gate** - Summary of all checks

**Environment:**

- Node.js 22
- pnpm 10

## Common Patterns

**Async Testing:**

```typescript
test("async operation", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1")).toBeVisible();
});
```

**Error Testing:**

```typescript
test("should show error for invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "invalid@example.com");
  await page.fill('input[name="password"]', "wrongpassword");
  await page.click('button[type="submit"]');
  await expect(page.getByText(/invalid credentials/i)).toBeVisible();
});
```

**Visual Regression:**

```typescript
test("homepage visual snapshot", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png", {
    maxDiffPixelRatio: 0.1,
  });
});
```

**Accessibility Testing:**

```typescript
test("should have proper heading hierarchy", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  const h2Count = await page.locator("h2").count();
  expect(h2Count).toBeGreaterThan(0);
});
```

**API Testing:**

```typescript
test("should connect to Go API Gateway", async ({ request }) => {
  const response = await request.get("http://localhost:7001/health");
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toHaveProperty("status", "healthy");
});
```

## Test Execution

**Local Development:**

```bash
pnpm test:e2e                    # Run all E2E tests
pnpm test:e2e -- --project=chromium  # Run specific browser
pnpm test:e2e -- --debug          # Debug mode
```

**CI/CD:**

```bash
pnpm lint && pnpm check          # Lint and type check
pnpm test --run                  # Unit tests
pnpm test:e2e                    # E2E tests (requires services)
```

---

_Testing analysis: 2026-04-09_
