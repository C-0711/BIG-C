import { useState, useEffect } from "react";
import { Link2, Database, Cloud, ShoppingBag, FileText, RefreshCw, CheckCircle, AlertCircle, Clock, Plus, Trash2, Settings, Loader2, X } from "lucide-react";

const API_BASE = "http://localhost:8766";

const getTypeIcon = (type) => ({ bmecat: <Database className="text-blue-600" size={24} />, amazon: <ShoppingBag className="text-orange-500" size={24} />, sap: <Database className="text-blue-700" size={24} />, cms: <FileText className="text-purple-500" size={24} />, sharepoint: <Cloud className="text-blue-400" size={24} /> }[type] || <Link2 className="text-gray-400" size={24} />);

const StatusBadge = ({ status }) => {
  const config = { connected: { icon: CheckCircle, color: "#059669", label: "Verbunden" }, warning: { icon: AlertCircle, color: "#f59e0b", label: "Warnung" }, pending: { icon: Clock, color: "#6b7280", label: "Ausstehend" } };
  const c = config[status] || config.pending;
  return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${c.color}15`, color: c.color }}><c.icon size={12} />{c.label}</span>;
};

const Dialog = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}><div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-gray-900">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>{children}</div></div>);
};

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [stats, setStats] = useState({ total: 0, connected: 0, records: 0 });
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newIntegration, setNewIntegration] = useState({ name: "", type: "custom" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const data = await (await fetch(`${API_BASE}/api/integrations`)).json(); setIntegrations(data.integrations || []); setStats({ total: data.total, connected: data.connected, records: data.records }); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const createIntegration = async () => {
    const res = await fetch(`${API_BASE}/api/integrations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newIntegration) });
    const data = await res.json();
    if (data.success) { setIntegrations([...integrations, data.integration]); setShowDialog(false); setNewIntegration({ name: "", type: "custom" }); }
  };

  const deleteIntegration = async (id) => { await fetch(`${API_BASE}/api/integrations/${id}`, { method: "DELETE" }); setIntegrations(integrations.filter(i => i.id !== id)); };

  const syncIntegration = async (id) => {
    const res = await fetch(`${API_BASE}/api/integrations/${id}/sync`, { method: "POST" });
    const data = await res.json();
    if (data.success) setIntegrations(integrations.map(i => i.id === id ? data.integration : i));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#0066cc]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-semibold text-gray-900">Integrationen</h1><p className="text-sm text-gray-500">Verbinden Sie externe Systeme und Datenquellen</p></div>
          <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]"><Plus size={18} /> Integration hinzufügen</button>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ label: "Integrationen", value: stats.total, Icon: Link2, color: "#0066cc" }, { label: "Verbunden", value: stats.connected, Icon: CheckCircle, color: "#059669" }, { label: "Datensätze", value: stats.records.toLocaleString(), Icon: Database, color: "#7c3aed" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2"><s.Icon size={20} style={{ color: s.color }} /><span className="text-xs text-gray-500">{s.label}</span></div>
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verbundene Systeme</h2>
          <div className="grid grid-cols-2 gap-4">
            {integrations.map(int => (
              <div key={int.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">{getTypeIcon(int.type)}<div><h3 className="text-gray-900 font-medium">{int.name}</h3><p className="text-gray-500 text-sm capitalize">{int.type}</p></div></div>
                  <StatusBadge status={int.status} />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3"><span>{int.records.toLocaleString()} Datensätze</span><span>Sync: {int.lastSync}</span></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => syncIntegration(int.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"><RefreshCw size={14} /> Sync</button>
                  <button className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"><Settings size={14} /></button>
                  {!int.builtin && <button onClick={() => deleteIntegration(int.id)} className="p-2 bg-white border border-gray-200 text-red-500 rounded-lg hover:bg-gray-50 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>}
                </div>
                {!int.builtin && <span className="text-xs text-blue-500 mt-2 block">Custom</span>}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Neue Integration hinzufügen">
        <div className="space-y-4">
          <div><label className="text-sm text-gray-600 block mb-1">Name</label><input type="text" value={newIntegration.name} onChange={e => setNewIntegration({...newIntegration, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Integration Name" /></div>
          <div><label className="text-sm text-gray-600 block mb-1">Typ</label>
            <select value={newIntegration.type} onChange={e => setNewIntegration({...newIntegration, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="custom">Custom API</option><option value="bmecat">BMEcat</option><option value="amazon">Amazon</option><option value="sap">SAP</option><option value="cms">CMS</option><option value="sharepoint">SharePoint</option></select>
          </div>
          <button onClick={createIntegration} className="w-full py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">Integration hinzufügen</button>
        </div>
      </Dialog>
    </div>
  );
}
