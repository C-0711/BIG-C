/**
 * EnhancedProductGraph - Advanced Product Network Visualization
 *
 * Features:
 * - Uses computed graph metrics (centrality, PageRank, communities)
 * - Node size based on degree centrality (importance)
 * - Node color based on community (product families)
 * - Edge width based on relationship strength
 * - Advanced filtering by relationship type, community
 * - Performance optimized for 1,000+ nodes
 * - Multiple layout algorithms
 */

import React, { useRef, useEffect, useState } from 'react';
import { Network } from 'vis-network';
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChartBarIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

export default function EnhancedProductGraph({
  centerProductId,
  onNodeClick,
  maxNodes = 100,
  showMetrics = true
}) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    relationshipTypes: [],
    communities: [],
    minCentrality: 0,
    layout: 'force-directed'
  });
  const [stats, setStats] = useState(null);

  // Community colors (generated palette for 136 communities)
  const getCommunityColor = (communityId) => {
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#4B5563', '#8B5CF6',
      '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
    ];
    return colors[communityId % colors.length];
  };

  const loadEnhancedNetwork = async (productId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${window.location.protocol}//${window.location.hostname}:8766/api/graph/enhanced-network/${productId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            limit: maxNodes,
            include_metrics: true,
            filters: filters
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGraphData(data);
      setStats(data.stats);
      renderEnhancedGraph(data);

    } catch (err) {
      console.error('Error loading enhanced network:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderEnhancedGraph = (data) => {
    if (!data || !data.nodes || !containerRef.current) return;

    // Enhanced node configuration using metrics
    const nodes = data.nodes.map((n, index) => {
      // Node size based on degree centrality
      const degreeCentrality = n.metrics?.degree_centrality || 0;
      const nodeSize = 10 + (degreeCentrality * 50);

      // Node color based on community
      const communityColor = n.community_id
        ? getCommunityColor(n.community_id)
        : '#9CA3AF';

      // Border color based on PageRank
      const pagerank = n.metrics?.pagerank || 0;
      const borderWidth = 2 + (pagerank * 20);

      return {
        id: n.id,
        label: n.label || n.supplier_pid,
        value: nodeSize,
        title: buildTooltip(n),
        supplier_pid: n.supplier_pid,
        community_id: n.community_id,
        metrics: n.metrics,
        color: {
          background: communityColor,
          border: index === 0 ? '#FFFFFF' : communityColor,
          highlight: {
            background: '#FBBF24',
            border: '#F59E0B'
          },
          hover: {
            background: lightenColor(communityColor, 0.2),
            border: communityColor
          }
        },
        borderWidth: borderWidth,
        font: {
          color: '#ffffff',
          size: 12 + (degreeCentrality * 6),
          face: 'Inter, system-ui, sans-serif',
          bold: index === 0
        },
        shape: 'dot',
        shadow: {
          enabled: true,
          color: `${communityColor}66`,
          size: 10 + (pagerank * 30),
          x: 0,
          y: 0
        }
      };
    });

    const edges = (data.edges || []).map(e => {
      const strength = e.strength || 0.5;
      const relationshipColor = getRelationshipColor(e.relationship_type);

      return {
        from: e.from,
        to: e.to,
        value: strength,
        title: `${e.relationship_type}\nStrength: ${(strength * 100).toFixed(0)}%`,
        color: {
          color: relationshipColor,
          highlight: '#FBBF24',
          hover: lightenColor(relationshipColor, 0.3)
        },
        width: 1 + (strength * 4),
        smooth: {
          type: filters.layout === 'hierarchical' ? 'cubicBezier' : 'continuous',
          roundness: 0.5
        },
        arrows: e.directional ? { to: { enabled: true, scaleFactor: 0.5 } } : undefined
      };
    });

    const visData = { nodes, edges };

    const options = getLayoutOptions(filters.layout);

    if (networkRef.current) {
      networkRef.current.destroy();
    }

    const network = new Network(containerRef.current, visData, options);
    networkRef.current = network;

    // Event handlers
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.find(n => n.id === nodeId);
        if (node && onNodeClick) {
          onNodeClick(node);
        }
      }
    });

    network.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.supplier_pid) {
          loadEnhancedNetwork(node.supplier_pid);
        }
      }
    });

    network.on('stabilizationIterationsDone', () => {
      network.setOptions({ physics: false });
    });
  };

  const buildTooltip = (node) => {
    const metrics = node.metrics || {};
    return `
<b>${node.label}</b>
Supplier PID: ${node.supplier_pid}

<b>Graph Metrics:</b>
Degree: ${(metrics.degree_centrality || 0).toFixed(4)}
PageRank: ${(metrics.pagerank || 0).toFixed(6)}
Betweenness: ${(metrics.betweenness_centrality || 0).toFixed(6)}

<b>Community:</b> ${node.community_id || 'Unknown'}
<b>Connections:</b> ${node.connection_count || 0}
    `.trim();
  };

  const getRelationshipColor = (type) => {
    const colors = {
      'similar_to': '#4B5563',
      'compatible_with': '#10B981',
      'replaced_by': '#F59E0B',
      'accessory_for': '#8B5CF6',
      'same_family': '#EC4899',
      'shares_terminology': '#14B8A6',
      'same_category': '#06B6D4',
      'price_alternative': '#F97316'
    };
    return colors[type] || '#6B7280';
  };

  const lightenColor = (color, amount) => {
    // Simple color lightening
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount * 255);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amount * 255);
    const b = Math.min(255, (num & 0x0000FF) + amount * 255);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const getLayoutOptions = (layout) => {
    const baseOptions = {
      nodes: {
        scaling: {
          min: 10,
          max: 40,
          label: { enabled: true, min: 10, max: 20 }
        },
        font: { size: 13, color: '#ffffff' },
        borderWidth: 2
      },
      edges: {
        width: 1,
        scaling: { min: 1, max: 8 },
        smooth: { type: 'continuous' }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true,
        navigationButtons: false
      }
    };

    switch (layout) {
      case 'hierarchical':
        return {
          ...baseOptions,
          layout: {
            hierarchical: {
              enabled: true,
              direction: 'UD',
              sortMethod: 'directed',
              levelSeparation: 150,
              nodeSpacing: 100
            }
          },
          physics: false
        };

      case 'circular':
        return {
          ...baseOptions,
          layout: {
            improvedLayout: true
          },
          physics: {
            enabled: true,
            solver: 'repulsion',
            repulsion: {
              centralGravity: 0.8,
              springLength: 200,
              springConstant: 0.05,
              nodeDistance: 150,
              damping: 0.09
            }
          }
        };

      default: // force-directed
        return {
          ...baseOptions,
          physics: {
            enabled: true,
            stabilization: { iterations: 200 },
            barnesHut: {
              gravitationalConstant: -8000,
              centralGravity: 0.3,
              springLength: 200,
              springConstant: 0.04,
              damping: 0.09,
              avoidOverlap: 0.2
            }
          }
        };
    }
  };

  useEffect(() => {
    if (centerProductId) {
      loadEnhancedNetwork(centerProductId);
    }
  }, [centerProductId, filters]);

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.2, animation: { duration: 300 } });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 0.8, animation: { duration: 300 } });
    }
  };

  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: { duration: 500 } });
    }
  };

  const handleReload = () => {
    if (centerProductId) {
      loadEnhancedNetwork(centerProductId);
    }
  };

  const togglePhysics = () => {
    if (networkRef.current) {
      const currentPhysics = networkRef.current.physics.options.enabled;
      networkRef.current.setOptions({ physics: { enabled: !currentPhysics } });
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-gray-800/90 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors"
          title="Zoom In (+)"
        >
          <MagnifyingGlassPlusIcon className="w-5 h-5 text-gray-300" />
        </button>

        <button
          onClick={handleZoomOut}
          className="p-2 bg-gray-800/90 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors"
          title="Zoom Out (-)"
        >
          <MagnifyingGlassMinusIcon className="w-5 h-5 text-gray-300" />
        </button>

        <button
          onClick={handleFit}
          className="p-2 bg-gray-800/90 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors"
          title="Fit View (F)"
        >
          <ArrowPathIcon className="w-5 h-5 text-gray-300" />
        </button>

        <button
          onClick={togglePhysics}
          className="p-2 bg-gray-800/90 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors"
          title="Toggle Physics"
        >
          <CubeIcon className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Metrics Overlay */}
      {showMetrics && stats && (
        <div className="absolute bottom-4 left-4 z-10 bg-gray-800/95 border border-gray-600 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-xs font-semibold text-gray-400 mb-2">NETWORK METRICS</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-500 text-xs">Nodes</div>
              <div className="text-white font-bold">{stats.total_nodes}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Edges</div>
              <div className="text-gray-400 font-bold">{stats.total_edges}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Communities</div>
              <div className="text-purple-400 font-bold">{stats.communities}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Avg Degree</div>
              <div className="text-green-400 font-bold">{stats.avg_degree?.toFixed(1)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Graph Container */}
      <div
        ref={containerRef}
        className="w-full h-full bg-gray-950 rounded-lg"
      />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B5563] mx-auto mb-4"></div>
            <div className="text-white font-medium">Loading enhanced network...</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-20">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-lg font-semibold mb-2">Failed to load network</div>
            <div className="text-gray-400 text-sm mb-4">{error}</div>
            <button
              onClick={handleReload}
              className="px-4 py-2 bg-[#374151] hover:bg-[#374151] rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800/95 border border-gray-600 rounded-lg p-3 backdrop-blur-sm">
        <div className="text-xs font-semibold text-gray-400 mb-2">LEGEND</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(to right, #9CA3AF, #4B5563)' }}></div>
            <span className="text-gray-300">Size = Degree Centrality</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-300">Color = Community</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[#374151]" style={{ width: '24px' }}></div>
            <span className="text-gray-300">Width = Strength</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-4 border-yellow-400 bg-gray-800"></div>
            <span className="text-gray-300">Glow = PageRank</span>
          </div>
        </div>
      </div>
    </div>
  );
}
