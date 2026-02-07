/**
 * CoverageMetrics Component
 * Displays data coverage percentages for the catalog
 */
export default function CoverageMetrics({ metrics, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#4B5563] border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const defaultMetrics = {
    total_products: 0,
    with_images: 0,
    with_documents: 0,
    with_embeddings: 0,
    with_relationships: 0,
    with_etim: 0,
    with_eclass: 0,
    ...metrics
  };

  const calculatePercentage = (count, total) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  const coverageItems = [
    {
      label: 'Images',
      icon: '🖼️',
      count: defaultMetrics.with_images,
      percentage: calculatePercentage(defaultMetrics.with_images, defaultMetrics.total_products),
      color: '#8B5CF6',
    },
    {
      label: 'Documents',
      icon: '📄',
      count: defaultMetrics.with_documents,
      percentage: calculatePercentage(defaultMetrics.with_documents, defaultMetrics.total_products),
      color: '#F59E0B',
    },
    {
      label: 'AI Embeddings',
      icon: '🤖',
      count: defaultMetrics.with_embeddings,
      percentage: calculatePercentage(defaultMetrics.with_embeddings, defaultMetrics.total_products),
      color: '#4B5563',
    },
    {
      label: 'Graph Relations',
      icon: '🔗',
      count: defaultMetrics.with_relationships,
      percentage: calculatePercentage(defaultMetrics.with_relationships, defaultMetrics.total_products),
      color: '#10B981',
    },
    {
      label: 'ETIM Class',
      icon: '🏷️',
      count: defaultMetrics.with_etim,
      percentage: calculatePercentage(defaultMetrics.with_etim, defaultMetrics.total_products),
      color: '#EC4899',
    },
    {
      label: 'ECLASS Class',
      icon: '📋',
      count: defaultMetrics.with_eclass,
      percentage: calculatePercentage(defaultMetrics.with_eclass, defaultMetrics.total_products),
      color: '#06B6D4',
    },
  ];

  const averageCoverage = Math.round(
    coverageItems.reduce((sum, item) => sum + item.percentage, 0) / coverageItems.length
  );

  return (
    <div className="space-y-6">
      {/* Overall Coverage */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Overall Data Coverage</h3>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{averageCoverage}%</div>
            <div className="text-gray-400 text-xs">Average</div>
          </div>
        </div>

        {/* Coverage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coverageItems.map((item, index) => (
            <div key={index} className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-300 text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-white font-bold text-lg">{item.percentage}%</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>

              {/* Count */}
              <div className="text-xs text-gray-500">
                {item.count.toLocaleString()} of {defaultMetrics.total_products.toLocaleString()} products
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage by Category */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-4">Coverage Heatmap</h3>

        <div className="space-y-3">
          {coverageItems.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 text-sm">{item.label}</span>
                <span className="text-white font-semibold text-sm">{item.percentage}%</span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 rounded"
                    style={{
                      backgroundColor: i < Math.floor(item.percentage / 10) ? item.color : '#374151',
                      opacity: i < Math.floor(item.percentage / 10) ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
          Each square represents 10% coverage
        </div>
      </div>
    </div>
  );
}
