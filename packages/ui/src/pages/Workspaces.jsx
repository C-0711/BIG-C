import { useState, useEffect } from "react";
import { Folder, Users, MessageSquare, FileText, Star, Plus, Search, Trash2, CheckCircle, Clock, Loader2, X } from "lucide-react";

const API_BASE = "http://localhost:8766";

const StatusBadge = ({ status }) => {
  const config = { active: { color: "#059669", label: "Aktiv" }, completed: { color: "#6b7280", label: "Abgeschlossen" } };
  const c = config[status] || config.active;
  return <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${c.color}20`, color: c.color }}>{c.label}</span>;
};

const Dialog = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-gray-900">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
};

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, messages: 0, files: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: "", desc: "", tags: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await (await fetch(`${API_BASE}/api/workspaces`)).json();
      setWorkspaces(data.workspaces || []); setActivities(data.activities || []);
      setStats({ total: data.total, active: data.active, messages: data.messages, files: data.files });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const createWorkspace = async () => {
    const res = await fetch(`${API_BASE}/api/workspaces`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newWorkspace, tags: newWorkspace.tags.split(",").map(t => t.trim()).filter(Boolean) }) });
    const data = await res.json();
    if (data.success) { setWorkspaces([...workspaces, data.workspace]); setShowDialog(false); setNewWorkspace({ name: "", desc: "", tags: "" }); }
  };

  const deleteWorkspace = async (id) => { await fetch(`${API_BASE}/api/workspaces/${id}`, { method: "DELETE" }); setWorkspaces(workspaces.filter(w => w.id !== id)); };

  const toggleFavorite = async (ws) => {
    const res = await fetch(`${API_BASE}/api/workspaces/${ws.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favorite: !ws.favorite }) });
    const data = await res.json();
    if (data.success) setWorkspaces(workspaces.map(w => w.id === ws.id ? data.workspace : w));
  };

  const filteredWorkspaces = workspaces.filter(w => {
    if (filter === "favorites" && !w.favorite) return false;
    if (filter === "active" && w.status !== "active") return false;
    if (filter === "completed" && w.status !== "completed") return false;
    if (searchQuery && !w.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#0066cc]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-semibold text-gray-900">Workspaces</h1><p className="text-sm text-gray-500">Projekte und Konversationen organisieren</p></div>
          <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857]"><Plus size={18} /> Neuer Workspace</button>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{ label: "Workspaces", value: stats.total, Icon: Folder, color: "#059669" }, { label: "Aktiv", value: stats.active, Icon: CheckCircle, color: "#059669" }, { label: "Nachrichten", value: stats.messages, Icon: MessageSquare, color: "#0066cc" }, { label: "Dateien", value: stats.files, Icon: FileText, color: "#7c3aed" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2"><s.Icon size={20} style={{ color: s.color }} /><span className="text-xs text-gray-500">{s.label}</span></div>
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Workspace suchen..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" /></div>
          <div className="flex gap-2">{["all", "favorites", "active", "completed"].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-sm ${filter === f ? "bg-[#0066cc] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{f === "all" ? "Alle" : f === "favorites" ? "Favoriten" : f === "active" ? "Aktiv" : "Abgeschlossen"}</button>))}</div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            {filteredWorkspaces.map(ws => (
              <div key={ws.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-[#059669] group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3"><Folder size={20} className="text-[#059669]" /><div><h3 className="text-gray-900 font-medium">{ws.name}</h3><p className="text-gray-500 text-sm">{ws.owner}</p></div></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFavorite(ws)} className={ws.favorite ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}><Star size={16} fill={ws.favorite ? "currentColor" : "none"} /></button>
                    {!ws.builtin && <button onClick={() => deleteWorkspace(ws.id)} className="text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>}
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-3">{ws.desc}</p>
                <div className="flex flex-wrap gap-2 mb-3">{ws.tags?.map((tag, i) => <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{tag}</span>)}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-gray-500 text-sm"><span className="flex items-center gap-1"><Users size={14} /> {ws.members}</span><span className="flex items-center gap-1"><MessageSquare size={14} /> {ws.messages}</span><span className="flex items-center gap-1"><FileText size={14} /> {ws.files}</span></div>
                  <StatusBadge status={ws.status} />
                </div>
                {!ws.builtin && <span className="text-xs text-blue-500 mt-2 block">Custom</span>}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Letzte Aktivität</h2>
            <div className="space-y-4">{activities.map(act => { const ws = workspaces.find(w => w.id === act.workspaceId); return (<div key={act.id} className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-medium">{act.user[0]}</div><div><p className="text-gray-600 text-sm"><span className="text-gray-900 font-medium">{act.user}</span> {act.action}</p><p className="text-gray-400 text-xs">{ws?.name || "Workspace"} • {act.time}</p></div></div>); })}</div>
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Neuen Workspace erstellen">
        <div className="space-y-4">
          <div><label className="text-sm text-gray-600 block mb-1">Name</label><input type="text" value={newWorkspace.name} onChange={e => setNewWorkspace({...newWorkspace, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Workspace Name" /></div>
          <div><label className="text-sm text-gray-600 block mb-1">Beschreibung</label><textarea value={newWorkspace.desc} onChange={e => setNewWorkspace({...newWorkspace, desc: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20" placeholder="Beschreibung..." /></div>
          <div><label className="text-sm text-gray-600 block mb-1">Tags (kommagetrennt)</label><input type="text" value={newWorkspace.tags} onChange={e => setNewWorkspace({...newWorkspace, tags: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Tag1, Tag2" /></div>
          <button onClick={createWorkspace} className="w-full py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857]">Workspace erstellen</button>
        </div>
      </Dialog>
    </div>
  );
}
