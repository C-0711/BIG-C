/**
 * DashboardLayout - React component for dashboard grid layout
 * Sprint 3.1 - Dashboard Basics
 * 
 * Note: This component is a thin wrapper. For full functionality,
 * use with react-grid-layout in the UI package.
 */

import React, { useCallback, useMemo } from 'react';
import { DashboardConfig, DashboardWidget, WidgetLayout } from './DashboardConfig';
import { DashboardManager } from './DashboardManager';
import { WidgetRenderer } from '../widgets/WidgetRenderer';
import { EventBus } from '../events/EventBus';

export interface DashboardLayoutProps {
  /** Dashboard manager instance */
  manager: DashboardManager;
  /** Render custom widget content */
  renderWidget?: (widget: DashboardWidget) => React.ReactNode;
  /** Called when layout changes */
  onLayoutChange?: (layouts: Array<{ id: string; layout: WidgetLayout }>) => void;
  /** Called when widget is selected */
  onWidgetSelect?: (widgetId: string) => void;
  /** Currently selected widget */
  selectedWidgetId?: string;
  /** Edit mode enabled */
  editMode?: boolean;
  /** Custom class name */
  className?: string;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

/**
 * Convert DashboardWidget to react-grid-layout format
 */
export function widgetToLayoutItem(widget: DashboardWidget): LayoutItem {
  return {
    i: widget.id,
    x: widget.layout.x,
    y: widget.layout.y,
    w: widget.layout.w,
    h: widget.layout.h,
    minW: widget.layout.minW,
    minH: widget.layout.minH,
    maxW: widget.layout.maxW,
    maxH: widget.layout.maxH,
    static: widget.layout.static,
    isDraggable: widget.layout.isDraggable,
    isResizable: widget.layout.isResizable,
  };
}

/**
 * Convert react-grid-layout item back to WidgetLayout
 */
export function layoutItemToWidgetLayout(item: LayoutItem): WidgetLayout {
  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
    maxW: item.maxW,
    maxH: item.maxH,
    static: item.static,
    isDraggable: item.isDraggable,
    isResizable: item.isResizable,
  };
}

/**
 * DashboardLayout component
 * 
 * This is a basic implementation. For full drag-and-drop support,
 * integrate with react-grid-layout in your UI package.
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  manager,
  renderWidget,
  onLayoutChange,
  onWidgetSelect,
  selectedWidgetId,
  editMode = false,
  className = '',
}) => {
  const config = manager.getConfig();
  const widgets = manager.getWidgets();

  const handleLayoutChange = useCallback((newLayouts: LayoutItem[]) => {
    const layouts = newLayouts.map(item => ({
      id: item.i,
      layout: layoutItemToWidgetLayout(item),
    }));
    
    manager.updateLayouts(layouts);
    onLayoutChange?.(layouts);
  }, [manager, onLayoutChange]);

  const handleWidgetClick = useCallback((widgetId: string) => {
    onWidgetSelect?.(widgetId);
    
    EventBus.emit('dashboard.widget.selected', {
      dashboardId: config.id,
      widgetId,
      timestamp: Date.now(),
    });
  }, [config.id, onWidgetSelect]);

  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${config.columns || 12}, 1fr)`,
    gap: `${config.margin?.[1] || 16}px ${config.margin?.[0] || 16}px`,
    padding: `${config.padding?.[1] || 16}px ${config.padding?.[0] || 16}px`,
  }), [config.columns, config.margin, config.padding]);

  return (
    <div 
      className={`dashboard-layout ${editMode ? 'edit-mode' : ''} ${className}`}
      style={gridStyle}
    >
      {widgets.map(widget => {
        const isSelected = widget.id === selectedWidgetId;
        
        return (
          <div
            key={widget.id}
            className={`dashboard-widget ${isSelected ? 'selected' : ''}`}
            style={{
              gridColumn: `${widget.layout.x + 1} / span ${widget.layout.w}`,
              gridRow: `${widget.layout.y + 1} / span ${widget.layout.h}`,
              minHeight: `${(config.rowHeight || 100) * widget.layout.h}px`,
            }}
            onClick={() => handleWidgetClick(widget.id)}
            data-widget-id={widget.id}
          >
            {renderWidget ? (
              renderWidget(widget)
            ) : (
              <WidgetRenderer config={widget.config} />
            )}
            
            {editMode && (
              <div className="widget-edit-overlay">
                <div className="widget-edit-controls">
                  <button 
                    className="widget-config-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      EventBus.emit('dashboard.widget.config.open', {
                        widgetId: widget.id,
                      });
                    }}
                  >
                    ⚙️
                  </button>
                  <button 
                    className="widget-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      manager.removeWidget(widget.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardLayout;
