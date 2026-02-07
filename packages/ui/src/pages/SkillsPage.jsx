import { useState, useEffect } from "react";
import { 
  Bot, Play, Pause, CheckCircle, Clock, AlertCircle, Sparkles, 
  FileText, ShoppingBag, Globe, Zap, RefreshCw, ChevronRight,
  Package, Copy, Download, Search, Activity, Loader2, Plus, Trash2,
  Edit, X, Save
} from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

// Icon mapping
const ICONS = {
  ShoppingBag, Globe, FileText, Zap, Sparkles, Bot, Package
};

// Color options
const COLOR_OPTIONS = [
  "#ff9900", "#0066cc", "#059669", "#7c3aed", "#e1306c", 
  "#1a1a1a", "#6366f1", "#ec4899", "#f59e0b", "#10b981"
];

// Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    completed: { icon: CheckCircle, color: "#059669", label: "Completed" },
    running: { icon: Loader2, color: "#0066cc", label: "Running", spin: true },
    queued: { icon: Clock, color: "#94a3b8", label: "Queued" },
    failed: { icon: AlertCircle, color: "#dc2626", label: "Failed" },
  };
  const c = config[status] || config.queued;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium" 
          style={{ backgroundColor: `${c.color}15`, color: c.color }}>
      <c.icon size={12} className={c.spin ? "animate-spin" : ""} />
      {c.label}
    </span>
  );
};

// Skill Card
const SkillCard = ({ skill, onRun, onEdit, onDelete }) => {
  const Icon = ICONS[skill.icon] || Sparkles;
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm hover:shadow-md hover:border-[#0066cc] transition-all group relative">
      {!skill.builtin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(skill)} className="p-1.5 hover:bg-[#f5f7fa] rounded" title="Bearbeiten">
            <Edit size={14} className="text-[#64748b]" />
          </button>
          <button onClick={() => onDelete(skill.id)} className="p-1.5 hover:bg-red-50 rounded" title="Löschen">
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${skill.color}15` }}>
          <Icon size={24} style={{ color: skill.color }} />
        </div>
        <button onClick={() => onRun(skill)} 
          className="px-3 py-1.5 bg-[#0066cc] hover:bg-[#0052a3] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100">
          <Play size={12} /> Starten
        </button>
      </div>
      <h3 className="font-medium text-[#1a2b3c] mb-1">{skill.name}</h3>
      <p className="text-sm text-[#64748b] mb-3">{skill.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {skill.outputs?.map(o => (
          <span key={o} className="px-2 py-0.5 bg-[#f5f7fa] rounded text-[10px] text-[#64748b]">{o}</span>
        ))}
      </div>
      {!skill.builtin && (
        <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
          <span className="text-[10px] text-[#94a3b8]">Custom Skill</span>
        </div>
      )}
    </div>
  );
};

// Create/Edit Skill Dialog
const SkillDialog = ({ skill, onClose, onSave }) => {
  const [name, setName] = useState(skill?.name || "");
  const [desc, setDesc] = useState(skill?.desc || "");
  const [icon, setIcon] = useState(skill?.icon || "Sparkles");
  const [color, setColor] = useState(skill?.color || "#6366f1");
  const [outputs, setOutputs] = useState(skill?.outputs?.join(", ") || "");
  const [prompt, setPrompt] = useState(skill?.prompt || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const data = {
      name,
      desc,
      icon,
      color,
      outputs: outputs.split(",").map(o => o.trim()).filter(Boolean),
      prompt
    };
    await onSave(data, skill?.id);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 className="font-semibold text-[#1a2b3c] text-lg">
            {skill ? "Skill bearbeiten" : "Neuen Skill erstellen"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f7fa] rounded-lg">
            <X size={20} className="text-[#64748b]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a2b3c] mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="z.B. E-Mail Redakteur"
              className="w-full px-4 py-2.5 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm focus:border-[#0066cc] focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a2b3c] mb-1">Beschreibung</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Was macht dieser Skill?"
              className="w-full px-4 py-2.5 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm focus:border-[#0066cc] focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a2b3c] mb-1">Icon</label>
              <select value={icon} onChange={e => setIcon(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm focus:border-[#0066cc] focus:outline-none">
                {Object.keys(ICONS).map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2b3c] mb-1">Farbe</label>
              <div className="flex gap-1 flex-wrap">
                {COLOR_OPTIONS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-[#1a2b3c]" : "border-transparent"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a2b3c] mb-1">Output-Felder (kommagetrennt)</label>
            <input type="text" value={outputs} onChange={e => setOutputs(e.target.value)}
              placeholder="z.B. Betreff, E-Mail Text, Signatur"
              className="w-full px-4 py-2.5 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm focus:border-[#0066cc] focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a2b3c] mb-1">AI Prompt (optional)</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="Spezielle Anweisungen für die KI..."
              rows={3}
              className="w-full px-4 py-2.5 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm focus:border-[#0066cc] focus:outline-none resize-none" />
          </div>
        </div>

        <div className="p-6 border-t border-[#e2e8f0] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#64748b] hover:text-[#1a2b3c]">
            Abbrechen
          </button>
          <button onClick={handleSave} disabled={!name || saving}
            className="px-6 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

// Run Dialog
const RunDialog = ({ skill, onClose, onSubmit }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const Icon = ICONS[skill.icon] || Sparkles;

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 6 })
      });
      const data = await res.json();
      setResults(data.products || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${skill.color}15` }}>
              <Icon size={20} style={{ color: skill.color }} />
            </div>
            <div>
              <h2 className="font-semibold text-[#1a2b3c]">{skill.name}</h2>
              <p className="text-sm text-[#64748b]">Select a product to process</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} 
                onKeyDown={e => e.key === "Enter" && search()}
                placeholder="Search product..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:outline-none" />
            </div>
            <button onClick={search} disabled={loading}
              className="px-4 py-2.5 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
            </button>
          </div>

          {results.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((p, i) => (
                <button key={`${p.id}-${i}`} onClick={() => setSelected(p)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selected?.supplier_pid === p.supplier_pid 
                      ? "bg-[#0066cc]/10 border-2 border-[#0066cc]" 
                      : "bg-[#f5f7fa] hover:bg-[#e2e8f0] border-2 border-transparent"
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[#0066cc] font-medium text-sm">{p.supplier_pid}</span>
                    {selected?.supplier_pid === p.supplier_pid && <CheckCircle size={16} className="text-[#0066cc]" />}
                  </div>
                  <p className="text-xs text-[#64748b] line-clamp-1">{p.description_short}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#64748b]">
              <Package className="mx-auto mb-2 text-[#e2e8f0]" size={32} />
              <p className="text-sm">Search for a product to start</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#e2e8f0] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#64748b] hover:text-[#1a2b3c]">Cancel</button>
          <button onClick={() => selected && onSubmit(selected)} disabled={!selected}
            className="px-6 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2">
            <Sparkles size={16} /> Start Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [runs, setRuns] = useState([]);
  const [runDialog, setRunDialog] = useState(null);
  const [skillDialog, setSkillDialog] = useState(null);
  const [editSkill, setEditSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load skills from API
  useEffect(() => {
    loadSkills();
    loadRuns();
  }, []);

  const loadSkills = async () => {
    try {
      const res = await fetch(`${API}/api/skills`);
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (e) {
      console.error("Failed to load skills:", e);
      // Fallback to built-in skills
      setSkills([
        { id: "amazon", name: "Amazon Redakteur", desc: "A+ Content, Bullet Points, Keywords", icon: "ShoppingBag", color: "#ff9900", outputs: ["Title", "Bullet Points", "A+ Content", "Search Terms"], builtin: true },
        { id: "seo", name: "SEO Redakteur", desc: "Meta descriptions, Long-form content", icon: "Globe", color: "#0066cc", outputs: ["Meta Title", "Meta Description", "Product Description", "FAQ"], builtin: true },
        { id: "technical", name: "Technischer Redakteur", desc: "Specs, Datasheets, Dokumentation", icon: "FileText", color: "#059669", outputs: ["Technical Summary", "Specifications", "Installation Notes"], builtin: true },
        { id: "ausschreibung", name: "Ausschreibungs-Redakteur", desc: "Leistungsverzeichnis, LV-Positionen", icon: "Zap", color: "#7c3aed", outputs: ["LV-Position", "Kurztext", "Langtext", "Technische Merkmale"], builtin: true },
        { id: "social", name: "Social Media Redakteur", desc: "LinkedIn, Instagram, Facebook Posts", icon: "Globe", color: "#e1306c", outputs: ["LinkedIn Post", "Instagram Caption", "Facebook Post", "Hashtags"], builtin: true },
        { id: "presse", name: "Presse Redakteur", desc: "Pressemitteilungen, News Articles", icon: "FileText", color: "#1a1a1a", outputs: ["Headline", "Teaser", "Pressemitteilung", "Boilerplate"], builtin: true },
      ]);
    }
    setLoading(false);
  };

  const loadRuns = async () => {
    try {
      const res = await fetch(`${API}/api/skills/runs`);
      const data = await res.json();
      setRuns(data.runs || []);
    } catch (e) {
      // Use mock data
      setRuns([
        { id: 1, skillId: "amazon", productId: "7716161061", status: "completed", createdAt: "10 min ago" },
        { id: 2, skillId: "seo", productId: "5236440", status: "running", createdAt: "2 min ago" },
        { id: 3, skillId: "ausschreibung", productId: "12222017", status: "queued", createdAt: "just now" },
      ]);
    }
  };

  const saveSkill = async (data, skillId) => {
    try {
      if (skillId) {
        await fetch(`${API}/api/skills/${skillId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      } else {
        await fetch(`${API}/api/skills`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      }
      await loadSkills();
      setSkillDialog(null);
      setEditSkill(null);
    } catch (e) {
      console.error("Failed to save skill:", e);
    }
  };

  const deleteSkill = async (skillId) => {
    if (!confirm("Skill wirklich löschen?")) return;
    try {
      await fetch(`${API}/api/skills/${skillId}`, { method: "DELETE" });
      await loadSkills();
    } catch (e) {
      console.error("Failed to delete skill:", e);
    }
  };

  const startSkill = async (product) => {
    const newRun = {
      id: Date.now(),
      skillId: runDialog.id,
      productId: product.supplier_pid,
      status: "running",
      createdAt: "just now",
    };
    setRuns(prev => [newRun, ...prev]);
    setRunDialog(null);

    // Call API
    try {
      await fetch(`${API}/api/skills/runs`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: runDialog.id, productId: product.supplier_pid })
      });
    } catch (e) {}

    // Simulate completion
    setTimeout(() => {
      setRuns(prev => prev.map(r => 
        r.id === newRun.id ? { ...r, status: "completed" } : r
      ));
    }, 5000);
  };

  const STATS = [
    { label: "Skills", value: skills.length.toString(), icon: Bot, color: "#0066cc" },
    { label: "Completed", value: runs.filter(r => r.status === "completed").length.toString(), icon: CheckCircle, color: "#059669" },
    { label: "Running", value: runs.filter(r => r.status === "running").length.toString(), icon: RefreshCw, color: "#7c3aed" },
    { label: "Queued", value: runs.filter(r => r.status === "queued").length.toString(), icon: Clock, color: "#94a3b8" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Skills</h1>
            <p className="text-sm text-[#64748b]">Spezialisierte Redakteure für Content-Generierung</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#64748b]">
              <Activity className="text-[#059669]" size={16} />
              {runs.filter(r => r.status === "running").length} Redakteure aktiv
            </div>
            <button onClick={() => setSkillDialog(true)}
              className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-medium rounded-lg flex items-center gap-2">
              <Plus size={16} /> Neuer Skill
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS.map(s => {
            const Icon = s.icon;
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

        {/* Skill Types */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-[#64748b] uppercase tracking-wider mb-4">Verfügbare Redakteure</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[#0066cc]" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {skills.map(skill => (
                <SkillCard key={skill.id} skill={skill} onRun={setRunDialog} 
                  onEdit={s => { setEditSkill(s); setSkillDialog(true); }}
                  onDelete={deleteSkill} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Runs */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="font-medium text-[#1a2b3c]">Recent Runs</h2>
            <button className="text-sm text-[#0066cc] hover:underline">View All</button>
          </div>
          <div className="divide-y divide-[#e2e8f0]">
            {runs.map(run => {
              const skill = skills.find(s => s.id === run.skillId);
              const Icon = ICONS[skill?.icon] || Sparkles;
              return (
                <div key={run.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#f5f7fa] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${skill?.color || "#6366f1"}15` }}>
                      <Icon size={18} style={{ color: skill?.color || "#6366f1" }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1a2b3c]">{skill?.name || "Unknown"}</span>
                        <StatusBadge status={run.status} />
                      </div>
                      <div className="text-sm text-[#64748b]">
                        Product: <span className="font-mono text-[#0066cc]">{run.productId}</span>
                        <span className="mx-2">•</span>
                        {run.createdAt}
                      </div>
                    </div>
                  </div>
                  {run.status === "completed" && (
                    <button className="px-3 py-1.5 bg-[#f5f7fa] hover:bg-[#e2e8f0] text-sm text-[#64748b] rounded-lg transition-colors flex items-center gap-1.5">
                      View Output <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Run Dialog */}
      {runDialog && <RunDialog skill={runDialog} onClose={() => setRunDialog(null)} onSubmit={startSkill} />}
      
      {/* Create/Edit Skill Dialog */}
      {skillDialog && <SkillDialog skill={editSkill} onClose={() => { setSkillDialog(null); setEditSkill(null); }} onSave={saveSkill} />}
    </div>
  );
}
