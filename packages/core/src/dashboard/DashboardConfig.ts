/**
 * DashboardConfig - Dashboard configuration types and schemas
 * Sprint 3.1 - Dashboard Basics
 */

import { WidgetConfig } from '../widgets/WidgetConfig';

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  /** Grid columns (default: 12) */
  columns?: number;
  /** Row height in pixels */
  rowHeight?: number;
  /** Margin between widgets [x, y] */
  margin?: [number, number];
  /** Container padding [x, y] */
  padding?: [number, number];
  /** Allow widgets to be dragged */
  draggable?: boolean;
  /** Allow widgets to be resized */
  resizable?: boolean;
  /** Compact type: vertical, horizontal, or none */
  compactType?: 'vertical' | 'horizontal' | null;
  /** Responsive breakpoints */
  breakpoints?: DashboardBreakpoints;
  /** Widget layouts */
  widgets: DashboardWidget[];
  /** Created timestamp */
  createdAt?: string;
  /** Updated timestamp */
  updatedAt?: string;
  /** Version for conflict resolution */
  version?: number;
}

export interface DashboardBreakpoints {
  lg?: number;
  md?: number;
  sm?: number;
  xs?: number;
}

export interface DashboardWidget {
  /** Unique widget instance ID */
  id: string;
  /** Widget configuration */
  config: WidgetConfig;
  /** Layout position and size */
  layout: WidgetLayout;
  /** Responsive layouts per breakpoint */
  responsiveLayouts?: Record<string, WidgetLayout>;
}

export interface WidgetLayout {
  /** X position in grid units */
  x: number;
  /** Y position in grid units */
  y: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;
  /** Minimum width */
  minW?: number;
  /** Minimum height */
  minH?: number;
  /** Maximum width */
  maxW?: number;
  /** Maximum height */
  maxH?: number;
  /** Is widget static (non-draggable/resizable) */
  static?: boolean;
  /** Is dragging disabled */
  isDraggable?: boolean;
  /** Is resizing disabled */
  isResizable?: boolean;
}

/**
 * Default dashboard configuration
 */
export const DEFAULT_DASHBOARD_CONFIG: Partial<DashboardConfig> = {
  columns: 12,
  rowHeight: 100,
  margin: [16, 16],
  padding: [16, 16],
  draggable: true,
  resizable: true,
  compactType: 'vertical',
  breakpoints: {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
  },
};

/**
 * Default widget layout
 */
export const DEFAULT_WIDGET_LAYOUT: WidgetLayout = {
  x: 0,
  y: 0,
  w: 4,
  h: 3,
  minW: 2,
  minH: 2,
};

/**
 * Merge dashboard config with defaults
 */
export function mergeDashboardConfig(config: Partial<DashboardConfig>): DashboardConfig {
  return {
    ...DEFAULT_DASHBOARD_CONFIG,
    ...config,
    id: config.id || `dashboard-${Date.now()}`,
    name: config.name || 'Untitled Dashboard',
    widgets: config.widgets || [],
    breakpoints: {
      ...DEFAULT_DASHBOARD_CONFIG.breakpoints,
      ...config.breakpoints,
    },
  } as DashboardConfig;
}

/**
 * Validate dashboard configuration
 */
export function validateDashboardConfig(config: unknown): config is DashboardConfig {
  if (typeof config !== 'object' || config === null) return false;
  const c = config as Record<string, unknown>;
  
  if (typeof c.id !== 'string' || c.id.length === 0) return false;
  if (typeof c.name !== 'string') return false;
  if (!Array.isArray(c.widgets)) return false;
  
  return true;
}

/**
 * Create a new dashboard widget entry
 */
export function createDashboardWidget(
  config: WidgetConfig,
  layout?: Partial<WidgetLayout>
): DashboardWidget {
  return {
    id: config.id || `widget-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    config,
    layout: {
      ...DEFAULT_WIDGET_LAYOUT,
      ...layout,
    },
  };
}
