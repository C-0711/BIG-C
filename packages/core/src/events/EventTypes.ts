/**
 * Event type definitions for the BIG-C Event Bus
 * Sprint 1.2 - Event Bus
 */

/** Base event payload interface */
export interface EventPayload {
  timestamp: number;
  source?: string;
}

/** Product-related events */
export interface ProductSelectedPayload extends EventPayload {
  productId: string;
  productName?: string;
}

export interface ProductSearchPayload extends EventPayload {
  query: string;
  filters?: Record<string, unknown>;
  resultCount?: number;
}

export interface ProductDetailPayload extends EventPayload {
  productId: string;
  data?: Record<string, unknown>;
}

/** Widget lifecycle events */
export interface WidgetMountedPayload extends EventPayload {
  widgetId: string;
  widgetType: string;
}

export interface WidgetErrorPayload extends EventPayload {
  widgetId: string;
  error: Error | string;
}

/** Event type constants */
export const EventTypes = {
  // Product events
  PRODUCT_SELECTED: 'product.selected',
  PRODUCT_SEARCH: 'product.search',
  PRODUCT_DETAIL_LOADED: 'product.detail.loaded',
  PRODUCT_SIMILAR_LOADED: 'product.similar.loaded',
  
  // Widget events
  WIDGET_MOUNTED: 'widget.mounted',
  WIDGET_UNMOUNTED: 'widget.unmounted',
  WIDGET_ERROR: 'widget.error',
  WIDGET_RESIZE: 'widget.resize',
  
  // Dashboard events
  DASHBOARD_LOADED: 'dashboard.loaded',
  DASHBOARD_SAVED: 'dashboard.saved',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];

/** Event factory functions */
export function createProductSelectedEvent(productId: string, productName?: string): ProductSelectedPayload {
  return {
    timestamp: Date.now(),
    productId,
    productName,
  };
}

export function createProductSearchEvent(query: string, filters?: Record<string, unknown>): ProductSearchPayload {
  return {
    timestamp: Date.now(),
    query,
    filters,
  };
}

export function createWidgetMountedEvent(widgetId: string, widgetType: string): WidgetMountedPayload {
  return {
    timestamp: Date.now(),
    widgetId,
    widgetType,
  };
}

/** Event validation */
export function isValidEventPayload(payload: unknown): payload is EventPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'timestamp' in payload &&
    typeof (payload as EventPayload).timestamp === 'number'
  );
}
