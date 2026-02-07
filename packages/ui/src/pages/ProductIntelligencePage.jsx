import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle, XCircle, GitBranch, Network, FileText, Search, Activity, ExternalLink } from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

export default function ProductIntelligencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    fetch(`${API}/api/products/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: id, limit: 10 })
    }).then(r => r.json()).then(d => {
      const found = d.products?.find(p => p.supplier_pid === id) || d.products?.[0];
      setProduct(found);
      setRelated(d.products?.filter(p => p.supplier_pid !== id).slice(0, 5) || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const STATS = product ? [
    { label: "Product ID", value: product.supplier_pid || id, Icon: Package, color: "#0066cc" },
    { label: "Status", value: product.product_status || "Unknown", Icon: product.product_status === "active" ? CheckCircle : XCircle, color: product.product_status === "active" ? "#059669" : "#dc2626" },
    { label: "Category", value: product.feature_group_name?.slice(0, 20) || "—", Icon: GitBranch, color: "#7c3aed" },
    { label: "Relations", value: related.length.toString(), Icon: Network, color: "#ea580c" },
  ] : [];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#f5f7fa] rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-[#64748b]" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-[#1a2b3c]">Product Intelligence</h1>
              <p className="text-sm text-[#64748b]">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to={`/product-comparison?p1=${id}`} className="px-4 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm text-[#64748b] hover:border-[#0066cc] hover:text-[#0066cc] transition-colors">
              Compare
            </Link>
            <div className="flex items-center gap-2 text-sm text-[#64748b]">
              <Activity className="text-[#059669]" size={16} />
              Online
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] p-4 animate-pulse">
                <div className="h-6 bg-[#e2e8f0] rounded w-16 mb-2" />
                <div className="h-4 bg-[#f5f7fa] rounded w-24" />
              </div>
            ))}
          </div>
        ) : product ? (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {STATS.map(s => {
                const Icon = s.Icon;
                return (
                  <div key={s.label} className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <Icon size={20} style={{ color: s.color }} />
                      <span className="text-xs text-[#94a3b8]">{s.label}</span>
                    </div>
                    <div className="text-xl font-semibold text-[#1a2b3c] truncate">{s.value}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 space-y-6">
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
                  <h3 className="font-medium text-[#1a2b3c] mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-[#64748b]" />
                    Product Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-[#94a3b8] mb-1">Description</div>
                      <div className="text-sm text-[#1a2b3c]">{product.description_short || "No description available"}</div>
                    </div>
                    {product.description_long && (
                      <div>
                        <div className="text-xs text-[#94a3b8] mb-1">Full Description</div>
                        <div className="text-sm text-[#64748b]">{product.description_long}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e2e8f0]">
                      <div>
                        <div className="text-xs text-[#94a3b8] mb-1">ETIM Group</div>
                        <div className="text-sm text-[#1a2b3c]">{product.feature_group_id || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#94a3b8] mb-1">Category</div>
                        <div className="text-sm text-[#1a2b3c]">{product.feature_group_name || "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
                  <h3 className="font-medium text-[#1a2b3c] mb-4 flex items-center gap-2">
                    <Network size={18} className="text-[#64748b]" />
                    Relationship Graph
                  </h3>
                  <div className="h-64 bg-[#f5f7fa] rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Network className="mx-auto text-[#e2e8f0] mb-2" size={48} />
                      <div className="text-[#64748b]">{related.length} connected products</div>
                      <Link to={`/global-network?focus=${id}`} className="text-xs text-[#0066cc] hover:underline mt-2 inline-block">
                        View in Network
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-4 space-y-6">
                <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
                  <div className="px-4 py-3 border-b border-[#e2e8f0]">
                    <h3 className="font-medium text-[#1a2b3c]">Related Products</h3>
                  </div>
                  <div className="p-2">
                    {related.length > 0 ? related.map((r, i) => (
                      <Link key={`${r.id}-${i}`} to={`/product-intelligence/${r.supplier_pid}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f5f7fa] transition-colors">
                        <div className="min-w-0">
                          <div className="font-mono text-[#0066cc] text-sm">{r.supplier_pid}</div>
                          <div className="text-xs text-[#64748b] truncate">{r.description_short?.slice(0, 50)}...</div>
                        </div>
                        <ExternalLink size={14} className="text-[#94a3b8] flex-shrink-0 ml-2" />
                      </Link>
                    )) : (
                      <div className="p-4 text-center text-sm text-[#64748b]">No related products found</div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm">
                  <h3 className="font-medium text-[#1a2b3c] mb-3">Actions</h3>
                  <div className="space-y-2">
                    <Link to={`/global-network?focus=${id}`} className="block w-full px-4 py-2 bg-[#f5f7fa] border border-[#e2e8f0] rounded-lg text-sm text-center text-[#64748b] hover:border-[#0066cc] hover:text-[#0066cc] transition-colors">
                      View in Network
                    </Link>
                    <button className="w-full px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm rounded-lg transition-colors">
                      Generate Content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-[#e2e8f0]">
            <Package className="mx-auto text-[#e2e8f0] mb-4" size={48} />
            <div className="text-[#64748b]">Product not found</div>
            <button onClick={() => navigate(-1)} className="mt-4 text-[#0066cc] hover:underline">Go back</button>
          </div>
        )}
      </main>
    </div>
  );
}
