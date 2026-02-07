import { useState, useEffect } from "react";
import { Zap, Clock, Play, Pause, CheckCircle, AlertCircle, Plus, Trash2, RefreshCw, Loader2, X } from "lucide-react";

const API_BASE = "http://localhost:8766";

const StatusBadge = ({ status }) => {
  const config = {
    active: { icon: CheckCircle, color: "#059669", label: "Aktiv" },
    paused: { icon: Pause, color: "#94a3b8", label: "Pausiert" },
    running: { icon: Loader2, color: "#0066cc", label: "Läuft", spin: true },
  };
  const c = config[status] || config.active;
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

export default function AutomationHub() {
  const [jobs, setJobs] = useState([]);
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, successRate: 0 });
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newJob, setNewJob] = useState({ name: "", schedule: "Täglich 09:00", action: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, runsRes] = await Promise.all([fetch(`${API_BASE}/api/automation/jobs`), fetch(`${API_BASE}/api/automation/runs`)]);
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs || []);
      setRuns((await runsRes.json()).runs || []);
      setStats({ total: jobsData.total, active: jobsData.active, successRate: jobsData.successRate });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createJob = async () => {
    const res = await fetch(`${API_BASE}/api/automation/jobs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newJob) });
    const data = await res.json();
    if (data.success) { setJobs([...jobs, data.job]); setShowDialog(false); setNewJob({ name: "", schedule: "Täglich 09:00", action: "" }); }
  };

  const deleteJob = async (id) => { await fetch(`${API_BASE}/api/automation/jobs/${id}`, { method: "DELETE" }); setJobs(jobs.filter(j => j.id !== id)); };

  const runJob = async (id) => {
    const res = await fetch(`${API_BASE}/api/automation/jobs/${id}/run`, { method: "POST" });
    const data = await res.json();
    if (data.success) { setRuns([data.run, ...runs]); fetchData(); }
  };

  const toggleJobStatus = async (job) => {
    const res = await fetch(`${API_BASE}/api/automation/jobs/${job.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: job.status === "active" ? "paused" : "active" }) });
    const data = await res.json();
    if (data.success) setJobs(jobs.map(j => j.id === job.id ? data.job : j));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#0066cc]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-semibold text-gray-900">Automation Hub</h1><p className="text-sm text-gray-500">Automatisierte Workflows und geplante Tasks</p></div>
          <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9]"><Plus size={18} /> Neuer Job</button>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{ label: "Jobs", value: stats.total, Icon: Zap, color: "#7c3aed" },
            { label: "Aktiv", value: stats.active, Icon: CheckCircle, color: "#059669" },
            { label: "Runs heute", value: runs.length, Icon: RefreshCw, color: "#0066cc" },
            { label: "Erfolgsrate", value: stats.successRate + "%", Icon: CheckCircle, color: "#059669" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2"><s.Icon size={20} style={{ color: s.color }} /><span className="text-xs text-gray-500">{s.label}</span></div>
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Automatisierungen</h2>
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 group">
                <div className="flex items-center gap-4">
                  <Zap size={20} className="text-[#7c3aed]" />
                  <div><h3 className="font-medium text-gray-900">{job.name}</h3><p className="text-sm text-gray-500">{job.schedule} • Letzter Lauf: {job.lastRun}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{job.success} ✓ / {job.failed} ✗</span>
                  <StatusBadge status={job.status} />
                  <button onClick={() => runJob(job.id)} className="p-2 hover:bg-gray-200 rounded-lg text-green-600" title="Jetzt ausführen"><Play size={16} /></button>
                  <button onClick={() => toggleJobStatus(job)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">{job.status === "active" ? <Pause size={16} /> : <Play size={16} />}</button>
                  {!job.builtin && <button onClick={() => deleteJob(job.id)} className="p-2 hover:bg-gray-200 rounded-lg text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {runs.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Letzte Ausführungen</h2>
            <div className="space-y-2">
              {runs.slice(0, 5).map(run => (
                <div key={run.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <span className="text-gray-900">{run.jobName}</span>
                  <div className="flex items-center gap-3"><span className="text-gray-500 text-sm">{run.startedAt}</span><StatusBadge status={run.status} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Neuen Job erstellen">
        <div className="space-y-4">
          <div><label className="text-sm text-gray-600 block mb-1">Name</label><input type="text" value={newJob.name} onChange={e => setNewJob({...newJob, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Job Name" /></div>
          <div><label className="text-sm text-gray-600 block mb-1">Zeitplan</label>
            <select value={newJob.schedule} onChange={e => setNewJob({...newJob, schedule: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Manuell</option><option>Stündlich</option><option>Alle 4 Stunden</option><option>Täglich 06:00</option><option>Täglich 09:00</option><option>Wöchentlich Mo 09:00</option><option>Monatlich 1. 00:00</option>
            </select>
          </div>
          <div><label className="text-sm text-gray-600 block mb-1">Aktion</label>
            <select value={newJob.action} onChange={e => setNewJob({...newJob, action: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Aktion wählen...</option><option value="sync_products">Produkte synchronisieren</option><option value="export_feed">Feed exportieren</option><option value="quality_check">Qualitätsprüfung</option><option value="generate_content">Content generieren</option>
            </select>
          </div>
          <button onClick={createJob} className="w-full py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9]">Job erstellen</button>
        </div>
      </Dialog>
    </div>
  );
}
