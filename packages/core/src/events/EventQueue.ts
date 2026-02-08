/**
 * EventQueue - In-memory queue for recording event history
 * Sprint 1.2 - Event Bus
 */

interface QueuedEvent {
  event: string;
  payload: unknown;
  timestamp: number;
}

export class EventQueue {
  private history: QueuedEvent[] = [];
  private maxSize: number;
  private dedupeWindow: number; // ms to check for duplicates

  constructor(maxSize = 100, dedupeWindow = 0) {
    this.maxSize = maxSize;
    this.dedupeWindow = dedupeWindow;
  }

  /**
   * Enqueue a new event record
   */
  enqueue(event: string, payload?: unknown): void {
    const timestamp = Date.now();
    
    // Optional deduplication
    if (this.dedupeWindow > 0) {
      const isDuplicate = this.history.some(
        e => e.event === event && 
             timestamp - e.timestamp < this.dedupeWindow &&
             JSON.stringify(e.payload) === JSON.stringify(payload)
      );
      if (isDuplicate) return;
    }
    
    this.history.push({ event, payload, timestamp });
    
    // Trim to max size (FIFO)
    while (this.history.length > this.maxSize) {
      this.history.shift();
    }
  }

  /**
   * Get the full recorded history
   */
  getHistory(): QueuedEvent[] {
    return [...this.history];
  }

  /**
   * Get events matching a pattern
   */
  getByPattern(pattern: string): QueuedEvent[] {
    if (pattern === '*') return this.getHistory();
    
    return this.history.filter(e => {
      if (pattern === e.event) return true;
      if (pattern.includes('*')) {
        const regex = new RegExp(
          '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'
        );
        return regex.test(e.event);
      }
      return false;
    });
  }

  /**
   * Get the last N events
   */
  getLast(n: number): QueuedEvent[] {
    return this.history.slice(-n);
  }

  /**
   * Clear the stored history
   */
  clear(): void {
    this.history = [];
  }

  /**
   * Get current queue size
   */
  get size(): number {
    return this.history.length;
  }
}

/** Default queue instance */
export const eventQueue = new EventQueue();
