import React, { useRef, useEffect, useState } from 'react';
import { Network } from 'vis-network';
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowPathIcon,
  FunnelIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { SkeletonGraph } from './Skeletons';

export default function ProfessionalGraph({
  personName,
  onNodeClick,
  onLoadNetwork,
  compact = false
}) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  const loadNetwork = async (name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8766/api/graph/network/${encodeURIComponent(name)}?limit=50`);
      if (!response.ok) throw new Error('Failed to load network');
      const data = await response.json();
      setGraphData(data);
      renderGraph(data);
      if (onLoadNetwork) onLoadNetwork(data);
    } catch (err) {
      console.error('Error loading graph:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderGraph = (data) => {
    if (!data || !data.nodes || !containerRef.current) return;

    const getNodeColor = (type) => {
      switch (type?.toLowerCase()) {
        case 'person': return { background: '#4B5563', border: '#6B7280' };
        case 'organization': return { background: '#10b981', border: '#059669' };
        case 'location': return { background: '#f59e0b', border: '#d97706' };
        default: return { background: '#4B5563', border: '#6B7280' };
      }
    };

    const nodes = data.nodes.map(n => {
      const colors = getNodeColor(n.type);
      return {
        id: n.id,
        label: n.label,
        value: n.value || 10,
        title: `${n.label}\n${n.type || 'Person'}\n${n.value || 0} mentions`,
        color: {
          background: colors.background,
          border: colors.border,
          highlight: { background: '#ef4444', border: '#dc2626' },
          hover: { background: '#D1D5DB', border: '#4B5563' }
        },
        font: {
          color: '#ffffff',
          size: compact ? 12 : 14,
          face: 'Inter, system-ui, sans-serif'
        },
        shape: 'dot',
        image: n.photo_url,
        brokenImage: undefined
      };
    });

    const edges = (data.edges || []).map(e => ({
      from: e.from,
      to: e.to,
      value: e.value || 1,
      title: e.title || `${e.value || 1} shared documents`,
      color: {
        color: '#64748b',
        highlight: '#4B5563',
        hover: '#94a3b8'
      },
      smooth: {
        type: 'continuous',
        roundness: 0.5
      },
      width: 1
    }));

    const visData = { nodes, edges };

    const options = {
      nodes: {
        shape: 'dot',
        scaling: {
          min: compact ? 10 : 15,
          max: compact ? 25 : 40,
          label: {
            enabled: true,
            min: 12,
            max: 20
          }
        },
        font: {
          size: compact ? 11 : 13,
          color: '#ffffff',
          face: 'Inter, system-ui, sans-serif'
        },
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.3)',
          size: 10,
          x: 2,
          y: 2
        }
      },
      edges: {
        width: 1,
        color: { inherit: false },
        smooth: {
          type: 'continuous',
          roundness: 0.5
        },
        scaling: {
          min: 1,
          max: 8
        },
        shadow: false
      },
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 200,
          updateInterval: 50
        },
        barnesHut: {
          gravitationalConstant: -8000,
          centralGravity: 0.3,
          springLength: compact ? 120 : 200,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.1
        },
        maxVelocity: 50,
        minVelocity: 0.75,
        solver: 'barnesHut',
        timestep: 0.5
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true,
        dragNodes: true,
        navigationButtons: false,
        keyboard: true
      },
      layout: {
        improvedLayout: true,
        clusterThreshold: 150
      }
    };

    if (networkRef.current) {
      networkRef.current.destroy();
    }

    const network = new Network(containerRef.current, visData, options);
    networkRef.current = network;

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.find(n => n.id === nodeId);
        if (node && onNodeClick) {
          onNodeClick(node);
        }
      }
    });

    network.on('stabilizationIterationsDone', () => {
      network.setOptions({ physics: false });
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  };

  useEffect(() => {
    if (personName) {
      loadNetwork(personName);
    }
  }, [personName]);

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 0.8 });
    }
  };

  const handleReset = () => {
    if (networkRef.current) {
      networkRef.current.fit();
    }
  };

  const handleReload = () => {
    if (personName) {
      loadNetwork(personName);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Graph Controls */}
      {!compact && (
        <div className="graph-controls">
          <button
            className="graph-control-btn"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
          <button
            className="graph-control-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
          <button
            className="graph-control-btn"
            onClick={handleReset}
            title="Reset View"
          >
            <ArrowPathIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
          <button
            className="graph-control-btn"
            onClick={handleReload}
            title="Reload Network"
          >
            <PhotoIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>
      )}

      {/* Graph Info */}
      {graphData && !compact && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
          zIndex: 10,
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            {graphData.center_person}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {graphData.nodes?.length || 0} nodes • {graphData.edges?.length || 0} connections
          </div>
        </div>
      )}

      {/* Graph Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--bg-primary)',
          borderRadius: compact ? '0' : '0.5rem'
        }}
      />

      {/* Loading State */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20
        }}>
          <SkeletonGraph />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 20
        }}>
          <p style={{ color: 'var(--danger)', fontSize: '1.125rem' }}>
            Failed to load network
          </p>
          <button className="btn btn-primary" onClick={handleReload}>
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !graphData && (
        <div className="empty-state">
          <p>Enter a person's name to visualize their network</p>
        </div>
      )}
    </div>
  );
}
