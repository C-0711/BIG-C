import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";

const API = `http://${window.location.hostname}:8766`;

export default function CommandCenter() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [leftWidth, setLeftWidth] = useState(350);
  const graphRef = useRef();
  const navigate = useNavigate();

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 20 })
      });
      const data = await res.json();
      setResults(data.products || []);
      if (data.products?.[0]) selectProduct(data.products[0]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const selectProduct = async (product) => {
    setSelected(product);
    try {
      const res = await fetch(`${API}/api/graph/neighborhood/${product.supplier_pid}`);
      const data = await res.json();
      setGraphData({ nodes: data.nodes || [], links: data.edges || [] });
    } catch (e) { console.error(e); }
  };

  const nodeColor = useCallback((node) => {
    if (selected?.supplier_pid === node.id) return "#0066cc";
    return "#94a3b8";
  }, [selected]);

  return (
    <div className="h-screen w-screen bg-[#f5f7fa] flex overflow-hidden">
      {/* Left Panel */}
      <div style={{ width: leftWidth }} className="h-full border-r border-[#e2e8f0] bg-[#ffffff] flex flex-col">
        <div className="p-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => navigate(-1)} className="text-[#94a3b8] hover:text-[#64748b]">←</button>
            <h1 className="text-sm font-medium text-[#e0e0e0]">Command Center</h1>
          </div>
          <div className="flex gap-2">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
              placeholder="Search..." className="flex-1 px-3 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded text-sm text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:outline-none" />
            <button onClick={search} className="px-3 py-2 bg-[#0066cc] hover:bg-[#c09060] text-[#f5f7fa] text-sm rounded">⌕</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="p-3 mb-2 bg-[#f5f7fa] rounded animate-pulse"><div className="h-3 bg-[#e2e8f0] rounded w-20" /></div>)
          ) : results.map((p, i) => (
            <div key={`${p.id}-${i}`} onClick={() => selectProduct(p)}
              className={`p-3 mb-2 rounded cursor-pointer transition-all ${selected?.id === p.id ? "bg-[#e2e8f0] border border-[#0066cc]" : "bg-[#f5f7fa] border border-transparent hover:border-[#cbd5e1]"}`}>
              <div className="font-mono text-xs text-[#0066cc]">{p.supplier_pid}</div>
              <div className="text-xs text-[#64748b] line-clamp-2 mt-1">{p.description_short}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resizer */}
      <div className="w-1 bg-[#e2e8f0] cursor-col-resize hover:bg-[#0066cc] transition-colors"
        onMouseDown={(e) => {
          const start = e.clientX;
          const startW = leftWidth;
          const move = (e) => setLeftWidth(Math.max(250, Math.min(500, startW + e.clientX - start)));
          const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
          document.addEventListener("mousemove", move);
          document.addEventListener("mouseup", up);
        }} />

      {/* Graph */}
      <div className="flex-1 relative">
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeId="id"
            nodeLabel="label"
            nodeColor={nodeColor}
            nodeRelSize={5}
            linkColor={() => "#e2e8f0"}
            linkWidth={1}
            backgroundColor="#f5f7fa"
            onNodeClick={(node) => {
              const product = results.find(p => p.supplier_pid === node.id);
              if (product) selectProduct(product);
            }}
            cooldownTicks={50}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-[#94a3b8]">
            Search for products to view their network
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-4 left-4 text-xs text-[#94a3b8]">
          {graphData.nodes.length} nodes, {graphData.links.length} edges
        </div>
      </div>

      {/* Right Panel */}
      {selected && (
        <div className="w-80 border-l border-[#e2e8f0] bg-[#ffffff] p-4 overflow-y-auto">
          <div className="font-mono text-[#0066cc] mb-2">{selected.supplier_pid}</div>
          <div className="text-sm text-[#1a2b3c] mb-4">{selected.description_short}</div>
          
          <div className="space-y-3">
            <div><span className="text-xs text-[#94a3b8]">Status:</span>
              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${selected.product_status === "active" ? "bg-[#3a4a3a] text-[#7a9060]" : "bg-[#4a3a3a] text-[#a05050]"}`}>{selected.product_status}</span>
            </div>
            {selected.feature_group_name && <div><span className="text-xs text-[#94a3b8]">Category:</span><span className="ml-2 text-sm text-[#64748b]">{selected.feature_group_name}</span></div>}
          </div>

          <button onClick={() => navigate(`/product-intelligence/${selected.supplier_pid}`)}
            className="w-full mt-4 px-4 py-2 bg-[#e2e8f0] hover:bg-[#e2e8f0] text-[#1a2b3c] text-sm rounded transition-colors">
            Full Details →
          </button>
        </div>
      )}
    </div>
  );
}
