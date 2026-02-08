/**
 * WidgetRegistry - Widget type registry with factory pattern
 * Sprint 1.1 - Widget Framework
 */

import { WidgetBase } from './WidgetBase';
import { WidgetConfig, validateWidgetConfig } from './WidgetConfig';

type WidgetConstructor = new (config: WidgetConfig) => WidgetBase;
type WidgetFactory = (config: WidgetConfig) => WidgetBase | Promise<WidgetBase>;

interface WidgetRegistration {
  constructor?: WidgetConstructor;
  factory?: WidgetFactory;
  lazyLoader?: () => Promise<WidgetConstructor>;
  metadata?: {
    name: string;
    description?: string;
    category?: string;
    icon?: string;
  };
}

class WidgetRegistryClass {
  private registry = new Map<string, WidgetRegistration>();
  private instances = new Map<string, WidgetBase>();

  /**
   * Register a widget type with its constructor
   */
  register(type: string, constructor: WidgetConstructor, metadata?: WidgetRegistration['metadata']): void {
    if (this.registry.has(type)) {
      console.warn(`WidgetRegistry: Overwriting registration for type "${type}"`);
    }
    this.registry.set(type, { constructor, metadata });
  }

  /**
   * Register a widget type with a factory function
   */
  registerFactory(type: string, factory: WidgetFactory, metadata?: WidgetRegistration['metadata']): void {
    this.registry.set(type, { factory, metadata } as WidgetRegistration);
  }

  /**
   * Register a widget type with lazy loading
   */
  registerLazy(type: string, loader: () => Promise<WidgetConstructor>, metadata?: WidgetRegistration['metadata']): void {
    this.registry.set(type, { lazyLoader: loader, metadata } as WidgetRegistration);
  }

  /**
   * Create a widget instance from configuration
   */
  async create(config: WidgetConfig): Promise<WidgetBase> {
    if (!validateWidgetConfig(config)) {
      throw new Error(`Invalid widget configuration`);
    }

    const registration = this.registry.get(config.type);
    if (!registration) {
      throw new Error(`Unknown widget type: ${config.type}`);
    }

    let widget: WidgetBase;

    if (registration.factory) {
      widget = await registration.factory(config);
    } else if (registration.lazyLoader) {
      // Lazy load the constructor
      const Constructor = await registration.lazyLoader();
      registration.constructor = Constructor; // Cache it
      widget = new Constructor(config);
    } else if (registration.constructor) {
      widget = new registration.constructor(config);
    } else {
      throw new Error(`Widget type "${config.type}" has no constructor or factory`);
    }

    // Track instance if it has an ID
    if (config.id) {
      this.instances.set(config.id, widget);
    }

    return widget;
  }

  /**
   * Get a registered widget's metadata
   */
  getMetadata(type: string): WidgetRegistration['metadata'] | undefined {
    return this.registry.get(type)?.metadata;
  }

  /**
   * Get all registered widget types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Check if a widget type is registered
   */
  isRegistered(type: string): boolean {
    return this.registry.has(type);
  }

  /**
   * Get a widget instance by ID
   */
  getInstance(id: string): WidgetBase | undefined {
    return this.instances.get(id);
  }

  /**
   * Remove a widget instance
   */
  removeInstance(id: string): boolean {
    return this.instances.delete(id);
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.registry.clear();
    this.instances.clear();
  }
}

/** Shared singleton instance */
export const WidgetRegistry = new WidgetRegistryClass();
