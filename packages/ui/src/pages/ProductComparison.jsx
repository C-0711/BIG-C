import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { GitCompare, Plus, X, Search, Activity, Package, CheckCircle, ArrowRight } from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

const STATS = [
  { label: "Compare Slots", value: "3", Icon: GitCompare, color: "#0066cc" },
  { label: "Products Loaded", value: "0", Icon: Package, color: "#059669" },
  { label: "Differences", value: "—", Icon: ArrowRight, color: "#7c3aed" },
  { label: "Match Score", value: "—", Icon: CheckCircle, color: "#ea580c" },
];

export default function ProductComparison() {
  const [params] = useSearchParams();
  const [slots, setSlots] = useState([null, null, null]);
  const [searches, setSearches] = useState(["", "", ""]);
  const [results, setResults] = useState([[], [], []]);
  const [loading, setLoading] = useState([false, false, false]);

  useEffect(() => {
    const p1 = params.get("p1");
    if (p1) loadProduct(0, p1);
  }, []);

  const searchProducts = async (idx, query) => {
    if (!query.trim()) { setResults(r => { r[idx] = []; return [...r]; }); return; }
    setLoading(l => { l[idx] = true; return [...l]; });
    try {
      const res = await fetch(`${API}/api/products/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 5 })
      });
      const data = await res.json();
      setResults(r => { r[idx] = data.products || []; return [...r]; });
    } catch (e) { console.error(e); }
    setLoading(l => { l[idx] = false; return [...l]; });
  };

  const loadProduct = async (idx, pid) => {
    setLoading(l => { l[idx] = true; return [...l]; });
    try {
      const res = await fetch(`${API}/api/products/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: pid, limit: 1 })
      });
      const data = await res.json();
      if (data.products?.[0]) {
        setSlots(s => { s[idx] = data.products[0]; return [...s]; });
        setSearches(s => { s[idx] = ""; return [...s]; });
        setResults(r => { r[idx] = []; return [...r]; });
      }
    } catch (e) { console.error(e); }
    setLoading(l => { l[idx] = false; return [...l]; });
  };

  const clear = (idx) => {
    setSlots(s => { s[idx] = null; return [...s]; });
    setSearches(s => { s[idx] = ""; return [...s]; });
  };

  const filled = slots.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Product Comparison</h1>
            <p className="text-sm text-[#64748b]">Compare up to 3 products side by side</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Activity className="text-[#059669]" size={16} />
            Online
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS.map((s, i) => {
            const Icon = s.Icon;
            const val = i === 1 ? filled.toString() : s.value;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Icon size={20} style={{ color: s.color }} />
                  <span className="text-xs text-[#94a3b8]">{s.label}</span>
                </div>
                <div className="text-2xl font-semibold text-[#1a2b3c]">{val}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {slots.map((slot, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f5f7fa]">
                <span className="text-sm font-medium text-[#64748b]">Product {idx + 1}</span>
              </div>

              {slot ? (
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Link to={`/product-intelligence/${slot.supplier_pid}`} className="font-mono text-[#0066cc] font-medium hover:underline">
                        {slot.supplier_pid}
                      </Link>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${slot.product_status === "active" ? "bg-[#059669]/10 text-[#059669]" : "bg-[#dc2626]/10 text-[#dc2626]"}`}>
                        {slot.product_status}
                      </span>
                    </div>
                    <button onClick={() => clear(idx)} className="p-1 hover:bg-[#f5f7fa] rounded">
                      <X size={16} className="text-[#94a3b8]" />
                    </button>
                  </div>
                  <p className="text-sm text-[#64748b] mb-4">{slot.description_short}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-t border-[#e2e8f0]">
                      <span className="text-[#94a3b8]">Category</span>
                      <span className="text-[#1a2b3c]">{slot.feature_group_name || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-[#e2e8f0]">
                      <span className="text-[#94a3b8]">ETIM</span>
                      <span className="text-[#1a2b3c]">{slot.feature_group_id || "—"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                    <input type="text" value={searches[idx]} onChange={e => { setSearches(s => { s[idx] = e.target.value; return [...s]; }); searchProducts(idx, e.target.value); }}
                      placeholder="Search product..." className="w-full pl-9 pr-4 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:outline-none" />
                  </div>
                  
                  {loading[idx] ? (
                    <div className="py-8 text-center text-sm text-[#94a3b8]">Searching...</div>
                  ) : results[idx].length > 0 ? (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {results[idx].map((p, i) => (
                        <button key={`${p.id}-${i}`} onClick={() => loadProduct(idx, p.supplier_pid)}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#f5f7fa] transition-colors">
                          <div className="font-mono text-[#0066cc] text-sm">{p.supplier_pid}</div>
                          <div className="text-xs text-[#64748b] truncate">{p.description_short?.slice(0, 50)}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <Plus className="mx-auto text-[#e2e8f0] mb-2" size={32} />
                      <div className="text-sm text-[#94a3b8]">Add product to compare</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
