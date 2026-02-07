/**
 * CategoryStats Component
 * Displays statistics for a selected category
 */
export default function CategoryStats({ category, stats, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-8 h-8 border-2 border-[#4B5563] border-r-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-400">Select a category to view statistics</p>
        </div>
      </div>
    );
  }

  const defaultStats = {
    total_products: category.count || 0,
    avg_price: 0,
    image_coverage: 0,
    document_coverage: 0,
    ...stats
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold text-lg">{category.name}</h3>
        {category.type && (
          <p className="text-gray-400 text-sm mt-1 capitalize">{category.type.replace('_', ' ')}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Total Products */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-gray-400 text-sm">Products</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {defaultStats.total_products.toLocaleString()}
            </div>
          </div>

          {/* Average Price */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-400 text-sm">Avg Price</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {defaultStats.avg_price > 0 ? `€${defaultStats.avg_price.toFixed(2)}` : 'N/A'}
            </div>
          </div>

          {/* Image Coverage */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-400 text-sm">Images</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-white">
                {defaultStats.image_coverage}%
              </div>
              <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{ width: `${defaultStats.image_coverage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Document Coverage */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-gray-400 text-sm">Documents</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-white">
                {defaultStats.document_coverage}%
              </div>
              <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-500 h-full transition-all duration-300"
                  style={{ width: `${defaultStats.document_coverage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {stats && stats.top_products && stats.top_products.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="text-gray-400 text-sm font-semibold mb-3">Top Products</h4>
            <div className="space-y-2">
              {stats.top_products.slice(0, 5).map((product, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm bg-gray-900/30 rounded p-2"
                >
                  <span className="text-gray-300 truncate flex-1">
                    {product.description_short || product.supplier_pid}
                  </span>
                  <span className="text-gray-500 text-xs ml-2">
                    {product.supplier_pid}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
