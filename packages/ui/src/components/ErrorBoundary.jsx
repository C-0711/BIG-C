import React from 'react';

/**
 * ErrorBoundary Component
 * Catches React errors and displays fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;

      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                <p className="text-gray-400 text-sm">The application encountered an error</p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-gray-900/50 rounded p-4 mb-4 border border-gray-700">
                <p className="text-red-400 font-mono text-sm">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="bg-gray-900/50 rounded p-4 mb-4 border border-gray-700">
                <summary className="text-gray-300 text-sm cursor-pointer mb-2">
                  Stack Trace (Development Only)
                </summary>
                <pre className="text-xs text-gray-500 overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#374151] hover:bg-[#374151] text-white rounded-lg font-medium transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Display Component
 * For displaying API/data errors (not React errors)
 */
export function ErrorDisplay({
  error,
  title = 'Error',
  onRetry,
  onDismiss
}) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-red-400 font-semibold mb-1">{title}</h3>
          <p className="text-gray-300 text-sm">
            {error?.message || error?.toString() || 'An unknown error occurred'}
          </p>
          {onRetry || onDismiss ? (
            <div className="flex gap-2 mt-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition-colors"
                >
                  Retry
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded font-medium transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
