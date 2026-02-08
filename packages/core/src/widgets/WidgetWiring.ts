/**
 * WidgetWiring - Event subscription config and cross-widget communication
 * Sprint 2.3 - Widget Wiring
 */

import { EventBus } from '../events/EventBus';

export interface WidgetWiringConfig {
  /** Widget type */
  type: string;
  /** Events this widget emits */
  emits: string[];
  /** Events this widget subscribes to */
  subscribes: string[];
  /** Description of data flow */
  description?: string;
}

/**
 * Standard widget wiring configuration
 * Defines which events each widget emits and subscribes to
 */
export const WIDGET_WIRING: WidgetWiringConfig[] = [
  // Product Search
  {
    type: 'product-search',
    emits: ['product.search', 'product.search.results', 'product.selected'],
    subscribes: ['product.search.request'],
    description: 'Searches products and emits selected product',
  },
  // Product Detail
  {
    type: 'product-detail',
    emits: ['product.detail.loaded', 'product.compared'],
    subscribes: ['product.selected'],
    description: 'Loads product details when product is selected',
  },
  // Similar Products
  {
    type: 'similar-products',
    emits: ['product.similar.loaded', 'product.selected'],
    subscribes: ['product.detail.loaded'],
    description: 'Loads similar products when detail is loaded',
  },
  // ETIM Explorer
  {
    type: 'etim-explorer',
    emits: ['etim.tree.loaded', 'navigation.category_selected', 'etim.products.loaded'],
    subscribes: ['navigation.breadcrumb_clicked'],
    description: 'Navigates ETIM tree and filters products by category',
  },
  // Media Gallery
  {
    type: 'media-gallery',
    emits: ['media.loaded', 'media.selected', 'media.lightbox.opened', 'media.lightbox.closed'],
    subscribes: ['product.selected', 'product.detail.loaded'],
    description: 'Shows product media when product is selected',
  },
  // Document Center
  {
    type: 'document-center',
    emits: ['documents.loaded', 'document.selected', 'document.download.started'],
    subscribes: ['product.selected', 'product.detail.loaded'],
    description: 'Shows product documents when product is selected',
  },
];

/**
 * Get wiring config for a widget type
 */
export function getWidgetWiring(type: string): WidgetWiringConfig | undefined {
  return WIDGET_WIRING.find(w => w.type === type);
}

/**
 * Get all widgets that emit a specific event
 */
export function getEmitters(event: string): string[] {
  return WIDGET_WIRING
    .filter(w => w.emits.some(e => matchesEventPattern(e, event)))
    .map(w => w.type);
}

/**
 * Get all widgets that subscribe to a specific event
 */
export function getSubscribers(event: string): string[] {
  return WIDGET_WIRING
    .filter(w => w.subscribes.some(e => matchesEventPattern(event, e)))
    .map(w => w.type);
}

/**
 * Build subscription matrix showing widget connections
 */
export function buildSubscriptionMatrix(): Record<string, string[]> {
  const matrix: Record<string, string[]> = {};
  
  for (const widget of WIDGET_WIRING) {
    matrix[widget.type] = [];
    
    for (const subscribedEvent of widget.subscribes) {
      // Find widgets that emit this event
      const emitters = WIDGET_WIRING
        .filter(w => w.emits.some(e => matchesEventPattern(e, subscribedEvent)))
        .map(w => w.type);
      
      for (const emitter of emitters) {
        if (!matrix[widget.type].includes(emitter) && emitter !== widget.type) {
          matrix[widget.type].push(emitter);
        }
      }
    }
  }
  
  return matrix;
}

/**
 * Check if an event matches a pattern (supports wildcards)
 */
function matchesEventPattern(event: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern === event) return true;
  
  if (pattern.includes('*')) {
    const regex = new RegExp(
      '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'
    );
    return regex.test(event);
  }
  
  return false;
}

/**
 * Event buffer for handling timing issues between widgets
 */
export class EventBuffer {
  private buffer: Map<string, { event: string; payload: unknown; timestamp: number }[]> = new Map();
  private maxAge: number;
  private maxSize: number;

  constructor(maxAge = 5000, maxSize = 50) {
    this.maxAge = maxAge;
    this.maxSize = maxSize;
  }

  /**
   * Buffer an event for late subscribers
   */
  add(event: string, payload: unknown): void {
    const key = event.split('.')[0]; // Group by first segment
    
    if (!this.buffer.has(key)) {
      this.buffer.set(key, []);
    }
    
    const events = this.buffer.get(key)!;
    events.push({ event, payload, timestamp: Date.now() });
    
    // Trim old events
    this.cleanup(key);
  }

  /**
   * Get buffered events for a pattern
   */
  get(pattern: string): { event: string; payload: unknown }[] {
    const results: { event: string; payload: unknown }[] = [];
    const now = Date.now();
    
    for (const [, events] of this.buffer) {
      for (const { event, payload, timestamp } of events) {
        if (now - timestamp <= this.maxAge && matchesEventPattern(event, pattern)) {
          results.push({ event, payload });
        }
      }
    }
    
    return results;
  }

  /**
   * Replay buffered events to a subscriber
   */
  replay(pattern: string, callback: (event: string, payload: unknown) => void): void {
    const events = this.get(pattern);
    for (const { event, payload } of events) {
      callback(event, payload);
    }
  }

  private cleanup(key: string): void {
    const events = this.buffer.get(key);
    if (!events) return;
    
    const now = Date.now();
    const filtered = events
      .filter(e => now - e.timestamp <= this.maxAge)
      .slice(-this.maxSize);
    
    this.buffer.set(key, filtered);
  }

  clear(): void {
    this.buffer.clear();
  }
}

/** Global event buffer instance */
export const eventBuffer = new EventBuffer();

// Auto-buffer events
EventBus.subscribe('*', (event, payload) => {
  eventBuffer.add(event, payload);
});
