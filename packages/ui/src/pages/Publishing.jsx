import { useState, useEffect } from "react";
import { Send, Globe, ShoppingBag, FileText, CheckCircle, AlertCircle, Clock, Plus, Trash2, ExternalLink, Loader2, X } from "lucide-react";

const API_BASE = "http://localhost:8766";

const getChannelIcon = (type) => ({ website: <Globe className="text-blue-500" size={24} />, amazon: <ShoppingBag className="text-orange-500" size={24} />, bmecat: <FileText className="text-green-500" size={24} />, marketplace: <ShoppingBag className="text-purple-500" size={24} /> }[type] || <Send className="text-gray-400" size={24} />);

const StatusBadge = ({ status }) => {
  const config = { active: { icon: CheckCircle, color: "#059669", label: "Aktiv" }, warning: { icon: AlertCircle, color: "#f59e0b", label: "Warnung" }, paused: { icon: Clock, color: "#6b7280", label: "Pausiert" }, success: { icon: CheckCircle, color: "#059669", label: "Erfolgreich" }, partial: { icon: AlertCircle, color: "#f59e0b", label: "Teilweise" }, publishing: { icon: Loader2, color: "#0066cc", label: "Publiziert", spin: true }, queued: { icon: Clock, color: "#6b7280", label: "Warteschlange" } };
  const c = config[status] || config.paused;
  return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${c.color}15`, color: c.color }}><c.icon size={12} className={c.spin ? "animate-spin" : ""} />{c.label}</span>;
};

const Dialog = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}><div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-gray-900">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>{children}</div></div>);
};

export default function Publishing() {
  const [channels, setChannels] = useState([]);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, publications: 0, queueCount: 0, successRate: 0 });
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: "", type: "custom", url: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const data = await (await fetch(`${API_BASE}/api/publishing/channels`)).json(); setChannels(data.channels || []); setQueue(data.queue || []); setHistory(data.history || []); setStats({ total: data.total, publications: data.publications, queueCount: data.queueCount, successRate: data.successRate }); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const createChannel = async () => {
    const res = await fetch(`${API_BASE}/api/publishing/channels`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newChannel) });
    const data = await res.json();
    if (data.success) { setChannels([...channels, data.channel]); setShowDialog(false); setNewChannel({ name: "", type: "custom", url: "" }); }
  };

  const deleteChannel = async (id) => { await fetch(`${API_BASE}/api/publishing/channels/${id}`, { method: "DELETE" }); setChannels(channels.filter(c => c.id !== id)); };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#0066cc]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-semibold text-gray-900">Publishing</h1><p className="text-sm text-gray-500">Multi-Channel Content Distribution</p></div>
          <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]"><Plus size={18} /> Neuer Kanal</button>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{ label: "Kanäle", value: stats.total, Icon: Send, color: "#0066cc" }, { label: "Publikationen", value: stats.publications?.toLocaleString(), Icon: FileText, color: "#7c3aed" }, { label: "In Queue", value: stats.queueCount, Icon: Clock, color: "#f59e0b" }, { label: "Erfolgsrate", value: stats.successRate + "%", Icon: CheckCircle, color: "#059669" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2"><s.Icon size={20} style={{ color: s.color }} /><span className="text-xs text-gray-500">{s.label}</span></div>
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kanäle</h2>
          <div className="grid grid-cols-3 gap-4">
            {channels.map(ch => (
              <div key={ch.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">{getChannelIcon(ch.type)}<div><h3 className="text-gray-900 font-medium">{ch.name}</h3><StatusBadge status={ch.status} /></div></div>
                  {!ch.builtin && <button onClick={() => deleteChannel(ch.id)} className="text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>}
                </div>
                <div className="text-sm text-gray-500 mb-3"><p>Produkte: {ch.products.toLocaleString()}</p><p>Update: {ch.lastUpdate}</p></div>
                <div className="flex gap-2">
                  {ch.url && <a href={ch.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 text-sm"><ExternalLink size={14} /> Öffnen</a>}
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] text-sm"><Send size={14} /> Publizieren</button>
                </div>
                {!ch.builtin && <span className="text-xs text-blue-500 mt-2 block">Custom</span>}
              </div>
            ))}
          </div>
        </div>

        {queue.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Warteschlange <span className="text-gray-500 text-sm">({queue.length} Jobs)</span></h2>
            <div className="space-y-3">
              {queue.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2"><div><h3 className="text-gray-900 font-medium">{item.name}</h3><p className="text-gray-500 text-sm">{item.products} Produkte</p></div><StatusBadge status={item.status} /></div>
                  {item.progress > 0 && <div className="mt-2"><div className="flex justify-between text-xs text-gray-500 mb-1"><span>Fortschritt</span><span>{item.progress}%</span></div><div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-[#0066cc]" style={{ width: `${item.progress}%` }} /></div></div>}
                  <div className="flex gap-2 mt-2">{item.channels.map((ch, i) => <span key={i} className="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded text-xs">{ch}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Letzte Publikationen</h2>
          <div className="space-y-3">
            {history.map(h => (
              <div key={h.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div><h3 className="text-gray-900 font-medium">{h.name}</h3><p className="text-gray-500 text-sm">{h.products} Produkte • {h.time}{h.errors > 0 && <span className="text-red-500"> • {h.errors} Fehler</span>}</p></div>
                <div className="flex items-center gap-3"><div className="flex gap-1">{h.channels.map((ch, i) => <span key={i} className="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded text-xs">{ch}</span>)}</div><StatusBadge status={h.status} /></div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Neuen Kanal hinzufügen">
        <div className="space-y-4">
          <div><label className="text-sm text-gray-600 block mb-1">Name</label><input type="text" value={newChannel.name} onChange={e => setNewChannel({...newChannel, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Kanal Name" /></div>
          <div><label className="text-sm text-gray-600 block mb-1">Typ</label><select value={newChannel.type} onChange={e => setNewChannel({...newChannel, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="custom">Custom</option><option value="website">Website</option><option value="amazon">Amazon</option><option value="marketplace">Marketplace</option><option value="bmecat">BMEcat</option></select></div>
          <div><label className="text-sm text-gray-600 block mb-1">URL (optional)</label><input type="text" value={newChannel.url} onChange={e => setNewChannel({...newChannel, url: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://..." /></div>
          <button onClick={createChannel} className="w-full py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">Kanal hinzufügen</button>
        </div>
      </Dialog>
    </div>
  );
}
