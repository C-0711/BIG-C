/**
 * SkillRegistry - Skill management and discovery
 * Sprint 6.1 - Skill Framework
 */

import { SkillDefinition, validateSkillDefinition } from './SkillSchema';
import { EventBus } from '../events/EventBus';

export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  category?: string;
  icon?: string;
  toolsUsed: string[];
  triggers: string[];
}

export class SkillRegistry {
  private skills: Map<string, SkillDefinition> = new Map();
  private triggerMap: Map<string, string[]> = new Map(); // event -> skill ids

  /**
   * Register a skill
   */
  register(skill: SkillDefinition): { success: boolean; errors?: string[] } {
    const validation = validateSkillDefinition(skill);
    
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    // Check for duplicate
    if (this.skills.has(skill.id)) {
      console.warn(`SkillRegistry: Overwriting skill "${skill.id}"`);
    }

    this.skills.set(skill.id, skill);

    // Register triggers
    if (skill.triggers) {
      for (const trigger of skill.triggers) {
        if (!this.triggerMap.has(trigger)) {
          this.triggerMap.set(trigger, []);
        }
        const skills = this.triggerMap.get(trigger)!;
        if (!skills.includes(skill.id)) {
          skills.push(skill.id);
        }
      }
    }

    EventBus.emit('skill.registered', {
      skillId: skill.id,
      name: skill.name,
      triggers: skill.triggers,
    });

    return { success: true };
  }

  /**
   * Register multiple skills
   */
  registerAll(skills: SkillDefinition[]): { success: number; failed: number; errors: Record<string, string[]> } {
    let success = 0;
    let failed = 0;
    const errors: Record<string, string[]> = {};

    for (const skill of skills) {
      const result = this.register(skill);
      if (result.success) {
        success++;
      } else {
        failed++;
        errors[skill.id || 'unknown'] = result.errors || ['Unknown error'];
      }
    }

    return { success, failed, errors };
  }

  /**
   * Unregister a skill
   */
  unregister(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    // Remove from trigger map
    if (skill.triggers) {
      for (const trigger of skill.triggers) {
        const skills = this.triggerMap.get(trigger);
        if (skills) {
          const index = skills.indexOf(skillId);
          if (index !== -1) {
            skills.splice(index, 1);
          }
          if (skills.length === 0) {
            this.triggerMap.delete(trigger);
          }
        }
      }
    }

    this.skills.delete(skillId);

    EventBus.emit('skill.unregistered', { skillId });

    return true;
  }

  /**
   * Get a skill by ID
   */
  get(skillId: string): SkillDefinition | undefined {
    return this.skills.get(skillId);
  }

  /**
   * Check if a skill exists
   */
  has(skillId: string): boolean {
    return this.skills.has(skillId);
  }

  /**
   * Get all registered skills
   */
  getAll(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get skill metadata (lightweight)
   */
  getMetadata(skillId: string): SkillMetadata | undefined {
    const skill = this.skills.get(skillId);
    if (!skill) return undefined;

    return {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      icon: skill.icon,
      toolsUsed: this.extractToolsUsed(skill),
      triggers: skill.triggers || [],
    };
  }

  /**
   * Get all skill metadata
   */
  getAllMetadata(): SkillMetadata[] {
    return this.getAll().map(skill => this.getMetadata(skill.id)!);
  }

  /**
   * Get skills by category
   */
  getByCategory(category: string): SkillDefinition[] {
    return this.getAll().filter(s => s.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const skill of this.skills.values()) {
      if (skill.category) {
        categories.add(skill.category);
      }
    }
    return Array.from(categories);
  }

  /**
   * Get skills triggered by an event
   */
  getSkillsForTrigger(event: string): SkillDefinition[] {
    const skillIds = this.triggerMap.get(event) || [];
    return skillIds.map(id => this.skills.get(id)!).filter(Boolean);
  }

  /**
   * Get skills that use a specific tool
   */
  getSkillsUsingTool(toolName: string): SkillDefinition[] {
    return this.getAll().filter(skill => 
      this.extractToolsUsed(skill).includes(toolName)
    );
  }

  /**
   * Search skills by name or description
   */
  search(query: string): SkillDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(skill =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear all registered skills
   */
  clear(): void {
    this.skills.clear();
    this.triggerMap.clear();
  }

  /**
   * Get count of registered skills
   */
  get count(): number {
    return this.skills.size;
  }

  /**
   * Extract all tools used by a skill
   */
  private extractToolsUsed(skill: SkillDefinition): string[] {
    const tools = new Set<string>();
    
    const extractFromSteps = (steps: typeof skill.steps) => {
      for (const step of steps) {
        if (step.type === 'tool_call' && step.tool?.name) {
          tools.add(step.tool.name);
        }
        if (step.condition?.then) {
          extractFromSteps(step.condition.then);
        }
        if (step.condition?.else) {
          extractFromSteps(step.condition.else);
        }
        if (step.parallel) {
          extractFromSteps(step.parallel);
        }
        if (step.loop?.steps) {
          extractFromSteps(step.loop.steps);
        }
      }
    };

    extractFromSteps(skill.steps);
    return Array.from(tools);
  }
}

/** Singleton instance */
export const skillRegistry = new SkillRegistry();
