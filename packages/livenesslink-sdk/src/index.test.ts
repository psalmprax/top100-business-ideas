import { LivenessLinkClient, createLivenessLinkClient } from "./index";
import axios from "axios";
import { mockAxiosInstance } from "./__mocks__/axios";

jest.mock("axios");

describe("LivenessLinkClient", () => {
  let client: LivenessLinkClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new LivenessLinkClient({
      apiKey: "test-api-key",
      endpoint: "https://api.test.com",
    });
  });

  describe("constructor", () => {
    it("should create client with config", () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: "https://api.test.com",
        headers: {
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
        },
      });
    });

    it("should use default endpoint when not provided", () => {
      new LivenessLinkClient({ apiKey: "key" });
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://api.livenesslink.dev",
        })
      );
    });
  });

  describe("liveness sessions", () => {
    it("should create liveness session", async () => {
      const session = { id: "s1", status: "pending" };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: session });
      const result = await client.createLivenessSession();
      expect(result).toEqual(session);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/liveness/sessions");
    });

    it("should get liveness result", async () => {
      const result = { sessionId: "s1", isLive: true, confidence: 0.95 };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: result });
      const res = await client.getLivenessResult("s1");
      expect(res).toEqual(result);
    });
  });

  describe("verification sessions", () => {
    it("should create verification session", async () => {
      const session = { id: "v1", userId: "user1", status: "pending" };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: session });
      const result = await client.createVerificationSession("user1");
      expect(result).toEqual(session);
    });

    it("should get verification result", async () => {
      const result = { sessionId: "v1", verified: true, confidence: 0.92 };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: result });
      const res = await client.getVerificationResult("v1");
      expect(res).toEqual(result);
    });

    it("should get verification history", async () => {
      const history = [{ id: "v1" }, { id: "v2" }];
      mockAxiosInstance.get.mockResolvedValueOnce({ data: history });
      const result = await client.getVerificationHistory("user1");
      expect(result).toEqual(history);
    });
  });

  describe("biometrics", () => {
    it("should get biometric templates", async () => {
      const templates = [{ id: "t1", type: "face" }];
      mockAxiosInstance.get.mockResolvedValueOnce({ data: templates });
      const result = await client.getBiometricTemplates("user1");
      expect(result).toEqual(templates);
    });

    it("should delete biometric template", async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({});
      await client.deleteBiometricTemplate("user1", "t1");
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        "/biometrics/user1/t1"
      );
    });
  });

  describe("fraud alerts", () => {
    it("should get fraud alerts", async () => {
      const alerts = [{ id: "a1", type: "deepfake" }];
      mockAxiosInstance.get.mockResolvedValueOnce({ data: alerts });
      const result = await client.getFraudAlerts({ severity: "high" });
      expect(result).toEqual(alerts);
    });
  });

  describe("analytics", () => {
    it("should get analytics summary", async () => {
      const summary = {
        totalVerifications: 100,
        successRate: 0.95,
        fraudAttemptsDetected: 3,
      };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: summary });
      const result = await client.getAnalyticsSummary();
      expect(result).toEqual(summary);
    });
  });

  describe("webhooks", () => {
    it("should configure webhook", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({});
      await client.configureWebhook("https://hook.test", ["verification"]);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/webhooks", {
        url: "https://hook.test",
        events: ["verification"],
      });
    });

    it("should test webhook", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { success: true },
      });
      const result = await client.testWebhook("wh1");
      expect(result.success).toBe(true);
    });
  });

  describe("createLivenessLinkClient", () => {
    it("should create client instance", () => {
      const c = createLivenessLinkClient({ apiKey: "key" });
      expect(c).toBeInstanceOf(LivenessLinkClient);
    });
  });
});
