/**
 * MemoryMiddleware - Connect events to working memory
 * Sprint 6.2 - Memory Layer 1
 */

import { EventBus } from '../events/EventBus';
import { WorkingMemory } from './WorkingMemory';
import { EventTypes } from '../events/EventTypes';

export interface MemoryMiddlewareConfig {
  /** Events to track for context */
  trackEvents?: string[];
  /** Events to ignore */
  ignoreEvents?: string[];
  /** Auto-track product selections */
  trackProductSelection?: boolean;
  /** Auto-track searches */
  trackSearches?: boolean;
  /** Auto-track comparisons */
  trackComparisons?: boolean;
}

const DEFAULT_TRACKED_EVENTS = [
  EventTypes.PRODUCT_SELECTED,
  EventTypes.PRODUCT_SEARCH,
  EventTypes.PRODUCT_DETAIL_LOADED,
  EventTypes.PRODUCT_SIMILAR_LOADED,
  'product.compared',
  'comparison.updated',
  'ecosystem.loaded',
  'documents.loaded',
  'media.loaded',
];

export class MemoryMiddleware {
  private memory: WorkingMemory;
  private config: Required<MemoryMiddlewareConfig>;
  private unsubscribers: (() => void)[] = [];
  private active = false;

  constructor(memory: WorkingMemory, config: MemoryMiddlewareConfig = {}) {
    this.memory = memory;
    this.config = {
      trackEvents: config.trackEvents || DEFAULT_TRACKED_EVENTS,
      ignoreEvents: config.ignoreEvents || [],
      trackProductSelection: config.trackProductSelection ?? true,
      trackSearches: config.trackSearches ?? true,
      trackComparisons: config.trackComparisons ?? true,
    };
  }

  /**
   * Start listening to events
   */
  start(): void {
    if (this.active) return;
    this.active = true;

    // Track specified events
    for (const event of this.config.trackEvents) {
      if (this.config.ignoreEvents.includes(event)) continue;
      
      const unsub = EventBus.subscribe(event, (eventName, payload) => {
        this.handleEvent(eventName, payload);
      });
      this.unsubscribers.push(unsub);
    }

    // Track product selections
    if (this.config.trackProductSelection) {
      const unsub = EventBus.subscribe(EventTypes.PRODUCT_SELECTED, (_, payload) => {
        this.handleProductSelected(payload);
      });
      this.unsubscribers.push(unsub);
    }

    // Track searches
    if (this.config.trackSearches) {
      const unsub = EventBus.subscribe(EventTypes.PRODUCT_SEARCH, (_, payload) => {
        this.handleSearch(payload);
      });
      this.unsubscribers.push(unsub);
    }

    // Track comparisons
    if (this.config.trackComparisons) {
      const unsub = EventBus.subscribe('product.compared', (_, payload) => {
        this.handleComparison(payload);
      });
      this.unsubscribers.push(unsub);
    }

    EventBus.emit('memory.middleware.started', {
      trackedEvents: this.config.trackEvents.length,
    });
  }

  /**
   * Stop listening to events
   */
  stop(): void {
    if (!this.active) return;
    this.active = false;

    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];

    EventBus.emit('memory.middleware.stopped', {});
  }

  /**
   * Handle generic event
   */
  private async handleEvent(event: string, payload: unknown): Promise<void> {
    const type = this.eventToContextType(event);
    await this.memory.addContext(type, payload, event);
  }

  /**
   * Handle product selection
   */
  private async handleProductSelected(payload: unknown): Promise<void> {
    const { productId, product, productName } = payload as {
      productId?: string;
      product?: unknown;
      productName?: string;
    };

    if (productId) {
      await this.memory.setSelectedProduct(productId, product || { name: productName });
    }
  }

  /**
   * Handle search events
   */
  private async handleSearch(payload: unknown): Promise<void> {
    const { query, results, resultCount } = payload as {
      query?: string;
      results?: unknown[];
      resultCount?: number;
    };

    if (query) {
      await this.memory.setLastSearch(query, results);
    }
  }

  /**
   * Handle comparison events
   */
  private async handleComparison(payload: unknown): Promise<void> {
    const { productId, productIds } = payload as {
      productId?: string;
      productIds?: string[];
    };

    if (productIds) {
      await this.memory.setComparedProducts(productIds);
    } else if (productId) {
      const existing = await this.memory.getComparedProducts() || [];
      if (!existing.includes(productId)) {
        await this.memory.setComparedProducts([...existing, productId]);
      }
    }
  }

  /**
   * Map event name to context type
   */
  private eventToContextType(event: string): 'product' | 'search' | 'comparison' | 'user_action' | 'custom' {
    if (event.includes('search')) return 'search';
    if (event.includes('product') || event.includes('detail') || event.includes('similar')) return 'product';
    if (event.includes('compar')) return 'comparison';
    if (event.includes('user') || event.includes('click')) return 'user_action';
    return 'custom';
  }

  /**
   * Check if middleware is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Get underlying memory instance
   */
  getMemory(): WorkingMemory {
    return this.memory;
  }
}

/**
 * Create and start memory middleware
 */
export function createMemoryMiddleware(
  memory: WorkingMemory,
  config?: MemoryMiddlewareConfig
): MemoryMiddleware {
  const middleware = new MemoryMiddleware(memory, config);
  middleware.start();
  return middleware;
}
