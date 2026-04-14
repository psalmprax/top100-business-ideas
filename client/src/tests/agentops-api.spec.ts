import { test, expect } from "@playwright/test";

test("should test all implemented endpoints directly", async ({ request }) => {
  console.log("Testing real implemented endpoints:");

  // 1. Test Governance endpoints
  console.log("\n📊 Testing Governance Endpoints:");

  const quorum = await request.get(
    "http://149.104.110.122:7002/governance/audit/quorum"
  );
  expect(
    quorum.ok(),
    `Governance quorum endpoint failed: ${quorum.status()}`
  ).toBeTruthy();
  const quorumData = await quorum.json();
  console.log("✅ /governance/audit/quorum works:", quorumData);

  const auditLogs = await request.get(
    "http://149.104.110.122:7002/governance/audit/logs"
  );
  expect(
    auditLogs.ok(),
    `Audit logs endpoint failed: ${auditLogs.status()}`
  ).toBeTruthy();
  console.log("✅ /governance/audit/logs works");

  const governanceStats = await request.get(
    "http://149.104.110.122:7002/governance/stats"
  );
  expect(
    governanceStats.ok(),
    `Governance stats endpoint failed: ${governanceStats.status()}`
  ).toBeTruthy();
  console.log("✅ /governance/stats works");

  // 2. Test Optimization endpoints
  console.log("\n📈 Testing Optimization Endpoints:");

  const efficiency = await request.get(
    "http://149.104.110.122:7002/governance/optimization/workforce/efficiency"
  );
  expect(
    efficiency.ok(),
    `Efficiency endpoint failed: ${efficiency.status()}`
  ).toBeTruthy();
  const efficiencyData = await efficiency.json();
  console.log("✅ /optimization/workforce/efficiency works:", efficiencyData);

  const cost = await request.get(
    "http://149.104.110.122:7002/governance/optimization/cost"
  );
  expect(
    cost.ok(),
    `Cost optimization endpoint failed: ${cost.status()}`
  ).toBeTruthy();
  const costData = await cost.json();
  console.log("✅ /optimization/cost works:", costData);

  const recommendations = await request.get(
    "http://149.104.110.122:7002/governance/optimization/recommendations"
  );
  expect(
    recommendations.ok(),
    `Recommendations endpoint failed: ${recommendations.status()}`
  ).toBeTruthy();
  const recommendationsData = await recommendations.json();
  console.log("✅ /optimization/recommendations works:", recommendationsData);

  // 3. Test Shadow AI endpoints
  console.log("\n🛡️ Testing Shadow AI Endpoints:");

  const detections = await request.get(
    "http://149.104.110.122:7002/shadow-ai/detections"
  );
  expect(
    detections.ok(),
    `Shadow AI detections failed: ${detections.status()}`
  ).toBeTruthy();
  console.log("✅ /shadow-ai/detections works");

  const shadowStats = await request.get(
    "http://149.104.110.122:7002/shadow-ai/stats"
  );
  expect(
    shadowStats.ok(),
    `Shadow AI stats failed: ${shadowStats.status()}`
  ).toBeTruthy();
  const shadowStatsData = await shadowStats.json();
  console.log("✅ /shadow-ai/stats works:", shadowStatsData);

  const blockTool = await request.post(
    "http://149.104.110.122:7002/shadow-ai/block/test-tool-123"
  );
  expect(
    blockTool.ok(),
    `Block tool endpoint failed: ${blockTool.status()}`
  ).toBeTruthy();
  const blockData = await blockTool.json();
  console.log("✅ /shadow-ai/block/{tool_id} works:", blockData);

  const allowTool = await request.post(
    "http://149.104.110.122:7002/shadow-ai/allow/test-tool-123"
  );
  expect(
    allowTool.ok(),
    `Allow tool endpoint failed: ${allowTool.status()}`
  ).toBeTruthy();
  const allowData = await allowTool.json();
  console.log("✅ /shadow-ai/allow/{tool_id} works:", allowData);

  // 4. Test Deepfake endpoints
  console.log("\n🎭 Testing Deepfake Endpoints:");

  const sdkDownload = await request.get(
    "http://149.104.110.122:7002/deepfake/sdk/download/android"
  );
  expect(
    sdkDownload.ok(),
    `SDK download endpoint failed: ${sdkDownload.status()}`
  ).toBeTruthy();
  const sdkData = await sdkDownload.json();
  console.log("✅ /deepfake/sdk/download/{platform} works:", sdkData);

  console.log("\n🎉 ALL IMPLEMENTED ENDPOINTS WORK SUCCESSFULLY!");
});
