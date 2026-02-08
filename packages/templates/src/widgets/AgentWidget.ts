/**
 * AgentWidget - Chat interface for AI agent interaction
 * Sprint 7.2 - Agent Widget (Basic)
 * 
 * @0711/templates - Reusable across all clients
 */

import { WidgetBase, WidgetConfig, EventBus, WorkingMemory } from '@0711/core';

export interface AgentWidgetConfig extends WidgetConfig {
  settings?: {
    /** Agent name for display */
    agentName?: string;
    /** Placeholder text for input */
    placeholder?: string;
    /** Welcome message */
    welcomeMessage?: string;
    /** Enable skill execution from chat */
    enableSkills?: boolean;
    /** Available skills */
    skills?: string[];
    /** Show typing indicator */
    showTyping?: boolean;
    /** Maximum message history */
    maxHistory?: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    toolCalls?: ToolCall[];
    skillExecuted?: string;
    error?: string;
  };
}

export interface ToolCall {
  tool: string;
  params: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

export interface AgentBackend {
  chat(
    messages: ChatMessage[],
    context?: Record<string, unknown>
  ): Promise<{ content: string; toolCalls?: ToolCall[] }>;
  
  chatStream?(
    messages: ChatMessage[],
    context?: Record<string, unknown>
  ): AsyncGenerator<string, void, unknown>;
}

export class AgentWidget extends WidgetBase {
  private messages: ChatMessage[] = [];
  private isTyping = false;
  private backend: AgentBackend | null = null;
  private memory: WorkingMemory | null = null;

  constructor(config: AgentWidgetConfig) {
    super({
      ...config,
      type: 'agent-chat',
      subscriptions: ['agent.message', 'skill.execution.completed', ...(config.subscriptions || [])],
    });
  }

  /**
   * Set the agent backend
   */
  setBackend(backend: AgentBackend): void {
    this.backend = backend;
  }

  /**
   * Set working memory for context
   */
  setMemory(memory: WorkingMemory): void {
    this.memory = memory;
  }

  async onMount(): Promise<void> {
    await super.onMount();

    const settings = (this.config as AgentWidgetConfig).settings || {};

    // Add welcome message
    if (settings.welcomeMessage) {
      this.addMessage('assistant', settings.welcomeMessage);
    }

    EventBus.emit('agent.mounted', {
      widgetId: this.id,
      agentName: settings.agentName,
    });
  }

  protected handleEvent(event: string, payload: unknown): void {
    if (event === 'agent.message') {
      const { content, role } = payload as { content: string; role?: 'user' | 'assistant' };
      if (content) {
        this.addMessage(role || 'user', content);
      }
    }

    if (event === 'skill.execution.completed') {
      const { skillId, result } = payload as { skillId: string; result: unknown };
      this.addMessage('system', `Skill "${skillId}" completed`, {
        skillExecuted: skillId,
      });
    }
  }

  /**
   * Send a user message
   */
  async sendMessage(content: string): Promise<void> {
    if (!content.trim()) return;

    // Add user message
    this.addMessage('user', content);

    // Get response from backend
    if (this.backend) {
      await this.getAgentResponse();
    } else {
      this.addMessage('system', 'No agent backend configured');
    }
  }

  /**
   * Get response from agent backend
   */
  private async getAgentResponse(): Promise<void> {
    if (!this.backend) return;

    this.isTyping = true;
    EventBus.emit('agent.typing', { widgetId: this.id, typing: true });

    try {
      // Get context from memory
      const context = await this.getContext();

      // Get response
      if (this.backend.chatStream) {
        // Streaming response
        let fullContent = '';
        const messageId = this.generateId();

        for await (const chunk of this.backend.chatStream(this.messages, context)) {
          fullContent += chunk;
          EventBus.emit('agent.stream', {
            widgetId: this.id,
            messageId,
            chunk,
            fullContent,
          });
        }

        this.addMessage('assistant', fullContent, undefined, messageId);
      } else {
        // Non-streaming response
        const response = await this.backend.chat(this.messages, context);
        this.addMessage('assistant', response.content, {
          toolCalls: response.toolCalls,
        });

        // Execute tool calls if any
        if (response.toolCalls && response.toolCalls.length > 0) {
          await this.handleToolCalls(response.toolCalls);
        }
      }
    } catch (error) {
      this.addMessage('system', 'Error getting response', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      this.isTyping = false;
      EventBus.emit('agent.typing', { widgetId: this.id, typing: false });
    }
  }

  /**
   * Handle tool calls from agent
   */
  private async handleToolCalls(toolCalls: ToolCall[]): Promise<void> {
    for (const call of toolCalls) {
      EventBus.emit('agent.tool_call', {
        widgetId: this.id,
        tool: call.tool,
        params: call.params,
      });
    }
  }

  /**
   * Get context for agent from memory
   */
  private async getContext(): Promise<Record<string, unknown>> {
    if (!this.memory) return {};

    const summary = await this.memory.getSummary();
    return {
      selectedProduct: summary.selectedProduct,
      lastSearch: summary.lastSearch,
      comparedProducts: summary.comparedProducts,
      recentContext: summary.recentContext,
    };
  }

  /**
   * Add a message to the chat
   */
  addMessage(
    role: ChatMessage['role'],
    content: string,
    metadata?: ChatMessage['metadata'],
    id?: string
  ): ChatMessage {
    const message: ChatMessage = {
      id: id || this.generateId(),
      role,
      content,
      timestamp: Date.now(),
      metadata,
    };

    this.messages.push(message);

    // Trim history if needed
    const settings = (this.config as AgentWidgetConfig).settings || {};
    const maxHistory = settings.maxHistory || 100;
    while (this.messages.length > maxHistory) {
      this.messages.shift();
    }

    // Update memory
    if (this.memory && (role === 'user' || role === 'assistant')) {
      this.memory.addTurn(role, content, metadata);
    }

    EventBus.emit('agent.message.added', {
      widgetId: this.id,
      message,
    });

    return message;
  }

  /**
   * Clear chat history
   */
  clearMessages(): void {
    this.messages = [];
    
    EventBus.emit('agent.cleared', {
      widgetId: this.id,
    });
  }

  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * Check if agent is typing
   */
  getIsTyping(): boolean {
    return this.isTyping;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Export chat history
   */
  exportHistory(): string {
    return this.messages
      .map(m => `[${new Date(m.timestamp).toISOString()}] ${m.role}: ${m.content}`)
      .join('\n');
  }
}
