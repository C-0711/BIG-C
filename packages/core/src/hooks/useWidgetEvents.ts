/**
 * useWidgetEvents - React hook for widget event subscription
 * Sprint 1.2 - Event Bus
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { EventBus } from '../events/EventBus';
import { eventQueue, EventQueue } from '../events/EventQueue';

interface UseWidgetEventsOptions {
  /** Event patterns to subscribe to */
  patterns?: string[];
  /** Whether to auto-subscribe based on widget type */
  autoSubscribe?: boolean;
  /** Widget type for auto-subscription */
  widgetType?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Track event history */
  trackHistory?: boolean;
}

interface EventRecord {
  event: string;
  payload: unknown;
  timestamp: number;
}

/**
 * Hook for subscribing to and emitting widget events
 */
export function useWidgetEvents(options: UseWidgetEventsOptions = {}) {
  const {
    patterns = [],
    autoSubscribe = false,
    widgetType,
    debug = false,
    trackHistory = false,
  } = options;

  const [lastEvent, setLastEvent] = useState<EventRecord | null>(null);
  const [eventHistory, setEventHistory] = useState<EventRecord[]>([]);
  const listenersRef = useRef<Map<string, (event: string, payload: unknown) => void>>(new Map());
  const unsubscribersRef = useRef<(() => void)[]>([]);

  // Determine patterns to subscribe to
  const effectivePatterns = autoSubscribe && widgetType
    ? [...patterns, `${widgetType}.*`, 'widget.*']
    : patterns;

  // Subscribe to events
  useEffect(() => {
    const handleEvent = (event: string, payload: unknown) => {
      const record: EventRecord = {
        event,
        payload,
        timestamp: Date.now(),
      };

      if (debug) {
        console.log(`[useWidgetEvents] Received: ${event}`, payload);
      }

      setLastEvent(record);

      if (trackHistory) {
        setEventHistory(prev => [...prev.slice(-99), record]);
        eventQueue.enqueue(event, payload);
      }

      // Call registered listeners
      listenersRef.current.forEach((listener, pattern) => {
        if (matchesPattern(event, pattern)) {
          listener(event, payload);
        }
      });
    };

    // Subscribe to all patterns
    for (const pattern of effectivePatterns) {
      const unsub = EventBus.subscribe(pattern, handleEvent);
      unsubscribersRef.current.push(unsub);
    }

    return () => {
      // Unsubscribe from all
      for (const unsub of unsubscribersRef.current) {
        unsub();
      }
      unsubscribersRef.current = [];
    };
  }, [effectivePatterns.join(','), debug, trackHistory]);

  /**
   * Emit an event
   */
  const emit = useCallback((event: string, payload?: unknown) => {
    if (debug) {
      console.log(`[useWidgetEvents] Emitting: ${event}`, payload);
    }
    EventBus.emit(event, payload);
  }, [debug]);

  /**
   * Add a listener for a specific pattern
   */
  const on = useCallback((pattern: string, listener: (event: string, payload: unknown) => void) => {
    listenersRef.current.set(pattern, listener);
    return () => {
      listenersRef.current.delete(pattern);
    };
  }, []);

  /**
   * Remove a listener
   */
  const off = useCallback((pattern: string) => {
    listenersRef.current.delete(pattern);
  }, []);

  /**
   * Clear event history
   */
  const clearHistory = useCallback(() => {
    setEventHistory([]);
  }, []);

  return {
    emit,
    on,
    off,
    lastEvent,
    eventHistory,
    clearHistory,
  };
}

/**
 * Pattern matching helper
 */
function matchesPattern(event: string, pattern: string): boolean {
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

export default useWidgetEvents;
