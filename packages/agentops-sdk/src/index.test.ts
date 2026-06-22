import { AgentOpsClient, createAgentOpsClient } from "./index";
import axios from "axios";
import { mockAxiosInstance } from "./__mocks__/axios";

jest.mock("axios");

describe("AgentOpsClient", () => {
  let client: AgentOpsClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new AgentOpsClient({
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
      new AgentOpsClient({ apiKey: "key" });
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://api.agentops.dev",
        })
      );
    });
  });

  describe("registerAgent", () => {
    it("should register agent and store id", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { id: "agent-123", name: "Test Agent" },
      });

      const agent = await client.registerAgent("Test Agent", "qa");
      expect(agent.id).toBe("agent-123");
      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/agents", {
        name: "Test Agent",
        type: "qa",
      });
    });
  });

  describe("heartbeat", () => {
    it("should throw if agent not registered", async () => {
      await expect(client.heartbeat()).rejects.toThrow("Agent not registered");
    });

    it("should send heartbeat when registered", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { id: "a1" } });
      await client.registerAgent("A", "type");
      mockAxiosInstance.post.mockResolvedValueOnce({});

      await client.heartbeat();
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/agents/a1/heartbeat",
        expect.objectContaining({ timestamp: expect.any(String) })
      );
    });
  });

  describe("reportTaskComplete", () => {
    it("should throw if agent not registered", async () => {
      await expect(client.reportTaskComplete("t1")).rejects.toThrow(
        "Agent not registered"
      );
    });

    it("should report task completion", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { id: "a1" } });
      await client.registerAgent("A", "type");
      mockAxiosInstance.post.mockResolvedValueOnce({});

      await client.reportTaskComplete("t1", { key: "value" });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/agents/a1/tasks", {
        taskId: "t1",
        status: "completed",
        metadata: { key: "value" },
      });
    });
  });

  describe("reportTaskFailed", () => {
    it("should report task failure", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { id: "a1" } });
      await client.registerAgent("A", "type");
      mockAxiosInstance.post.mockResolvedValueOnce({});

      await client.reportTaskFailed("t1", "timeout");
      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/agents/a1/tasks", {
        taskId: "t1",
        status: "failed",
        error: "timeout",
      });
    });
  });

  describe("log", () => {
    it("should send log entry", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { id: "a1" } });
      await client.registerAgent("A", "type");
      mockAxiosInstance.post.mockResolvedValueOnce({});

      await client.log("info", "test message", { foo: "bar" });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/agents/a1/logs", {
        level: "info",
        message: "test message",
        metadata: { foo: "bar" },
      });
    });
  });

  describe("tracing", () => {
    it("should start and end trace", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { id: "a1" } });
      await client.registerAgent("A", "type");

      mockAxiosInstance.post.mockResolvedValueOnce({ data: { id: "trace-1" } });
      const traceId = await client.startTrace("my-trace");
      expect(traceId).toBe("trace-1");

      mockAxiosInstance.patch.mockResolvedValueOnce({});
      await client.endTrace(traceId, "completed");
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        "/agents/a1/traces/trace-1",
        expect.objectContaining({ status: "completed" })
      );
    });

    it("should add span to trace", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { id: "a1" } });
      await client.registerAgent("A", "type");

      mockAxiosInstance.post.mockResolvedValueOnce({ data: { id: "span-1" } });
      const spanId = await client.addSpan("trace-1", "http-call", {
        url: "/api",
      });
      expect(spanId).toBe("span-1");
    });
  });

  describe("getters", () => {
    it("should get agents", async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [{ id: "a1" }] });
      const agents = await client.getAgents();
      expect(agents).toEqual([{ id: "a1" }]);
    });

    it("should get dashboard metrics", async () => {
      const metrics = {
        totalAgents: 5,
        activeAgents: 3,
        totalTasks: 100,
        successRate: 0.95,
        averageLatency: 150,
        totalCost: 12.5,
        uptime: 99.9,
      };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: metrics });
      const result = await client.getDashboardMetrics();
      expect(result).toEqual(metrics);
    });

    it("should get alerts with optional agentId", async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] });
      await client.getAlerts("agent-1");
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/alerts", {
        params: { agentId: "agent-1" },
      });
    });
  });

  describe("acknowledgeAlert", () => {
    it("should acknowledge alert", async () => {
      mockAxiosInstance.patch.mockResolvedValueOnce({});
      await client.acknowledgeAlert("alert-1");
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith("/alerts/alert-1", {
        acknowledged: true,
      });
    });
  });

  describe("createAgentOpsClient", () => {
    it("should create client instance", () => {
      const c = createAgentOpsClient({ apiKey: "key" });
      expect(c).toBeInstanceOf(AgentOpsClient);
    });
  });
});
