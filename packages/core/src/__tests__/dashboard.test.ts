/**
 * Dashboard tests
 * Sprint 3.3 - Testing & Polish
 */

import { 
  DashboardConfig, 
  DashboardWidget,
  mergeDashboardConfig,
  createDashboardWidget,
  validateDashboardConfig,
  DEFAULT_DASHBOARD_CONFIG,
} from '../dashboard/DashboardConfig';
import { DashboardManager, DashboardPersistence } from '../dashboard/DashboardManager';
import { EventBus } from '../events/EventBus';

describe('DashboardConfig', () => {
  describe('mergeDashboardConfig', () => {
    it('should merge config with defaults', () => {
      const config = mergeDashboardConfig({ name: 'Test Dashboard' });
      
      expect(config.name).toBe('Test Dashboard');
      expect(config.columns).toBe(DEFAULT_DASHBOARD_CONFIG.columns);
      expect(config.rowHeight).toBe(DEFAULT_DASHBOARD_CONFIG.rowHeight);
      expect(config.widgets).toEqual([]);
    });

    it('should generate ID if not provided', () => {
      const config = mergeDashboardConfig({ name: 'Test' });
      
      expect(config.id).toMatch(/^dashboard-\d+$/);
    });

    it('should preserve provided values', () => {
      const config = mergeDashboardConfig({
        id: 'custom-id',
        name: 'Test',
        columns: 16,
        rowHeight: 150,
      });
      
      expect(config.id).toBe('custom-id');
      expect(config.columns).toBe(16);
      expect(config.rowHeight).toBe(150);
    });
  });

  describe('validateDashboardConfig', () => {
    it('should validate valid config', () => {
      const config = { id: 'test', name: 'Test', widgets: [] };
      expect(validateDashboardConfig(config)).toBe(true);
    });

    it('should reject invalid config', () => {
      expect(validateDashboardConfig({})).toBe(false);
      expect(validateDashboardConfig({ id: '', name: 'Test', widgets: [] })).toBe(false);
      expect(validateDashboardConfig({ id: 'test', name: 'Test' })).toBe(false);
      expect(validateDashboardConfig(null)).toBe(false);
    });
  });

  describe('createDashboardWidget', () => {
    it('should create widget with default layout', () => {
      const widget = createDashboardWidget({ type: 'product-search' });
      
      expect(widget.id).toBeDefined();
      expect(widget.config.type).toBe('product-search');
      expect(widget.layout.x).toBe(0);
      expect(widget.layout.y).toBe(0);
      expect(widget.layout.w).toBe(4);
      expect(widget.layout.h).toBe(3);
    });

    it('should apply custom layout', () => {
      const widget = createDashboardWidget(
        { type: 'product-search' },
        { x: 2, y: 1, w: 6, h: 4 }
      );
      
      expect(widget.layout.x).toBe(2);
      expect(widget.layout.y).toBe(1);
      expect(widget.layout.w).toBe(6);
      expect(widget.layout.h).toBe(4);
    });
  });
});

describe('DashboardManager', () => {
  let manager: DashboardManager;
  let mockPersistence: DashboardPersistence;

  beforeEach(() => {
    EventBus.clear();
    
    manager = new DashboardManager({ 
      id: 'test-dashboard',
      name: 'Test Dashboard',
    });

    mockPersistence = {
      save: jest.fn().mockResolvedValue(undefined),
      load: jest.fn().mockResolvedValue(null),
      list: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
    };
  });

  describe('addWidget', () => {
    it('should add widget to dashboard', () => {
      const widget = manager.addWidget({ type: 'product-search' });
      
      expect(widget).toBeDefined();
      expect(manager.getWidgets().length).toBe(1);
      expect(manager.getWidget(widget.id)).toBeDefined();
    });

    it('should emit event on add', () => {
      const listener = jest.fn();
      EventBus.subscribe('dashboard.widget.added', listener);
      
      manager.addWidget({ type: 'product-search' });
      
      expect(listener).toHaveBeenCalled();
    });

    it('should find available position', () => {
      manager.addWidget({ type: 'widget-1' }, { x: 0, y: 0, w: 4, h: 3 });
      const widget2 = manager.addWidget({ type: 'widget-2' });
      
      // Second widget should be placed after first
      expect(widget2.layout.x).toBeGreaterThanOrEqual(0);
    });
  });

  describe('removeWidget', () => {
    it('should remove widget from dashboard', () => {
      const widget = manager.addWidget({ type: 'product-search' });
      
      const removed = manager.removeWidget(widget.id);
      
      expect(removed).toBe(true);
      expect(manager.getWidgets().length).toBe(0);
    });

    it('should return false for non-existent widget', () => {
      const removed = manager.removeWidget('non-existent');
      expect(removed).toBe(false);
    });

    it('should emit event on remove', () => {
      const listener = jest.fn();
      EventBus.subscribe('dashboard.widget.removed', listener);
      
      const widget = manager.addWidget({ type: 'product-search' });
      manager.removeWidget(widget.id);
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('updateWidgetLayout', () => {
    it('should update widget layout', () => {
      const widget = manager.addWidget({ type: 'product-search' });
      
      manager.updateWidgetLayout(widget.id, { x: 5, y: 2 });
      
      const updated = manager.getWidget(widget.id);
      expect(updated?.layout.x).toBe(5);
      expect(updated?.layout.y).toBe(2);
    });
  });

  describe('persistence', () => {
    beforeEach(() => {
      manager.setPersistence(mockPersistence);
    });

    it('should save dashboard', async () => {
      await manager.save();
      
      expect(mockPersistence.save).toHaveBeenCalled();
    });

    it('should load dashboard', async () => {
      const loadedConfig = {
        id: 'loaded-dashboard',
        name: 'Loaded',
        widgets: [],
      };
      (mockPersistence.load as jest.Mock).mockResolvedValueOnce(loadedConfig);
      
      const success = await manager.load('loaded-dashboard');
      
      expect(success).toBe(true);
      expect(manager.getConfig().id).toBe('loaded-dashboard');
    });

    it('should return false when dashboard not found', async () => {
      const success = await manager.load('non-existent');
      expect(success).toBe(false);
    });
  });
});
