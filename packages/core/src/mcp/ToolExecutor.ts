/**
 * ToolExecutor - Execute MCP tools with logging and error handling
 * Sprint 2.1 - MCP Integration
 */

import { MCPClient, MCPExecutionResult, MCPToolSchema } from './MCPClient';
import { EventBus } from '../events/EventBus';

export interface ToolExecution {
  id: string;
  tool: string;
  params: Record<string, unknown>;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: unknown;
  error?: string;
}

export interface ToolExecutorConfig {
  /** Log all executions */
  logging?: boolean;
  /** Emit events for executions */
  emitEvents?: boolean;
  /** Maximum history size */
  historySize?: number;
  /** Validate params against schema */
  validateParams?: boolean;
}

export class ToolExecutor {
  private mcpClient: MCPClient;
  private config: Required<ToolExecutorConfig>;
  private history: ToolExecution[] = [];
  private executionCounter = 0;

  constructor(mcpClient: MCPClient, config: ToolExecutorConfig = {}) {
    this.mcpClient = mcpClient;
    this.config = {
      logging: config.logging ?? true,
      emitEvents: config.emitEvents ?? true,
      historySize: config.historySize ?? 100,
      validateParams: config.validateParams ?? true,
    };
  }

  /**
   * Execute a tool with full tracking
   */
  async execute<T = unknown>(
    tool: string,
    params: Record<string, unknown>
  ): Promise<T> {
    const execution = this.createExecution(tool, params);
    
    try {
      execution.status = 'running';
      this.emitEvent('tool.execution.started', execution);
      
      // Validate parameters if enabled
      if (this.config.validateParams) {
        await this.validateParams(tool, params);
      }

      // Execute the tool
      const result = await this.mcpClient.callWithMeta<T>(tool, params);
      
      execution.endTime = Date.now();
      
      if (result.success) {
        execution.status = 'success';
        execution.result = result.data;
        this.log(`✅ ${tool} completed in ${result.executionTime}ms`);
        this.emitEvent('tool.execution.success', { ...execution, result: result.data });
        return result.data as T;
      } else {
        throw new Error(result.error || 'Tool execution failed');
      }
    } catch (error) {
      execution.endTime = Date.now();
      execution.status = 'error';
      execution.error = error instanceof Error ? error.message : String(error);
      
      this.log(`❌ ${tool} failed: ${execution.error}`);
      this.emitEvent('tool.execution.error', execution);
      
      throw error;
    } finally {
      this.addToHistory(execution);
    }
  }

  /**
   * Execute a tool and return result without throwing
   */
  async executeSafe<T = unknown>(
    tool: string,
    params: Record<string, unknown>
  ): Promise<MCPExecutionResult<T>> {
    try {
      const data = await this.execute<T>(tool, params);
      return { success: true, data, executionTime: 0 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0,
      };
    }
  }

  /**
   * Execute multiple tools in parallel
   */
  async executeParallel<T = unknown>(
    calls: Array<{ tool: string; params: Record<string, unknown> }>
  ): Promise<MCPExecutionResult<T>[]> {
    return Promise.all(
      calls.map(({ tool, params }) => this.executeSafe<T>(tool, params))
    );
  }

  /**
   * Execute tools in sequence
   */
  async executeSequence<T = unknown>(
    calls: Array<{ tool: string; params: Record<string, unknown> }>
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (const { tool, params } of calls) {
      results.push(await this.execute<T>(tool, params));
    }
    
    return results;
  }

  /**
   * Get execution history
   */
  getHistory(): ToolExecution[] {
    return [...this.history];
  }

  /**
   * Get executions by tool name
   */
  getHistoryByTool(tool: string): ToolExecution[] {
    return this.history.filter(e => e.tool === tool);
  }

  /**
   * Get execution statistics
   */
  getStats(): {
    total: number;
    success: number;
    error: number;
    avgExecutionTime: number;
    byTool: Record<string, { count: number; avgTime: number }>;
  } {
    const completed = this.history.filter(e => e.endTime);
    const success = completed.filter(e => e.status === 'success');
    const errors = completed.filter(e => e.status === 'error');
    
    const totalTime = completed.reduce(
      (sum, e) => sum + ((e.endTime || 0) - e.startTime),
      0
    );

    const byTool: Record<string, { count: number; avgTime: number }> = {};
    for (const execution of completed) {
      if (!byTool[execution.tool]) {
        byTool[execution.tool] = { count: 0, avgTime: 0 };
      }
      const entry = byTool[execution.tool];
      const execTime = (execution.endTime || 0) - execution.startTime;
      entry.avgTime = (entry.avgTime * entry.count + execTime) / (entry.count + 1);
      entry.count++;
    }

    return {
      total: completed.length,
      success: success.length,
      error: errors.length,
      avgExecutionTime: completed.length > 0 ? totalTime / completed.length : 0,
      byTool,
    };
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Validate parameters against tool schema
   */
  private async validateParams(
    tool: string,
    params: Record<string, unknown>
  ): Promise<void> {
    const schema = await this.mcpClient.getTool(tool);
    if (!schema) {
      throw new Error(`Unknown tool: ${tool}`);
    }

    if (schema.inputSchema?.required) {
      for (const required of schema.inputSchema.required) {
        if (params[required] === undefined) {
          throw new Error(`Missing required parameter: ${required}`);
        }
      }
    }
  }

  /**
   * Create a new execution record
   */
  private createExecution(
    tool: string,
    params: Record<string, unknown>
  ): ToolExecution {
    return {
      id: `exec-${++this.executionCounter}-${Date.now()}`,
      tool,
      params,
      startTime: Date.now(),
      status: 'pending',
    };
  }

  /**
   * Add execution to history
   */
  private addToHistory(execution: ToolExecution): void {
    this.history.push(execution);
    
    // Trim history if needed
    while (this.history.length > this.config.historySize) {
      this.history.shift();
    }
  }

  /**
   * Log message if logging enabled
   */
  private log(message: string): void {
    if (this.config.logging) {
      console.log(`[ToolExecutor] ${message}`);
    }
  }

  /**
   * Emit event if events enabled
   */
  private emitEvent(event: string, data: unknown): void {
    if (this.config.emitEvents) {
      EventBus.emit(event, data);
    }
  }
}
