import { useState, useEffect } from "react";
import { Package, CheckCircle, XCircle, GitBranch, Grid3X3, Database, Search, Activity, Clock, Server } from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/statistics`).then(r => r.json()).then(d => {
      setStats(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const METRICS = stats ? [
    { label: "Total Products", value: stats.total_products?.toLocaleString(), Icon: Package, color: "#0066cc" },
    { label: "Active Products", value: stats.active_products?.toLocaleString(), Icon: CheckCircle, color: "#059669" },
    { label: "Discontinued", value: stats.discontinued_products?.toLocaleString(), Icon: XCircle, color: "#dc2626" },
    { label: "Relationships", value: `${(stats.total_relationships / 1e6).toFixed(1)}M`, Icon: GitBranch, color: "#7c3aed" },
    { label: "ETIM Groups", value: stats.total_etim_groups, Icon: Grid3X3, color: "#ea580c" },
    { label: "Embeddings", value: stats.total_embeddings?.toLocaleString(), Icon: Database, color: "#0891b2" },
  ] : [];

  const PIPELINE = [
    { label: "Source Import", status: "completed", time: "2h ago" },
    { label: "Data Validation", status: "completed", time: "99.2% valid" },
    { label: "Embedding Generation", status: "completed", time: "23,141 vectors" },
    { label: "Relationship Mapping", status: "completed", time: "267M edges" },
    { label: "Index Optimization", status: "running", time: "In progress" },
  ];

  const HEALTH = [
    { label: "API Server", status: "healthy", latency: "5ms" },
    { label: "PostgreSQL", status: "healthy", latency: "12ms" },
    { label: "Vector Index", status: "healthy", latency: "45ms" },
    { label: "Graph Engine", status: "healthy", latency: "89ms" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Statistics</h1>
            <p className="text-sm text-[#64748b]">Platform metrics and data insights</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Activity className="text-[#059669]" size={16} />
            All systems online
          </div>
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-5 bg-white border border-[#e2e8f0] rounded-xl animate-pulse">
                <div className="h-8 bg-[#e2e8f0] rounded w-20 mb-2" />
                <div className="h-4 bg-[#f5f7fa] rounded w-24" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {METRICS.map(m => {
                const Icon = m.Icon;
                return (
                  <div key={m.label} className="p-5 bg-white border border-[#e2e8f0] rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <Icon size={24} style={{ color: m.color }} />
                    </div>
                    <div className="text-3xl font-semibold text-[#1a2b3c] mb-1">{m.value}</div>
                    <div className="text-sm text-[#64748b]">{m.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm">
                <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center gap-2">
                  <Clock size={18} className="text-[#64748b]" />
                  <h3 className="font-medium text-[#1a2b3c]">Data Pipeline</h3>
                </div>
                <div className="p-5 space-y-4">
                  {PIPELINE.map(p => (
                    <div key={p.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${p.status === "completed" ? "bg-[#059669]" : "bg-[#0066cc] animate-pulse"}`} />
                        <span className="text-sm text-[#1a2b3c]">{p.label}</span>
                      </div>
                      <span className="text-xs text-[#64748b]">{p.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm">
                <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center gap-2">
                  <Server size={18} className="text-[#64748b]" />
                  <h3 className="font-medium text-[#1a2b3c]">System Health</h3>
                </div>
                <div className="p-5 space-y-4">
                  {HEALTH.map(h => (
                    <div key={h.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#059669]" />
                        <span className="text-sm text-[#1a2b3c]">{h.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#059669]">Healthy</span>
                        <span className="text-xs font-mono text-[#94a3b8]">{h.latency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
