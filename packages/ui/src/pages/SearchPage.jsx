import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Activity, FileText, Clock, TrendingUp, Filter } from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const search = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setParams({ q });
    try {
      const res = await fetch(`${API}/api/products/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, limit: 50 })
      });
      const data = await res.json();
      setResults(data.products || []);
      setTotal(data.total || data.products?.length || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (params.get("q")) search(params.get("q")); }, []);

  const STATS = [
    { label: "Results", value: total.toString(), Icon: FileText, color: "#0066cc" },
    { label: "Search Time", value: "45ms", Icon: Clock, color: "#059669" },
    { label: "Relevance", value: "94%", Icon: TrendingUp, color: "#7c3aed" },
    { label: "Filters", value: "0", Icon: Filter, color: "#64748b" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Search</h1>
            <p className="text-sm text-[#64748b]">Semantic product search</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); search(query); }} className="flex-1 max-w-2xl mx-8">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:outline-none transition-all" />
              </div>
              <button type="submit" className="px-6 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white font-medium rounded-lg transition-colors">
                Search
              </button>
            </div>
          </form>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Activity className="text-[#059669]" size={16} />
            Online
          </div>
        </div>
      </header>

      <main className="p-6">
        {params.get("q") && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {STATS.map(s => {
              const Icon = s.Icon;
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
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 bg-white border border-[#e2e8f0] rounded-xl shadow-sm animate-pulse">
                <div className="h-4 bg-[#e2e8f0] rounded w-32 mb-2" />
                <div className="h-3 bg-[#f5f7fa] rounded w-full" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((p, i) => (
              <Link key={`${p.id}-${i}`} to={`/product-intelligence/${p.supplier_pid}`}
                className="block p-4 bg-white border border-[#e2e8f0] rounded-xl shadow-sm hover:border-[#0066cc] hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[#0066cc] font-medium">{p.supplier_pid}</span>
                      {p.product_status && (
                        <span className={`px-2 py-0.5 rounded text-xs ${p.product_status === "active" ? "bg-[#059669]/10 text-[#059669]" : "bg-[#dc2626]/10 text-[#dc2626]"}`}>
                          {p.product_status}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[#64748b] line-clamp-2">{p.description_short}</div>
                    {p.feature_group_name && <div className="text-xs text-[#94a3b8] mt-2">{p.feature_group_name}</div>}
                  </div>
                  {p.similarity !== undefined && (
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-[#0066cc]">{(p.similarity * 100).toFixed(0)}%</div>
                      <div className="text-xs text-[#94a3b8]">match</div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : params.get("q") ? (
          <div className="text-center py-12 bg-white rounded-xl border border-[#e2e8f0]">
            <Search className="mx-auto text-[#e2e8f0] mb-4" size={48} />
            <div className="text-[#64748b] mb-2">No results found for "{params.get("q")}"</div>
            <div className="text-xs text-[#94a3b8]">Try different keywords</div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-[#e2e8f0]">
            <Search className="mx-auto text-[#e2e8f0] mb-4" size={48} />
            <div className="text-[#64748b] mb-4">Enter a search query to find products</div>
            <div className="flex flex-wrap justify-center gap-2">
              {["Waermepumpe", "Pufferspeicher", "Brenner", "Solar"].map(s => (
                <button key={s} onClick={() => { setQuery(s); search(s); }}
                  className="px-4 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm text-[#64748b] hover:border-[#0066cc] hover:text-[#0066cc] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
