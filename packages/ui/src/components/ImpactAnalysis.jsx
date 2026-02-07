import { useState } from 'react';

/**
 * ImpactAnalysis Component
 * What-if scenarios and improvement recommendations
 */
export default function ImpactAnalysis({ stats }) {
  const [scenarioType, setScenarioType] = useState('add_products');
  const [scenarioValue, setScenarioValue] = useState(1000);

  const defaultStats = {
    total_products: 0,
    total_embeddings: 0,
    total_relationships: 0,
    avg_embedding_time_ms: 50,
    avg_graph_time_ms: 10,
    storage_per_product_mb: 0.5,
    ...stats
  };

  const calculateImpact = () => {
    switch (scenarioType) {
      case 'add_products':
        return {
          new_embeddings: scenarioValue,
          embedding_time_sec: Math.round((scenarioValue * defaultStats.avg_embedding_time_ms) / 1000),
          graph_time_sec: Math.round((scenarioValue * defaultStats.avg_graph_time_ms) / 1000),
          storage_mb: Math.round(scenarioValue * defaultStats.storage_per_product_mb),
          new_relationships: Math.round(scenarioValue * 15), // ~15 avg relationships per product
        };
      case 'rebuild_embeddings':
        return {
          total_time_min: Math.round((defaultStats.total_products * defaultStats.avg_embedding_time_ms) / 60000),
          cpu_hours: Math.round((defaultStats.total_products * defaultStats.avg_embedding_time_ms) / 3600000 * 96), // 96 cores
          cost_estimate: Math.round(defaultStats.total_products * 0.0001 * 100) / 100, // ~$0.0001 per embedding
        };
      case 'rebuild_graph':
        return {
          total_time_min: Math.round((defaultStats.total_relationships * defaultStats.avg_graph_time_ms) / 60000),
          storage_mb: Math.round(defaultStats.total_relationships * 0.1),
        };
      default:
        return {};
    }
  };

  const impact = calculateImpact();

  const scenarios = [
    { value: 'add_products', label: 'Add Products', icon: '➕' },
    { value: 'rebuild_embeddings', label: 'Rebuild Embeddings', icon: '🤖' },
    { value: 'rebuild_graph', label: 'Rebuild Graph', icon: '🔗' },
  ];

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Impact Analysis - What If?
        </h3>

        {/* Scenario Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Scenario Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.value}
                onClick={() => setScenarioType(scenario.value)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  scenarioType === scenario.value
                    ? 'bg-[#374151] text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{scenario.icon}</span>
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Value (for add_products) */}
        {scenarioType === 'add_products' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Products: {scenarioValue.toLocaleString()}
            </label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={scenarioValue}
              onChange={(e) => setScenarioValue(parseInt(e.target.value))}
              className="w-full accent-gray-400"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100</span>
              <span>10,000</span>
            </div>
          </div>
        )}

        {/* Impact Results */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-semibold text-sm mb-3">Estimated Impact</h4>
          <div className="space-y-3">
            {Object.entries(impact).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-400 text-sm capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-white font-semibold">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                  {key.includes('time_sec') && ' seconds'}
                  {key.includes('time_min') && ' minutes'}
                  {key.includes('storage_mb') && ' MB'}
                  {key.includes('cost') && ' EUR'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Improvement Priorities */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Priority Improvements
        </h3>

        <div className="space-y-3">
          <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-red-500">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">Add Missing Images</h4>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded font-medium">
                HIGH
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-2">
              Products without images have lower conversion rates
            </p>
            <div className="text-gray-400 text-xs">
              Estimated: {Math.round(defaultStats.total_products * 0.13).toLocaleString()} products
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">Enrich Product Descriptions</h4>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded font-medium">
                MEDIUM
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-2">
              Better descriptions improve SEO and customer understanding
            </p>
            <div className="text-gray-400 text-xs">
              Estimated: {Math.round(defaultStats.total_products * 0.18).toLocaleString()} products
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-[#4B5563]">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">Add ETIM Classifications</h4>
              <span className="px-2 py-1 bg-[#4B5563]/20 text-gray-400 text-xs rounded font-medium">
                LOW
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-2">
              ETIM classifications enable better categorization and filtering
            </p>
            <div className="text-gray-400 text-xs">
              Estimated: {Math.round(defaultStats.total_products * 0.05).toLocaleString()} products
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
