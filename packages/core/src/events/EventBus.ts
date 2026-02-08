/**
 * EventBus - Singleton event emitter with wildcard support
 * Sprint 1.2 - Event Bus
 */

type EventListener = (event: string, payload: unknown) => void;

interface Subscription {
  pattern: string;
  listener: EventListener;
}

class EventBusClass {
  private subscriptions: Subscription[] = [];

  /**
   * Subscribe to events matching a pattern
   * Supports wildcards: 'product.*' matches 'product.selected', 'product.search', etc.
   * Use '*' to match all events
   */
  subscribe(pattern: string, listener: EventListener): () => void {
    const subscription: Subscription = { pattern, listener };
    this.subscriptions.push(subscription);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscriptions.indexOf(subscription);
      if (index > -1) {
        this.subscriptions.splice(index, 1);
      }
    };
  }

  /**
   * Unsubscribe a specific listener from a pattern
   */
  unsubscribe(pattern: string, listener: EventListener): void {
    this.subscriptions = this.subscriptions.filter(
      sub => !(sub.pattern === pattern && sub.listener === listener)
    );
  }

  /**
   * Emit an event to all matching subscribers
   */
  emit(event: string, payload?: unknown): void {
    for (const { pattern, listener } of this.subscriptions) {
      if (this.matchesPattern(event, pattern)) {
        try {
          listener(event, payload);
        } catch (error) {
          console.error(`EventBus: Error in listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Check if an event matches a subscription pattern
   */
  private matchesPattern(event: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern === event) return true;
    
    // Handle wildcard patterns like 'product.*'
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'
      );
      return regex.test(event);
    }
    
    return false;
  }

  /**
   * Get count of active subscriptions (for debugging)
   */
  get subscriptionCount(): number {
    return this.subscriptions.length;
  }

  /**
   * Clear all subscriptions (useful for testing)
   */
  clear(): void {
    this.subscriptions = [];
  }
}

/** Shared singleton instance */
export const EventBus = new EventBusClass();
