import React from 'react';

/**
 * LoadingSpinner Component
 * Reusable loading indicator with optional message
 */
export default function LoadingSpinner({
  size = 'medium',
  message = 'Loading...',
  fullscreen = false
}) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  const spinnerClass = `
    inline-block rounded-full border-solid border-[#4B5563]
    border-r-transparent animate-spin ${sizeClasses[size]}
  `;

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center gap-4 border border-gray-700 shadow-2xl">
          <div className={spinnerClass} />
          {message && (
            <p className="text-gray-300 text-sm font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className={spinnerClass} />
      {message && (
        <p className="text-gray-400 text-sm">{message}</p>
      )}
    </div>
  );
}

/**
 * Inline spinner (no container)
 */
export function InlineSpinner({ size = 'small' }) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-6 h-6 border-2',
  };

  return (
    <div
      className={`
        inline-block rounded-full border-solid border-[#4B5563]
        border-r-transparent animate-spin ${sizeClasses[size]}
      `}
    />
  );
}
