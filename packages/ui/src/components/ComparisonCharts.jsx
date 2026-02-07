/**
 * ComparisonCharts Component
 * Visual charts for product comparison (radar, bar charts)
 */
export default function ComparisonCharts({ products }) {
  if (!products || products.length === 0) {
    return null;
  }

  // For now, we'll create a simple bar chart comparison
  // In a full implementation, you'd use a charting library like Chart.js or Recharts

  const metrics = [
    { key: 'data_completeness', label: 'Data Completeness', format: (v) => `${v}%` },
    { key: 'availability', label: 'Availability', format: (v) => v ? 'Available' : 'N/A' },
  ];

  const getMetricValue = (product, metric) => {
    // Mock values - in reality, calculate from product data
    switch (metric.key) {
      case 'data_completeness':
        return Math.round((Object.keys(product).filter(k => product[k]).length / Object.keys(product).length) * 100);
      case 'availability':
        return product.product_status === 'active';
      default:
        return 0;
    }
  };

  const colors = ['#4B5563', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Bar Chart Comparison */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Data Completeness Comparison
        </h3>

        <div className="space-y-4">
          {products.map((product, i) => {
            const completeness = getMetricValue(product, metrics[0]);
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">
                    Product {i + 1}: {product.description_short?.substring(0, 30) || product.supplier_pid}
                  </span>
                  <span className="text-white font-semibold">{completeness}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${completeness}%`,
                      backgroundColor: colors[i % colors.length]
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Availability Matrix */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Feature Availability
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-3">Product {i + 1}</div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Description</span>
                  {product.description_long ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Images</span>
                  {product.has_images ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Documents</span>
                  {product.has_documents ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Active</span>
                  {product.product_status === 'active' ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Not Available</span>
          </div>
          <div className="flex items-center gap-2">
            {colors.map((color, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                <span>P{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
