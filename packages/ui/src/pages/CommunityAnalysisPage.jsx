/**
 * CommunityAnalysisPage - Product Community Analysis Dashboard
 *
 * Displays and analyzes the 136 product communities discovered through
 * graph clustering algorithms
 */

import { useState } from 'react';
import Navigation from '../components/Navigation';
import CommunityExplorer from '../components/CommunityExplorer';
import EnhancedProductGraph from '../components/EnhancedProductGraph';

export default function CommunityAnalysisPage() {
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleCommunitySelect = (community) => {
    setSelectedCommunity(community);
    console.log('Selected community:', community);
  };

  const handleNodeClick = (nodeData) => {
    setSelectedProduct(nodeData);
    console.log('Selected product:', nodeData);
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <header className="palantir-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="palantir-logo">BOSCH INTELLIGENCE PLATFORM</span>
          <div style={{ width: 1, height: 20, background: '#2A3140' }} />
          <nav className="palantir-breadcrumb">
            <span>Analysis</span>
            <span>/</span>
            <span>Communities</span>
          </nav>
        </div>
        <div style={{ fontSize: 10, color: '#6B7280', fontFamily: 'monospace' }}>
          {new Date().toISOString().slice(0, 10)}
        </div>
      </header>

      <Navigation />

      {/* Main Content */}
      <div style={styles.mainLayout}>
        {/* Left Sidebar - Community Explorer */}
        <div style={styles.sidebar}>
          <CommunityExplorer onCommunitySelect={handleCommunitySelect} />
        </div>

        {/* Center - Graph Visualization */}
        <div style={styles.centerPanel}>
          {selectedCommunity ? (
            <div className="palantir-entity-card" style={{ height: '100%' }}>
              <div className="palantir-section-title mb-4">
                COMMUNITY {selectedCommunity.community_id} NETWORK
              </div>
              <div className="text-palantir-text-secondary text-sm mb-4">
                Visualizing {selectedCommunity.member_count} products in this community
              </div>
              {/* TODO: Add filtered graph view for selected community */}
              <div className="flex items-center justify-center h-96 text-palantir-text-muted">
                Graph visualization for Community {selectedCommunity.community_id}
                <br />
                (Feature in development)
              </div>
            </div>
          ) : (
            <div className="palantir-entity-card" style={{ height: '100%' }}>
              <div className="flex items-center justify-center h-full flex-col gap-4">
                <div className="text-6xl opacity-20">🔍</div>
                <div className="text-palantir-text-secondary text-center">
                  <div className="text-lg font-semibold mb-2">
                    Select a Community
                  </div>
                  <div className="text-sm">
                    Choose a community from the left panel to explore its network
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Community Insights */}
        <div style={styles.sidebar}>
          {selectedCommunity && (
            <div className="space-y-4">
              <div className="palantir-entity-card">
                <div className="palantir-section-title mb-3">
                  COMMUNITY INSIGHTS
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-palantir-text-secondary text-xs mb-1">
                      Community ID
                    </div>
                    <div className="text-gray-400 font-bold text-2xl">
                      {selectedCommunity.community_id}
                    </div>
                  </div>

                  <div>
                    <div className="text-palantir-text-secondary text-xs mb-1">
                      Member Count
                    </div>
                    <div className="text-palantir-text-primary font-semibold text-lg">
                      {selectedCommunity.member_count}
                    </div>
                  </div>

                  <div>
                    <div className="text-palantir-text-secondary text-xs mb-2">
                      Product Types
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCommunity.types?.map((type, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-palantir-bg-tertiary rounded text-xs text-palantir-text-primary"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="palantir-entity-card">
                <div className="palantir-section-title mb-3">
                  ANALYSIS
                </div>
                <div className="text-palantir-text-muted text-sm">
                  Community analysis features:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Density metrics</li>
                    <li>Key products (hubs)</li>
                    <li>Inter-community links</li>
                    <li>Product family patterns</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!selectedCommunity && (
            <div className="palantir-entity-card">
              <div className="text-center text-palantir-text-muted">
                <div className="text-4xl mb-2 opacity-20">📊</div>
                <div className="text-sm">
                  Select a community to view detailed insights
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #0A0E1A, #141B2E)',
    color: '#E5E7EB',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr 320px',
    gap: 16,
    padding: 16,
    maxWidth: '1920px',
    margin: '0 auto'
  },
  sidebar: {
    height: 'calc(100vh - 180px)',
    overflowY: 'auto'
  },
  centerPanel: {
    height: 'calc(100vh - 180px)'
  }
};
