import { useState, useEffect } from "react";
import { 
  Database, Search, Upload, FileText, Folder, Tag, Clock, 
  Plus, Trash2, BookOpen, Brain, CheckCircle, AlertCircle, Loader2,
  File, FileSpreadsheet, Link2, RefreshCw, X
} from "lucide-react";

const API_BASE = "http://localhost:8766";

const StatusBadge = ({ status }) => {
  const config = {
    indexed: { icon: CheckCircle, color: "#059669", label: "Indexiert" },
    processing: { icon: Loader2, color: "#0066cc", label: "Verarbeitung", spin: true },
    active: { icon: CheckCircle, color: "#059669", label: "Aktiv" },
    paused: { icon: Clock, color: "#94a3b8", label: "Pausiert" },
  };
  const c = config[status] || config.indexed;
  return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${c.color}15`, color: c.color }}><c.icon size={12} className={c.spin ? "animate-spin" : ""} />{c.label}</span>;
};

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

export default function KnowledgeBase() {
  const [collections, setCollections] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: "", icon: "📁", color: "#6b7280" });
  const [newSource, setNewSource] = useState({ name: "", type: "custom", url: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [colRes, srcRes] = await Promise.all([
        fetch(`${API_BASE}/api/knowledge/collections`),
        fetch(`${API_BASE}/api/knowledge/sources`)
      ]);
      setCollections((await colRes.json()).collections || []);
      setSources((await srcRes.json()).sources || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setSearchResults([
        { doc: "CS7000iAW_Datenblatt.pdf", chunk: "Die Bosch CS7000iAW erreicht einen SCOP von bis zu 5,1...", score: 0.94, page: 3 },
        { doc: "Installationsanleitung_Logamax.pdf", chunk: "Bei der Installation ist auf ausreichenden Abstand zu achten...", score: 0.78, page: 12 },
      ]);
      setSearching(false);
    }, 1500);
  };

  const createCollection = async () => {
    const res = await fetch(`${API_BASE}/api/knowledge/collections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCollection) });
    const data = await res.json();
    if (data.success) { setCollections([...collections, data.collection]); setShowCollectionDialog(false); setNewCollection({ name: "", icon: "📁", color: "#6b7280" }); }
  };

  const deleteCollection = async (id) => {
    await fetch(`${API_BASE}/api/knowledge/collections/${id}`, { method: "DELETE" });
    setCollections(collections.filter(c => c.id !== id));
  };

  const createSource = async () => {
    const res = await fetch(`${API_BASE}/api/knowledge/sources`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSource) });
    const data = await res.json();
    if (data.success) { setSources([...sources, data.source]); setShowSourceDialog(false); setNewSource({ name: "", type: "custom", url: "" }); }
  };

  const deleteSource = async (id) => {
    await fetch(`${API_BASE}/api/knowledge/sources/${id}`, { method: "DELETE" });
    setSources(sources.filter(s => s.id !== id));
  };

  const totalDocs = collections.reduce((sum, c) => sum + c.docs, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#0066cc]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Knowledge Base</h1>
            <p className="text-sm text-gray-500">RAG-fähige Wissensdatenbank für Produktinformationen</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCollectionDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]"><Plus size={18} /> Neue Collection</button>
            <button onClick={() => setShowSourceDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857]"><Link2 size={18} /> Neue Quelle</button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{ label: "Dokumente", value: totalDocs.toLocaleString(), Icon: FileText, color: "#0066cc" },
            { label: "Collections", value: collections.length, Icon: Folder, color: "#7c3aed" },
            { label: "Quellen", value: sources.length, Icon: Database, color: "#059669" },
            { label: "Vektoren", value: "2.4M", Icon: Brain, color: "#f59e0b" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2"><s.Icon size={20} style={{ color: s.color }} /><span className="text-xs text-gray-500">{s.label}</span></div>
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Brain className="text-[#7c3aed]" size={20} /> Semantische Suche</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Fragen Sie die Wissensdatenbank..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#0066cc] focus:outline-none" />
            </div>
            <button onClick={handleSearch} disabled={searching} className="px-6 py-3 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] disabled:opacity-50">
              {searching ? <Loader2 className="animate-spin" size={20} /> : "Suchen"}
            </button>
          </div>
          {searchResults && (
            <div className="mt-4 space-y-3">
              {searchResults.map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-900 font-medium">{r.doc}</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">Score: {r.score}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{r.chunk}</p>
                  <p className="text-gray-400 text-xs mt-2">Seite {r.page}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collections */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Collections</h2>
          <div className="grid grid-cols-3 gap-4">
            {collections.map(col => (
              <div key={col.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#0066cc] cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{col.icon}</span>
                    <div><h3 className="text-gray-900 font-medium">{col.name}</h3><p className="text-gray-500 text-sm">{col.docs.toLocaleString()} Dokumente</p></div>
                  </div>
                  {!col.builtin && <button onClick={() => deleteCollection(col.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={16} /></button>}
                </div>
                <p className="text-gray-400 text-xs mt-2">Aktualisiert {col.updated}</p>
                {!col.builtin && <span className="text-xs text-blue-500 mt-1 block">Custom</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datenquellen</h2>
          <div className="space-y-3">
            {sources.map(src => (
              <div key={src.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 group">
                <div className="flex items-center gap-4">
                  <Database size={20} className="text-[#0066cc]" />
                  <div><h3 className="text-gray-900 font-medium">{src.name}</h3><p className="text-gray-500 text-sm">{src.docs.toLocaleString()} Dokumente • Sync {src.lastSync}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={src.status} />
                  {!src.builtin && <button onClick={() => deleteSource(src.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={16} /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={showCollectionDialog} onClose={() => setShowCollectionDialog(false)} title="Neue Collection erstellen">
        <div className="space-y-4">
          <div><label className="text-sm text-gray-600 block mb-1">Name</label><input type="text" value={newCollection.name} onChange={e => setNewCollection({...newCollection, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Collection Name" /></div>
          <div><label className="text-sm text-gray-600 block mb-1">Icon (Emoji)</label><input type="text" value={newCollection.icon} onChange={e => setNewCollection({...newCollection, icon: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
          <button onClick={createCollection} className="w-full py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">Collection erstellen</button>
        </div>
      </Dialog>

      <Dialog open={showSourceDialog} onClose={() => setShowSourceDialog(false)} title="Neue Datenquelle hinzufügen">
        <div className="space-y-4">
          <div><label className="text-sm text-gray-600 block mb-1">Name</label><input type="text" value={newSource.name} onChange={e => setNewSource({...newSource, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Quelle Name" /></div>
          <div><label className="text-sm text-gray-600 block mb-1">Typ</label>
            <select value={newSource.type} onChange={e => setNewSource({...newSource, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="custom">Custom</option><option value="api">API</option><option value="sharepoint">SharePoint</option><option value="gdrive">Google Drive</option><option value="crawler">Web Crawler</option>
            </select>
          </div>
          <button onClick={createSource} className="w-full py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857]">Quelle hinzufügen</button>
        </div>
      </Dialog>
    </div>
  );
}
