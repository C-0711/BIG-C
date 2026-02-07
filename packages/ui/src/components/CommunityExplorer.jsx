/**
 * CommunityExplorer - Visualize and explore product communities
 *
 * Features:
 * - Display all 136 communities with color coding
 * - Filter products by community
 * - Show community statistics (size, types, connections)
 * - Inter-community relationship analysis
 */

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const API = `${window.location.protocol}//${window.location.hostname}:8766`;

// Community color palette (consistent with EnhancedProductGraph)
const COMMUNITY_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#4B5563', '#8B5CF6',
  '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16',
  '#06B6D4', '#EAB308', '#22C55E', '#A855F7', '#F43F5E'
];

const getCommunityColor = (communityId) => {
  return COMMUNITY_COLORS[communityId % COMMUNITY_COLORS.length];
};

export default function CommunityExplorer({ onCommunitySelect }) {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communityDetails, setCommunityDetails] = useState(null);
  const [sortBy, setSortBy] = useState('size'); // size, connections, diversity

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API}/api/graph/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'communities' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setCommunities(data.communities || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCommunityDetails = async (communityId) => {
    try {
      // Get detailed community info
      const response = await fetch(`${API}/api/graph/community/${communityId}`);
      if (response.ok) {
        const data = await response.json();
        setCommunityDetails(data);
      }
    } catch (err) {
      console.error('Failed to load community details:', err);
    }
  };

  const handleCommunityClick = (community) => {
    setSelectedCommunity(community.community_id);
    loadCommunityDetails(community.community_id);
    if (onCommunitySelect) {
      onCommunitySelect(community);
    }
  };

  const sortedCommunities = [...communities].sort((a, b) => {
    switch (sortBy) {
      case 'size':
        return b.member_count - a.member_count;
      case 'id':
        return a.community_id - b.community_id;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="palantir-entity-card">
        <LoadingSpinner message="Loading communities..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="palantir-entity-card">
        <div className="text-palantir-accent-red">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="palantir-entity-card">
        <div className="flex justify-between items-center mb-4">
          <div className="palantir-section-title">COMMUNITY ANALYSIS</div>
          <div className="text-palantir-text-secondary text-xs">
            {communities.length} Communities
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortBy('size')}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              sortBy === 'size'
                ? 'palantir-btn-primary'
                : 'palantir-btn-secondary'
            }`}
          >
            By Size
          </button>
          <button
            onClick={() => setSortBy('id')}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              sortBy === 'id'
                ? 'palantir-btn-primary'
                : 'palantir-btn-secondary'
            }`}
          >
            By ID
          </button>
        </div>

        {/* Community Grid */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedCommunities.slice(0, 50).map((community) => (
            <div
              key={community.community_id}
              onClick={() => handleCommunityClick(community)}
              className={`p-3 rounded cursor-pointer transition-all ${
                selectedCommunity === community.community_id
                  ? 'bg-[#1a1f2e] border-l-2 border-[#4B5563]'
                  : 'bg-palantir-bg-tertiary hover:bg-palantir-bg-panel'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Community Color Indicator */}
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getCommunityColor(community.community_id) }}
                  />

                  <div>
                    <div className="text-palantir-text-primary text-sm font-medium">
                      Community {community.community_id}
                    </div>
                    <div className="text-palantir-text-muted text-xs">
                      {community.member_count} products
                    </div>
                  </div>
                </div>

                {/* Product Types */}
                <div className="flex gap-1">
                  {community.types?.slice(0, 3).map((type, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-palantir-bg-tertiary rounded text-xs text-palantir-text-secondary"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {communities.length > 50 && (
          <div className="mt-3 text-center text-palantir-text-muted text-xs">
            Showing top 50 communities
          </div>
        )}
      </div>

      {/* Selected Community Details */}
      {selectedCommunity && (
        <div className="palantir-entity-card">
          <div className="palantir-section-title mb-3">
            COMMUNITY {selectedCommunity} DETAILS
          </div>

          {communityDetails ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="palantir-entity-field">
                  <div className="palantir-field-label">Members</div>
                  <div className="palantir-field-value">
                    {communityDetails.member_count}
                  </div>
                </div>
                <div className="palantir-entity-field">
                  <div className="palantir-field-label">Connections</div>
                  <div className="palantir-field-value">
                    {communityDetails.total_connections || 'N/A'}
                  </div>
                </div>
                <div className="palantir-entity-field">
                  <div className="palantir-field-label">Avg Centrality</div>
                  <div className="palantir-field-value">
                    {communityDetails.avg_centrality?.toFixed(3) || 'N/A'}
                  </div>
                </div>
                <div className="palantir-entity-field">
                  <div className="palantir-field-label">Diversity</div>
                  <div className="palantir-field-value">
                    {communityDetails.product_types?.length || 0} types
                  </div>
                </div>
              </div>

              {/* Top Products in Community */}
              <div className="mt-4">
                <div className="text-palantir-text-secondary text-xs mb-2 font-semibold">
                  Top Products
                </div>
                <div className="space-y-1">
                  {communityDetails.top_products?.slice(0, 5).map((product, i) => (
                    <div
                      key={i}
                      className="p-2 bg-palantir-bg-tertiary rounded text-xs"
                    >
                      <div className="text-palantir-text-primary truncate">
                        {product.description_short || product.supplier_pid}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <LoadingSpinner message="Loading details..." />
          )}
        </div>
      )}

      {/* Community Statistics Summary */}
      <div className="palantir-entity-card">
        <div className="palantir-section-title mb-3">COMMUNITY STATISTICS</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="palantir-entity-field">
            <div className="palantir-field-label">Total Communities</div>
            <div className="text-gray-400 font-bold text-lg">
              {communities.length}
            </div>
          </div>
          <div className="palantir-entity-field">
            <div className="palantir-field-label">Largest Community</div>
            <div className="text-gray-400 font-bold text-lg">
              {Math.max(...communities.map(c => c.member_count))}
            </div>
          </div>
          <div className="palantir-entity-field">
            <div className="palantir-field-label">Avg Size</div>
            <div className="text-palantir-text-primary font-semibold">
              {(communities.reduce((sum, c) => sum + c.member_count, 0) / communities.length).toFixed(0)}
            </div>
          </div>
          <div className="palantir-entity-field">
            <div className="palantir-field-label">Total Products</div>
            <div className="text-palantir-text-primary font-semibold">
              {communities.reduce((sum, c) => sum + c.member_count, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
