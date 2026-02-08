/**
 * SkillSchema - Skill definition types and validation
 * Sprint 6.1 - Skill Framework
 */

export interface SkillDefinition {
  /** Unique skill identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of what the skill does */
  description: string;
  /** Category for organization */
  category?: string;
  /** Icon identifier */
  icon?: string;
  /** Skill version */
  version?: string;
  /** Input schema */
  input: SkillInputSchema;
  /** Output schema */
  output: SkillOutputSchema;
  /** Execution steps */
  steps: SkillStep[];
  /** Events that trigger this skill */
  triggers?: string[];
  /** Error handling strategy */
  errorHandling?: ErrorHandlingStrategy;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

export interface SkillInputSchema {
  type: 'object';
  properties: Record<string, SchemaProperty>;
  required?: string[];
}

export interface SkillOutputSchema {
  type: 'object';
  properties: Record<string, SchemaProperty>;
}

export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  default?: unknown;
  enum?: unknown[];
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
}

export type SkillStepType = 'tool_call' | 'transform' | 'condition' | 'parallel' | 'loop';

export interface SkillStep {
  /** Step identifier */
  id: string;
  /** Step type */
  type: SkillStepType;
  /** Step name for display */
  name?: string;
  /** Tool call configuration */
  tool?: ToolCallConfig;
  /** Transform configuration */
  transform?: TransformConfig;
  /** Condition configuration */
  condition?: ConditionConfig;
  /** Parallel steps */
  parallel?: SkillStep[];
  /** Loop configuration */
  loop?: LoopConfig;
  /** Input mapping from context */
  inputMapping?: Record<string, string>;
  /** Output mapping to context */
  outputMapping?: Record<string, string>;
  /** Continue on error */
  continueOnError?: boolean;
  /** Retry configuration */
  retry?: RetryConfig;
}

export interface ToolCallConfig {
  /** MCP tool name */
  name: string;
  /** Static parameters */
  params?: Record<string, unknown>;
}

export interface TransformConfig {
  /** JavaScript expression or JSONPath */
  expression: string;
  /** Transform type */
  type: 'jsonpath' | 'expression' | 'template';
}

export interface ConditionConfig {
  /** Condition expression */
  if: string;
  /** Steps if true */
  then: SkillStep[];
  /** Steps if false */
  else?: SkillStep[];
}

export interface LoopConfig {
  /** Array to iterate over (JSONPath) */
  items: string;
  /** Variable name for current item */
  as: string;
  /** Steps to execute for each item */
  steps: SkillStep[];
  /** Maximum iterations */
  maxIterations?: number;
}

export interface RetryConfig {
  /** Maximum retry attempts */
  maxAttempts: number;
  /** Delay between retries in ms */
  delayMs: number;
  /** Exponential backoff */
  exponential?: boolean;
}

export type ErrorHandlingStrategy = 'fail' | 'continue' | 'rollback';

/**
 * Validate a skill definition
 */
export function validateSkillDefinition(skill: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof skill !== 'object' || skill === null) {
    errors.push('Skill must be an object');
    return { valid: false, errors };
  }

  const s = skill as Record<string, unknown>;

  // Required fields
  if (!s.id || typeof s.id !== 'string') {
    errors.push('Skill must have a string id');
  }

  if (!s.name || typeof s.name !== 'string') {
    errors.push('Skill must have a string name');
  }

  if (!s.description || typeof s.description !== 'string') {
    errors.push('Skill must have a string description');
  }

  if (!s.input || typeof s.input !== 'object') {
    errors.push('Skill must have an input schema');
  }

  if (!s.output || typeof s.output !== 'object') {
    errors.push('Skill must have an output schema');
  }

  if (!Array.isArray(s.steps) || s.steps.length === 0) {
    errors.push('Skill must have at least one step');
  } else {
    // Validate steps
    for (let i = 0; i < (s.steps as SkillStep[]).length; i++) {
      const stepErrors = validateSkillStep((s.steps as SkillStep[])[i], i);
      errors.push(...stepErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a skill step
 */
function validateSkillStep(step: SkillStep, index: number): string[] {
  const errors: string[] = [];
  const prefix = `Step ${index}`;

  if (!step.id) {
    errors.push(`${prefix}: must have an id`);
  }

  if (!step.type) {
    errors.push(`${prefix}: must have a type`);
  }

  switch (step.type) {
    case 'tool_call':
      if (!step.tool?.name) {
        errors.push(`${prefix}: tool_call must have a tool name`);
      }
      break;
    case 'transform':
      if (!step.transform?.expression) {
        errors.push(`${prefix}: transform must have an expression`);
      }
      break;
    case 'condition':
      if (!step.condition?.if) {
        errors.push(`${prefix}: condition must have an if expression`);
      }
      if (!step.condition?.then || step.condition.then.length === 0) {
        errors.push(`${prefix}: condition must have then steps`);
      }
      break;
    case 'parallel':
      if (!step.parallel || step.parallel.length === 0) {
        errors.push(`${prefix}: parallel must have steps`);
      }
      break;
    case 'loop':
      if (!step.loop?.items) {
        errors.push(`${prefix}: loop must have items path`);
      }
      if (!step.loop?.as) {
        errors.push(`${prefix}: loop must have as variable`);
      }
      break;
  }

  return errors;
}

/**
 * Create a simple tool call skill
 */
export function createSimpleSkill(
  id: string,
  name: string,
  tool: string,
  inputProps: Record<string, SchemaProperty>,
  outputProps: Record<string, SchemaProperty>
): SkillDefinition {
  return {
    id,
    name,
    description: `Execute ${tool}`,
    input: {
      type: 'object',
      properties: inputProps,
      required: Object.keys(inputProps),
    },
    output: {
      type: 'object',
      properties: outputProps,
    },
    steps: [
      {
        id: 'call',
        type: 'tool_call',
        tool: { name: tool },
        inputMapping: Object.fromEntries(
          Object.keys(inputProps).map(k => [k, `$.input.${k}`])
        ),
        outputMapping: { result: '$.output' },
      },
    ],
  };
}
