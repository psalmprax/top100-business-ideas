import { RegulensClient, createRegulensClient } from "./index";
import axios from "axios";
import { mockAxiosInstance } from "./__mocks__/axios";

jest.mock("axios");

describe("RegulensClient", () => {
  let client: RegulensClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new RegulensClient({
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
      new RegulensClient({ apiKey: "key" });
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://api.regulens.dev",
        })
      );
    });
  });

  describe("getArticles", () => {
    it("should fetch all articles", async () => {
      const articles = [{ id: "1", number: 1, title: "Test Article" }];
      mockAxiosInstance.get.mockResolvedValueOnce({ data: articles });
      const result = await client.getArticles();
      expect(result).toEqual(articles);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/compliance/articles");
    });
  });

  describe("getArticle", () => {
    it("should fetch specific article", async () => {
      const article = { id: "1", number: 5, title: "Article 5" };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: article });
      const result = await client.getArticle(5);
      expect(result).toEqual(article);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        "/compliance/articles/5"
      );
    });
  });

  describe("runScan", () => {
    it("should run compliance scan", async () => {
      const scan = { id: "scan-1", status: "completed" };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: scan });
      const result = await client.runScan("model-1", { articles: [5, 6] });
      expect(result).toEqual(scan);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/compliance/scans", {
        model_id: "model-1",
        articles: [5, 6],
      });
    });
  });

  describe("getScanResults", () => {
    it("should fetch scan results", async () => {
      const scan = { id: "scan-1", status: "completed", results: [] };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: scan });
      const result = await client.getScanResults("scan-1");
      expect(result).toEqual(scan);
    });
  });

  describe("registerModel", () => {
    it("should register model", async () => {
      const model = { id: "m1", name: "Test Model" };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: model });
      const result = await client.registerModel({
        name: "Test Model",
        version: "1.0",
        risk_category: "high",
      });
      expect(result).toEqual(model);
    });
  });

  describe("getModel", () => {
    it("should fetch model info", async () => {
      const model = { id: "m1", name: "Test Model" };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: model });
      const result = await client.getModel("m1");
      expect(result).toEqual(model);
    });
  });

  describe("listModels", () => {
    it("should list all models", async () => {
      const models = [{ id: "m1" }, { id: "m2" }];
      mockAxiosInstance.get.mockResolvedValueOnce({ data: models });
      const result = await client.listModels();
      expect(result).toEqual(models);
    });
  });

  describe("updateTrainingData", () => {
    it("should update training data", async () => {
      mockAxiosInstance.patch.mockResolvedValueOnce({});
      await client.updateTrainingData("m1", {
        size: 1000,
        sources: ["web"],
        date_range: { start: new Date(), end: new Date() },
      });
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        "/models/m1/training-data",
        expect.any(Object)
      );
    });
  });

  describe("configureIntegration", () => {
    it("should configure integration", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({});
      await client.configureIntegration({
        type: "cicd",
        provider: "github",
        config: { repo: "test/repo" },
      });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/integrations", {
        type: "cicd",
        provider: "github",
        config: { repo: "test/repo" },
      });
    });
  });

  describe("listIntegrations", () => {
    it("should list integrations", async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] });
      await client.listIntegrations();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/integrations");
    });
  });

  describe("testIntegration", () => {
    it("should test integration", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { success: true, message: "ok" },
      });
      const result = await client.testIntegration("int-1");
      expect(result.success).toBe(true);
    });
  });

  describe("generateReport", () => {
    it("should generate compliance report", async () => {
      const report = { id: "r1", summary: { overall_score: 85 } };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: report });
      const result = await client.generateReport("m1");
      expect(result).toEqual(report);
    });
  });

  describe("getComplianceSummary", () => {
    it("should fetch compliance summary", async () => {
      const summary = {
        totalModels: 10,
        compliantModels: 8,
        highRiskModels: 2,
        overallScore: 80,
      };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: summary });
      const result = await client.getComplianceSummary();
      expect(result).toEqual(summary);
    });
  });

  describe("getRiskAssessment", () => {
    it("should fetch risk assessment", async () => {
      const assessment = {
        category: "high",
        factors: ["bias"],
        mitigationSuggestions: ["diverse training data"],
      };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: assessment });
      const result = await client.getRiskAssessment("m1");
      expect(result).toEqual(assessment);
    });
  });

  describe("createRegulensClient", () => {
    it("should create client instance", () => {
      const c = createRegulensClient({ apiKey: "key" });
      expect(c).toBeInstanceOf(RegulensClient);
    });
  });
});
