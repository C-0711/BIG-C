/**
 * WidgetBase - Base class for all widgets with lifecycle hooks
 * Sprint 1.1 - Widget Framework
 */

import { WidgetConfig, mergeWithDefaults } from './WidgetConfig';
import { EventBus } from '../events/EventBus';

export type WidgetState = 'idle' | 'loading' | 'ready' | 'error';

export interface WidgetContext {
  widgetId: string;
  config: WidgetConfig;
  emit: (event: string, payload?: unknown) => void;
}

export abstract class WidgetBase {
  protected config: WidgetConfig;
  protected state: WidgetState = 'idle';
  protected error: Error | null = null;
  protected subscriptions: (() => void)[] = [];
  
  readonly id: string;

  constructor(config: WidgetConfig) {
    this.config = mergeWithDefaults(config);
    this.id = config.id || `${config.type}-${Date.now()}`;
  }

  /**
   * Lifecycle: Called when widget is mounted
   * Override in subclass for initialization
   */
  async onMount(): Promise<void> {
    this.state = 'loading';
    
    // Subscribe to configured events
    if (this.config.subscriptions) {
      for (const pattern of this.config.subscriptions) {
        const unsub = EventBus.subscribe(pattern, this.handleEvent.bind(this));
        this.subscriptions.push(unsub);
      }
    }
    
    // Emit mounted event
    EventBus.emit('widget.mounted', {
      widgetId: this.id,
      widgetType: this.config.type,
      timestamp: Date.now(),
    });
    
    this.state = 'ready';
  }

  /**
   * Lifecycle: Called when widget is updated
   * Override in subclass for update handling
   */
  async onUpdate(prevConfig: WidgetConfig): Promise<void> {
    this.config = mergeWithDefaults({ ...prevConfig, ...this.config });
  }

  /**
   * Lifecycle: Called when widget is destroyed
   * Override in subclass for cleanup
   */
  async onDestroy(): Promise<void> {
    // Unsubscribe from all events
    for (const unsub of this.subscriptions) {
      unsub();
    }
    this.subscriptions = [];
    
    // Emit unmounted event
    EventBus.emit('widget.unmounted', {
      widgetId: this.id,
      widgetType: this.config.type,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle incoming events
   * Override in subclass for event handling
   */
  protected handleEvent(event: string, payload: unknown): void {
    // Override in subclass
    console.log(`Widget ${this.id} received event: ${event}`, payload);
  }

  /**
   * Emit an event from this widget
   */
  protected emit(event: string, payload?: Record<string, unknown>): void {
    EventBus.emit(event, {
      ...(payload || {}),
      source: this.id,
      timestamp: Date.now(),
    });
  }

  /**
   * Set widget to error state
   */
  protected setError(error: Error): void {
    this.state = 'error';
    this.error = error;
    
    EventBus.emit('widget.error', {
      widgetId: this.id,
      widgetType: this.config.type,
      error: error.message,
      timestamp: Date.now(),
    });
  }

  /**
   * Get current widget state
   */
  getState(): WidgetState {
    return this.state;
  }

  /**
   * Get current error if any
   */
  getError(): Error | null {
    return this.error;
  }

  /**
   * Get widget configuration
   */
  getConfig(): WidgetConfig {
    return { ...this.config };
  }
}
