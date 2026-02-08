/**
 * SkillExecutor - Execute skills with step-by-step processing
 * Sprint 6.1 - Skill Framework
 */

import { SkillDefinition, SkillStep, RetryConfig } from './SkillSchema';
import { ToolExecutor } from '../mcp/ToolExecutor';
import { EventBus } from '../events/EventBus';

export interface SkillExecutionContext {
  /** Input parameters */
  input: Record<string, unknown>;
  /** Output accumulator */
  output: Record<string, unknown>;
  /** Step results */
  steps: Record<string, unknown>;
  /** Loop variables */
  vars: Record<string, unknown>;
  /** Execution metadata */
  meta: {
    skillId: string;
    startTime: number;
    currentStep: string;
  };
}

export interface SkillExecutionResult {
  success: boolean;
  output: Record<string, unknown>;
  error?: string;
  executionTime: number;
  stepsExecuted: number;
  stepResults: Record<string, StepResult>;
}

export interface StepResult {
  stepId: string;
  success: boolean;
  output?: unknown;
  error?: string;
  executionTime: number;
}

export class SkillExecutor {
  private toolExecutor: ToolExecutor;
  private executionHistory: SkillExecutionResult[] = [];
  private maxHistorySize = 50;

  constructor(toolExecutor: ToolExecutor) {
    this.toolExecutor = toolExecutor;
  }

  /**
   * Execute a skill with given input
   */
  async execute(
    skill: SkillDefinition,
    input: Record<string, unknown>
  ): Promise<SkillExecutionResult> {
    const startTime = Date.now();
    const stepResults: Record<string, StepResult> = {};
    let stepsExecuted = 0;

    // Initialize context
    const context: SkillExecutionContext = {
      input,
      output: {},
      steps: {},
      vars: {},
      meta: {
        skillId: skill.id,
        startTime,
        currentStep: '',
      },
    };

    EventBus.emit('skill.execution.started', {
      skillId: skill.id,
      input,
      timestamp: startTime,
    });

    try {
      // Execute steps
      for (const step of skill.steps) {
        context.meta.currentStep = step.id;
        
        const stepResult = await this.executeStep(step, context, skill.errorHandling);
        stepResults[step.id] = stepResult;
        stepsExecuted++;

        if (!stepResult.success && skill.errorHandling !== 'continue') {
          throw new Error(stepResult.error || `Step ${step.id} failed`);
        }
      }

      const result: SkillExecutionResult = {
        success: true,
        output: context.output,
        executionTime: Date.now() - startTime,
        stepsExecuted,
        stepResults,
      };

      this.addToHistory(result);

      EventBus.emit('skill.execution.completed', {
        skillId: skill.id,
        result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      const result: SkillExecutionResult = {
        success: false,
        output: context.output,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        stepsExecuted,
        stepResults,
      };

      this.addToHistory(result);

      EventBus.emit('skill.execution.failed', {
        skillId: skill.id,
        error: result.error,
        timestamp: Date.now(),
      });

      return result;
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: SkillStep,
    context: SkillExecutionContext,
    errorHandling?: string
  ): Promise<StepResult> {
    const startTime = Date.now();

    try {
      let output: unknown;

      switch (step.type) {
        case 'tool_call':
          output = await this.executeToolCall(step, context);
          break;
        case 'transform':
          output = await this.executeTransform(step, context);
          break;
        case 'condition':
          output = await this.executeCondition(step, context, errorHandling);
          break;
        case 'parallel':
          output = await this.executeParallel(step, context, errorHandling);
          break;
        case 'loop':
          output = await this.executeLoop(step, context, errorHandling);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      // Apply output mapping
      if (step.outputMapping && output !== undefined) {
        for (const [key, path] of Object.entries(step.outputMapping)) {
          this.setValueAtPath(context, path, output);
          context.steps[step.id] = output;
        }
      }

      return {
        stepId: step.id,
        success: true,
        output,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      // Handle retry
      if (step.retry && step.retry.maxAttempts > 0) {
        return this.executeWithRetry(step, context, errorHandling, step.retry);
      }

      if (step.continueOnError) {
        return {
          stepId: step.id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          executionTime: Date.now() - startTime,
        };
      }

      throw error;
    }
  }

  /**
   * Execute tool call step
   */
  private async executeToolCall(
    step: SkillStep,
    context: SkillExecutionContext
  ): Promise<unknown> {
    if (!step.tool?.name) {
      throw new Error('Tool call step must have a tool name');
    }

    // Build params from static params and input mapping
    const params: Record<string, unknown> = { ...step.tool.params };
    
    if (step.inputMapping) {
      for (const [key, path] of Object.entries(step.inputMapping)) {
        params[key] = this.getValueAtPath(context, path);
      }
    }

    return this.toolExecutor.execute(step.tool.name, params);
  }

  /**
   * Execute transform step
   */
  private async executeTransform(
    step: SkillStep,
    context: SkillExecutionContext
  ): Promise<unknown> {
    if (!step.transform) {
      throw new Error('Transform step must have transform config');
    }

    const { expression, type } = step.transform;

    switch (type) {
      case 'jsonpath':
        return this.getValueAtPath(context, expression);
      case 'expression':
        // Simple expression evaluation (be careful with security!)
        return this.evaluateExpression(expression, context);
      case 'template':
        return this.evaluateTemplate(expression, context);
      default:
        throw new Error(`Unknown transform type: ${type}`);
    }
  }

  /**
   * Execute condition step
   */
  private async executeCondition(
    step: SkillStep,
    context: SkillExecutionContext,
    errorHandling?: string
  ): Promise<unknown> {
    if (!step.condition) {
      throw new Error('Condition step must have condition config');
    }

    const conditionResult = this.evaluateExpression(step.condition.if, context);
    const stepsToExecute = conditionResult ? step.condition.then : step.condition.else;

    if (!stepsToExecute || stepsToExecute.length === 0) {
      return null;
    }

    let lastOutput: unknown;
    for (const subStep of stepsToExecute) {
      const result = await this.executeStep(subStep, context, errorHandling);
      lastOutput = result.output;
      if (!result.success && errorHandling !== 'continue') {
        throw new Error(result.error);
      }
    }

    return lastOutput;
  }

  /**
   * Execute parallel steps
   */
  private async executeParallel(
    step: SkillStep,
    context: SkillExecutionContext,
    errorHandling?: string
  ): Promise<unknown[]> {
    if (!step.parallel || step.parallel.length === 0) {
      return [];
    }

    const results = await Promise.all(
      step.parallel.map(subStep => this.executeStep(subStep, context, errorHandling))
    );

    const failed = results.filter(r => !r.success);
    if (failed.length > 0 && errorHandling !== 'continue') {
      throw new Error(`Parallel execution failed: ${failed.map(f => f.error).join(', ')}`);
    }

    return results.map(r => r.output);
  }

  /**
   * Execute loop step
   */
  private async executeLoop(
    step: SkillStep,
    context: SkillExecutionContext,
    errorHandling?: string
  ): Promise<unknown[]> {
    if (!step.loop) {
      throw new Error('Loop step must have loop config');
    }

    const items = this.getValueAtPath(context, step.loop.items) as unknown[];
    if (!Array.isArray(items)) {
      throw new Error('Loop items must be an array');
    }

    const maxIterations = step.loop.maxIterations || 1000;
    const results: unknown[] = [];

    for (let i = 0; i < Math.min(items.length, maxIterations); i++) {
      context.vars[step.loop.as] = items[i];
      context.vars[`${step.loop.as}_index`] = i;

      for (const subStep of step.loop.steps) {
        const result = await this.executeStep(subStep, context, errorHandling);
        if (!result.success && errorHandling !== 'continue') {
          throw new Error(result.error);
        }
        if (i === items.length - 1) {
          results.push(result.output);
        }
      }
    }

    return results;
  }

  /**
   * Execute with retry
   */
  private async executeWithRetry(
    step: SkillStep,
    context: SkillExecutionContext,
    errorHandling?: string,
    retry?: RetryConfig,
    attempt = 1
  ): Promise<StepResult> {
    if (!retry || attempt > retry.maxAttempts) {
      return {
        stepId: step.id,
        success: false,
        error: 'Max retries exceeded',
        executionTime: 0,
      };
    }

    try {
      const result = await this.executeStep(
        { ...step, retry: undefined }, // Remove retry to prevent infinite recursion
        context,
        errorHandling
      );
      return result;
    } catch {
      const delay = retry.exponential 
        ? retry.delayMs * Math.pow(2, attempt - 1)
        : retry.delayMs;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.executeWithRetry(step, context, errorHandling, retry, attempt + 1);
    }
  }

  /**
   * Get value at JSONPath-like path
   */
  private getValueAtPath(context: SkillExecutionContext, path: string): unknown {
    const parts = path.replace(/^\$\./, '').split('.');
    let current: unknown = context;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      // Handle array indexing
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, prop, index] = arrayMatch;
        current = (current as Record<string, unknown>)[prop];
        if (Array.isArray(current)) {
          current = current[parseInt(index, 10)];
        }
      } else {
        current = (current as Record<string, unknown>)[part];
      }
    }

    return current;
  }

  /**
   * Set value at path
   */
  private setValueAtPath(context: SkillExecutionContext, path: string, value: unknown): void {
    const parts = path.replace(/^\$\./, '').split('.');
    let current: Record<string, unknown> = context as unknown as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Evaluate a simple expression
   */
  private evaluateExpression(expression: string, context: SkillExecutionContext): unknown {
    // Very simple expression evaluation
    // In production, use a proper expression parser
    const safeContext = {
      input: context.input,
      output: context.output,
      steps: context.steps,
      vars: context.vars,
    };

    try {
      // Simple property access: $.input.query
      if (expression.startsWith('$.')) {
        return this.getValueAtPath(context, expression);
      }
      
      // Boolean comparison: $.input.value > 10
      const comparisonMatch = expression.match(/^\$\.(\S+)\s*(===?|!==?|>=?|<=?)\s*(.+)$/);
      if (comparisonMatch) {
        const [, path, op, value] = comparisonMatch;
        const leftValue = this.getValueAtPath(context, `$.${path}`);
        const rightValue = JSON.parse(value);
        
        switch (op) {
          case '==':
          case '===': return leftValue === rightValue;
          case '!=':
          case '!==': return leftValue !== rightValue;
          case '>': return (leftValue as number) > rightValue;
          case '>=': return (leftValue as number) >= rightValue;
          case '<': return (leftValue as number) < rightValue;
          case '<=': return (leftValue as number) <= rightValue;
        }
      }

      return expression;
    } catch {
      return expression;
    }
  }

  /**
   * Evaluate a template string
   */
  private evaluateTemplate(template: string, context: SkillExecutionContext): string {
    return template.replace(/\{\{(.+?)\}\}/g, (_, path) => {
      const value = this.getValueAtPath(context, path.trim());
      return value !== undefined ? String(value) : '';
    });
  }

  /**
   * Get execution history
   */
  getHistory(): SkillExecutionResult[] {
    return [...this.executionHistory];
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }

  private addToHistory(result: SkillExecutionResult): void {
    this.executionHistory.push(result);
    while (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
  }
}
