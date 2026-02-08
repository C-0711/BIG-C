/**
 * MCPClient - Model Context Protocol client wrapper
 * Sprint 2.1 - MCP Integration
 */

export interface MCPToolSchema {
  name: string;
  description?: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, JSONSchemaProperty>;
    required?: string[];
  };
  outputSchema?: {
    type: string;
    properties?: Record<string, JSONSchemaProperty>;
  };
}

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  default?: unknown;
  minimum?: number;
  maximum?: number;
}

export interface MCPConfig {
  endpoint: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface MCPExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime: number;
}

export interface MCPClientInterface {
  listTools(): Promise<MCPToolSchema[]>;
  getTool(name: string): Promise<MCPToolSchema | null>;
  call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T>;
  callWithMeta<T = unknown>(tool: string, params: Record<string, unknown>): Promise<MCPExecutionResult<T>>;
}

export class MCPClient implements MCPClientInterface {
  private config: Required<MCPConfig>;
  private toolCache: Map<string, MCPToolSchema> = new Map();
  private toolListCached: MCPToolSchema[] | null = null;

  constructor(config: MCPConfig) {
    this.config = {
      endpoint: config.endpoint,
      apiKey: config.apiKey || '',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
    };
  }

  /**
   * List all available MCP tools
   */
  async listTools(): Promise<MCPToolSchema[]> {
    if (this.toolListCached) {
      return this.toolListCached;
    }

    const response = await this.request<{ tools: MCPToolSchema[] }>('tools/list', {});
    this.toolListCached = response.tools || [];
    
    // Cache individual tools
    for (const tool of this.toolListCached) {
      this.toolCache.set(tool.name, tool);
    }
    
    return this.toolListCached;
  }

  /**
   * Get a specific tool's schema
   */
  async getTool(name: string): Promise<MCPToolSchema | null> {
    if (this.toolCache.has(name)) {
      return this.toolCache.get(name)!;
    }

    // Fetch all tools if not cached
    await this.listTools();
    return this.toolCache.get(name) || null;
  }

  /**
   * Execute a tool with parameters
   */
  async call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T> {
    const result = await this.callWithMeta<T>(tool, params);
    if (!result.success) {
      throw new Error(result.error || `Tool execution failed: ${tool}`);
    }
    return result.data as T;
  }

  /**
   * Execute a tool and return full result with metadata
   */
  async callWithMeta<T = unknown>(
    tool: string,
    params: Record<string, unknown>
  ): Promise<MCPExecutionResult<T>> {
    const startTime = Date.now();

    try {
      const response = await this.requestWithRetry<T>('tools/call', {
        name: tool,
        arguments: params,
      });

      return {
        success: true,
        data: response,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Clear the tool cache
   */
  clearCache(): void {
    this.toolCache.clear();
    this.toolListCached = null;
  }

  /**
   * Make a request with retry logic
   */
  private async requestWithRetry<T>(method: string, body: unknown): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        return await this.request<T>(method, body);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.config.retries - 1) {
          await this.delay(this.config.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Make a single request to MCP server
   */
  private async request<T>(method: string, body: unknown): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.endpoint}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MCP request failed: ${response.status} - ${errorText}`);
      }

      return await response.json() as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
