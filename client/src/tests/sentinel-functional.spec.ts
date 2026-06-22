import { test, expect } from "@playwright/test";

test.describe("Sentinel Security Lockdown Protocol", () => {
  const ADMIN_SECRET = "test-admin-secret-alaska";
  const API_URL = process.env.VITE_API_URL || "http://localhost:7001";

  test("should activate system-wide lockdown and then reset", async ({
    request,
  }) => {
    // 1. Initially, systems should be accessible (check health)
    const initialHealth = await request.get(`${API_URL}/health`);
    expect(initialHealth.ok()).toBe(true);

    // 2. Trigger Panic Word Lockdown
    console.log("Triggering Panic Word Lockdown...");
    const lockResponse = await request.post(`${API_URL}/api/v1/panic/lock`);
    expect(lockResponse.ok()).toBe(true);
    const lockData = await lockResponse.json();
    expect(lockData.success).toBe(true);
    expect(lockData.message).toContain("Lock engaged");

    // 3. Verify System is Locked (Non-white-listed routes should return 503)
    // We use /api/v1/agents which is protected by SystemLock middleware
    const lockedResponse = await request.get(`${API_URL}/api/v1/agents`);
    expect(lockedResponse.status()).toBe(503);
    const errorData = await lockedResponse.json();
    expect(errorData.error).toBe("System Lock Active");

    // 4. Reset System with Administrative Secret
    console.log("Triggering Administrative Reset...");
    const resetResponse = await request.post(`${API_URL}/api/v1/panic/reset`, {
      data: { adminSecret: ADMIN_SECRET },
    });
    expect(resetResponse.ok()).toBe(true);
    const resetData = await resetResponse.json();
    expect(resetData.success).toBe(true);
    expect(resetData.message).toContain("released");

    // 5. Verify System is Unlocked
    const unlockedHealth = await request.get(`${API_URL}/health`);
    expect(unlockedHealth.ok()).toBe(true);

    // Check /api/v1/agents - it might 401 if not logged in, but shouldn't be 503
    const postLockCheck = await request.get(`${API_URL}/api/v1/agents`);
    expect(postLockCheck.status()).not.toBe(503);
  });

  test("should reject reset with invalid secret", async ({ request }) => {
    // Ensure system is locked for this test
    await request.post(`${API_URL}/api/v1/panic/lock`);

    const resetResponse = await request.post(`${API_URL}/api/v1/panic/reset`, {
      data: { adminSecret: "wrong-secret" },
    });
    expect(resetResponse.status()).toBe(403);

    // Cleanup: Reset with correct secret
    await request.post(`${API_URL}/api/v1/panic/reset`, {
      data: { adminSecret: ADMIN_SECRET },
    });
  });
});
