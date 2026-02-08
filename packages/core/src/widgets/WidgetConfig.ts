/**
 * Widget configuration interface and JSON schema
 * Sprint 1.1 - Widget Framework
 */

/** Widget configuration interface */
export interface WidgetConfig {
  /** Unique widget type identifier */
  type: string;
  /** Optional unique widget instance id */
  id?: string;
  /** Display title */
  title?: string;
  /** Arbitrary settings for widget behavior */
  settings?: Record<string, unknown>;
  /** Widget dimensions */
  layout?: {
    width?: number | string;
    height?: number | string;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  /** Event subscriptions */
  subscriptions?: string[];
}

/** JSON Schema for validating widget configuration */
export const WidgetConfigSchema = {
  type: 'object',
  required: ['type'],
  properties: {
    type: { type: 'string', minLength: 1 },
    id: { type: 'string' },
    title: { type: 'string' },
    settings: { type: 'object' },
    layout: {
      type: 'object',
      properties: {
        width: { oneOf: [{ type: 'number' }, { type: 'string' }] },
        height: { oneOf: [{ type: 'number' }, { type: 'string' }] },
        minWidth: { type: 'number' },
        minHeight: { type: 'number' },
        maxWidth: { type: 'number' },
        maxHeight: { type: 'number' },
      },
    },
    subscriptions: {
      type: 'array',
      items: { type: 'string' },
    },
  },
} as const;

/** Default widget configuration */
export const defaultWidgetConfig: Partial<WidgetConfig> = {
  layout: {
    width: '100%',
    height: 'auto',
  },
  settings: {},
  subscriptions: [],
};

/** Merge config with defaults */
export function mergeWithDefaults(config: WidgetConfig): WidgetConfig {
  return {
    ...defaultWidgetConfig,
    ...config,
    layout: {
      ...defaultWidgetConfig.layout,
      ...config.layout,
    },
    settings: {
      ...defaultWidgetConfig.settings,
      ...config.settings,
    },
  };
}

/** Validate widget configuration */
export function validateWidgetConfig(config: unknown): config is WidgetConfig {
  if (typeof config !== 'object' || config === null) return false;
  const c = config as Record<string, unknown>;
  if (typeof c.type !== 'string' || c.type.length === 0) return false;
  return true;
}
