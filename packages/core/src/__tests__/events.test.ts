/**
 * Event Bus unit tests
 * Sprint 1.2 - Event Bus
 */

import { EventBus } from '../events/EventBus';
import { EventQueue } from '../events/EventQueue';
import { EventTypes, createProductSelectedEvent, isValidEventPayload } from '../events/EventTypes';

describe('EventBus', () => {
  beforeEach(() => {
    EventBus.clear();
  });

  describe('subscribe', () => {
    it('should subscribe to exact event', () => {
      const listener = jest.fn();
      EventBus.subscribe('test.event', listener);
      EventBus.emit('test.event', { data: 'test' });
      
      expect(listener).toHaveBeenCalledWith('test.event', { data: 'test' });
    });

    it('should support wildcard subscriptions', () => {
      const listener = jest.fn();
      EventBus.subscribe('product.*', listener);
      
      EventBus.emit('product.selected', { id: '1' });
      EventBus.emit('product.search', { query: 'test' });
      EventBus.emit('other.event', { data: 'ignored' });
      
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should support global wildcard', () => {
      const listener = jest.fn();
      EventBus.subscribe('*', listener);
      
      EventBus.emit('any.event', {});
      EventBus.emit('another.event', {});
      
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should return unsubscribe function', () => {
      const listener = jest.fn();
      const unsubscribe = EventBus.subscribe('test', listener);
      
      EventBus.emit('test', {});
      expect(listener).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      EventBus.emit('test', {});
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe specific listener', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      EventBus.subscribe('test', listener1);
      EventBus.subscribe('test', listener2);
      EventBus.unsubscribe('test', listener1);
      
      EventBus.emit('test', {});
      
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});

describe('EventQueue', () => {
  let queue: EventQueue;

  beforeEach(() => {
    queue = new EventQueue(10, 0);
  });

  describe('enqueue', () => {
    it('should store events', () => {
      queue.enqueue('test.event', { data: 'test' });
      
      const history = queue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].event).toBe('test.event');
    });

    it('should enforce max size (FIFO)', () => {
      for (let i = 0; i < 15; i++) {
        queue.enqueue(`event.${i}`, { i });
      }
      
      const history = queue.getHistory();
      expect(history).toHaveLength(10);
      expect(history[0].event).toBe('event.5');
    });
  });

  describe('deduplication', () => {
    it('should deduplicate within window', () => {
      const dedupeQueue = new EventQueue(10, 1000);
      
      dedupeQueue.enqueue('test', { id: 1 });
      dedupeQueue.enqueue('test', { id: 1 }); // duplicate
      dedupeQueue.enqueue('test', { id: 2 }); // different payload
      
      expect(dedupeQueue.size).toBe(2);
    });
  });

  describe('getByPattern', () => {
    it('should filter by pattern', () => {
      queue.enqueue('product.selected', {});
      queue.enqueue('product.search', {});
      queue.enqueue('widget.mounted', {});
      
      const productEvents = queue.getByPattern('product.*');
      expect(productEvents).toHaveLength(2);
    });
  });
});

describe('EventTypes', () => {
  describe('factory functions', () => {
    it('should create product selected event', () => {
      const event = createProductSelectedEvent('123', 'Test Product');
      
      expect(event.productId).toBe('123');
      expect(event.productName).toBe('Test Product');
      expect(event.timestamp).toBeDefined();
    });
  });

  describe('validation', () => {
    it('should validate event payload', () => {
      expect(isValidEventPayload({ timestamp: Date.now() })).toBe(true);
      expect(isValidEventPayload({})).toBe(false);
      expect(isValidEventPayload(null)).toBe(false);
    });
  });
});
