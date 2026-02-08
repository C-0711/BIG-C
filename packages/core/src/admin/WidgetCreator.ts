/**
 * WidgetCreator - Widget creation utilities
 * Sprint 3.2 - Widget Admin
 */

import { WidgetConfig, validateWidgetConfig } from '../widgets/WidgetConfig';
import { WidgetRegistry } from '../widgets/WidgetRegistry';
import { EventBus } from '../events/EventBus';

export interface WidgetTemplate {
  type: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  defaultConfig: Partial<WidgetConfig>;
  mcpTools?: string[];
  previewImage?: string;
}

export interface WidgetCreationResult {
  success: boolean;
  widget?: WidgetConfig;
  error?: string;
}

export class WidgetCreator {
  private templates: Map<string, WidgetTemplate> = new Map();

  /**
   * Register a widget template
   */
  registerTemplate(template: WidgetTemplate): void {
    this.templates.set(template.type, template);
  }

  /**
   * Register multiple templates
   */
  registerTemplates(templates: WidgetTemplate[]): void {
    for (const template of templates) {
      this.registerTemplate(template);
    }
  }

  /**
   * Get all registered templates
   */
  getTemplates(): WidgetTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(): Record<string, WidgetTemplate[]> {
    const grouped: Record<string, WidgetTemplate[]> = {};
    
    for (const template of this.templates.values()) {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    }
    
    return grouped;
  }

  /**
   * Get a specific template
   */
  getTemplate(type: string): WidgetTemplate | undefined {
    return this.templates.get(type);
  }

  /**
   * Create a widget from a template
   */
  createFromTemplate(
    type: string,
    overrides?: Partial<WidgetConfig>
  ): WidgetCreationResult {
    const template = this.templates.get(type);
    
    if (!template) {
      return {
        success: false,
        error: `Unknown widget type: ${type}`,
      };
    }

    const widget: WidgetConfig = {
      type: template.type,
      id: this.generateId(type),
      title: template.name,
      ...template.defaultConfig,
      ...overrides,
      settings: {
        ...template.defaultConfig.settings,
        ...overrides?.settings,
      },
    };

    if (!validateWidgetConfig(widget)) {
      return {
        success: false,
        error: 'Invalid widget configuration',
      };
    }

    EventBus.emit('admin.widget.created', {
      widget,
      templateType: type,
      timestamp: Date.now(),
    });

    return {
      success: true,
      widget,
    };
  }

  /**
   * Create a custom widget (not from template)
   */
  createCustom(config: WidgetConfig): WidgetCreationResult {
    if (!config.id) {
      config.id = this.generateId(config.type);
    }

    if (!validateWidgetConfig(config)) {
      return {
        success: false,
        error: 'Invalid widget configuration',
      };
    }

    EventBus.emit('admin.widget.created', {
      widget: config,
      custom: true,
      timestamp: Date.now(),
    });

    return {
      success: true,
      widget: config,
    };
  }

  /**
   * Clone an existing widget
   */
  clone(widget: WidgetConfig, newId?: string): WidgetConfig {
    return {
      ...widget,
      id: newId || this.generateId(widget.type),
      title: widget.title ? `${widget.title} (Copy)` : undefined,
      settings: { ...widget.settings },
      layout: widget.layout ? { ...widget.layout } : undefined,
    };
  }

  /**
   * Validate a widget configuration
   */
  validate(config: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof config !== 'object' || config === null) {
      errors.push('Configuration must be an object');
      return { valid: false, errors };
    }

    const c = config as Record<string, unknown>;

    if (!c.type || typeof c.type !== 'string') {
      errors.push('Widget type is required');
    }

    if (c.id && typeof c.id !== 'string') {
      errors.push('Widget ID must be a string');
    }

    if (c.title && typeof c.title !== 'string') {
      errors.push('Widget title must be a string');
    }

    if (c.settings && typeof c.settings !== 'object') {
      errors.push('Widget settings must be an object');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a unique widget ID
   */
  private generateId(type: string): string {
    return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

/** Singleton instance */
export const widgetCreator = new WidgetCreator();
