import { nanoid } from "nanoid";
import { hermesApi } from "../api";

export type AgentRole =
  | "Logistics"
  | "Compliance"
  | "Marketing"
  | "Auditor"
  | "Researcher";

export type AgentTaskStatus = "pending" | "running" | "completed" | "failed";
export type EngineStatus = "idle" | "thinking" | "acting" | "success" | "error";

export interface AgentTask {
  id: string;
  goal: string;
  status: AgentTaskStatus;
  result?: string;
  logs: string[];
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  engineStatus: EngineStatus;
  taskStatus?: AgentTaskStatus;
  currentTask?: string;
  thoughtProcess: string[];
  lastAction?: string;
}

export interface LLMProvider {
  name: string;
  generateResponse(prompt: string, context: any): Promise<string>;
}

/**
 * AgnosticCloudProvider - REAL-FIRST Multi-Cloud implementation
 * Connects to the Unified LLM Proxy which manages Azure, Anthropic, and Bedrock.
 */
export class AgnosticCloudProvider implements LLMProvider {
  name = "Agnostic-Proxy (Multi-Cloud)";

  async generateResponse(prompt: string, context: any): Promise<string> {
    try {
      // Step 1: Call the Unified Multi-Cloud Proxy chat endpoint
      // We pass the desired provider/model if specified in context, or let the proxy decide
      const result = await hermesApi.chat(
        prompt,
        `You are acting as a ${context.role} agent in our enterprise cluster.`
      );

      return result.response;
    } catch (error) {
      console.error(
        `[AgnosticCloudProvider] Proxy failure [${context.role}]:`,
        error
      );
      throw new Error(
        `Unified LLM Proxy unreachable: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

/**
 * The core Agnostic Agent Engine.
 * Designed to be provider-agnostic and project-neutral.
 */
export class AgnosticAgentEngine {
  private provider: LLMProvider;
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private listeners: Set<
    (state: { agents: Agent[]; tasks: AgentTask[] }) => void
  > = new Set();

  constructor(provider?: LLMProvider) {
    // REAL-FIRST: Default to AgnosticCloudProvider (Multi-Cloud)
    this.provider = provider || new AgnosticCloudProvider();

    if (this.provider instanceof AgnosticCloudProvider) {
      this.log(
        "info",
        "Engine initialized with AgnosticCloudProvider (Production Mode)"
      );
    }
  }

  private log(level: "info" | "warn" | "error", message: string, data?: any) {
    // Hardening (Standard 2.22): Structured JSON-like logging
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
      source: "AgnosticAgentEngine",
    };
    console.log(JSON.stringify(logEntry));
  }

  public registerAgent(name: string, role: AgentRole): Agent {
    const id = nanoid();
    const agent: Agent = {
      id,
      name,
      role,
      engineStatus: "idle",
      thoughtProcess: [],
    };
    this.agents.set(id, agent);
    this.notify();
    return agent;
  }

  public async dispatchTask(
    goal: string,
    assignedAgentId?: string
  ): Promise<string> {
    const taskId = nanoid();
    const task: AgentTask = {
      id: taskId,
      goal,
      status: "pending",
      logs: [`Task initialized: ${goal}`],
    };
    this.tasks.set(taskId, task);

    const agent = assignedAgentId
      ? this.agents.get(assignedAgentId)
      : Array.from(this.agents.values()).find(a => a.engineStatus === "idle");

    if (!agent) {
      task.status = "failed";
      task.logs.push("No available agents found.");
      this.notify();
      return taskId;
    }

    this.runTask(task, agent);
    return taskId;
  }

  private async runTask(task: AgentTask, agent: Agent) {
    agent.engineStatus = "thinking";
    agent.taskStatus = "running";
    agent.currentTask = task.id;
    task.status = "running";
    agent.thoughtProcess.push(`Analyzing goal: ${task.goal}`);
    this.notify();

    try {
      // Step 1: Brainstorming
      await new Promise(r => setTimeout(r, 1000));
      agent.thoughtProcess.push(`Decomposing task into sub-objectives...`);
      this.notify();

      // Step 2: Provider Call
      agent.engineStatus = "acting";
      agent.lastAction = "Executing LLM analysis...";
      const result = await this.provider.generateResponse(task.goal, {
        role: agent.role,
      });

      agent.thoughtProcess.push(
        `Received synthesis from ${this.provider.name}`
      );
      task.result = result;
      task.status = "completed";
      task.logs.push(`Results received: ${result.substring(0, 50)}...`);

      agent.engineStatus = "success";
      setTimeout(() => {
        agent.engineStatus = "idle";
        agent.currentTask = undefined;
        this.notify();
      }, 3000);
    } catch (error) {
      task.status = "failed";
      agent.engineStatus = "error";
      task.logs.push(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    this.notify();
  }

  public subscribe(
    listener: (state: { agents: Agent[]; tasks: AgentTask[] }) => void
  ) {
    this.listeners.add(listener);
    listener({
      agents: Array.from(this.agents.values()),
      tasks: Array.from(this.tasks.values()),
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = {
      agents: Array.from(this.agents.values()),
      tasks: Array.from(this.tasks.values()),
    };
    this.listeners.forEach(l => l(state));
  }

  public static getInstance(): AgnosticAgentEngine {
    if (!(window as any).__agentEngine) {
      (window as any).__agentEngine = new AgnosticAgentEngine();
    }
    return (window as any).__agentEngine;
  }
}
