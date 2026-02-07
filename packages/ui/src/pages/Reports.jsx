import { useState, useEffect } from "react";
import { FileText, Download, Calendar, Clock, Play, Plus, Trash2, BarChart2, PieChart, TrendingUp, Loader2, X, Share2 } from "lucide-react";

const API_BASE = "http://localhost:8766";

const Dialog = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}><div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-gray-900">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>{children}</div></div>);
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [exports, setExports] = useState([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, thisWeek: 0, downloads: 0 });
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newReport, setNewReport] = useState({ name: "", schedule: "Manuell", type: "product" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const data = await (await fetch(`${API_BASE}/api/reports`)).json(); setReports(data.reports || []); setExports(data.exports || []); setStats({ total: data.total, scheduled: data.scheduled, thisWeek: data.thisWeek, downloads: data.downloads }); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const createReport = async () => {
    const res = await fetch(`${API_BASE}/api/reports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newReport) });
    const data = await res.json();
    if (data.success) { setReports([...reports, data.report]); setShowDialog(false); setNewReport({ name: "", schedule: "Manuell", type: "product" }); }
  };

  const deleteReport = async (id) => { await fetch(`${API_BASE}/api/reports/${id}`, { method: "DELETE" }); setReports(reports.filter(r => r.id !== id)); };

  const runReport = async (id) => {
    const res = await fetch(`${API_BASE}/api/reports/${id}/run`, { method: "POST" });
    const data = await res.json();
    if (data.success) { setExports([data.export, ...exports]); fetchData(); }
  };

  const templates = [
    { icon: BarChart2, name: "Produktübersicht", desc: "Vollständiger Katalogstatus", tags: ["Produkte", "Kategorien"] },
    { icon: PieChart, name: "Content Qualität", desc: "Vollständigkeit und Scores", tags: ["Füllgrade", "Bilder"] },
    { icon: TrendingUp, name: "Kanal Performance", desc: "Multi-Channel Analytics", tags: ["Views", "Conversions"] },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#0066cc]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-semibold text-gray-900">Reports & Dashboards</h1><p className="text-sm text-gray-500">Analysen, Exports und automatisierte Reports</p></div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9]"><BarChart2 size={18} /> AI Report</button>
            <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]"><Plus size={18} /> Neuer Report</button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{ label: "Gespeicherte Reports", value: stats.total, Icon: FileText, color: "#7c3aed" }, { label: "Diese Woche erstellt", value: stats.thisWeek, Icon: Calendar, color: "#0066cc" }, { label: "Geplante Reports", value: stats.scheduled, Icon: Clock, color: "#f59e0b" }, { label: "Downloads", value: stats.downloads, Icon: Download, color: "#059669" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2"><s.Icon size={20} style={{ color: s.color }} /><span className="text-xs text-gray-500">{s.label}</span></div>
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Vorlagen</h2>
          <div className="grid grid-cols-3 gap-4">
            {templates.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#7c3aed] cursor-pointer">
                <t.icon size={24} className="text-[#7c3aed] mb-3" /><h3 className="text-gray-900 font-medium mb-1">{t.name}</h3><p className="text-gray-500 text-sm mb-3">{t.desc}</p>
                <div className="flex flex-wrap gap-2">{t.tags.map((tag, j) => <span key={j} className="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded text-xs">{tag}</span>)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gespeicherte Reports</h2>
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 group">
                <div><h3 className="text-gray-900 font-medium">{r.name}</h3><p className="text-gray-500 text-sm">{r.schedule} • Letzter Lauf: {r.lastRun}</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => runReport(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-[#059669] text-white rounded-lg text-sm"><Play size={14} /> Ausführen</button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm"><FileText size={14} /> Anzeigen</button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm"><Share2 size={14} /> Teilen</button>
                  {!r.builtin && <button onClick={() => deleteReport(r.id)} className="p-2 text-red-500 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Letzte Exports</h2>
          <div className="space-y-2">
            {exports.map(e => (
              <div key={e.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-3"><FileText size={18} className="text-gray-400" /><div><p className="text-gray-900 text-sm">{e.name}</p><p className="text-gray-500 text-xs">{e.size} • {e.time}</p></div></div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><Download size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Neuen Report erstellen">
        <div className="space-y-4">
          <div><label className="text-sm text-gray-600 block mb-1">Name</label><input type="text" value={newReport.name} onChange={e => setNewReport({...newReport, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Report Name" /></div>
          <div><label className="text-sm text-gray-600 block mb-1">Zeitplan</label><select value={newReport.schedule} onChange={e => setNewReport({...newReport, schedule: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option>Manuell</option><option>Täglich</option><option>Wöchentlich</option><option>Monatlich</option><option>Quartalsweise</option></select></div>
          <div><label className="text-sm text-gray-600 block mb-1">Typ</label><select value={newReport.type} onChange={e => setNewReport({...newReport, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="product">Produktreport</option><option value="channel">Kanal-Report</option><option value="quality">Qualitätsreport</option><option value="analytics">Analytics</option></select></div>
          <button onClick={createReport} className="w-full py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">Report erstellen</button>
        </div>
      </Dialog>
    </div>
  );
}
