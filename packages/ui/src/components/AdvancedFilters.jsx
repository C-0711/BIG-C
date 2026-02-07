import { useState } from 'react';

export default function AdvancedFilters({ onApply, onReset }) {
  const [filters, setFilters] = useState({
    productTypes: [],
    priceRange: [0, 10000],
    relationshipTypes: [],
    minConnections: 1,
    hasEmbedding: true,
    lifecycleStage: [],
  });

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({
      productTypes: [],
      priceRange: [0, 10000],
      relationshipTypes: [],
      minConnections: 1,
      hasEmbedding: true,
      lifecycleStage: [],
    });
    onReset();
  };

  return (
    <div className="palantir-entity-card">
      <div className="palantir-section-title mb-4">ADVANCED FILTERS</div>

      {/* Product Types */}
      <div className="mb-4">
        <div className="text-palantir-text-secondary text-xs mb-2 font-semibold">Product Types</div>
        <div className="space-y-1">
          {['heat_pump', 'boiler', 'water_heater', 'accessory'].map(type => (
            <label key={type} className="palantir-filter-item cursor-pointer">
              <input
                type="checkbox"
                checked={filters.productTypes.includes(type)}
                onChange={(e) => {
                  setFilters(prev => ({
                    ...prev,
                    productTypes: e.target.checked
                      ? [...prev.productTypes, type]
                      : prev.productTypes.filter(t => t !== type)
                  }));
                }}
                className="mr-2 accent-gray-400"
              />
              <span>{type.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <div className="text-palantir-text-secondary text-xs mb-2 font-semibold">
          Price Range: €{filters.priceRange[0]} - €{filters.priceRange[1]}
        </div>
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          value={filters.priceRange[1]}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            priceRange: [0, parseInt(e.target.value)]
          }))}
          className="w-full accent-gray-400"
        />
      </div>

      {/* Relationship Types */}
      <div className="mb-4">
        <div className="text-palantir-text-secondary text-xs mb-2 font-semibold">Relationship Types</div>
        <div className="space-y-1">
          {['compatible', 'similar', 'replaced_by', 'accessory'].map(type => (
            <label key={type} className="palantir-filter-item cursor-pointer">
              <input
                type="checkbox"
                checked={filters.relationshipTypes.includes(type)}
                onChange={(e) => {
                  setFilters(prev => ({
                    ...prev,
                    relationshipTypes: e.target.checked
                      ? [...prev.relationshipTypes, type]
                      : prev.relationshipTypes.filter(t => t !== type)
                  }));
                }}
                className="mr-2 accent-gray-400"
              />
              <span>{type.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Lifecycle Stage */}
      <div className="mb-4">
        <div className="text-palantir-text-secondary text-xs mb-2 font-semibold">Lifecycle Stage</div>
        <div className="grid grid-cols-2 gap-2">
          {['introduction', 'growth', 'maturity', 'decline'].map(stage => (
            <button
              key={stage}
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  lifecycleStage: prev.lifecycleStage.includes(stage)
                    ? prev.lifecycleStage.filter(s => s !== stage)
                    : [...prev.lifecycleStage, stage]
                }));
              }}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                filters.lifecycleStage.includes(stage)
                  ? 'palantir-btn-primary'
                  : 'palantir-btn-secondary'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <button onClick={handleApply} className="palantir-btn palantir-btn-primary flex-1">
          Apply Filters
        </button>
        <button onClick={handleReset} className="palantir-btn palantir-btn-secondary">
          Reset
        </button>
      </div>
    </div>
  );
}
