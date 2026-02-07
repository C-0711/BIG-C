import { useEffect, useRef, useState, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

export default function GlobalNetworkPage() {
  const graphRef = useRef();
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/graph/network`).then(r => r.json()).then(d => {
      setData({ nodes: d.nodes || [], links: d.edges || [] });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: search, limit: 1 })
      });
      const d = await res.json();
      if (d.products?.[0]) {
        const pid = d.products[0].supplier_pid;
        const res2 = await fetch(`${API}/api/graph/neighborhood/${pid}`);
        const g = await res2.json();
        setData({ nodes: g.nodes || [], links: g.edges || [] });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const nodeColor = useCallback((node) => {
    if (selected?.id === node.id) return "#0066cc";
    return "#94a3b8";
  }, [selected]);

  return (
    <div className="h-screen w-screen bg-[#f5f7fa] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-white border-b border-[#e2e8f0]">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#f5f7fa] rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-[#64748b]" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[#1a2b3c]">Product Network</h1>
              <p className="text-xs text-[#64748b]">{data.nodes.length} nodes, {data.links.length} edges</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search product..." className="pl-9 pr-4 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:outline-none w-64" />
            </div>
            <button onClick={handleSearch} className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-medium rounded-lg">
              Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-[#64748b]">Loading network...</div>
        </div>
      ) : (
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeId="id"
          nodeLabel="label"
          nodeColor={nodeColor}
          nodeRelSize={6}
          linkColor={() => "#e2e8f0"}
          linkWidth={1}
          backgroundColor="#f5f7fa"
          onNodeClick={(node) => setSelected(node)}
          onNodeRightClick={(node) => navigate(`/product-intelligence/${node.id}`)}
          cooldownTicks={100}
        />
      )}

      {selected && (
        <div className="absolute bottom-4 left-4 w-80 bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-lg z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[#0066cc] font-medium">{selected.id}</span>
            <button onClick={() => setSelected(null)} className="text-[#94a3b8] hover:text-[#64748b]">
              <X size={16} />
            </button>
          </div>
          <div className="text-sm text-[#64748b] mb-3">{selected.label}</div>
          <button onClick={() => navigate(`/product-intelligence/${selected.id}`)}
            className="w-full px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm rounded-lg transition-colors">
            View Details
          </button>
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-lg z-10">
        <div className="text-xs text-[#64748b] mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0066cc]" /><span className="text-xs text-[#64748b]">Selected</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#94a3b8]" /><span className="text-xs text-[#64748b]">Product</span></div>
        </div>
        <div className="mt-2 pt-2 border-t border-[#e2e8f0] text-[10px] text-[#94a3b8]">Right-click: View details</div>
      </div>
    </div>
  );
}
