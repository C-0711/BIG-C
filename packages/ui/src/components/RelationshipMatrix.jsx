/**
 * RelationshipMatrix Component
 * Displays product relationships in a matrix/table format
 */
export default function RelationshipMatrix({ relationships, onSelectProduct }) {
  if (!relationships || relationships.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p className="text-gray-400">No relationships found</p>
      </div>
    );
  }

  // Group by relationship type
  const grouped = relationships.reduce((acc, rel) => {
    const type = rel.relationship_type || 'related';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(rel);
    return acc;
  }, {});

  const getRelationshipColor = (type) => {
    const colors = {
      'similar_to': '#4B5563',
      'compatible_with': '#10B981',
      'replaced_by': '#F59E0B',
      'accessory_for': '#8B5CF6',
      'same_family': '#EC4899',
      'related': '#6B7280'
    };
    return colors[type] || colors.related;
  };

  const getRelationshipIcon = (type) => {
    switch (type) {
      case 'similar_to':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'compatible_with':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'replaced_by':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'accessory_for':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, rels]) => (
        <div key={type} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* Section Header */}
          <div
            className="p-4 border-b border-gray-700 flex items-center gap-3"
            style={{ backgroundColor: getRelationshipColor(type) + '15' }}
          >
            <div style={{ color: getRelationshipColor(type) }}>
              {getRelationshipIcon(type)}
            </div>
            <h3 className="text-white font-semibold capitalize">
              {type.replace('_', ' ')}
            </h3>
            <span className="ml-auto px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
              {rels.length} {rels.length === 1 ? 'product' : 'products'}
            </span>
          </div>

          {/* Relationships List */}
          <div className="divide-y divide-gray-700">
            {rels.map((rel, index) => (
              <div
                key={index}
                onClick={() => onSelectProduct?.(rel)}
                className="p-4 hover:bg-gray-700/50 cursor-pointer transition-colors flex items-center gap-4"
              >
                {/* Product Icon */}
                <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm truncate">
                    {rel.description_short || rel.supplier_pid}
                  </h4>
                  <p className="text-gray-400 text-xs mt-1">
                    {rel.supplier_pid}
                  </p>
                  {rel.manufacturer_name && (
                    <p className="text-gray-500 text-xs mt-1">
                      {rel.manufacturer_name}
                    </p>
                  )}
                </div>

                {/* Relationship Weight/Strength */}
                {rel.weight !== undefined && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-gray-400 text-xs">Strength</div>
                    <div className="text-white font-semibold">
                      {Math.round(rel.weight * 100)}%
                    </div>
                  </div>
                )}

                {/* Arrow */}
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
