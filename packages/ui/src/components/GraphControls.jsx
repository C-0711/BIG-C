import { useState } from 'react';

/**
 * GraphControls Component
 * Advanced controls for graph visualization
 */
export default function GraphControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onExport,
  onFilter,
  filters = {},
  showFilters = true,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 border-b border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-white font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Graph Controls
        </h3>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Controls Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Zoom Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              View Controls
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onZoomIn}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                title="Zoom In (+ key)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
                Zoom +
              </button>
              <button
                onClick={onZoomOut}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                title="Zoom Out (- key)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
                Zoom -
              </button>
              <button
                onClick={onFitView}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                title="Fit View (F key)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Fit
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <>
              {/* Relationship Strength */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Relationship Strength: {localFilters.minStrength || 0}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localFilters.minStrength || 0}
                  onChange={(e) => handleFilterChange('minStrength', parseInt(e.target.value))}
                  className="w-full accent-gray-400"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Node Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search in Graph
                </label>
                <input
                  type="text"
                  value={localFilters.searchText || ''}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                  placeholder="Filter by name or PID..."
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6B7280]"
                />
              </div>

              {/* Show Labels */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={localFilters.showLabels !== false}
                    onChange={(e) => handleFilterChange('showLabels', e.target.checked)}
                    className="w-4 h-4 accent-gray-400"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    Show Node Labels
                  </span>
                </label>
              </div>

              {/* Show Physics */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={localFilters.enablePhysics !== false}
                    onChange={(e) => handleFilterChange('enablePhysics', e.target.checked)}
                    className="w-4 h-4 accent-gray-400"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    Enable Physics Simulation
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Keyboard Shortcuts */}
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-gray-400 text-xs font-semibold mb-2">Keyboard Shortcuts</h4>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Zoom In</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded font-mono">+</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Zoom Out</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded font-mono">-</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Fit View</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded font-mono">F</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Export</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded font-mono">E</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
