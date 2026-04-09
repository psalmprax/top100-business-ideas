import { nanoid } from 'nanoid';
import { hermesApi } from '../api';

export type AgentRole = 'Logistics' | 'Compliance' | 'Marketing' | 'Auditor' | 'Researcher';

export type AgentStatus = 'idle' | 'thinking' | 'acting' | 'success' | 'error';

export interface AgentTask {
  id: string;
  goal: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  logs: string[];
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  currentTask?: string;
  thoughtProcess: string[];
  lastAction?: string;
}

export interface LLMProvider {
  name: string;
  generateResponse(prompt: string, context: any): Promise<string>;
}

/**
 * HermesCloudProvider - REAL-FIRST implementation
 * Connects the Agnostic Agent Engine to the persistent Hermes service.
 */
export class HermesCloudProvider implements LLMProvider {
  name = 'Hermes-Cloud (Sentinel Core)';

  async generateResponse(prompt: string, context: any): Promise<string> {
    try {
      // Step 1: Call real Hermes backend service via the authenticated api layer
      const result = await hermesApi.chat(prompt, `You are acting as a ${context.role} agent in our enterprise cluster.`);
      
      // Step 2: Return real response from orchestrator
      return result.response;
    } catch (error) {
      console.error('[HermesCloudProvider] Failed to generate response from backend:', error);
      throw new Error(`Hermes Cloud unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  private listeners: Set<(state: { agents: Agent[], tasks: AgentTask[] }) => void> = new Set();

  constructor(provider?: LLMProvider) {
    // REAL-FIRST: Default to HermesCloudProvider instead of a mock
    this.provider = provider || new HermesCloudProvider();
    
    if (this.provider instanceof HermesCloudProvider) {
      console.info('[AgnosticAgentEngine] Initialized with HermesCloudProvider (Production Mode)');
    }
  }

  public registerAgent(name: string, role: AgentRole): Agent {
    const id = nanoid();
    const agent: Agent = {
      id,
      name,
      role,
      status: 'idle',
      thoughtProcess: [],
    };
    this.agents.set(id, agent);
    this.notify();
    return agent;
  }

  public async dispatchTask(goal: string, assignedAgentId?: string): Promise<string> {
    const taskId = nanoid();
    const task: AgentTask = {
      id: taskId,
      goal,
      status: 'pending',
      logs: [`Task initialized: ${goal}`],
    };
    this.tasks.set(taskId, task);

    const agent = assignedAgentId 
      ? this.agents.get(assignedAgentId) 
      : Array.from(this.agents.values()).find(a => a.status === 'idle');

    if (!agent) {
      task.status = 'failed';
      task.logs.push('No available agents found.');
      this.notify();
      return taskId;
    }

    this.runTask(task, agent);
    return taskId;
  }

  private async runTask(task: AgentTask, agent: Agent) {
    agent.status = 'thinking';
    agent.currentTask = task.id;
    task.status = 'running';
    agent.thoughtProcess.push(`Analyzing goal: ${task.goal}`);
    this.notify();

    try {
      // Step 1: Brainstorming
      await new Promise(r => setTimeout(r, 1000));
      agent.thoughtProcess.push(`Decomposing task into sub-objectives...`);
      this.notify();

      // Step 2: Provider Call
      agent.status = 'acting';
      agent.lastAction = 'Executing LLM analysis...';
      const result = await this.provider.generateResponse(task.goal, { role: agent.role });
      
      agent.thoughtProcess.push(`Received synthesis from ${this.provider.name}`);
      task.result = result;
      task.status = 'completed';
      task.logs.push(`Results received: ${result.substring(0, 50)}...`);
      
      agent.status = 'success';
      setTimeout(() => {
        agent.status = 'idle';
        agent.currentTask = undefined;
        this.notify();
      }, 3000);

    } catch (error) {
      task.status = 'failed';
      agent.status = 'error';
      task.logs.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    this.notify();
  }

  public subscribe(listener: (state: { agents: Agent[], tasks: AgentTask[] }) => void) {
    this.listeners.add(listener);
    listener({ 
      agents: Array.from(this.agents.values()), 
      tasks: Array.from(this.tasks.values()) 
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
