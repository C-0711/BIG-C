/**
 * AgentSchema - Agent definition types and validation
 * Sprint 8.1 - Agent Framework
 */

export interface AgentDefinition {
  /** Unique agent identifier */
  id: string;
  /** Display name */
  name: string;
  /** Agent description */
  description: string;
  /** Agent persona/personality */
  persona?: AgentPersona;
  /** Skills this agent can use */
  skills: string[];
  /** Tools this agent can directly call */
  tools?: string[];
  /** Triggers that activate this agent */
  triggers?: AgentTrigger[];
  /** Agent capabilities */
  capabilities?: AgentCapabilities;
  /** Agent version */
  version?: string;
  /** Whether agent is enabled */
  enabled?: boolean;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

export interface AgentPersona {
  /** System prompt / personality description */
  systemPrompt: string;
  /** Tone of voice */
  tone?: 'formal' | 'casual' | 'technical' | 'friendly';
  /** Language preference */
  language?: string;
  /** Custom instructions */
  instructions?: string[];
}

export type TriggerType = 'event' | 'cron' | 'manual' | 'webhook';

export interface AgentTrigger {
  /** Trigger type */
  type: TriggerType;
  /** Trigger configuration */
  config: EventTriggerConfig | CronTriggerConfig | WebhookTriggerConfig;
  /** Whether trigger is enabled */
  enabled?: boolean;
}

export interface EventTriggerConfig {
  /** Event patterns to listen for */
  events: string[];
  /** Optional filter conditions */
  filter?: Record<string, unknown>;
}

export interface CronTriggerConfig {
  /** Cron expression */
  schedule: string;
  /** Timezone */
  timezone?: string;
}

export interface WebhookTriggerConfig {
  /** Webhook path */
  path: string;
  /** HTTP methods */
  methods?: ('GET' | 'POST' | 'PUT')[];
}

export interface AgentCapabilities {
  /** Can execute skills */
  executeSkills?: boolean;
  /** Can call tools directly */
  callTools?: boolean;
  /** Can send notifications */
  sendNotifications?: boolean;
  /** Can access working memory */
  accessMemory?: boolean;
  /** Maximum concurrent executions */
  maxConcurrent?: number;
}

export interface AgentExecutionContext {
  /** Agent ID */
  agentId: string;
  /** Trigger that activated the agent */
  trigger?: {
    type: TriggerType;
    event?: string;
    payload?: unknown;
  };
  /** User input if any */
  input?: string;
  /** Working memory reference */
  memorySessionId?: string;
  /** Execution metadata */
  meta: {
    executionId: string;
    startTime: number;
    timeout?: number;
  };
}

export interface AgentResponse {
  /** Response message */
  message: string;
  /** Skills executed */
  skillsExecuted?: string[];
  /** Tools called */
  toolsCalled?: string[];
  /** Actions taken */
  actions?: AgentAction[];
  /** Suggested follow-ups */
  suggestions?: string[];
}

export interface AgentAction {
  type: 'skill' | 'tool' | 'notification' | 'event';
  name: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

/**
 * Validate an agent definition
 */
export function validateAgentDefinition(agent: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof agent !== 'object' || agent === null) {
    errors.push('Agent must be an object');
    return { valid: false, errors };
  }

  const a = agent as Record<string, unknown>;

  if (!a.id || typeof a.id !== 'string') {
    errors.push('Agent must have a string id');
  }

  if (!a.name || typeof a.name !== 'string') {
    errors.push('Agent must have a string name');
  }

  if (!a.description || typeof a.description !== 'string') {
    errors.push('Agent must have a string description');
  }

  if (!Array.isArray(a.skills)) {
    errors.push('Agent must have a skills array');
  }

  // Validate triggers if present
  if (a.triggers && Array.isArray(a.triggers)) {
    for (let i = 0; i < (a.triggers as AgentTrigger[]).length; i++) {
      const trigger = (a.triggers as AgentTrigger[])[i];
      if (!trigger.type) {
        errors.push(`Trigger ${i}: must have a type`);
      }
      if (!trigger.config) {
        errors.push(`Trigger ${i}: must have config`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create an agent from a skill (promotion)
 */
export function createAgentFromSkill(
  skillId: string,
  skillName: string,
  skillDescription: string,
  options?: {
    persona?: AgentPersona;
    triggers?: AgentTrigger[];
  }
): AgentDefinition {
  return {
    id: `agent-${skillId}`,
    name: `${skillName} Agent`,
    description: `Agent that executes the ${skillName} skill. ${skillDescription}`,
    persona: options?.persona || {
      systemPrompt: `You are an assistant specialized in ${skillName}. Help users by executing the ${skillId} skill when appropriate.`,
      tone: 'friendly',
    },
    skills: [skillId],
    triggers: options?.triggers || [{ type: 'manual', config: {}, enabled: true }],
    capabilities: {
      executeSkills: true,
      accessMemory: true,
    },
    enabled: true,
  };
}
