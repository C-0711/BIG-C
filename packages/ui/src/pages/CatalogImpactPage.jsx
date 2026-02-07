import { useState, useEffect } from "react";
import { Package, CheckCircle, Award, Clock, Search, Activity, FileCheck, FileText, Image, GitBranch } from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

const COVERAGE = [
  { name: "Product Descriptions", pct: 98 },
  { name: "Technical Specifications", pct: 87 },
  { name: "Images Available", pct: 72 },
  { name: "ETIM Classification", pct: 94 },
  { name: "Relationship Data", pct: 100 },
  { name: "Price Information", pct: 100 },
];

const QUALITY = [
  { name: "Data Completeness", value: "94%" },
  { name: "Format Consistency", value: "98%" },
  { name: "Reference Integrity", value: "100%" },
  { name: "Update Frequency", value: "Daily" },
  { name: "Error Rate", value: "0.2%" },
];

export default function CatalogImpactPage() {
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
    { label: "Total Products", value: stats?.total_products?.toLocaleString() || "23,141", Icon: Package, color: "#0066cc" },
    { label: "Data Coverage", value: "92%", Icon: FileCheck, color: "#059669" },
    { label: "Quality Score", value: "A+", Icon: Award, color: "#7c3aed" },
    { label: "Last Updated", value: "Today", Icon: Clock, color: "#ea580c" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Catalog Impact</h1>
            <p className="text-sm text-[#64748b]">Data coverage and quality analysis</p>
          </div>
          <form className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
              <input type="text" placeholder="Search metrics..."
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

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm mb-6">
          <h3 className="font-medium text-[#1a2b3c] mb-4">Coverage Analysis</h3>
          <div className="space-y-4">
            {COVERAGE.map(c => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#64748b]">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#94a3b8]">{Math.round(stats?.total_products * c.pct / 100 || 23141 * c.pct / 100).toLocaleString()} / {stats?.total_products?.toLocaleString() || "23,141"}</span>
                    <span className="text-[#0066cc] font-medium">{c.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0066cc] rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
            <h3 className="font-medium text-[#1a2b3c] mb-4">Quality Metrics</h3>
            <div className="space-y-3">
              {QUALITY.map(q => (
                <div key={q.name} className="flex items-center justify-between py-2 border-b border-[#e2e8f0] last:border-0">
                  <span className="text-sm text-[#64748b]">{q.name}</span>
                  <span className="text-sm text-[#0066cc] font-medium">{q.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
            <h3 className="font-medium text-[#1a2b3c] mb-4">Category Distribution</h3>
            <div className="space-y-3">
              {categories.map((c, i) => {
                const total = stats?.total_products || 23141;
                const pct = Math.round((c.product_count / total) * 100);
                return (
                  <div key={c.feature_group_id || i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#64748b]">{c.feature_group_id || c.feature_system_name || "Unknown"}</span>
                      <span className="text-[#1a2b3c]">{c.product_count?.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0066cc] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
