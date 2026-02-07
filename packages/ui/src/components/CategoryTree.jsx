import { useState, useEffect } from 'react';

/**
 * CategoryTree Component
 * Hierarchical tree view for product categories
 */
export default function CategoryTree({ onSelectCategory, selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Fetch ETIM groups
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:8766/api/etim/groups?limit=50`);
      const data = await response.json();

      // Build hierarchical structure
      const tree = buildCategoryTree(data.groups || []);
      setCategories(tree);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryTree = (etimGroups) => {
    // Group by manufacturer (we'll use a simplified structure)
    const manufacturers = new Map();

    etimGroups.forEach(group => {
      // Extract manufacturer from system name (simplified)
      const manufacturer = 'Bosch'; // In real scenario, extract from data

      if (!manufacturers.has(manufacturer)) {
        manufacturers.set(manufacturer, {
          id: manufacturer,
          name: manufacturer,
          type: 'manufacturer',
          children: []
        });
      }

      manufacturers.get(manufacturer).children.push({
        id: group.feature_group_id,
        name: group.feature_system_name,
        type: 'etim_group',
        count: group.product_count,
        data: group
      });
    });

    return Array.from(manufacturers.values());
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node, level = 0, idx = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedCategory?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={`${node.id}-${level}-${idx}`}>
        <div
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            onSelectCategory?.(node);
          }}
          className={`
            flex items-center gap-2 px-3 py-2 cursor-pointer rounded transition-colors
            ${isSelected ? 'bg-[#374151] text-white' : 'hover:bg-gray-700 text-gray-300'}
          `}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <svg
              className={`w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}

          {/* Category Icon */}
          {!hasChildren && <div className="w-4" />}

          {node.type === 'manufacturer' && (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )}
          {node.type === 'etim_group' && (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          )}

          {/* Category Name */}
          <span className="flex-1 text-sm font-medium truncate">
            {node.name}
          </span>

          {/* Product Count */}
          {node.count !== undefined && (
            <span className={`
              text-xs px-2 py-0.5 rounded-full flex-shrink-0
              ${isSelected ? 'bg-white/20' : 'bg-gray-700'}
            `}>
              {node.count}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child, i) => renderNode(child, level + 1, i))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block w-6 h-6 border-2 border-[#4B5563] border-r-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm mt-2">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Categories
        </h3>
      </div>

      <div className="max-h-[600px] overflow-y-auto p-2">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories available
          </div>
        ) : (
          categories.map((node, i) => renderNode(node, 0, i))
        )}
      </div>

      <div className="p-3 border-t border-gray-700 text-xs text-gray-500">
        {categories.length} manufacturers • Click to expand/select
      </div>
    </div>
  );
}
