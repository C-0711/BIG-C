import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Package, Search, Activity, Grid, List, ChevronRight } from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

export default function CatalogPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`${API}/api/etim/groups`).then(r => r.json()).then(d => {
      setCategories(d.groups || d || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadCategory = async (cat) => {
    setSelected(cat);
    setLoading(true);
    try {
      const searchTerm = cat.feature_group_id || cat.feature_system_name || "";
      const res = await fetch(`${API}/api/products/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm, limit: 50 })
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Catalog Browser</h1>
            <p className="text-sm text-[#64748b]">Browse products by category</p>
          </div>
          <form className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter categories..."
                className="w-full pl-10 pr-4 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:outline-none transition-all" />
            </div>
          </form>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Activity className="text-[#059669]" size={16} />
            Online
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="w-72 border-r border-[#e2e8f0] bg-white overflow-y-auto">
          <div className="p-4 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-2 text-sm font-medium text-[#1a2b3c]">
              <FolderOpen size={16} />
              Categories ({categories.length})
            </div>
          </div>
          <div className="p-2">
            {categories.filter(c => !query || (c.feature_group_id || c.feature_system_name || "").toLowerCase().includes(query.toLowerCase())).map((cat, i) => (
              <button key={cat.feature_group_id || `cat-${i}`} onClick={() => loadCategory(cat)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center justify-between ${selected?.feature_group_id === cat.feature_group_id ? "bg-[#0066cc] text-white" : "text-[#64748b] hover:bg-[#f5f7fa]"}`}>
                <span className="truncate">{cat.feature_group_id || cat.feature_system_name || "Other"}</span>
                <span className={`text-xs ${selected?.feature_group_id === cat.feature_group_id ? "text-white/70" : "text-[#94a3b8]"}`}>{cat.product_count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-[#1a2b3c]">
                {selected ? (selected.feature_group_id || selected.feature_system_name) : "Select a category"}
              </h2>
              <p className="text-sm text-[#64748b]">{selected ? `${products.length} products` : "Choose from the sidebar"}</p>
            </div>
            {selected && (
              <div className="flex gap-1 bg-[#f5f7fa] p-1 rounded-lg">
                <button onClick={() => setView("grid")} className={`p-2 rounded ${view === "grid" ? "bg-white shadow-sm" : ""}`}>
                  <Grid size={16} className={view === "grid" ? "text-[#0066cc]" : "text-[#94a3b8]"} />
                </button>
                <button onClick={() => setView("list")} className={`p-2 rounded ${view === "list" ? "bg-white shadow-sm" : ""}`}>
                  <List size={16} className={view === "list" ? "text-[#0066cc]" : "text-[#94a3b8]"} />
                </button>
              </div>
            )}
          </div>

          {!selected ? (
            <div className="text-center py-20">
              <FolderOpen className="mx-auto text-[#e2e8f0] mb-4" size={48} />
              <div className="text-[#64748b]">Select a category from the sidebar</div>
            </div>
          ) : loading ? (
            <div className={view === "grid" ? "grid grid-cols-3 gap-4" : "space-y-3"}>
              {[...Array(9)].map((_, i) => (
                <div key={i} className="p-4 bg-white border border-[#e2e8f0] rounded-xl animate-pulse">
                  <div className="h-4 bg-[#e2e8f0] rounded w-24 mb-2" />
                  <div className="h-3 bg-[#f5f7fa] rounded w-full" />
                </div>
              ))}
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-3 gap-4">
              {products.map((p, i) => (
                <Link key={`${p.id}-${i}`} to={`/product-intelligence/${p.supplier_pid}`}
                  className="p-4 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#0066cc] hover:shadow-md transition-all group">
                  <div className="font-mono text-[#0066cc] text-sm mb-2">{p.supplier_pid}</div>
                  <div className="text-sm text-[#64748b] line-clamp-3">{p.description_short}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs ${p.product_status === "active" ? "bg-[#059669]/10 text-[#059669]" : "bg-[#dc2626]/10 text-[#dc2626]"}`}>
                      {p.product_status || "—"}
                    </span>
                    <ChevronRight size={14} className="text-[#94a3b8] group-hover:text-[#0066cc]" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((p, i) => (
                <Link key={`${p.id}-${i}`} to={`/product-intelligence/${p.supplier_pid}`}
                  className="flex items-center justify-between p-4 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#0066cc] transition-all">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[#0066cc]">{p.supplier_pid}</span>
                    <span className="text-sm text-[#64748b] truncate max-w-md">{p.description_short}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${p.product_status === "active" ? "bg-[#059669]/10 text-[#059669]" : "bg-[#dc2626]/10 text-[#dc2626]"}`}>
                    {p.product_status || "—"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
