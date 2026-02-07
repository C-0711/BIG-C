/**
 * ProductCard Component
 * Displays product information in a card format
 */
export default function ProductCard({ product, onClick, variant = 'grid' }) {
  const {
    supplier_pid,
    manufacturer_name,
    description_short,
    product_type,
    product_status,
    keyword,
  } = product;

  if (variant === 'list') {
    return (
      <div
        onClick={() => onClick?.(product)}
        className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-[#4B5563] transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          {/* Placeholder Image */}
          <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center flex-shrink-0 group-hover:bg-gray-600 transition-colors">
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base truncate group-hover:text-white transition-colors">
                  {description_short || supplier_pid}
                </h3>
                <p className="text-gray-400 text-sm mt-0.5">
                  {supplier_pid}
                </p>
              </div>
              {product_status && (
                <span className={`
                  px-2 py-1 rounded text-xs font-medium flex-shrink-0
                  ${product_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-300'}
                `}>
                  {product_status}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
              {manufacturer_name && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {manufacturer_name}
                </span>
              )}
              {product_type && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {product_type}
                </span>
              )}
            </div>
          </div>

          {/* Arrow Icon */}
          <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div
      onClick={() => onClick?.(product)}
      className="bg-gray-800 rounded-lg border border-gray-700 hover:border-[#4B5563] transition-all cursor-pointer group overflow-hidden"
    >
      {/* Product Image Placeholder */}
      <div className="aspect-square bg-gray-700 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
        <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          {product_status && (
            <span className={`
              px-2 py-1 rounded text-xs font-medium
              ${product_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-300'}
            `}>
              {product_status}
            </span>
          )}
        </div>

        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2 group-hover:text-white transition-colors min-h-[2.5rem]">
          {description_short || supplier_pid}
        </h3>

        <p className="text-gray-400 text-xs mb-3 font-mono">
          {supplier_pid}
        </p>

        {manufacturer_name && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{manufacturer_name}</span>
          </div>
        )}

        {product_type && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="truncate">{product_type}</span>
          </div>
        )}

        {/* View Details Button */}
        <button className="mt-4 w-full py-2 bg-gray-700 group-hover:bg-[#374151] text-gray-300 group-hover:text-white rounded font-medium text-sm transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
