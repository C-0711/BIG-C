import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, TrendingUp, Database, Percent, Search, Activity, PieChart, 
  GitBranch, FileBarChart, Plus, Trash2, X, Loader2, LayoutDashboard
} from "lucide-react";

const API_BASE = "http://localhost:8766";

const Dialog = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newDashboard, setNewDashboard] = useState({ name: "", type: "custom" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, dashRes] = await Promise.all([
        fetch(`${API_BASE}/api/statistics`),
        fetch(`${API_BASE}/api/analytics/dashboards`)
      ]);
      const statsData = await statsRes.json();
      const dashData = await dashRes.json();
      setStats(statsData);
      setDashboards(dashData.dashboards || []);
      setKpis(dashData.kpis || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createDashboard = async () => {
    const res = await fetch(`${API_BASE}/api/analytics/dashboards`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDashboard)
    });
    const data = await res.json();
    if (data.success) { setDashboards([...dashboards, data.dashboard]); setShowDialog(false); setNewDashboard({ name: "", type: "custom" }); }
  };

  const deleteDashboard = async (id) => {
    await fetch(`${API_BASE}/api/analytics/dashboards/${id}`, { method: "DELETE" });
    setDashboards(dashboards.filter(d => d.id !== id));
  };

  const STATS_CONFIG = [
    { key: "products", label: "Products", Icon: Database, color: "#0066cc", getValue: s => s?.total_products?.toLocaleString() || "23,141" },
    { key: "embeddings", label: "Embeddings", Icon: BarChart3, color: "#059669", getValue: s => s?.total_embeddings?.toLocaleString() || "23,141" },
    { key: "relations", label: "Relations", Icon: TrendingUp, color: "#7c3aed", getValue: s => s ? `${(s.total_relationships/1e6).toFixed(0)}M` : "267M" },
    { key: "coverage", label: "Coverage", Icon: Percent, color: "#ea580c", getValue: () => "94%" },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500">Data insights, metrics and reporting</p>
          </div>
          <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">
            <Plus size={18} /> Neues Dashboard
          </button>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS_CONFIG.map(s => (
            <div key={s.key} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <s.Icon size={20} style={{ color: s.color }} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{s.getValue(stats)}</div>
            </div>
          ))}
        </div>

        {/* Dashboards */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboards</h2>
          <div className="grid grid-cols-3 gap-4">
            {dashboards.map(d => (
              <div key={d.id} className="p-4 border border-gray-200 rounded-xl hover:border-[#0066cc] hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0066cc]/10 flex items-center justify-center">
                    <LayoutDashboard size={20} className="text-[#0066cc]" />
                  </div>
                  {!d.builtin && (
                    <button onClick={(e) => { e.stopPropagation(); deleteDashboard(d.id); }} className="text-red-500 opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <h3 className="font-medium text-gray-900">{d.name}</h3>
                <p className="text-sm text-gray-500">{d.widgets} Widgets • {d.lastViewed}</p>
                {!d.builtin && <span className="text-xs text-blue-500 mt-1 block">Custom</span>}
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Quality KPIs</h2>
          <div className="grid grid-cols-2 gap-4">
            {kpis.map(k => (
              <div key={k.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{k.name}</span>
                  <span className={"text-xs px-2 py-1 rounded " + (k.value >= k.target ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600")}>
                    Ziel: {k.target}{k.unit}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-gray-900">{k.value}{k.unit}</span>
                  <TrendingUp size={16} className={k.trend === "up" ? "text-green-500" : "text-gray-400"} />
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0066cc]" style={{ width: `${k.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Neues Dashboard erstellen">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Name</label>
            <input type="text" value={newDashboard.name} onChange={e => setNewDashboard({...newDashboard, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Dashboard Name" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Typ</label>
            <select value={newDashboard.type} onChange={e => setNewDashboard({...newDashboard, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="custom">Custom</option>
              <option value="products">Produkte</option>
              <option value="quality">Qualität</option>
              <option value="channels">Channels</option>
            </select>
          </div>
          <button onClick={createDashboard} className="w-full py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">Dashboard erstellen</button>
        </div>
      </Dialog>
    </div>
  );
}
