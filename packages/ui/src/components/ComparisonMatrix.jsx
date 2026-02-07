/**
 * ComparisonMatrix Component
 * Side-by-side feature comparison table
 */
export default function ComparisonMatrix({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <h3 className="text-xl font-semibold text-white mb-2">No Products to Compare</h3>
        <p className="text-gray-400">Add products using the search box above to start comparing</p>
      </div>
    );
  }

  // Extract all unique features from all products
  const allFeatures = new Map();

  // Basic info features
  allFeatures.set('supplier_pid', { label: 'Supplier PID', category: 'Basic Info' });
  allFeatures.set('manufacturer_name', { label: 'Manufacturer', category: 'Basic Info' });
  allFeatures.set('product_type', { label: 'Product Type', category: 'Basic Info' });
  allFeatures.set('product_status', { label: 'Status', category: 'Basic Info' });
  allFeatures.set('gtin', { label: 'GTIN', category: 'Basic Info' });

  // Group features by category
  const featuresByCategory = {};
  allFeatures.forEach((info, key) => {
    if (!featuresByCategory[info.category]) {
      featuresByCategory[info.category] = [];
    }
    featuresByCategory[info.category].push({ key, ...info });
  });

  const getFeatureValue = (product, featureKey) => {
    const value = product[featureKey];
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  };

  // Check if values differ for highlighting
  const valuesDiffer = (featureKey) => {
    const values = products.map(p => getFeatureValue(p, featureKey));
    return new Set(values).size > 1;
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 z-10">
        <div className="grid" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
          <div className="p-4 font-semibold text-gray-400 text-sm border-r border-gray-700">
            Feature
          </div>
          {products.map((product, i) => (
            <div key={i} className="p-4 border-r border-gray-700 last:border-r-0">
              <div className="text-white font-semibold text-sm truncate">
                Product {i + 1}
              </div>
              <div className="text-gray-400 text-xs mt-1 truncate">
                {product.supplier_pid}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Rows */}
      <div className="max-h-[600px] overflow-y-auto">
        {Object.entries(featuresByCategory).map(([category, features]) => (
          <div key={category}>
            {/* Category Header */}
            <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-700 sticky" style={{ top: '60px' }}>
              <h3 className="text-gray-400 font-semibold text-sm">{category}</h3>
            </div>

            {/* Feature Rows */}
            {features.map((feature) => {
              const differs = valuesDiffer(feature.key);
              return (
                <div
                  key={feature.key}
                  className={`
                    grid border-b border-gray-700 hover:bg-gray-700/30 transition-colors
                    ${differs ? 'bg-yellow-500/5' : ''}
                  `}
                  style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
                >
                  <div className="p-4 border-r border-gray-700 flex items-center gap-2">
                    <span className="text-gray-300 text-sm">{feature.label}</span>
                    {differs && (
                      <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>

                  {products.map((product, i) => {
                    const value = getFeatureValue(product, feature.key);
                    const isEmpty = value === '—';

                    return (
                      <div
                        key={i}
                        className="p-4 border-r border-gray-700 last:border-r-0 flex items-center"
                      >
                        <span className={`text-sm ${isEmpty ? 'text-gray-600 italic' : 'text-white'}`}>
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-900 border-t border-gray-700 p-4">
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-500/30 rounded"></div>
            <span>Values differ</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Different values</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 italic">—</span>
            <span>No data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
