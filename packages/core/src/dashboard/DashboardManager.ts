/**
 * DashboardManager - Dashboard state management
 * Sprint 3.1 - Dashboard Basics
 */

import { 
  DashboardConfig, 
  DashboardWidget, 
  WidgetLayout,
  mergeDashboardConfig,
  createDashboardWidget,
  DEFAULT_WIDGET_LAYOUT,
} from './DashboardConfig';
import { WidgetConfig } from '../widgets/WidgetConfig';
import { EventBus } from '../events/EventBus';

export interface DashboardPersistence {
  save(dashboard: DashboardConfig): Promise<void>;
  load(id: string): Promise<DashboardConfig | null>;
  list(): Promise<DashboardConfig[]>;
  delete(id: string): Promise<void>;
}

export class DashboardManager {
  private dashboard: DashboardConfig;
  private persistence: DashboardPersistence | null = null;
  private autoSaveTimeout: NodeJS.Timeout | null = null;
  private autoSaveDelay = 2000;
  private isDirty = false;

  constructor(config?: Partial<DashboardConfig>) {
    this.dashboard = mergeDashboardConfig(config || {});
  }

  /**
   * Set persistence adapter
   */
  setPersistence(persistence: DashboardPersistence): void {
    this.persistence = persistence;
  }

  /**
   * Get current dashboard config
   */
  getConfig(): DashboardConfig {
    return { ...this.dashboard };
  }

  /**
   * Get all widgets
   */
  getWidgets(): DashboardWidget[] {
    return [...this.dashboard.widgets];
  }

  /**
   * Get widget by ID
   */
  getWidget(id: string): DashboardWidget | undefined {
    return this.dashboard.widgets.find(w => w.id === id);
  }

  /**
   * Add a widget to the dashboard
   */
  addWidget(config: WidgetConfig, layout?: Partial<WidgetLayout>): DashboardWidget {
    const widget = createDashboardWidget(config, layout);
    
    // Find available position if not specified
    if (layout?.x === undefined || layout?.y === undefined) {
      const position = this.findAvailablePosition(widget.layout.w, widget.layout.h);
      widget.layout.x = position.x;
      widget.layout.y = position.y;
    }
    
    this.dashboard.widgets.push(widget);
    this.markDirty();
    
    EventBus.emit('dashboard.widget.added', {
      dashboardId: this.dashboard.id,
      widget,
      timestamp: Date.now(),
    });
    
    return widget;
  }

  /**
   * Remove a widget from the dashboard
   */
  removeWidget(id: string): boolean {
    const index = this.dashboard.widgets.findIndex(w => w.id === id);
    if (index === -1) return false;
    
    const [removed] = this.dashboard.widgets.splice(index, 1);
    this.markDirty();
    
    EventBus.emit('dashboard.widget.removed', {
      dashboardId: this.dashboard.id,
      widgetId: id,
      timestamp: Date.now(),
    });
    
    return true;
  }

  /**
   * Update widget layout (position/size)
   */
  updateWidgetLayout(id: string, layout: Partial<WidgetLayout>): boolean {
    const widget = this.dashboard.widgets.find(w => w.id === id);
    if (!widget) return false;
    
    widget.layout = { ...widget.layout, ...layout };
    this.markDirty();
    
    EventBus.emit('dashboard.widget.layout.changed', {
      dashboardId: this.dashboard.id,
      widgetId: id,
      layout: widget.layout,
      timestamp: Date.now(),
    });
    
    return true;
  }

  /**
   * Update widget configuration
   */
  updateWidgetConfig(id: string, config: Partial<WidgetConfig>): boolean {
    const widget = this.dashboard.widgets.find(w => w.id === id);
    if (!widget) return false;
    
    widget.config = { ...widget.config, ...config };
    this.markDirty();
    
    EventBus.emit('dashboard.widget.config.changed', {
      dashboardId: this.dashboard.id,
      widgetId: id,
      config: widget.config,
      timestamp: Date.now(),
    });
    
    return true;
  }

  /**
   * Update all widget layouts (batch update after drag/resize)
   */
  updateLayouts(layouts: Array<{ id: string; layout: WidgetLayout }>): void {
    for (const { id, layout } of layouts) {
      const widget = this.dashboard.widgets.find(w => w.id === id);
      if (widget) {
        widget.layout = layout;
      }
    }
    this.markDirty();
    
    EventBus.emit('dashboard.layouts.changed', {
      dashboardId: this.dashboard.id,
      layouts,
      timestamp: Date.now(),
    });
  }

  /**
   * Move widget to a new position
   */
  moveWidget(id: string, x: number, y: number): boolean {
    return this.updateWidgetLayout(id, { x, y });
  }

  /**
   * Resize widget
   */
  resizeWidget(id: string, w: number, h: number): boolean {
    return this.updateWidgetLayout(id, { w, h });
  }

  /**
   * Find an available position for a new widget
   */
  findAvailablePosition(width: number, height: number): { x: number; y: number } {
    const columns = this.dashboard.columns || 12;
    const occupied = new Set<string>();
    
    // Mark occupied cells
    for (const widget of this.dashboard.widgets) {
      for (let x = widget.layout.x; x < widget.layout.x + widget.layout.w; x++) {
        for (let y = widget.layout.y; y < widget.layout.y + widget.layout.h; y++) {
          occupied.add(`${x},${y}`);
        }
      }
    }
    
    // Find first available position
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= columns - width; x++) {
        let fits = true;
        for (let dx = 0; dx < width && fits; dx++) {
          for (let dy = 0; dy < height && fits; dy++) {
            if (occupied.has(`${x + dx},${y + dy}`)) {
              fits = false;
            }
          }
        }
        if (fits) {
          return { x, y };
        }
      }
    }
    
    // Default to bottom
    const maxY = Math.max(0, ...this.dashboard.widgets.map(w => w.layout.y + w.layout.h));
    return { x: 0, y: maxY };
  }

  /**
   * Save dashboard to persistence
   */
  async save(): Promise<void> {
    if (!this.persistence) {
      console.warn('DashboardManager: No persistence configured');
      return;
    }
    
    this.dashboard.updatedAt = new Date().toISOString();
    this.dashboard.version = (this.dashboard.version || 0) + 1;
    
    await this.persistence.save(this.dashboard);
    this.isDirty = false;
    
    EventBus.emit('dashboard.saved', {
      dashboardId: this.dashboard.id,
      version: this.dashboard.version,
      timestamp: Date.now(),
    });
  }

  /**
   * Load dashboard from persistence
   */
  async load(id: string): Promise<boolean> {
    if (!this.persistence) {
      console.warn('DashboardManager: No persistence configured');
      return false;
    }
    
    const loaded = await this.persistence.load(id);
    if (!loaded) return false;
    
    this.dashboard = mergeDashboardConfig(loaded);
    this.isDirty = false;
    
    EventBus.emit('dashboard.loaded', {
      dashboardId: this.dashboard.id,
      timestamp: Date.now(),
    });
    
    return true;
  }

  /**
   * Mark dashboard as dirty and trigger auto-save
   */
  private markDirty(): void {
    this.isDirty = true;
    this.dashboard.updatedAt = new Date().toISOString();
    
    // Debounced auto-save
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    if (this.persistence) {
      this.autoSaveTimeout = setTimeout(() => {
        this.save().catch(console.error);
      }, this.autoSaveDelay);
    }
  }

  /**
   * Check if dashboard has unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return this.isDirty;
  }

  /**
   * Set auto-save delay
   */
  setAutoSaveDelay(delay: number): void {
    this.autoSaveDelay = delay;
  }

  /**
   * Disable auto-save
   */
  disableAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
  }
}
