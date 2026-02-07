import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function UnifiedSearch({ onSearch, onModeChange, initialMode = 'all' }) {
  const [query, setQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [recentSearches, setRecentSearches] = useState([]);

  const modes = [
    { id: 'all', label: 'All', color: '#4B5563' },
    { id: 'documents', label: 'Documents', color: '#10b981' },
    { id: 'entities', label: 'Entities', color: '#f59e0b' },
    { id: 'graph', label: 'Graph', color: '#ef4444' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newSearch = { query: query.trim(), mode: selectedMode, timestamp: Date.now() };
    const updated = [newSearch, ...recentSearches.filter(s => s.query !== query.trim())].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    if (onSearch) {
      onSearch(query.trim(), selectedMode);
    }
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  const handleRecentSearchClick = (search) => {
    setQuery(search.query);
    setSelectedMode(search.mode);
    if (onSearch) {
      onSearch(search.query, search.mode);
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="unified-search">
      {/* Search Input */}
      <form onSubmit={handleSearch} style={{ marginBottom: '0.75rem' }}>
        <div style={{ position: 'relative' }}>
          <MagnifyingGlassIcon
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1.25rem',
              height: '1.25rem',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, entities, connections..."
            className="search-input"
            style={{ paddingLeft: '3rem' }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                color: 'var(--text-muted)'
              }}
            >
              <XMarkIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          )}
        </div>
      </form>

      {/* Mode Toggles */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid',
              borderColor: selectedMode === mode.id ? mode.color : 'var(--border-primary)',
              backgroundColor: selectedMode === mode.id ? `${mode.color}22` : 'var(--bg-tertiary)',
              color: selectedMode === mode.id ? mode.color : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !query && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Recent Searches
            </span>
            <button
              onClick={handleClearRecent}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Clear
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {recentSearches.slice(0, 5).map((search, idx) => (
              <button
                key={idx}
                onClick={() => handleRecentSearchClick(search)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  background: 'none',
                  border: 'none',
                  borderRadius: '0.25rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <MagnifyingGlassIcon style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {search.query}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {search.mode}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
