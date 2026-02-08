/**
 * TemplateManager - Export/Import templates for widgets, skills, agents, dashboards
 * Sprint 12.1 - Template Library
 */

import { WidgetConfig } from '../widgets/WidgetConfig';
import { SkillDefinition } from '../skills/SkillSchema';
import { AgentDefinition } from '../agents/AgentSchema';
import { DashboardConfig } from '../dashboard/DashboardConfig';
import { EventBus } from '../events/EventBus';

export type TemplateType = 'widget' | 'skill' | 'agent' | 'dashboard' | 'bundle';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  version: string;
  author?: string;
  tags?: string[];
  requiredTools?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WidgetTemplate extends TemplateMetadata {
  type: 'widget';
  config: WidgetConfig;
}

export interface SkillTemplate extends TemplateMetadata {
  type: 'skill';
  definition: SkillDefinition;
}

export interface AgentTemplate extends TemplateMetadata {
  type: 'agent';
  definition: AgentDefinition;
}

export interface DashboardTemplate extends TemplateMetadata {
  type: 'dashboard';
  config: DashboardConfig;
  widgetTemplates?: WidgetTemplate[];
}

export interface BundleTemplate extends TemplateMetadata {
  type: 'bundle';
  widgets: WidgetTemplate[];
  skills: SkillTemplate[];
  agents: AgentTemplate[];
  dashboards: DashboardTemplate[];
}

export type Template = WidgetTemplate | SkillTemplate | AgentTemplate | DashboardTemplate | BundleTemplate;

export interface ExportOptions {
  includeMetadata?: boolean;
  prettyPrint?: boolean;
  includeDependencies?: boolean;
}

export interface ImportResult {
  success: boolean;
  template?: Template;
  errors?: string[];
  warnings?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingTools: string[];
}

export class TemplateManager {
  private templates: Map<string, Template> = new Map();

  /**
   * Export a widget as template
   */
  exportWidget(config: WidgetConfig, metadata: Partial<TemplateMetadata>): WidgetTemplate {
    const template: WidgetTemplate = {
      id: metadata.id || `widget-${config.type}-${Date.now()}`,
      name: metadata.name || config.title || config.type,
      description: metadata.description || `Widget template for ${config.type}`,
      type: 'widget',
      version: metadata.version || '1.0.0',
      author: metadata.author,
      tags: metadata.tags,
      requiredTools: this.extractToolsFromWidget(config),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config,
    };

    this.templates.set(template.id, template);
    EventBus.emit('template.exported', { type: 'widget', id: template.id });

    return template;
  }

  /**
   * Export a skill as template
   */
  exportSkill(definition: SkillDefinition, metadata: Partial<TemplateMetadata>): SkillTemplate {
    const template: SkillTemplate = {
      id: metadata.id || `skill-${definition.id}-${Date.now()}`,
      name: metadata.name || definition.name,
      description: metadata.description || definition.description,
      type: 'skill',
      version: metadata.version || definition.version || '1.0.0',
      author: metadata.author,
      tags: metadata.tags,
      requiredTools: this.extractToolsFromSkill(definition),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      definition,
    };

    this.templates.set(template.id, template);
    EventBus.emit('template.exported', { type: 'skill', id: template.id });

    return template;
  }

  /**
   * Export an agent as template
   */
  exportAgent(definition: AgentDefinition, metadata: Partial<TemplateMetadata>): AgentTemplate {
    const template: AgentTemplate = {
      id: metadata.id || `agent-${definition.id}-${Date.now()}`,
      name: metadata.name || definition.name,
      description: metadata.description || definition.description,
      type: 'agent',
      version: metadata.version || definition.version || '1.0.0',
      author: metadata.author,
      tags: metadata.tags,
      requiredTools: definition.tools,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      definition,
    };

    this.templates.set(template.id, template);
    EventBus.emit('template.exported', { type: 'agent', id: template.id });

    return template;
  }

  /**
   * Export a dashboard as template
   */
  exportDashboard(
    config: DashboardConfig,
    metadata: Partial<TemplateMetadata>,
    widgetTemplates?: WidgetTemplate[]
  ): DashboardTemplate {
    const template: DashboardTemplate = {
      id: metadata.id || `dashboard-${Date.now()}`,
      name: metadata.name || config.name,
      description: metadata.description || `Dashboard template: ${config.name}`,
      type: 'dashboard',
      version: metadata.version || '1.0.0',
      author: metadata.author,
      tags: metadata.tags,
      requiredTools: this.extractToolsFromDashboard(config, widgetTemplates),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config,
      widgetTemplates,
    };

    this.templates.set(template.id, template);
    EventBus.emit('template.exported', { type: 'dashboard', id: template.id });

    return template;
  }

  /**
   * Export multiple items as a bundle
   */
  exportBundle(
    name: string,
    description: string,
    items: {
      widgets?: WidgetTemplate[];
      skills?: SkillTemplate[];
      agents?: AgentTemplate[];
      dashboards?: DashboardTemplate[];
    },
    metadata?: Partial<TemplateMetadata>
  ): BundleTemplate {
    const allTools = new Set<string>();
    
    items.widgets?.forEach(w => w.requiredTools?.forEach(t => allTools.add(t)));
    items.skills?.forEach(s => s.requiredTools?.forEach(t => allTools.add(t)));
    items.agents?.forEach(a => a.requiredTools?.forEach(t => allTools.add(t)));
    items.dashboards?.forEach(d => d.requiredTools?.forEach(t => allTools.add(t)));

    const template: BundleTemplate = {
      id: metadata?.id || `bundle-${Date.now()}`,
      name,
      description,
      type: 'bundle',
      version: metadata?.version || '1.0.0',
      author: metadata?.author,
      tags: metadata?.tags,
      requiredTools: Array.from(allTools),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      widgets: items.widgets || [],
      skills: items.skills || [],
      agents: items.agents || [],
      dashboards: items.dashboards || [],
    };

    this.templates.set(template.id, template);
    EventBus.emit('template.exported', { type: 'bundle', id: template.id });

    return template;
  }

  /**
   * Import a template from JSON
   */
  import(json: string | object): ImportResult {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      
      const validation = this.validate(data);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
        };
      }

      const template = data as Template;
      this.templates.set(template.id, template);

      EventBus.emit('template.imported', { type: template.type, id: template.id });

      return {
        success: true,
        template,
        warnings: validation.warnings,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Validate a template
   */
  validate(template: unknown, availableTools?: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingTools: string[] = [];

    if (typeof template !== 'object' || template === null) {
      errors.push('Template must be an object');
      return { valid: false, errors, warnings, missingTools };
    }

    const t = template as Record<string, unknown>;

    // Check required fields
    if (!t.id) errors.push('Template must have an id');
    if (!t.name) errors.push('Template must have a name');
    if (!t.type) errors.push('Template must have a type');
    if (!['widget', 'skill', 'agent', 'dashboard', 'bundle'].includes(t.type as string)) {
      errors.push(`Invalid template type: ${t.type}`);
    }

    // Check version
    if (!t.version) warnings.push('Template should have a version');

    // Check required tools
    if (availableTools && t.requiredTools) {
      for (const tool of t.requiredTools as string[]) {
        if (!availableTools.includes(tool)) {
          missingTools.push(tool);
        }
      }
      if (missingTools.length > 0) {
        warnings.push(`Missing tools: ${missingTools.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      missingTools,
    };
  }

  /**
   * Serialize template to JSON
   */
  toJSON(template: Template, options: ExportOptions = {}): string {
    const data = options.includeMetadata !== false ? template : this.stripMetadata(template);
    return JSON.stringify(data, null, options.prettyPrint ? 2 : 0);
  }

  /**
   * Get a template by ID
   */
  get(templateId: string): Template | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getAll(): Template[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by type
   */
  getByType(type: TemplateType): Template[] {
    return this.getAll().filter(t => t.type === type);
  }

  /**
   * Search templates
   */
  search(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Delete a template
   */
  delete(templateId: string): boolean {
    const deleted = this.templates.delete(templateId);
    if (deleted) {
      EventBus.emit('template.deleted', { id: templateId });
    }
    return deleted;
  }

  /**
   * Clear all templates
   */
  clear(): void {
    this.templates.clear();
  }

  /**
   * Extract tools used by a widget
   */
  private extractToolsFromWidget(config: WidgetConfig): string[] {
    // This would need to be enhanced based on widget type
    // For now, return empty array
    return [];
  }

  /**
   * Extract tools used by a skill
   */
  private extractToolsFromSkill(definition: SkillDefinition): string[] {
    const tools = new Set<string>();

    const extractFromSteps = (steps: typeof definition.steps) => {
      for (const step of steps) {
        if (step.type === 'tool_call' && step.tool?.name) {
          tools.add(step.tool.name);
        }
        if (step.condition?.then) extractFromSteps(step.condition.then);
        if (step.condition?.else) extractFromSteps(step.condition.else);
        if (step.parallel) extractFromSteps(step.parallel);
        if (step.loop?.steps) extractFromSteps(step.loop.steps);
      }
    };

    extractFromSteps(definition.steps);
    return Array.from(tools);
  }

  /**
   * Extract tools from dashboard
   */
  private extractToolsFromDashboard(
    config: DashboardConfig,
    widgetTemplates?: WidgetTemplate[]
  ): string[] {
    const tools = new Set<string>();
    
    if (widgetTemplates) {
      for (const widget of widgetTemplates) {
        widget.requiredTools?.forEach(t => tools.add(t));
      }
    }

    return Array.from(tools);
  }

  /**
   * Strip metadata from template for minimal export
   */
  private stripMetadata(template: Template): unknown {
    switch (template.type) {
      case 'widget':
        return (template as WidgetTemplate).config;
      case 'skill':
        return (template as SkillTemplate).definition;
      case 'agent':
        return (template as AgentTemplate).definition;
      case 'dashboard':
        return (template as DashboardTemplate).config;
      default:
        return template;
    }
  }
}

/** Singleton instance */
export const templateManager = new TemplateManager();
