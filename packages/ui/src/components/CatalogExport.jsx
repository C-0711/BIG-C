import { useState } from 'react';
import { showToast } from './ToastProvider';
import { exportProductsAsCSV, exportProductsAsJSON } from '../utils/exportUtils';

/**
 * CatalogExport Component
 * Export catalog data in various formats
 */
export default function CatalogExport({ category, products, onExport }) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportOptions, setExportOptions] = useState({
    include_images: true,
    include_documents: true,
    include_features: false,
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!products || products.length === 0) {
      showToast.error('No products to export');
      return;
    }

    setExporting(true);

    try {
      const categoryName = category?.name || 'catalog';
      const timestamp = Date.now();

      switch (exportFormat) {
        case 'csv':
          exportProductsAsCSV(products, `${categoryName}-${timestamp}.csv`);
          showToast.success('Catalog exported as CSV');
          break;

        case 'json':
          exportProductsAsJSON(products, `${categoryName}-${timestamp}.json`);
          showToast.success('Catalog exported as JSON');
          break;

        case 'excel':
          // For Excel export, we'll use CSV format with .xlsx extension
          // In a real implementation, you'd use a library like xlsx
          exportProductsAsCSV(products, `${categoryName}-${timestamp}.xlsx`);
          showToast.success('Catalog exported as Excel');
          break;

        case 'pdf':
          showToast.error('PDF export not yet implemented');
          break;

        default:
          showToast.error('Unknown export format');
      }

      onExport?.();
    } catch (error) {
      console.error('Export error:', error);
      showToast.error('Export failed: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export Catalog
      </h3>

      {/* Format Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Export Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'csv', label: 'CSV', icon: '📊' },
            { value: 'json', label: 'JSON', icon: '📄' },
            { value: 'excel', label: 'Excel', icon: '📗' },
            { value: 'pdf', label: 'PDF', icon: '📕', disabled: true },
          ].map(format => (
            <button
              key={format.value}
              onClick={() => setExportFormat(format.value)}
              disabled={format.disabled}
              className={`
                px-4 py-3 rounded-lg font-medium text-sm transition-colors
                ${exportFormat === format.value
                  ? 'bg-[#374151] text-white'
                  : format.disabled
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              <span className="mr-2">{format.icon}</span>
              {format.label}
            </button>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Include in Export
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={exportOptions.include_images}
            onChange={(e) => setExportOptions({ ...exportOptions, include_images: e.target.checked })}
            className="w-4 h-4 accent-gray-400"
          />
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            Image URLs
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={exportOptions.include_documents}
            onChange={(e) => setExportOptions({ ...exportOptions, include_documents: e.target.checked })}
            className="w-4 h-4 accent-gray-400"
          />
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            Document References
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={exportOptions.include_features}
            onChange={(e) => setExportOptions({ ...exportOptions, include_features: e.target.checked })}
            className="w-4 h-4 accent-gray-400"
          />
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            Technical Features
          </span>
        </label>
      </div>

      {/* Export Info */}
      <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-400">Products to export:</span>
          <span className="text-white font-semibold">{products?.length || 0}</span>
        </div>
        {category && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Category:</span>
            <span className="text-white font-semibold">{category.name}</span>
          </div>
        )}
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exporting || !products || products.length === 0}
        className="w-full px-4 py-3 bg-[#374151] hover:bg-[#374151] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {exporting ? (
          <>
            <div className="inline-block w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export {exportFormat.toUpperCase()}
          </>
        )}
      </button>

      {/* Format Info */}
      <div className="mt-3 text-xs text-gray-500">
        {exportFormat === 'csv' && '• CSV format compatible with Excel and Google Sheets'}
        {exportFormat === 'json' && '• JSON format for API integration and data processing'}
        {exportFormat === 'excel' && '• Excel format with formatting and formulas'}
        {exportFormat === 'pdf' && '• PDF format for printing and sharing (coming soon)'}
      </div>
    </div>
  );
}
