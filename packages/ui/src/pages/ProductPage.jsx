import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Package, CheckCircle, XCircle, Grid3X3, Search, Activity, 
  FolderOpen, Database, GitCompare, Sparkles, Plus, Trash2, X, Loader2, Tag
} from "lucide-react";

const API_BASE = "http://localhost:8766";

const MODULES = [
  { path: "/catalogs", name: "Catalog Browser", desc: "Browse by category and ETIM", Icon: FolderOpen },
  { path: "/products", name: "Product Database", desc: "Full product listing", Icon: Database },
  { path: "/product-comparison", name: "Compare Products", desc: "Side-by-side specs", Icon: GitCompare },
  { path: "/search", name: "Semantic Search", desc: "Natural language queries", Icon: Sparkles },
];

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

export default function ProductPage() {
  const [stats, setStats] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: "", icon: "📁" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, colRes] = await Promise.all([
        fetch(`${API_BASE}/api/statistics`),
        fetch(`${API_BASE}/api/products/collections`)
      ]);
      setStats(await statsRes.json());
      const colData = await colRes.json();
      setCollections(colData.collections || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createCollection = async () => {
    const res = await fetch(`${API_BASE}/api/products/collections`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCollection)
    });
    const data = await res.json();
    if (data.success) { setCollections([...collections, data.collection]); setShowDialog(false); setNewCollection({ name: "", icon: "📁" }); }
  };

  const deleteCollection = async (id) => {
    await fetch(`${API_BASE}/api/products/collections/${id}`, { method: "DELETE" });
    setCollections(collections.filter(c => c.id !== id));
  };

  const STATS_CONFIG = [
    { key: "total", label: "Total Products", Icon: Package, color: "#0066cc", getValue: s => s?.total_products?.toLocaleString() || "23,141" },
    { key: "active", label: "Active", Icon: CheckCircle, color: "#059669", getValue: s => s?.active_products?.toLocaleString() || "21,953" },
    { key: "discontinued", label: "Discontinued", Icon: XCircle, color: "#dc2626", getValue: s => s?.discontinued_products?.toLocaleString() || "1,188" },
    { key: "categories", label: "ETIM Groups", Icon: Grid3X3, color: "#7c3aed", getValue: s => s?.total_etim_groups || "167" },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Product</h1>
            <p className="text-sm text-gray-500">Catalog management and exploration</p>
          </div>
          <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">
            <Plus size={18} /> Neue Kollektion
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

        {/* Modules */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Modules</h2>
          <div className="grid grid-cols-4 gap-4">
            {MODULES.map(m => (
              <Link key={m.path} to={m.path} className="p-5 bg-white border border-gray-200 rounded-xl hover:border-[#0066cc] hover:shadow-md transition-all group shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-[#0066cc]/10">
                  <m.Icon size={20} className="text-gray-500 group-hover:text-[#0066cc]" />
                </div>
                <div className="font-medium text-gray-900 group-hover:text-[#0066cc]">{m.name}</div>
                <div className="text-xs text-gray-500">{m.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Collections */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Produkt-Kollektionen</h2>
          <div className="grid grid-cols-4 gap-4">
            {collections.map(c => (
              <div key={c.id} className="p-4 border border-gray-200 rounded-xl hover:border-[#0066cc] transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">{c.icon}</span>
                  {!c.builtin && (
                    <button onClick={() => deleteCollection(c.id)} className="text-red-500 opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <h3 className="font-medium text-gray-900">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.products} Produkte</p>
                {!c.builtin && <span className="text-xs text-blue-500 mt-1 block">Custom</span>}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Neue Kollektion erstellen">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Name</label>
            <input type="text" value={newCollection.name} onChange={e => setNewCollection({...newCollection, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Kollektion Name" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Icon (Emoji)</label>
            <input type="text" value={newCollection.icon} onChange={e => setNewCollection({...newCollection, icon: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="📁" />
          </div>
          <button onClick={createCollection} className="w-full py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">Kollektion erstellen</button>
        </div>
      </Dialog>
    </div>
  );
}
