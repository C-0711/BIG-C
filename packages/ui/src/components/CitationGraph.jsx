import { useRef, useEffect, useState } from 'react';
import { Network } from 'vis-network';

const API = `${window.location.protocol}//${window.location.hostname}:8766`;

export default function CitationGraph({ supplierPid, onNodeSelect }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (supplierPid) {
      loadCitationGraph();
    }
  }, [supplierPid]);

  const loadCitationGraph = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/graph/citations/${supplierPid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          include_related_products: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setGraphData(data);
      renderGraph(data);
    } catch (error) {
      console.error('Failed to load citation graph:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGraph = (data) => {
    if (!data || !containerRef.current) return;

    // Transform nodes for vis-network
    const nodes = data.nodes.map(node => ({
      id: node.id,
      label: node.label,
      shape: node.shape,
      size: node.size,
      color: {
        background: node.color,
        border: node.borderColor,
        highlight: {
          background: lightenColor(node.color, 0.2),
          border: node.borderColor
        },
        hover: {
          background: lightenColor(node.color, 0.1),
          border: node.borderColor
        }
      },
      borderWidth: node.borderWidth,
      font: {
        color: node.nodeType === 'center' ? '#FFD700' : '#C9D1D9',
        size: node.nodeType === 'center' ? 16 : 12,
        face: 'Inter, sans-serif',
        bold: node.nodeType === 'center'
      },
      shadow: node.nodeType === 'center' ? {
        enabled: true,
        color: 'rgba(255, 215, 0, 0.4)',
        size: 20,
        x: 0,
        y: 0
      } : false,
      // Store metadata
      metadata: {
        type: node.nodeType,
        source_type: node.source_type,
        confidence: node.confidence,
        supplier_pid: node.supplier_pid,
        citation_count: node.citation_count,
        validation_status: node.validation_status,
        document_filename: node.document_filename
      }
    }));

    const edges = data.edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      color: {
        color: getEdgeColor(edge.confidence),
        opacity: 0.4 + (edge.confidence * 0.5)
      },
      width: 1 + (edge.confidence * 3),
      label: edge.label || '',
      font: {
        color: '#8B949E',
        size: 9,
        strokeWidth: 0,
        face: 'Inter'
      },
      smooth: {
        enabled: true,
        type: 'curvedCW',
        roundness: 0.15
      },
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.6,
          type: 'arrow'
        }
      },
      // Store edge metadata
      title: buildEdgeTooltip(edge)
    }));

    const options = {
      layout: {
        improvedLayout: true,
        hierarchical: {
          enabled: false  // Use physics for radial layout
        }
      },
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 150,
          updateInterval: 25
        },
        barnesHut: {
          gravitationalConstant: -3000,  // Reduziert von -8000
          centralGravity: 0.1,           // Reduziert von 0.3
          springLength: 120,             // Kürzer für kompakteres Layout
          springConstant: 0.01,          // Schwächere Springs
          damping: 0.5,                  // Stark erhöht von 0.2 → weniger Vibrieren
          avoidOverlap: 0.3
        },
        maxVelocity: 30,                 // Reduziert von 50
        minVelocity: 0.1                 // Schnellerer Stop
      },
      nodes: {
        borderWidthSelected: 3,
        chosen: {
          node: (values, id, selected, hovering) => {
            if (selected) {
              values.borderWidth = 4;
              values.shadow = true;
              values.shadowColor = 'rgba(59, 127, 204, 0.6)';
              values.shadowSize = 15;
            }
          }
        }
      },
      edges: {
        selectionWidth: 2,
        hoverWidth: 0.5
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        navigationButtons: true,
        keyboard: {
          enabled: true,
          speed: { x: 10, y: 10, zoom: 0.02 }
        }
      },
      groups: {}
    };

    // Create network
    if (networkRef.current) {
      networkRef.current.destroy();
    }

    const network = new Network(containerRef.current, { nodes, edges }, options);
    networkRef.current = network;

    // Event handlers
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const nodeData = nodes.find(n => n.id === nodeId);
        setSelectedNode(nodeData);
        if (onNodeSelect) {
          onNodeSelect(nodeData);
        }
      }
    });

    // Focus on center product after stabilization and stop physics
    network.once('stabilizationIterationsDone', () => {
      // Stop physics to prevent vibration
      network.setOptions({ physics: false });

      const centerNode = nodes.find(n => n.metadata?.type === 'center');
      if (centerNode) {
        network.focus(centerNode.id, {
          scale: 0.8,
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          }
        });
      }
      console.log('Citation graph stabilized');
    });

    // Timeout fallback
    setTimeout(() => {
      if (network) {
        network.setOptions({ physics: false });
      }
    }, 3000);
  };

  const getEdgeColor = (confidence) => {
    // Dezente Farben basierend auf Confidence
    if (confidence >= 0.9) return '#059669';  // High: Dunkles Grün
    if (confidence >= 0.7) return '#475569';  // Medium: Dunkelgrau
    if (confidence >= 0.5) return '#78350F';  // Low-medium: Dunkles Amber
    return '#7F1D1D';  // Low: Dunkles Rot
  };

  const buildEdgeTooltip = (edge) => {
    return `
      <div style="padding: 8px;">
        <div style="font-weight: 600;">${edge.field_path || 'Data Field'}</div>
        <div style="font-size: 11px; color: #9CA3AF; margin-top: 4px;">
          Value: ${edge.field_value || 'N/A'}
        </div>
        <div style="font-size: 11px; color: #9CA3AF;">
          Confidence: ${(edge.confidence * 100).toFixed(0)}%
        </div>
      </div>
    `;
  };

  const lightenColor = (hex, amount) => {
    // Simple color lightening function
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount * 255);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amount * 255);
    const b = Math.min(255, (num & 0x0000FF) + amount * 255);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  return (
    <div className="relative w-full h-full">
      {/* Graph Container */}
      <div
        ref={containerRef}
        className="w-full h-full rounded-lg"
        style={{
          background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #05070b 100%)',
          border: '1px solid #1A1F26'
        }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-950/90 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B5563] mx-auto mb-4" />
            <div className="text-gray-300 text-sm">Loading Citations Graph...</div>
          </div>
        </div>
      )}

      {/* Stats Overlay */}
      {graphData && !loading && (
        <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Citations</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="text-gray-500">Total:</div>
            <div className="text-gray-200 font-semibold">{graphData.stats.total_citations}</div>
            <div className="text-gray-500">Sources:</div>
            <div className="text-gray-200 font-semibold">{graphData.stats.unique_sources}</div>
            <div className="text-gray-500">Confidence:</div>
            <div className="text-gray-200 font-semibold">
              {(graphData.stats.avg_confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
