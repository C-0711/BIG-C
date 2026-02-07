/**
 * QualityDashboard Component
 * Data quality metrics and analysis
 */
export default function QualityDashboard({ qualityData, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#4B5563] border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const defaultData = {
    high_quality: 0,      // >= 90% complete
    medium_quality: 0,    // 70-89% complete
    low_quality: 0,       // < 70% complete
    avg_completeness: 0,
    total_products: 0,
    ...qualityData
  };

  const getQualityColor = (level) => {
    const colors = {
      high: '#10B981',
      medium: '#F59E0B',
      low: '#EF4444',
    };
    return colors[level] || '#6B7280';
  };

  const qualityBreakdown = [
    {
      level: 'high',
      label: 'High Quality',
      description: '≥90% complete',
      count: defaultData.high_quality,
      percentage: Math.round((defaultData.high_quality / defaultData.total_products) * 100) || 0,
      icon: '✅',
    },
    {
      level: 'medium',
      label: 'Medium Quality',
      description: '70-89% complete',
      count: defaultData.medium_quality,
      percentage: Math.round((defaultData.medium_quality / defaultData.total_products) * 100) || 0,
      icon: '⚠️',
    },
    {
      level: 'low',
      label: 'Low Quality',
      description: '<70% complete',
      count: defaultData.low_quality,
      percentage: Math.round((defaultData.low_quality / defaultData.total_products) * 100) || 0,
      icon: '❌',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quality Score */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#4B5563] to-[#6B7280] mb-4">
            <div className="text-4xl font-bold text-white">
              {defaultData.avg_completeness}%
            </div>
          </div>
          <h3 className="text-white font-semibold text-xl mb-1">
            Average Data Quality
          </h3>
          <p className="text-gray-400 text-sm">
            Across {defaultData.total_products.toLocaleString()} products
          </p>
        </div>

        {/* Quality Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {qualityBreakdown.map((item) => (
            <div
              key={item.level}
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="text-center mb-3">
                <span className="text-3xl">{item.icon}</span>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: getQualityColor(item.level) }}
                >
                  {item.percentage}%
                </div>
                <div className="text-white text-sm font-medium mb-1">
                  {item.label}
                </div>
                <div className="text-gray-500 text-xs mb-2">
                  {item.description}
                </div>
                <div className="text-gray-400 text-xs">
                  {item.count.toLocaleString()} products
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Distribution Chart */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-4">Quality Distribution</h3>

        <div className="space-y-4">
          {qualityBreakdown.map((item) => (
            <div key={item.level}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-gray-300 text-sm">{item.label}</span>
                </div>
                <span className="text-white font-semibold">{item.count.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: getQualityColor(item.level)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Quality Recommendations */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Recommendations
        </h3>

        <div className="space-y-3">
          {defaultData.low_quality > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-red-400 font-semibold text-sm mb-1">
                    {defaultData.low_quality.toLocaleString()} products need improvement
                  </h4>
                  <p className="text-gray-300 text-xs">
                    These products have less than 70% data completeness. Review and enrich with missing information.
                  </p>
                </div>
              </div>
            </div>
          )}

          {defaultData.medium_quality > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-yellow-400 font-semibold text-sm mb-1">
                    {defaultData.medium_quality.toLocaleString()} products can be enhanced
                  </h4>
                  <p className="text-gray-300 text-xs">
                    These products have 70-89% completeness. Add remaining fields for optimal quality.
                  </p>
                </div>
              </div>
            </div>
          )}

          {defaultData.high_quality > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-green-400 font-semibold text-sm mb-1">
                    {defaultData.high_quality.toLocaleString()} products are high quality
                  </h4>
                  <p className="text-gray-300 text-xs">
                    These products have ≥90% completeness. Excellent data quality!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
