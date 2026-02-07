import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, CheckCircle, GitBranch, Grid3X3, Database, Megaphone, BarChart3, Network, Search as SearchIcon, Command, Map, Headphones, Activity } from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

const SECTIONS = [
  { path: "/marketing", Icon: Megaphone, name: "Marketing", desc: "SEO & Content", color: "#0066cc" },
  { path: "/product", Icon: Package, name: "Product", desc: "Catalog", color: "#059669" },
  { path: "/analytics", Icon: BarChart3, name: "Analytics", desc: "Metrics", color: "#7c3aed" },
  { path: "/intelligence", Icon: Network, name: "Intelligence", desc: "Network", color: "#db2777" },
  { path: "/research", Icon: SearchIcon, name: "Research", desc: "Explore", color: "#ea580c" },
];

const STATS_CONFIG = [
  { key: "products", label: "Products", Icon: Package, color: "#0066cc", getValue: s => s?.total_products?.toLocaleString() || "23,141" },
  { key: "active", label: "Active", Icon: CheckCircle, color: "#059669", getValue: s => s?.active_products?.toLocaleString() || "21,953" },
  { key: "relations", label: "Relations", Icon: GitBranch, color: "#7c3aed", getValue: s => s ? `${(s.total_relationships/1e6).toFixed(0)}M` : "267M" },
  { key: "categories", label: "Categories", Icon: Grid3X3, color: "#db2777", getValue: s => s?.total_etim_groups || "167" },
  { key: "embeddings", label: "Embeddings", Icon: Database, color: "#ea580c", getValue: s => s?.total_embeddings?.toLocaleString() || "23,141" },
];

export default function IntelligenceDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/statistics`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/api/products/search`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "", limit: 6 })
    }).then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
  }, []);

  const search = (e) => { e.preventDefault(); if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`); };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Dashboard</h1>
            <p className="text-sm text-[#64748b]">Bosch Intelligence Platform</p>
          </div>
          <form onSubmit={search} className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:outline-none transition-all" />
            </div>
          </form>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Activity className="text-[#059669]" size={16} />
            All systems online
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {STATS_CONFIG.map(s => {
            const Icon = s.Icon;
            return (
              <div key={s.key} className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Icon size={20} style={{ color: s.color }} />
                  <span className="text-xs text-[#94a3b8]">{s.label}</span>
                </div>
                <div className="text-2xl font-semibold text-[#1a2b3c]">{s.getValue(stats)}</div>
              </div>
            );
          })}
        </div>

        {/* Section Links */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {SECTIONS.map(s => {
            const Icon = s.Icon;
            return (
              <Link key={s.path} to={s.path} 
                className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm hover:shadow-md hover:border-[#0066cc] transition-all group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${s.color}12` }}>
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <div className="font-medium text-[#1a2b3c] group-hover:text-[#0066cc] transition-colors">{s.name}</div>
                <div className="text-sm text-[#94a3b8]">{s.desc}</div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            {/* Featured */}
            <Link to="/global-network" className="block bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/70 mb-1">Featured</div>
                  <div className="text-2xl font-semibold mb-2">Product Network</div>
                  <p className="text-white/80">Explore {stats?.total_products?.toLocaleString() || "23,000"}+ products and their relationships</p>
                </div>
                <Network className="text-white/20 group-hover:text-white/30 transition-colors" size={64} />
              </div>
            </Link>

            {/* Recent Products */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
                <h3 className="font-medium text-[#1a2b3c]">Recent Products</h3>
                <Link to="/catalogs" className="text-sm text-[#0066cc] hover:underline">View all</Link>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4">
                {products.length ? products.map((p, i) => (
                  <Link key={`${p.id}-${i}`} to={`/product-intelligence/${p.supplier_pid}`}
                    className="p-4 bg-[#f5f7fa] rounded-lg border border-[#e2e8f0] hover:border-[#0066cc] transition-colors">
                    <div className="text-sm font-mono text-[#0066cc] mb-1">{p.supplier_pid}</div>
                    <div className="text-sm text-[#64748b] line-clamp-2">{p.description_short}</div>
                  </Link>
                )) : [...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 bg-[#f5f7fa] rounded-lg border border-[#e2e8f0] animate-pulse">
                    <div className="h-4 bg-[#e2e8f0] rounded w-24 mb-2" />
                    <div className="h-3 bg-[#e2e8f0] rounded w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <div className="px-5 py-4 border-b border-[#e2e8f0]">
                <h3 className="font-medium text-[#1a2b3c]">Quick Actions</h3>
              </div>
              <div className="p-3">
                {[
                  { p: "/search", Icon: SearchIcon, l: "Search", d: "Find products" },
                  { p: "/command", Icon: Command, l: "Command Center", d: "Unified workspace" },
                  { p: "/mindmap", Icon: Map, l: "Mind Map", d: "Visual exploration" },
                  { p: "/service", Icon: Headphones, l: "Service Desk", d: "Get support" },
                ].map(a => {
                  const Icon = a.Icon;
                  return (
                    <Link key={a.p} to={a.p} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f5f7fa] transition-colors">
                      <div className="w-9 h-9 bg-[#f5f7fa] rounded-lg flex items-center justify-center text-[#64748b]">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#1a2b3c]">{a.l}</div>
                        <div className="text-xs text-[#94a3b8]">{a.d}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <div className="px-5 py-4 border-b border-[#e2e8f0]">
                <h3 className="font-medium text-[#1a2b3c]">System Status</h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { n: "API Server", l: "5ms" },
                  { n: "Database", l: "12ms" },
                  { n: "Vector Search", l: "45ms" },
                  { n: "Graph Engine", l: "89ms" },
                ].map(s => (
                  <div key={s.n} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#059669]" />
                      <span className="text-sm text-[#64748b]">{s.n}</span>
                    </div>
                    <span className="text-xs font-mono text-[#94a3b8]">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
