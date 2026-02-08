/**
 * Widget Framework unit tests
 * Sprint 1.1 - Widget Framework
 */

import { WidgetConfig, validateWidgetConfig, mergeWithDefaults, defaultWidgetConfig } from '../widgets/WidgetConfig';
import { WidgetBase, WidgetState } from '../widgets/WidgetBase';
import { WidgetRegistry } from '../widgets/WidgetRegistry';
import { EventBus } from '../events/EventBus';

// Test widget implementation
class TestWidget extends WidgetBase {
  public mountCalled = false;
  public destroyCalled = false;
  public eventsReceived: Array<{ event: string; payload: unknown }> = [];

  async onMount(): Promise<void> {
    await super.onMount();
    this.mountCalled = true;
  }

  async onDestroy(): Promise<void> {
    await super.onDestroy();
    this.destroyCalled = true;
  }

  protected handleEvent(event: string, payload: unknown): void {
    this.eventsReceived.push({ event, payload });
  }
}

describe('WidgetConfig', () => {
  describe('validateWidgetConfig', () => {
    it('should validate valid config', () => {
      expect(validateWidgetConfig({ type: 'test-widget' })).toBe(true);
    });

    it('should reject invalid config', () => {
      expect(validateWidgetConfig({})).toBe(false);
      expect(validateWidgetConfig({ type: '' })).toBe(false);
      expect(validateWidgetConfig(null)).toBe(false);
      expect(validateWidgetConfig('string')).toBe(false);
    });
  });

  describe('mergeWithDefaults', () => {
    it('should merge config with defaults', () => {
      const config: WidgetConfig = { type: 'test', title: 'Test' };
      const merged = mergeWithDefaults(config);

      expect(merged.type).toBe('test');
      expect(merged.title).toBe('Test');
      expect(merged.layout).toEqual(defaultWidgetConfig.layout);
    });

    it('should override defaults', () => {
      const config: WidgetConfig = {
        type: 'test',
        layout: { width: 500 },
      };
      const merged = mergeWithDefaults(config);

      expect(merged.layout?.width).toBe(500);
      expect(merged.layout?.height).toBe('auto');
    });
  });
});

describe('WidgetBase', () => {
  let widget: TestWidget;

  beforeEach(() => {
    EventBus.clear();
    widget = new TestWidget({ type: 'test-widget', id: 'test-1' });
  });

  afterEach(async () => {
    await widget.onDestroy();
  });

  describe('lifecycle', () => {
    it('should call onMount', async () => {
      await widget.onMount();
      expect(widget.mountCalled).toBe(true);
      expect(widget.getState()).toBe('ready');
    });

    it('should call onDestroy', async () => {
      await widget.onMount();
      await widget.onDestroy();
      expect(widget.destroyCalled).toBe(true);
    });

    it('should emit widget.mounted event', async () => {
      const listener = jest.fn();
      EventBus.subscribe('widget.mounted', listener);
      
      await widget.onMount();
      
      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][1]).toMatchObject({
        widgetId: 'test-1',
        widgetType: 'test-widget',
      });
    });
  });

  describe('event handling', () => {
    it('should subscribe to configured events', async () => {
      const widgetWithSubs = new TestWidget({
        type: 'test-widget',
        id: 'test-2',
        subscriptions: ['test.event'],
      });

      await widgetWithSubs.onMount();
      EventBus.emit('test.event', { data: 'test' });

      expect(widgetWithSubs.eventsReceived).toHaveLength(1);
      
      await widgetWithSubs.onDestroy();
    });
  });

  describe('state management', () => {
    it('should start in idle state', () => {
      expect(widget.getState()).toBe('idle');
    });

    it('should transition to ready after mount', async () => {
      await widget.onMount();
      expect(widget.getState()).toBe('ready');
    });
  });
});

describe('WidgetRegistry', () => {
  beforeEach(() => {
    WidgetRegistry.clear();
  });

  describe('register', () => {
    it('should register widget type', () => {
      WidgetRegistry.register('test', TestWidget);
      expect(WidgetRegistry.isRegistered('test')).toBe(true);
    });

    it('should list registered types', () => {
      WidgetRegistry.register('type-a', TestWidget);
      WidgetRegistry.register('type-b', TestWidget);
      
      const types = WidgetRegistry.getRegisteredTypes();
      expect(types).toContain('type-a');
      expect(types).toContain('type-b');
    });
  });

  describe('create', () => {
    it('should create widget instance', async () => {
      WidgetRegistry.register('test', TestWidget);
      
      const widget = await WidgetRegistry.create({ type: 'test', id: 'instance-1' });
      
      expect(widget).toBeInstanceOf(TestWidget);
      expect(widget.id).toBe('instance-1');
    });

    it('should throw for unknown type', async () => {
      await expect(
        WidgetRegistry.create({ type: 'unknown' })
      ).rejects.toThrow('Unknown widget type');
    });

    it('should track instance by ID', async () => {
      WidgetRegistry.register('test', TestWidget);
      await WidgetRegistry.create({ type: 'test', id: 'tracked' });
      
      const instance = WidgetRegistry.getInstance('tracked');
      expect(instance).toBeDefined();
    });
  });

  describe('lazy loading', () => {
    it('should support lazy-loaded widgets', async () => {
      WidgetRegistry.registerLazy('lazy', async () => TestWidget);
      
      const widget = await WidgetRegistry.create({ type: 'lazy' });
      expect(widget).toBeInstanceOf(TestWidget);
    });
  });
});
