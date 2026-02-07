import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, CheckCircle, XCircle, Grid3X3, Search, Activity, Filter, List, Grid, ChevronRight } from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("list");

  useEffect(() => {
    fetch(`${API}/api/statistics`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/api/products/recent?limit=50`).then(r => r.json()).then(d => {
      setProducts(d.products || d || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    if (filter === "active" && p.product_status !== "active") return false;
    if (filter === "discontinued" && p.product_status !== "discontinued") return false;
    if (query && !p.supplier_pid?.toLowerCase().includes(query.toLowerCase()) && 
        !p.description_short?.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const STATS = [
    { label: "Total Products", value: stats?.total_products?.toLocaleString() || "23,141", Icon: Package, color: "#0066cc" },
    { label: "Active", value: stats?.active_products?.toLocaleString() || "21,953", Icon: CheckCircle, color: "#059669" },
    { label: "Discontinued", value: stats?.discontinued_products?.toLocaleString() || "1,188", Icon: XCircle, color: "#dc2626" },
    { label: "ETIM Groups", value: stats?.total_etim_groups || "167", Icon: Grid3X3, color: "#7c3aed" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Products</h1>
            <p className="text-sm text-[#64748b]">{filtered.length} products loaded</p>
          </div>
          <form className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter products..."
                className="w-full pl-10 pr-4 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:outline-none transition-all" />
            </div>
          </form>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Activity className="text-[#059669]" size={16} />
            Online
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS.map(s => {
            const Icon = s.Icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Icon size={20} style={{ color: s.color }} />
                  <span className="text-xs text-[#94a3b8]">{s.label}</span>
                </div>
                <div className="text-2xl font-semibold text-[#1a2b3c]">{s.value}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#64748b]" />
              <div className="flex gap-1 bg-[#f5f7fa] p-1 rounded-lg">
                {["all", "active", "discontinued"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded ${filter === f ? "bg-white shadow-sm text-[#0066cc]" : "text-[#64748b]"}`}>
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-1 bg-[#f5f7fa] p-1 rounded-lg">
              <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === "list" ? "bg-white shadow-sm" : ""}`}>
                <List size={16} className={view === "list" ? "text-[#0066cc]" : "text-[#94a3b8]"} />
              </button>
              <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "bg-white shadow-sm" : ""}`}>
                <Grid size={16} className={view === "grid" ? "text-[#0066cc]" : "text-[#94a3b8]"} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="p-4 bg-[#f5f7fa] rounded-lg animate-pulse">
                  <div className="h-4 bg-[#e2e8f0] rounded w-32 mb-2" />
                  <div className="h-3 bg-[#e2e8f0] rounded w-full" />
                </div>
              ))}
            </div>
          ) : view === "list" ? (
            <div className="divide-y divide-[#e2e8f0]">
              {filtered.map((p, i) => (
                <Link key={`${p.id}-${i}`} to={`/product-intelligence/${p.supplier_pid}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#f5f7fa] transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="font-mono text-[#0066cc] font-medium w-28">{p.supplier_pid}</span>
                    <span className="text-sm text-[#64748b] truncate">{p.description_short}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#94a3b8] hidden md:block">{p.feature_group_name || "—"}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${p.product_status === "active" ? "bg-[#059669]/10 text-[#059669]" : "bg-[#dc2626]/10 text-[#dc2626]"}`}>
                      {p.product_status || "—"}
                    </span>
                    <ChevronRight size={16} className="text-[#94a3b8]" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 grid grid-cols-3 gap-4">
              {filtered.map((p, i) => (
                <Link key={`${p.id}-${i}`} to={`/product-intelligence/${p.supplier_pid}`}
                  className="p-4 bg-[#f5f7fa] rounded-xl hover:shadow-md transition-all border border-transparent hover:border-[#0066cc]">
                  <div className="font-mono text-[#0066cc] font-medium mb-2">{p.supplier_pid}</div>
                  <div className="text-sm text-[#64748b] line-clamp-2 mb-2">{p.description_short}</div>
                  <span className={`px-2 py-0.5 rounded text-xs ${p.product_status === "active" ? "bg-[#059669]/10 text-[#059669]" : "bg-[#dc2626]/10 text-[#dc2626]"}`}>
                    {p.product_status || "—"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
