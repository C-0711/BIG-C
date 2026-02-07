import { useState } from 'react';
import { showToast } from './ToastProvider';

/**
 * GraphExportMenu Component
 * Enhanced export menu with multiple format options
 */
export default function GraphExportMenu({
  onExportJSON,
  onExportCSV,
  onExportPNG,
  onExportGephi,
  graphData,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeStats: true,
    highResolution: false,
  });

  const handleExport = (format) => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      showToast.error('No graph data to export');
      return;
    }

    switch (format) {
      case 'json':
        onExportJSON?.(exportOptions);
        break;
      case 'csv':
        onExportCSV?.(exportOptions);
        break;
      case 'png':
        onExportPNG?.(exportOptions);
        break;
      case 'gephi':
        onExportGephi?.(exportOptions);
        break;
      default:
        showToast.error('Unknown export format');
    }

    setIsOpen(false);
  };

  const exportFormats = [
    {
      id: 'json',
      name: 'JSON',
      description: 'Graph data in JSON format',
      icon: '📄',
      available: true,
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Nodes and edges as CSV files',
      icon: '📊',
      available: true,
    },
    {
      id: 'png',
      name: 'PNG Image',
      description: 'High-resolution screenshot',
      icon: '🖼️',
      available: true,
    },
    {
      id: 'gephi',
      name: 'Gephi Format',
      description: 'Compatible with Gephi/Cytoscape',
      icon: '🔗',
      available: true,
    },
  ];

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-[#374151] hover:bg-[#374151] rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Export Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold mb-1">Export Graph</h3>
              <p className="text-gray-400 text-xs">
                Choose format and options
              </p>
            </div>

            {/* Export Options */}
            <div className="p-4 border-b border-gray-700 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                  className="w-4 h-4 accent-gray-400"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Include Metadata
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={exportOptions.includeStats}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeStats: e.target.checked })}
                  className="w-4 h-4 accent-gray-400"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Include Statistics
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={exportOptions.highResolution}
                  onChange={(e) => setExportOptions({ ...exportOptions, highResolution: e.target.checked })}
                  className="w-4 h-4 accent-gray-400"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  High Resolution (PNG only)
                </span>
              </label>
            </div>

            {/* Format Buttons */}
            <div className="p-4 space-y-2">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  disabled={!format.available}
                  className={`
                    w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center gap-3
                    ${format.available
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-700/50 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <span className="text-2xl">{format.icon}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{format.name}</div>
                    <div className="text-gray-400 text-xs">{format.description}</div>
                  </div>
                  {format.available && (
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-900/50 text-xs text-gray-500 border-t border-gray-700">
              Press <kbd className="px-1 py-0.5 bg-gray-700 rounded font-mono">E</kbd> for quick export menu
            </div>
          </div>
        </>
      )}
    </div>
  );
}
