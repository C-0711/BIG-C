/**
 * AgentRegistry - Agent management and discovery
 * Sprint 8.1 - Agent Framework
 */

import { AgentDefinition, AgentTrigger, validateAgentDefinition } from './AgentSchema';
import { EventBus } from '../events/EventBus';

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  skills: string[];
  triggerTypes: string[];
  enabled: boolean;
}

export class AgentRegistry {
  private agents: Map<string, AgentDefinition> = new Map();
  private eventTriggers: Map<string, string[]> = new Map(); // event -> agent ids
  private cronTriggers: Map<string, AgentDefinition> = new Map(); // agentId -> agent (for cron)

  /**
   * Register an agent
   */
  register(agent: AgentDefinition): { success: boolean; errors?: string[] } {
    const validation = validateAgentDefinition(agent);

    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    if (this.agents.has(agent.id)) {
      console.warn(`AgentRegistry: Overwriting agent "${agent.id}"`);
    }

    this.agents.set(agent.id, agent);

    // Index triggers
    this.indexTriggers(agent);

    EventBus.emit('agent.registered', {
      agentId: agent.id,
      name: agent.name,
      skills: agent.skills,
    });

    return { success: true };
  }

  /**
   * Register multiple agents
   */
  registerAll(agents: AgentDefinition[]): { success: number; failed: number; errors: Record<string, string[]> } {
    let success = 0;
    let failed = 0;
    const errors: Record<string, string[]> = {};

    for (const agent of agents) {
      const result = this.register(agent);
      if (result.success) {
        success++;
      } else {
        failed++;
        errors[agent.id || 'unknown'] = result.errors || ['Unknown error'];
      }
    }

    return { success, failed, errors };
  }

  /**
   * Unregister an agent
   */
  unregister(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    // Remove from trigger indexes
    this.removeTriggerIndex(agent);

    this.agents.delete(agentId);

    EventBus.emit('agent.unregistered', { agentId });

    return true;
  }

  /**
   * Get an agent by ID
   */
  get(agentId: string): AgentDefinition | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Check if agent exists
   */
  has(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  /**
   * Get all registered agents
   */
  getAll(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get enabled agents only
   */
  getEnabled(): AgentDefinition[] {
    return this.getAll().filter(a => a.enabled !== false);
  }

  /**
   * Get agent metadata (lightweight)
   */
  getMetadata(agentId: string): AgentMetadata | undefined {
    const agent = this.agents.get(agentId);
    if (!agent) return undefined;

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      skills: agent.skills,
      triggerTypes: (agent.triggers || []).map(t => t.type),
      enabled: agent.enabled !== false,
    };
  }

  /**
   * Get all agent metadata
   */
  getAllMetadata(): AgentMetadata[] {
    return this.getAll().map(agent => this.getMetadata(agent.id)!);
  }

  /**
   * Get agents triggered by an event
   */
  getAgentsForEvent(event: string): AgentDefinition[] {
    const agentIds = this.eventTriggers.get(event) || [];
    
    // Also check wildcard patterns
    for (const [pattern, ids] of this.eventTriggers) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(event)) {
          agentIds.push(...ids);
        }
      }
    }

    const uniqueIds = [...new Set(agentIds)];
    return uniqueIds
      .map(id => this.agents.get(id))
      .filter((a): a is AgentDefinition => a !== undefined && a.enabled !== false);
  }

  /**
   * Get agents with cron triggers
   */
  getCronAgents(): AgentDefinition[] {
    return Array.from(this.cronTriggers.values()).filter(a => a.enabled !== false);
  }

  /**
   * Get agents that use a specific skill
   */
  getAgentsUsingSkill(skillId: string): AgentDefinition[] {
    return this.getAll().filter(agent => agent.skills.includes(skillId));
  }

  /**
   * Enable/disable an agent
   */
  setEnabled(agentId: string, enabled: boolean): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    agent.enabled = enabled;

    EventBus.emit('agent.status_changed', { agentId, enabled });

    return true;
  }

  /**
   * Update agent triggers
   */
  updateTriggers(agentId: string, triggers: AgentTrigger[]): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    // Remove old trigger indexes
    this.removeTriggerIndex(agent);

    // Update and re-index
    agent.triggers = triggers;
    this.indexTriggers(agent);

    EventBus.emit('agent.triggers_updated', { agentId, triggers });

    return true;
  }

  /**
   * Search agents by name or description
   */
  search(query: string): AgentDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(agent =>
      agent.name.toLowerCase().includes(lowerQuery) ||
      agent.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear all registered agents
   */
  clear(): void {
    this.agents.clear();
    this.eventTriggers.clear();
    this.cronTriggers.clear();
  }

  /**
   * Get count of registered agents
   */
  get count(): number {
    return this.agents.size;
  }

  /**
   * Index triggers for quick lookup
   */
  private indexTriggers(agent: AgentDefinition): void {
    if (!agent.triggers) return;

    for (const trigger of agent.triggers) {
      if (trigger.enabled === false) continue;

      switch (trigger.type) {
        case 'event':
          const eventConfig = trigger.config as { events: string[] };
          for (const event of eventConfig.events || []) {
            if (!this.eventTriggers.has(event)) {
              this.eventTriggers.set(event, []);
            }
            const agents = this.eventTriggers.get(event)!;
            if (!agents.includes(agent.id)) {
              agents.push(agent.id);
            }
          }
          break;
        case 'cron':
          this.cronTriggers.set(agent.id, agent);
          break;
      }
    }
  }

  /**
   * Remove trigger indexes for an agent
   */
  private removeTriggerIndex(agent: AgentDefinition): void {
    // Remove from event triggers
    for (const [event, agentIds] of this.eventTriggers) {
      const index = agentIds.indexOf(agent.id);
      if (index !== -1) {
        agentIds.splice(index, 1);
      }
      if (agentIds.length === 0) {
        this.eventTriggers.delete(event);
      }
    }

    // Remove from cron triggers
    this.cronTriggers.delete(agent.id);
  }
}

/** Singleton instance */
export const agentRegistry = new AgentRegistry();
