import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Award, FileCheck, Leaf, Shield, Package, Plus, Trash2, X, Loader2,
  CheckCircle, AlertCircle, Clock, Search
} from "lucide-react";

const API_BASE = "http://localhost:8766";

const StatusBadge = ({ status }) => {
  const config = {
    active: { icon: CheckCircle, color: "#059669", label: "Aktiv" },
    warning: { icon: AlertCircle, color: "#f59e0b", label: "Warnung" },
    pending: { icon: Clock, color: "#6b7280", label: "Ausstehend" },
  };
  const c = config[status] || config.pending;
  return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${c.color}15`, color: c.color }}><c.icon size={12} />{c.label}</span>;
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

export default function DPPManagement() {
  const [templates, setTemplates] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", category: "", fields: 10 });
  const [newCert, setNewCert] = useState({ name: "", type: "custom", validUntil: "2026-12-31" });
  const [productId, setProductId] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dpp/templates`);
      const data = await res.json();
      setTemplates(data.templates || []);
      setCertifications(data.certifications || []);
      setStats({ total: data.total, totalProducts: data.totalProducts });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createTemplate = async () => {
    const res = await fetch(`${API_BASE}/api/dpp/templates`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTemplate)
    });
    const data = await res.json();
    if (data.success) { setTemplates([...templates, data.template]); setShowTemplateDialog(false); setNewTemplate({ name: "", category: "", fields: 10 }); }
  };

  const deleteTemplate = async (id) => {
    await fetch(`${API_BASE}/api/dpp/templates/${id}`, { method: "DELETE" });
    setTemplates(templates.filter(t => t.id !== id));
  };

  const createCertification = async () => {
    const res = await fetch(`${API_BASE}/api/dpp/certifications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCert)
    });
    const data = await res.json();
    if (data.success) { setCertifications([...certifications, data.certification]); setShowCertDialog(false); setNewCert({ name: "", type: "custom", validUntil: "2026-12-31" }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#059669] font-medium mb-1">EU Digital Product Passport</div>
            <h1 className="text-xl font-semibold text-gray-900">Digital Product Pass</h1>
            <p className="text-sm text-gray-500">Complete product lifecycle documentation</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <input type="text" value={productId} onChange={e => setProductId(e.target.value)} placeholder="Enter Product ID..."
                className="px-3 py-2 border border-gray-300 rounded-lg w-48" />
              <Link to={`/dpp/${productId || '8735100978'}`} className="px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857]">Find</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2"><FileCheck size={20} className="text-[#059669]" /><span className="text-xs text-gray-500">Templates</span></div>
            <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2"><Package size={20} className="text-[#0066cc]" /><span className="text-xs text-gray-500">Produkte mit DPP</span></div>
            <div className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2"><Award size={20} className="text-[#7c3aed]" /><span className="text-xs text-gray-500">Zertifizierungen</span></div>
            <div className="text-2xl font-semibold text-gray-900">{certifications.length}</div>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">DPP Templates</h2>
            <button onClick={() => setShowTemplateDialog(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#0066cc] text-white rounded-lg text-sm">
              <Plus size={16} /> Neues Template
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t.id} className="p-4 border border-gray-200 rounded-xl group hover:border-[#059669] transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#059669]/10 flex items-center justify-center">
                    <Leaf size={20} className="text-[#059669]" />
                  </div>
                  {!t.builtin && (
                    <button onClick={() => deleteTemplate(t.id)} className="text-red-500 opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <h3 className="font-medium text-gray-900">{t.name}</h3>
                <p className="text-sm text-gray-500">{t.category} • {t.fields} Felder</p>
                <p className="text-xs text-gray-400 mt-1">{t.products} Produkte • {t.compliance}</p>
                {!t.builtin && <span className="text-xs text-blue-500 mt-1 block">Custom</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Zertifizierungen</h2>
            <button onClick={() => setShowCertDialog(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#7c3aed] text-white rounded-lg text-sm">
              <Plus size={16} /> Neue Zertifizierung
            </button>
          </div>
          <div className="space-y-3">
            {certifications.map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center">
                    <Shield size={20} className="text-[#7c3aed]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{c.name}</h3>
                    <p className="text-sm text-gray-500">{c.type} • Gültig bis {c.validUntil}</p>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onClose={() => setShowTemplateDialog(false)} title="Neues DPP Template">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Name</label>
            <input type="text" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Template Name" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Kategorie</label>
            <input type="text" value={newTemplate.category} onChange={e => setNewTemplate({...newTemplate, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="z.B. Wärmepumpen" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Anzahl Felder</label>
            <input type="number" value={newTemplate.fields} onChange={e => setNewTemplate({...newTemplate, fields: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <button onClick={createTemplate} className="w-full py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857]">Template erstellen</button>
        </div>
      </Dialog>

      {/* Certification Dialog */}
      <Dialog open={showCertDialog} onClose={() => setShowCertDialog(false)} title="Neue Zertifizierung">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Name</label>
            <input type="text" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Zertifizierung Name" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Typ</label>
            <select value={newCert.type} onChange={e => setNewCert({...newCert, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="mandatory">Mandatory</option>
              <option value="energy">Energy</option>
              <option value="subsidy">Subsidy</option>
              <option value="environmental">Environmental</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Gültig bis</label>
            <input type="date" value={newCert.validUntil} onChange={e => setNewCert({...newCert, validUntil: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <button onClick={createCertification} className="w-full py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9]">Zertifizierung erstellen</button>
        </div>
      </Dialog>
    </div>
  );
}
