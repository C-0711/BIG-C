import { useState, useEffect } from 'react';

/**
 * ProductFilters Component
 * Advanced filtering sidebar for products
 */
export default function ProductFilters({
  filters = {},
  onChange,
  onReset,
  loading = false,
}) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [etimGroups, setEtimGroups] = useState([]);

  useEffect(() => {
    // Fetch ETIM groups for filter options
    fetchEtimGroups();
  }, []);

  const fetchEtimGroups = async () => {
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:8766/api/etim/groups?limit=20`);
      const data = await response.json();
      setEtimGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching ETIM groups:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onChange?.(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset?.();
  };

  const activeFilterCount = Object.keys(localFilters).filter(
    key => localFilters[key] !== undefined && localFilters[key] !== ''
  ).length;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-[#374151] text-white border border-[#4B5563] font-mono text-xs">
              {activeFilterCount}
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-4">
        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Product Type
          </label>
          <select
            value={localFilters.product_type || ''}
            onChange={(e) => handleFilterChange('product_type', e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-[#4B5563] focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="heat_pump">Heat Pump</option>
            <option value="boiler">Boiler</option>
            <option value="water_heater">Water Heater</option>
            <option value="accessory">Accessory</option>
            <option value="controller">Controller</option>
            <option value="sensor">Sensor</option>
          </select>
        </div>

        {/* Product Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={localFilters.product_status || ''}
            onChange={(e) => handleFilterChange('product_status', e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-[#4B5563] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="discontinued">Discontinued</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        {/* Manufacturer */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Manufacturer
          </label>
          <select
            value={localFilters.manufacturer_name || ''}
            onChange={(e) => handleFilterChange('manufacturer_name', e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-[#4B5563] focus:outline-none"
          >
            <option value="">All Manufacturers</option>
            <option value="Bosch">Bosch</option>
            <option value="Buderus">Buderus</option>
            <option value="Junkers">Junkers</option>
          </select>
        </div>

        {/* ETIM Classification */}
        {etimGroups.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ETIM Classification
            </label>
            <select
              value={localFilters.etim_group || ''}
              onChange={(e) => handleFilterChange('etim_group', e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-[#4B5563] focus:outline-none"
            >
              <option value="">All Classifications</option>
              {etimGroups.map((group, index) => (
                <option key={`${group.feature_group_id}-${index}`} value={group.feature_group_id}>
                  {group.feature_system_name} ({group.product_count})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Has Images */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={localFilters.has_images || false}
              onChange={(e) => handleFilterChange('has_images', e.target.checked)}
              className="w-4 h-4 accent-gray-400"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              Has Images
            </span>
          </label>
        </div>

        {/* Has Documents */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={localFilters.has_documents || false}
              onChange={(e) => handleFilterChange('has_documents', e.target.checked)}
              className="w-4 h-4 accent-gray-400"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              Has Documents
            </span>
          </label>
        </div>

        {/* Has Embeddings */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={localFilters.has_embeddings || false}
              onChange={(e) => handleFilterChange('has_embeddings', e.target.checked)}
              className="w-4 h-4 accent-gray-400"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              Has AI Embeddings
            </span>
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([key, value]) => {
              if (!value || value === '') return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#4B5563]/20 border border-[#4B5563]/30 rounded text-xs text-gray-400"
                >
                  {key.replace('_', ' ')}: {typeof value === 'boolean' ? 'Yes' : value}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
