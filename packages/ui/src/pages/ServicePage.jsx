import { useState, useEffect } from "react";
import { MessageSquare, Users, Clock, CheckCircle, Send, AlertCircle, Loader2, Plus, X, Headphones } from "lucide-react";

const API_BASE = "http://localhost:8766";

const StatusBadge = ({ status }) => {
  const config = { open: { color: "#f59e0b", label: "Offen" }, in_progress: { color: "#0066cc", label: "In Bearbeitung" }, resolved: { color: "#059669", label: "Gelöst" } };
  const c = config[status] || config.open;
  return <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${c.color}20`, color: c.color }}>{c.label}</span>;
};

const PriorityBadge = ({ priority }) => {
  const colors = { high: "#dc2626", medium: "#f59e0b", low: "#6b7280" };
  return <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: `${colors[priority]}20`, color: colors[priority] }}>{priority === "high" ? "Hoch" : priority === "medium" ? "Mittel" : "Niedrig"}</span>;
};

const Dialog = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}><div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-gray-900">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>{children}</div></div>);
};

export default function ServicePage() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, avgResponse: "2m", expertsOnline: 0, resolveRate: 0 });
  const [loading, setLoading] = useState(true);
  const [chatQuery, setChatQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: "", priority: "medium", product: "", description: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const data = await (await fetch(`${API_BASE}/api/service/tickets`)).json(); setTickets(data.tickets || []); setStats({ total: data.total, today: data.today, avgResponse: data.avgResponse, expertsOnline: data.expertsOnline, resolveRate: data.resolveRate }); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const createTicket = async () => {
    const res = await fetch(`${API_BASE}/api/service/tickets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTicket) });
    const data = await res.json();
    if (data.success) { setTickets([...tickets, data.ticket]); setShowDialog(false); setNewTicket({ title: "", priority: "medium", product: "", description: "" }); }
  };

  const suggestedQuestions = ["Wärmepumpe für Altbau", "Pufferspeicher für CS7000", "Installation Zubehör", "Ersatzteile Brenner"];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#0066cc]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-semibold text-gray-900">Service</h1><p className="text-sm text-gray-500">RAG-powered Produkt-Assistent</p></div>
          <div className="flex items-center gap-2 text-green-600"><CheckCircle size={16} /> All systems online</div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{ label: "Tickets Heute", value: stats.today, Icon: MessageSquare, color: "#0066cc" }, { label: "Avg. Response", value: stats.avgResponse, Icon: Clock, color: "#f59e0b" }, { label: "Experten Online", value: stats.expertsOnline, Icon: Users, color: "#059669" }, { label: "Resolved", value: stats.resolveRate + "%", Icon: CheckCircle, color: "#059669" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2"><s.Icon size={20} style={{ color: s.color }} /><span className="text-xs text-gray-500">{s.label}</span></div>
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Produkt-Assistent</h2>
            <p className="text-gray-500 mb-4">Willkommen beim Bosch Produkt-Assistenten! Wie kann ich Ihnen helfen?</p>
            <div className="flex flex-wrap gap-2 mb-4">{suggestedQuestions.map((q, i) => <button key={i} onClick={() => setChatQuery(q)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">{q}</button>)}</div>
            <div className="flex gap-2"><input type="text" value={chatQuery} onChange={e => setChatQuery(e.target.value)} placeholder="Ihre Frage eingeben..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" /><button className="px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]"><Send size={18} /></button></div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
              <button onClick={() => setShowDialog(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#0066cc] text-white rounded-lg text-sm"><Plus size={14} /> Neues Ticket</button>
            </div>
            <div className="space-y-3">
              {tickets.map(t => (
                <div key={t.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start mb-2"><h3 className="text-gray-900 font-medium text-sm">{t.title}</h3><StatusBadge status={t.status} /></div>
                  <div className="flex items-center justify-between"><span className="text-gray-500 text-xs">{t.product} • {t.created}</span><PriorityBadge priority={t.priority} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4"><Headphones size={24} className="text-[#0066cc]" /><div><h3 className="text-gray-900 font-semibold">Experten-Chat</h3><p className="text-gray-500 text-sm">Live-Support verfügbar • Wartezeit: ca. 2 min</p></div></div>
            <button className="px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857]">Mit Experten verbinden</button>
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Neues Support Ticket">
        <div className="space-y-4">
          <div><label className="text-sm text-gray-600 block mb-1">Titel</label><input type="text" value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Kurze Beschreibung" /></div>
          <div><label className="text-sm text-gray-600 block mb-1">Produkt</label><input type="text" value={newTicket.product} onChange={e => setNewTicket({...newTicket, product: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="z.B. CS7000iAW" /></div>
          <div><label className="text-sm text-gray-600 block mb-1">Priorität</label><select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="low">Niedrig</option><option value="medium">Mittel</option><option value="high">Hoch</option></select></div>
          <div><label className="text-sm text-gray-600 block mb-1">Beschreibung</label><textarea value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20" placeholder="Details..." /></div>
          <button onClick={createTicket} className="w-full py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">Ticket erstellen</button>
        </div>
      </Dialog>
    </div>
  );
}
