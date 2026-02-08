/**
 * LoadingStates - Loading indicators and skeleton loaders
 * Sprint 3.3 - Testing & Polish
 */

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

/**
 * Simple loading spinner
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#007bff',
  text,
}) => {
  const sizes = {
    small: 16,
    medium: 32,
    large: 48,
  };
  const px = sizes[size];

  return (
    <div className="loading-spinner" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: px,
        height: px,
        border: `3px solid #f3f3f3`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      {text && (
        <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
          {text}
        </p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

/**
 * Skeleton loading placeholder
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
}) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

/**
 * Widget loading skeleton
 */
export const WidgetSkeleton: React.FC<{ title?: boolean }> = ({ title = true }) => {
  return (
    <div className="widget-skeleton" style={{ padding: '16px' }}>
      {title && (
        <Skeleton width="60%" height="24px" className="mb-3" />
      )}
      <Skeleton width="100%" height="16px" className="mb-2" />
      <Skeleton width="100%" height="16px" className="mb-2" />
      <Skeleton width="80%" height="16px" className="mb-2" />
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <Skeleton width="100px" height="32px" />
        <Skeleton width="100px" height="32px" />
      </div>
      <style>{`
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
      `}</style>
    </div>
  );
};

/**
 * Product card skeleton
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="product-card-skeleton" style={{ 
      padding: '16px',
      border: '1px solid #eee',
      borderRadius: '8px',
    }}>
      <Skeleton width="100%" height="120px" borderRadius="8px" />
      <div style={{ marginTop: '12px' }}>
        <Skeleton width="80%" height="18px" className="mb-2" />
        <Skeleton width="60%" height="14px" className="mb-2" />
        <Skeleton width="40%" height="20px" />
      </div>
      <style>{`
        .mb-2 { margin-bottom: 8px; }
      `}</style>
    </div>
  );
};

/**
 * Table skeleton
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="table-skeleton" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} width={`${100 / columns}%`} height="32px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`r-${rowIndex}`} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`c-${rowIndex}-${colIndex}`} width={`${100 / columns}%`} height="24px" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Progress bar
 */
export const ProgressBar: React.FC<{
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}> = ({
  progress,
  color = '#007bff',
  height = 8,
  showLabel = false,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className="progress-bar-container">
      <div style={{
        width: '100%',
        height: `${height}px`,
        background: '#e0e0e0',
        borderRadius: `${height / 2}px`,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${clampedProgress}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
};

export default {
  LoadingSpinner,
  Skeleton,
  WidgetSkeleton,
  ProductCardSkeleton,
  TableSkeleton,
  ProgressBar,
};
