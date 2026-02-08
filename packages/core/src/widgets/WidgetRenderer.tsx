/**
 * WidgetRenderer - React component for rendering widgets
 * Sprint 1.1 - Widget Framework
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { WidgetConfig } from './WidgetConfig';
import { WidgetBase, WidgetState } from './WidgetBase';
import { WidgetRegistry } from './WidgetRegistry';
import { EventBus } from '../events/EventBus';

interface WidgetRendererProps {
  config: WidgetConfig;
  onError?: (error: Error) => void;
  onResize?: (width: number, height: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface WidgetRendererState {
  widget: WidgetBase | null;
  state: WidgetState;
  error: Error | null;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  config,
  onError,
  onResize,
  className,
  style,
}) => {
  const [state, setState] = useState<WidgetRendererState>({
    widget: null,
    state: 'idle',
    error: null,
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Initialize widget
  useEffect(() => {
    let mounted = true;
    let widget: WidgetBase | null = null;

    const initWidget = async () => {
      try {
        setState(prev => ({ ...prev, state: 'loading' }));
        
        widget = await WidgetRegistry.create(config);
        
        if (!mounted) {
          await widget.onDestroy();
          return;
        }
        
        await widget.onMount();
        
        if (!mounted) {
          await widget.onDestroy();
          return;
        }
        
        setState({
          widget,
          state: widget.getState(),
          error: widget.getError(),
        });
      } catch (error) {
        if (!mounted) return;
        
        const err = error instanceof Error ? error : new Error(String(error));
        setState({
          widget: null,
          state: 'error',
          error: err,
        });
        onError?.(err);
      }
    };

    initWidget();

    return () => {
      mounted = false;
      if (widget) {
        widget.onDestroy().catch(console.error);
      }
    };
  }, [config.type, config.id]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current || !onResize) return;

    resizeObserverRef.current = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        onResize(width, height);
        
        EventBus.emit('widget.resize', {
          widgetId: config.id,
          widgetType: config.type,
          width,
          height,
          timestamp: Date.now(),
        });
      }
    });

    resizeObserverRef.current.observe(containerRef.current);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [config.id, config.type, onResize]);

  // Render loading state
  if (state.state === 'loading') {
    return (
      <div 
        ref={containerRef}
        className={`widget-renderer widget-loading ${className || ''}`}
        style={style}
      >
        <div className="widget-loading-indicator">Loading...</div>
      </div>
    );
  }

  // Render error state
  if (state.state === 'error' || state.error) {
    return (
      <div 
        ref={containerRef}
        className={`widget-renderer widget-error ${className || ''}`}
        style={style}
      >
        <div className="widget-error-message">
          <strong>Widget Error</strong>
          <p>{state.error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  // Render widget content
  return (
    <div 
      ref={containerRef}
      className={`widget-renderer widget-ready ${className || ''}`}
      style={{
        ...style,
        width: config.layout?.width,
        height: config.layout?.height,
        minWidth: config.layout?.minWidth,
        minHeight: config.layout?.minHeight,
        maxWidth: config.layout?.maxWidth,
        maxHeight: config.layout?.maxHeight,
      }}
      data-widget-id={config.id}
      data-widget-type={config.type}
    >
      {/* Widget content will be rendered by specific widget implementations */}
      {config.title && (
        <div className="widget-header">
          <h3 className="widget-title">{config.title}</h3>
        </div>
      )}
      <div className="widget-content">
        {/* Placeholder for widget-specific content */}
      </div>
    </div>
  );
};

export default WidgetRenderer;
