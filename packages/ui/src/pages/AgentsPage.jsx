import { useState, useEffect } from "react";
import { 
  Bot, Play, Pause, CheckCircle, Clock, AlertCircle, Sparkles, 
  FileText, ShoppingBag, Globe, Zap, RefreshCw, ChevronRight,
  Package, Copy, Download, Search, Activity, Loader2
} from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

// Agent Types
const AGENT_TYPES = [
  { 
    id: "amazon", 
    name: "Amazon Listing Agent", 
    desc: "A+ Content, Bullet Points, Keywords",
    icon: ShoppingBag,
    color: "#ff9900",
    outputs: ["Title", "Bullet Points", "A+ Content", "Search Terms"]
  },
  { 
    id: "seo", 
    name: "SEO Content Agent", 
    desc: "Meta descriptions, Long-form content",
    icon: Globe,
    color: "#0066cc",
    outputs: ["Meta Title", "Meta Description", "Product Description", "FAQ"]
  },
  { 
    id: "technical", 
    name: "Technical Writer Agent", 
    desc: "Specs, Datasheets, Documentation",
    icon: FileText,
    color: "#059669",
    outputs: ["Technical Summary", "Specifications", "Installation Notes"]
  },
  { 
    id: "ausschreibung", 
    name: "Ausschreibungs-Agent", 
    desc: "Leistungsverzeichnis, Positionen",
    icon: Zap,
    color: "#7c3aed",
    outputs: ["LV-Position", "Kurztext", "Langtext", "Technische Merkmale"]
  },
];

// Simulated agent runs
const MOCK_RUNS = [
  { id: 1, agent: "amazon", product: "7716161061", status: "completed", created: "10 min ago", outputs: 4 },
  { id: 2, agent: "seo", product: "5236440", status: "running", created: "2 min ago", progress: 65 },
  { id: 3, agent: "ausschreibung", product: "12222017", status: "queued", created: "just now" },
];

// Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    completed: { icon: CheckCircle, color: "#059669", bg: "#059669/10", label: "Completed" },
    running: { icon: Loader2, color: "#0066cc", bg: "#0066cc/10", label: "Running", spin: true },
    queued: { icon: Clock, color: "#94a3b8", bg: "#94a3b8/10", label: "Queued" },
    failed: { icon: AlertCircle, color: "#dc2626", bg: "#dc2626/10", label: "Failed" },
  };
  const c = config[status] || config.queued;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium`} 
          style={{ backgroundColor: `${c.color}15`, color: c.color }}>
      <c.icon size={12} className={c.spin ? "animate-spin" : ""} />
      {c.label}
    </span>
  );
};

// Agent Card
const AgentCard = ({ agent, onRun }) => {
  const Icon = agent.icon;
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${agent.color}15` }}>
          <Icon size={24} style={{ color: agent.color }} />
        </div>
        <button onClick={() => onRun(agent)} 
          className="px-3 py-1.5 bg-[#0066cc] hover:bg-[#0052a3] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5">
          <Play size={12} /> Run
        </button>
      </div>
      <h3 className="font-medium text-[#1a2b3c] mb-1">{agent.name}</h3>
      <p className="text-sm text-[#64748b] mb-3">{agent.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {agent.outputs.map(o => (
          <span key={o} className="px-2 py-0.5 bg-[#f5f7fa] rounded text-[10px] text-[#64748b]">{o}</span>
        ))}
      </div>
    </div>
  );
};

// Run Dialog
const RunDialog = ({ agent, onClose, onSubmit }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${agent.color}15` }}>
              <agent.icon size={20} style={{ color: agent.color }} />
            </div>
            <div>
              <h2 className="font-semibold text-[#1a2b3c]">{agent.name}</h2>
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

          {results.length > 0 && (
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
          )}

          {results.length === 0 && !loading && (
            <div className="text-center py-8 text-[#64748b]">
              <Package className="mx-auto mb-2 text-[#e2e8f0]" size={32} />
              <p className="text-sm">Search for a product to start</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#e2e8f0] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#64748b] hover:text-[#1a2b3c]">
            Cancel
          </button>
          <button onClick={() => selected && onSubmit(selected)} disabled={!selected}
            className="px-6 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2">
            <Sparkles size={16} /> Start Agent
          </button>
        </div>
      </div>
    </div>
  );
};

// Generated Content View
const ContentView = ({ run, onClose }) => {
  const agent = AGENT_TYPES.find(a => a.id === run.agent);
  const [content] = useState({
    "Title": "Bosch Wärmepumpe CS7000iAW - Hocheffiziente Luft-Wasser-Wärmepumpe für Neubau und Sanierung",
    "Bullet Points": `• Höchste Effizienz mit SCOP bis 5,1 für minimale Heizkosten
• Extrem leiser Betrieb ab 35 dB(A) - ideal für Wohngebiete
• Smart Home ready mit Bosch HomeCom Pro App-Steuerung
• Vorlauftemperaturen bis 65°C auch bei -15°C Außentemperatur
• Made in Germany - 5 Jahre Herstellergarantie`,
    "A+ Content": `Die Bosch CS7000iAW setzt neue Maßstäbe in der Wärmepumpentechnologie. Mit ihrer invertergesteuerten Kompressortechnik erreicht sie Spitzenwerte bei der Energieeffizienz und senkt Ihre Heizkosten um bis zu 50% im Vergleich zu konventionellen Heizsystemen.

Das innovative Kältemittel R290 (Propan) ist natürlich und klimafreundlich mit einem GWP von nur 3. Die intelligente Abtauautomatik sorgt auch bei extremen Minusgraden für zuverlässigen Betrieb.`,
    "Search Terms": "wärmepumpe luft wasser, bosch wärmepumpe, heizung wärmepumpe, energieeffiziente heizung, cs7000, förderung wärmepumpe, split wärmepumpe",
    "LV-Position": `01.02.030 Wärmepumpe Luft/Wasser
Bosch CS7000iAW oder gleichwertig
Heizleistung: 7 kW bei A7/W35
SCOP: min. 5,1
Schallleistungspegel: max. 35 dB(A)
inkl. Regelung und Fernbedienung`,
    "Kurztext": "Luft-Wasser-Wärmepumpe, Inverter-Technologie, 7 kW, SCOP 5,1, R290",
    "Langtext": `Luft-Wasser-Wärmepumpe in Split-Bauweise zur Außenaufstellung der Außeneinheit und Innenaufstellung der Inneneinheit. Inverter-geregelte Scroll-Verdichtertechnologie mit stufenloser Leistungsanpassung. Natürliches Kältemittel R290 (Propan). Integrierte Hocheffizienzpumpe. Witterungsgeführte Regelung mit Touchdisplay. App-Anbindung über WLAN. Vorlauftemperatur bis 65°C. Kühlfunktion optional. Schalloptimierter Nachtbetrieb.`,
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${agent?.color}15` }}>
              {agent && <agent.icon size={20} style={{ color: agent.color }} />}
            </div>
            <div>
              <h2 className="font-semibold text-[#1a2b3c]">Generated Content</h2>
              <p className="text-sm text-[#64748b]">Product: {run.product}</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-medium rounded-lg flex items-center gap-2">
            <Download size={16} /> Export All
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
          {agent?.outputs.map(output => (
            <div key={output} className="bg-[#f5f7fa] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[#1a2b3c]">{output}</h3>
                <button className="p-1.5 hover:bg-white rounded transition-colors" title="Copy">
                  <Copy size={14} className="text-[#64748b]" />
                </button>
              </div>
              <p className="text-sm text-[#64748b] whitespace-pre-line">{content[output] || "Content generated..."}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function AgentsPage() {
  const [runs, setRuns] = useState(MOCK_RUNS);
  const [runDialog, setRunDialog] = useState(null);
  const [viewRun, setViewRun] = useState(null);

  const startAgent = (product) => {
    const newRun = {
      id: Date.now(),
      agent: runDialog.id,
      product: product.supplier_pid,
      status: "running",
      created: "just now",
      progress: 0,
    };
    setRuns(prev => [newRun, ...prev]);
    setRunDialog(null);

    // Simulate completion
    setTimeout(() => {
      setRuns(prev => prev.map(r => 
        r.id === newRun.id ? { ...r, status: "completed", outputs: 4 } : r
      ));
    }, 5000);
  };

  const STATS = [
    { label: "Total Runs", value: runs.length.toString(), icon: Bot, color: "#0066cc" },
    { label: "Completed", value: runs.filter(r => r.status === "completed").length.toString(), icon: CheckCircle, color: "#059669" },
    { label: "Running", value: runs.filter(r => r.status === "running").length.toString(), icon: RefreshCw, color: "#7c3aed" },
    { label: "Queued", value: runs.filter(r => r.status === "queued").length.toString(), icon: Clock, color: "#94a3b8" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Agents</h1>
            <p className="text-sm text-[#64748b]">AI-powered content generation workers</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Activity className="text-[#059669]" size={16} />
            {runs.filter(r => r.status === "running").length} agents running
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

        {/* Agent Types */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-[#64748b] uppercase tracking-wider mb-4">Available Agents</h2>
          <div className="grid grid-cols-4 gap-4">
            {AGENT_TYPES.map(agent => (
              <AgentCard key={agent.id} agent={agent} onRun={setRunDialog} />
            ))}
          </div>
        </div>

        {/* Recent Runs */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="font-medium text-[#1a2b3c]">Recent Runs</h2>
            <button className="text-sm text-[#0066cc] hover:underline">View All</button>
          </div>
          <div className="divide-y divide-[#e2e8f0]">
            {runs.map(run => {
              const agent = AGENT_TYPES.find(a => a.id === run.agent);
              return (
                <div key={run.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#f5f7fa] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${agent?.color}15` }}>
                      {agent && <agent.icon size={18} style={{ color: agent.color }} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1a2b3c]">{agent?.name}</span>
                        <StatusBadge status={run.status} />
                      </div>
                      <div className="text-sm text-[#64748b]">
                        Product: <span className="font-mono text-[#0066cc]">{run.product}</span>
                        <span className="mx-2">•</span>
                        {run.created}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {run.status === "running" && (
                      <div className="w-24 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#0066cc] rounded-full animate-pulse" style={{ width: `${run.progress || 50}%` }} />
                      </div>
                    )}
                    {run.status === "completed" && (
                      <button onClick={() => setViewRun(run)}
                        className="px-3 py-1.5 bg-[#f5f7fa] hover:bg-[#e2e8f0] text-sm text-[#64748b] rounded-lg transition-colors flex items-center gap-1.5">
                        View Output <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Run Dialog */}
      {runDialog && <RunDialog agent={runDialog} onClose={() => setRunDialog(null)} onSubmit={startAgent} />}
      
      {/* Content View */}
      {viewRun && <ContentView run={viewRun} onClose={() => setViewRun(null)} />}
    </div>
  );
}
