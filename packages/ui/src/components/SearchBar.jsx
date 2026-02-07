import { useState } from 'react';
import { InlineSpinner } from './LoadingSpinner';

/**
 * SearchBar Component
 * Advanced search with semantic search toggle and autocomplete
 */
export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search products...",
  loading = false,
  useSemanticSearch = false,
  onToggleSemanticSearch,
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch?.();
    }
  };

  return (
    <div className="w-full">
      <div className={`
        relative flex items-center gap-3 bg-gray-800 rounded-lg p-4 border-2 transition-colors
        ${isFocused ? 'border-[#4B5563]' : 'border-gray-700'}
      `}>
        {/* Search Icon */}
        <svg
          className="w-5 h-5 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Search Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
        />

        {/* Loading Spinner */}
        {loading && <InlineSpinner size="medium" />}

        {/* Clear Button */}
        {value && !loading && (
          <button
            onClick={() => onChange?.('')}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Clear search"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={loading || !value}
          className="px-6 py-2 bg-[#374151] hover:bg-[#374151] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
        >
          Search
        </button>
      </div>

      {/* Semantic Search Toggle */}
      {onToggleSemanticSearch && (
        <div className="mt-3 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={useSemanticSearch}
              onChange={(e) => onToggleSemanticSearch(e.target.checked)}
              className="w-4 h-4 accent-gray-400"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              Use Semantic Search (AI-powered similarity)
            </span>
          </label>

          {useSemanticSearch && (
            <div className="ml-2 px-2 py-1 bg-[#4B5563]/20 border border-[#4B5563]/30 rounded text-xs text-gray-400">
              AI Mode
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-2 text-xs text-gray-500">
        {useSemanticSearch ? (
          <span>💡 Try: "efficient heating system for cold climates"</span>
        ) : (
          <span>💡 Search by: supplier PID, name, description, or keywords</span>
        )}
      </div>
    </div>
  );
}
