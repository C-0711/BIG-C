/**
 * ErrorBoundary - React error boundary component
 * Sprint 3.3 - Testing & Polish
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { EventBus } from '../events/EventBus';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI */
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Unique identifier for this boundary */
  boundaryId?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error
    console.error('ErrorBoundary caught error:', error, errorInfo);
    
    // Call custom handler
    this.props.onError?.(error, errorInfo);
    
    // Emit event
    EventBus.emit('error.boundary.caught', {
      boundaryId: this.props.boundaryId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
    });
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error!, this.resetError);
        }
        return this.props.fallback;
      }

      // Default fallback
      return (
        <div className="error-boundary-fallback" style={{
          padding: '20px',
          background: '#fff3f3',
          border: '1px solid #ffcccc',
          borderRadius: '8px',
          margin: '10px',
        }}>
          <h3 style={{ color: '#cc0000', margin: '0 0 10px 0' }}>
            Something went wrong
          </h3>
          <p style={{ color: '#666', margin: '0 0 15px 0' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={this.resetError}
            style={{
              padding: '8px 16px',
              background: '#cc0000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Widget-level error boundary
 */
export const WidgetErrorBoundary: React.FC<{
  widgetId: string;
  widgetType: string;
  children: ReactNode;
}> = ({ widgetId, widgetType, children }) => {
  return (
    <ErrorBoundary
      boundaryId={`widget-${widgetId}`}
      onError={(error) => {
        EventBus.emit('widget.error', {
          widgetId,
          widgetType,
          error: error.message,
          timestamp: Date.now(),
        });
      }}
      fallback={(error, reset) => (
        <div className="widget-error" style={{
          padding: '20px',
          textAlign: 'center',
          background: '#fafafa',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Widget failed to load
          </p>
          <small style={{ color: '#999', display: 'block', marginBottom: '15px' }}>
            {error.message}
          </small>
          <button 
            onClick={reset}
            style={{
              padding: '6px 12px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Reload Widget
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
