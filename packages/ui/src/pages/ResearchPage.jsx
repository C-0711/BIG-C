import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Activity, Command, Map, Sparkles, Clock, FileSearch, Lightbulb } from "lucide-react";

const MODULES = [
  { path: "/search", name: "Semantic Search", desc: "Natural language queries", Icon: Sparkles },
  { path: "/command", name: "Command Center", desc: "Unified workspace", Icon: Command },
  { path: "/mindmap", name: "Mind Map", desc: "Visual exploration", Icon: Map },
];

const RECENT = [
  { q: "Waermepumpe Altbau", t: "2h ago", r: 45 },
  { q: "CS7000iAW Installation", t: "5h ago", r: 12 },
  { q: "Pufferspeicher 500L", t: "1d ago", r: 28 },
];

const STATS = [
  { key: "searches", label: "Searches Today", Icon: Search, color: "#0066cc", value: "1,247" },
  { key: "results", label: "Avg. Results", Icon: FileSearch, color: "#059669", value: "34" },
  { key: "recent", label: "Recent Queries", Icon: Clock, color: "#7c3aed", value: "89" },
  { key: "insights", label: "AI Insights", Icon: Lightbulb, color: "#ea580c", value: "156" },
];

export default function ResearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Research</h1>
            <p className="text-sm text-[#64748b]">Deep dive exploration and discovery</p>
          </div>
          <form className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search anything..."
                className="w-full pl-10 pr-4 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:outline-none transition-all" />
            </div>
          </form>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Activity className="text-[#059669]" size={16} />
            All systems online
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS.map(s => {
            const Icon = s.Icon;
            return (
              <div key={s.key} className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Icon size={20} style={{ color: s.color }} />
                  <span className="text-xs text-[#94a3b8]">{s.label}</span>
                </div>
                <div className="text-2xl font-semibold text-[#1a2b3c]">{s.value}</div>
              </div>
            );
          })}
        </div>

        <Link to="/command" className="block mb-6 bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/70 mb-1">Featured</div>
              <div className="text-2xl font-semibold mb-2">Command Center</div>
              <p className="text-white/80">Unified workspace with search, filters, graph, and details</p>
            </div>
            <Command className="text-white/20 group-hover:text-white/30 transition-colors" size={64} />
          </div>
        </Link>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {MODULES.map(m => {
                const Icon = m.Icon;
                return (
                  <Link key={m.path} to={m.path} className="p-5 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#0066cc] hover:shadow-md transition-all group shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-[#f5f7fa] flex items-center justify-center mb-3 group-hover:bg-[#0066cc]/10">
                      <Icon size={20} className="text-[#64748b] group-hover:text-[#0066cc]" />
                    </div>
                    <div className="font-medium text-[#1a2b3c] group-hover:text-[#0066cc] transition-colors">{m.name}</div>
                    <div className="text-xs text-[#64748b]">{m.desc}</div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="col-span-4">
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <div className="px-5 py-4 border-b border-[#e2e8f0]">
                <h3 className="font-medium text-[#1a2b3c]">Recent Searches</h3>
              </div>
              <div className="p-3">
                {RECENT.map((s, i) => (
                  <Link key={i} to={`/search?q=${encodeURIComponent(s.q)}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f5f7fa] transition-colors">
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-[#94a3b8]" />
                      <span className="text-sm text-[#1a2b3c]">{s.q}</span>
                    </div>
                    <span className="text-xs text-[#0066cc]">{s.r} results</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
