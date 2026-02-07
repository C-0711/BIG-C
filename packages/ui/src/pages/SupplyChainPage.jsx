import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, GitBranch, Layers, Network, Search, Activity, Cog, Home, Wrench, Monitor } from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

const FLOW = [
  { name: "Komponenten", Icon: Cog },
  { name: "Systeme", Icon: Home },
  { name: "Zubehoer", Icon: Wrench },
  { name: "Service", Icon: Monitor },
];

const REL_TYPES = [
  { name: "Similar Products", pct: 45 },
  { name: "Compatible With", pct: 28 },
  { name: "Accessories", pct: 18 },
  { name: "Replaced By", pct: 9 },
];

export default function SupplyChainPage() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/statistics`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/api/etim/groups`).then(r => r.json()).then(d => {
      const groups = d.groups || d || [];
      setCategories(groups.slice(0, 5));
    }).catch(() => {});
  }, []);

  const STATS_CONFIG = [
    { label: "Products", value: stats?.total_products?.toLocaleString() || "23,141", Icon: Package, color: "#0066cc" },
    { label: "Relationships", value: stats ? `${(stats.total_relationships / 1e6).toFixed(0)}M` : "267M", Icon: GitBranch, color: "#059669" },
    { label: "Avg. Dependencies", value: stats?.avg_relationships_per_product?.toLocaleString() || "11,574", Icon: Layers, color: "#7c3aed" },
    { label: "Categories", value: stats?.total_etim_groups || "167", Icon: Network, color: "#ea580c" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Supply Chain</h1>
            <p className="text-sm text-[#64748b]">Product dependencies and flow analysis</p>
          </div>
          <form className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
              <input type="text" placeholder="Search supply chain..."
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
          {STATS_CONFIG.map(s => {
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

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
            <h3 className="font-medium text-[#1a2b3c] mb-4">Relationship Types</h3>
            <div className="space-y-4">
              {REL_TYPES.map(r => (
                <div key={r.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#64748b]">{r.name}</span>
                    <span className="text-[#0066cc] font-medium">{r.pct}%</span>
                  </div>
                  <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0066cc] rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
            <h3 className="font-medium text-[#1a2b3c] mb-4">Top Connected Categories</h3>
            <div className="space-y-3">
              {categories.map((c, i) => (
                <div key={c.feature_group_id || i} className="flex items-center justify-between py-2 border-b border-[#e2e8f0] last:border-0">
                  <span className="text-sm text-[#64748b]">{c.feature_group_id || c.feature_system_name || "Unknown"}</span>
                  <span className="text-sm text-[#0066cc] font-medium">{c.product_count?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm mb-6">
          <h3 className="font-medium text-[#1a2b3c] mb-6">Supply Chain Flow</h3>
          <div className="flex items-center justify-between">
            {FLOW.map((f, i) => {
              const Icon = f.Icon;
              return (
                <div key={f.name} className="flex items-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-xl bg-[#f5f7fa] flex items-center justify-center mb-2">
                      <Icon size={28} className="text-[#64748b]" />
                    </div>
                    <div className="text-sm text-[#1a2b3c]">{f.name}</div>
                  </div>
                  {i < FLOW.length - 1 && (
                    <div className="w-24 h-0.5 bg-[#e2e8f0] mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/global-network" className="p-5 bg-white rounded-xl border border-[#e2e8f0] hover:border-[#0066cc] transition-all group shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Network size={20} className="text-[#64748b] group-hover:text-[#0066cc]" />
              <span className="font-medium text-[#1a2b3c] group-hover:text-[#0066cc]">View Network Graph</span>
            </div>
            <p className="text-sm text-[#64748b]">Interactive visualization</p>
          </Link>
          <Link to="/catalog-impact" className="p-5 bg-white rounded-xl border border-[#e2e8f0] hover:border-[#0066cc] transition-all group shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Layers size={20} className="text-[#64748b] group-hover:text-[#0066cc]" />
              <span className="font-medium text-[#1a2b3c] group-hover:text-[#0066cc]">Catalog Impact</span>
            </div>
            <p className="text-sm text-[#64748b]">Coverage analysis</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
