import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";

const API = `http://${window.location.hostname}:8766`;

export default function MindMapView() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState({ nodes: [], links: [] });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState(2);
  const graphRef = useRef();
  const navigate = useNavigate();

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 1 })
      });
      const d = await res.json();
      if (d.products?.[0]) {
        const pid = d.products[0].supplier_pid;
        const res2 = await fetch(`${API}/api/graph/neighborhood/${pid}`);
        const g = await res2.json();
        setData({ nodes: g.nodes || [], links: g.edges || [] });
        setSelected(d.products[0]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const nodeColor = useCallback((node) => {
    if (selected?.supplier_pid === node.id) return "#0066cc";
    const level = node.level || 0;
    const colors = ["#0066cc", "#8a9060", "#6090a0", "#94a3b8"];
    return colors[Math.min(level, colors.length - 1)];
  }, [selected]);

  const nodeSize = useCallback((node) => {
    if (selected?.supplier_pid === node.id) return 12;
    const level = node.level || 0;
    return Math.max(4, 10 - level * 2);
  }, [selected]);

  return (
    <div className="h-screen w-screen bg-[#f5f7fa] relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-[#f5f7fa] via-[#f5f7fa] to-transparent">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="px-3 py-1.5 bg-[#ffffff] border border-[#e2e8f0] rounded text-sm text-[#64748b] hover:border-[#0066cc]">
              ← Back
            </button>
            <div>
              <h1 className="text-lg font-medium text-[#e0e0e0]">Mind Map</h1>
              <p className="text-xs text-[#94a3b8]">{data.nodes.length} nodes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
              placeholder="Enter product or search term..." className="px-4 py-2 bg-[#ffffff] border border-[#e2e8f0] rounded text-sm text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:outline-none w-80" />
            <button onClick={search} disabled={loading}
              className="px-5 py-2 bg-[#0066cc] hover:bg-[#c09060] text-[#f5f7fa] text-sm font-medium rounded transition-colors disabled:opacity-50">
              {loading ? "..." : "Explore"}
            </button>
          </div>
        </div>
      </div>

      {/* Graph */}
      {data.nodes.length > 0 ? (
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeId="id"
          nodeLabel="label"
          nodeColor={nodeColor}
          nodeRelSize={1}
          nodeVal={nodeSize}
          linkColor={() => "#e2e8f0"}
          linkWidth={1}
          linkDirectionalParticles={1}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleColor={() => "#0066cc"}
          backgroundColor="#f5f7fa"
          onNodeClick={(node) => setSelected({ supplier_pid: node.id, description_short: node.label })}
          onNodeRightClick={(node) => navigate(`/product-intelligence/${node.id}`)}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
        />
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="text-6xl text-[#e2e8f0] mb-4">◇</div>
          <div className="text-[#94a3b8] mb-2">Enter a product or search term to explore</div>
          <div className="text-xs text-[#94a3b8]">The mind map will visualize related products hierarchically</div>
        </div>
      )}

      {/* Selected Panel */}
      {selected && (
        <div className="absolute bottom-4 left-4 w-80 bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[#0066cc]">{selected.supplier_pid}</span>
            <button onClick={() => setSelected(null)} className="text-[#94a3b8] hover:text-[#64748b]">×</button>
          </div>
          <div className="text-sm text-[#64748b] mb-3">{selected.description_short}</div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/product-intelligence/${selected.supplier_pid}`)}
              className="flex-1 px-3 py-2 bg-[#e2e8f0] hover:bg-[#e2e8f0] text-[#1a2b3c] text-sm rounded transition-colors">
              Details
            </button>
            <button onClick={() => { setQuery(selected.supplier_pid); search(); }}
              className="flex-1 px-3 py-2 bg-[#0066cc] hover:bg-[#c09060] text-[#f5f7fa] text-sm rounded transition-colors">
              Expand
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-3 z-10">
        <div className="text-xs text-[#94a3b8] mb-2">Hierarchy</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0066cc]" /><span className="text-xs text-[#64748b]">Root</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#8a9060]" /><span className="text-xs text-[#64748b]">Level 1</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#6090a0]" /><span className="text-xs text-[#64748b]">Level 2</span></div>
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]" /><span className="text-xs text-[#64748b]">Level 3+</span></div>
        </div>
      </div>
    </div>
  );
}
