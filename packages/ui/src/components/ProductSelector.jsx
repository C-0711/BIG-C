import { useState, useEffect } from 'react';
import { InlineSpinner } from './LoadingSpinner';

/**
 * ProductSelector Component
 * Search and select products for comparison
 */
export default function ProductSelector({ onAddProduct, selectedProducts = [], maxProducts = 4 }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        searchProducts();
      }, 300); // Debounce

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:8766/api/products/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.products || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product) => {
    onAddProduct?.(product);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const isProductSelected = (product) => {
    return selectedProducts.some(p => p.id === product.id || p.supplier_pid === product.supplier_pid);
  };

  const canAddMore = selectedProducts.length < maxProducts;

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-4 py-3 border border-gray-600">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={canAddMore ? "Search products to add..." : "Maximum products reached"}
          disabled={!canAddMore}
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none disabled:text-gray-500"
        />
        {loading && <InlineSpinner size="small" />}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          {searchResults.map((product) => {
            const selected = isProductSelected(product);
            return (
              <button
                key={product.id || product.supplier_pid}
                onClick={() => !selected && handleAddProduct(product)}
                disabled={selected || !canAddMore}
                className={`
                  w-full px-4 py-3 text-left border-b border-gray-700 last:border-b-0 transition-colors
                  ${selected
                    ? 'bg-gray-700/50 cursor-not-allowed'
                    : canAddMore
                    ? 'hover:bg-gray-700 cursor-pointer'
                    : 'cursor-not-allowed opacity-50'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">
                      {product.description_short || product.supplier_pid}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {product.supplier_pid}
                    </div>
                    {product.manufacturer_name && (
                      <div className="text-gray-500 text-xs mt-1">
                        {product.manufacturer_name}
                      </div>
                    )}
                  </div>
                  {selected && (
                    <span className="flex-shrink-0 px-2 py-1 bg-[#4B5563]/20 text-gray-400 text-xs rounded">
                      Added
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {showResults && searchResults.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4 z-50">
          <div className="text-center text-gray-400 text-sm">
            No products found for "{searchQuery}"
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500">
        {canAddMore ? (
          <span>
            {selectedProducts.length} of {maxProducts} products selected • Search by name or PID
          </span>
        ) : (
          <span className="text-yellow-500">
            Maximum {maxProducts} products reached • Remove a product to add another
          </span>
        )}
      </div>
    </div>
  );
}
