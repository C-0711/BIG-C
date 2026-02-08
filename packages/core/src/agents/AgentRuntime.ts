/**
 * AgentRuntime - Agent execution engine
 * Sprint 8.2 - Agent Framework
 */

import {
  AgentDefinition,
  AgentExecutionContext,
  AgentResponse,
  AgentAction,
  TriggerType,
} from './AgentSchema';
import { AgentRegistry } from './AgentRegistry';
import { SkillExecutor } from '../skills/SkillExecutor';
import { skillRegistry } from '../skills/SkillRegistry';
import { ToolExecutor } from '../mcp/ToolExecutor';
import { WorkingMemory } from '../memory/WorkingMemory';
import { EventBus } from '../events/EventBus';

export interface AgentRuntimeConfig {
  /** Default timeout in ms */
  defaultTimeout?: number;
  /** Maximum concurrent agent executions */
  maxConcurrent?: number;
  /** Claude API client for agent responses */
  claudeClient?: ClaudeClientInterface;
}

export interface ClaudeClientInterface {
  chat(messages: Array<{ role: string; content: string }>, options?: {
    system?: string;
    tools?: unknown[];
  }): Promise<{ content: string; toolCalls?: Array<{ name: string; params: Record<string, unknown> }> }>;
}

export interface AgentExecutionResult {
  success: boolean;
  agentId: string;
  response?: AgentResponse;
  error?: string;
  executionTime: number;
  context: AgentExecutionContext;
}

export class AgentRuntime {
  private registry: AgentRegistry;
  private skillExecutor: SkillExecutor;
  private toolExecutor: ToolExecutor;
  private config: Required<AgentRuntimeConfig>;
  private activeExecutions: Map<string, AgentExecutionContext> = new Map();
  private executionHistory: AgentExecutionResult[] = [];
  private memoryInstances: Map<string, WorkingMemory> = new Map();

  constructor(
    registry: AgentRegistry,
    skillExecutor: SkillExecutor,
    toolExecutor: ToolExecutor,
    config: AgentRuntimeConfig = {}
  ) {
    this.registry = registry;
    this.skillExecutor = skillExecutor;
    this.toolExecutor = toolExecutor;
    this.config = {
      defaultTimeout: config.defaultTimeout || 30000,
      maxConcurrent: config.maxConcurrent || 10,
      claudeClient: config.claudeClient || null as unknown as ClaudeClientInterface,
    };
  }

  /**
   * Execute an agent
   */
  async execute(
    agentId: string,
    input?: string,
    trigger?: { type: TriggerType; event?: string; payload?: unknown }
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const executionId = this.generateExecutionId();

    const agent = this.registry.get(agentId);
    if (!agent) {
      return {
        success: false,
        agentId,
        error: `Agent not found: ${agentId}`,
        executionTime: Date.now() - startTime,
        context: this.createContext(agentId, executionId, trigger),
      };
    }

    if (agent.enabled === false) {
      return {
        success: false,
        agentId,
        error: `Agent is disabled: ${agentId}`,
        executionTime: Date.now() - startTime,
        context: this.createContext(agentId, executionId, trigger),
      };
    }

    // Check concurrent execution limit
    if (this.activeExecutions.size >= this.config.maxConcurrent) {
      return {
        success: false,
        agentId,
        error: 'Maximum concurrent executions reached',
        executionTime: Date.now() - startTime,
        context: this.createContext(agentId, executionId, trigger),
      };
    }

    const context = this.createContext(agentId, executionId, trigger, input);
    this.activeExecutions.set(executionId, context);

    EventBus.emit('agent.execution.started', {
      agentId,
      executionId,
      trigger,
      timestamp: startTime,
    });

    try {
      const response = await this.runAgent(agent, context, input);

      const result: AgentExecutionResult = {
        success: true,
        agentId,
        response,
        executionTime: Date.now() - startTime,
        context,
      };

      this.addToHistory(result);

      EventBus.emit('agent.execution.completed', {
        agentId,
        executionId,
        response,
        executionTime: result.executionTime,
      });

      return result;
    } catch (error) {
      const result: AgentExecutionResult = {
        success: false,
        agentId,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        context,
      };

      this.addToHistory(result);

      EventBus.emit('agent.execution.failed', {
        agentId,
        executionId,
        error: result.error,
      });

      return result;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Execute agent triggered by an event
   */
  async executeForEvent(event: string, payload: unknown): Promise<AgentExecutionResult[]> {
    const agents = this.registry.getAgentsForEvent(event);
    const results: AgentExecutionResult[] = [];

    for (const agent of agents) {
      const result = await this.execute(agent.id, undefined, {
        type: 'event',
        event,
        payload,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Run the agent logic
   */
  private async runAgent(
    agent: AgentDefinition,
    context: AgentExecutionContext,
    input?: string
  ): Promise<AgentResponse> {
    const actions: AgentAction[] = [];
    const skillsExecuted: string[] = [];
    const toolsCalled: string[] = [];

    // Get or create working memory for this session
    const memory = this.getOrCreateMemory(context.memorySessionId || context.meta.executionId);

    // Build context for Claude
    const memoryContext = await memory.getSummary();

    // If we have a Claude client, use it to determine actions
    if (this.config.claudeClient && input) {
      const systemPrompt = this.buildSystemPrompt(agent, memoryContext);
      const tools = this.buildToolDefinitions(agent);

      const response = await this.config.claudeClient.chat(
        [{ role: 'user', content: input }],
        { system: systemPrompt, tools }
      );

      // Execute any tool calls
      if (response.toolCalls) {
        for (const call of response.toolCalls) {
          const action = await this.executeAction(agent, call.name, call.params);
          actions.push(action);

          if (action.type === 'skill') {
            skillsExecuted.push(call.name);
          } else if (action.type === 'tool') {
            toolsCalled.push(call.name);
          }
        }
      }

      // Store conversation turn
      await memory.addTurn('user', input);
      await memory.addTurn('assistant', response.content);

      return {
        message: response.content,
        skillsExecuted,
        toolsCalled,
        actions,
      };
    }

    // Fallback: Execute first skill if no Claude client
    if (agent.skills.length > 0) {
      const skillId = agent.skills[0];
      const skill = skillRegistry.get(skillId);

      if (skill) {
        const skillInput = context.trigger?.payload || {};
        const result = await this.skillExecutor.execute(skill, skillInput as Record<string, unknown>);

        actions.push({
          type: 'skill',
          name: skillId,
          result: result.output,
          error: result.error,
        });

        skillsExecuted.push(skillId);

        return {
          message: result.success
            ? `Executed skill: ${skill.name}`
            : `Skill failed: ${result.error}`,
          skillsExecuted,
          actions,
        };
      }
    }

    return {
      message: 'Agent executed with no actions',
      skillsExecuted: [],
      toolsCalled: [],
      actions: [],
    };
  }

  /**
   * Execute an action (skill or tool)
   */
  private async executeAction(
    agent: AgentDefinition,
    name: string,
    params: Record<string, unknown>
  ): Promise<AgentAction> {
    // Check if it's a skill
    if (agent.skills.includes(name)) {
      const skill = skillRegistry.get(name);
      if (skill) {
        try {
          const result = await this.skillExecutor.execute(skill, params);
          return {
            type: 'skill',
            name,
            params,
            result: result.output,
            error: result.error,
          };
        } catch (error) {
          return {
            type: 'skill',
            name,
            params,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }
    }

    // Check if it's a tool
    if (agent.tools?.includes(name) || agent.capabilities?.callTools) {
      try {
        const result = await this.toolExecutor.execute(name, params);
        return {
          type: 'tool',
          name,
          params,
          result,
        };
      } catch (error) {
        return {
          type: 'tool',
          name,
          params,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return {
      type: 'tool',
      name,
      params,
      error: `Unknown action: ${name}`,
    };
  }

  /**
   * Build system prompt for agent
   */
  private buildSystemPrompt(agent: AgentDefinition, memoryContext: unknown): string {
    let prompt = agent.persona?.systemPrompt || `You are ${agent.name}. ${agent.description}`;

    if (agent.persona?.instructions) {
      prompt += '\n\nInstructions:\n' + agent.persona.instructions.join('\n');
    }

    prompt += `\n\nContext:\n${JSON.stringify(memoryContext, null, 2)}`;

    return prompt;
  }

  /**
   * Build tool definitions for Claude
   */
  private buildToolDefinitions(agent: AgentDefinition): unknown[] {
    const tools: unknown[] = [];

    // Add skills as tools
    for (const skillId of agent.skills) {
      const skill = skillRegistry.get(skillId);
      if (skill) {
        tools.push({
          name: skillId,
          description: skill.description,
          input_schema: skill.input,
        });
      }
    }

    return tools;
  }

  /**
   * Create execution context
   */
  private createContext(
    agentId: string,
    executionId: string,
    trigger?: { type: TriggerType; event?: string; payload?: unknown },
    input?: string
  ): AgentExecutionContext {
    return {
      agentId,
      trigger,
      input,
      meta: {
        executionId,
        startTime: Date.now(),
        timeout: this.config.defaultTimeout,
      },
    };
  }

  /**
   * Get or create working memory
   */
  private getOrCreateMemory(sessionId: string): WorkingMemory {
    if (!this.memoryInstances.has(sessionId)) {
      this.memoryInstances.set(sessionId, new WorkingMemory({ sessionId }));
    }
    return this.memoryInstances.get(sessionId)!;
  }

  /**
   * Generate execution ID
   */
  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): AgentExecutionContext[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get execution history
   */
  getHistory(): AgentExecutionResult[] {
    return [...this.executionHistory];
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }

  private addToHistory(result: AgentExecutionResult): void {
    this.executionHistory.push(result);
    while (this.executionHistory.length > 100) {
      this.executionHistory.shift();
    }
  }
}
