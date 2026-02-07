import { useState, useEffect } from "react";
import { 
  ShoppingBag, ShoppingCart, Tag, Search, Globe, RefreshCw, 
  Package, CheckCircle, Zap, Plus, Trash2, Play, Pause, X, Loader2, TrendingUp, Rocket, Edit2
} from "lucide-react";

const API_BASE = "http://localhost:8766";

const CHANNEL_ICONS = {
  amazon: ShoppingBag,
  shopify: ShoppingCart,
  ebay: Tag,
  google: Search,
  marketplace: Globe,
  default: ShoppingBag
};

const CHANNEL_COLORS = {
  amazon: "#ff9900",
  shopify: "#96bf48",
  ebay: "#e53238",
  google: "#4285f4",
  marketplace: "#7c3aed",
  default: "#6b7280"
};

const StatusBadge = ({ status }) => {
  const config = {
    active: { color: "#059669", label: "Aktiv" },
    completed: { color: "#6b7280", label: "Abgeschlossen" },
    draft: { color: "#f59e0b", label: "Entwurf" },
    paused: { color: "#94a3b8", label: "Pausiert" },
  };
  const c = config[status] || config.draft;
  return <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${c.color}20`, color: c.color }}>{c.label}</span>;
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

const EmptyState = ({ icon: Icon, title, desc, action, onAction }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <Icon size={32} className="text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4 max-w-sm">{desc}</p>
    {action && <button onClick={onAction} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]"><Plus size={18} /> {action}</button>}
  </div>
);

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [channels, setChannels] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, totalGenerated: 0, avgConversion: "0%" });
  const [loading, setLoading] = useState(true);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: "", channel: "Multi-Channel", products: 100 });
  const [newChannel, setNewChannel] = useState({ name: "", type: "marketplace", desc: "" });
  const [runningCampaign, setRunningCampaign] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [campaignsRes, channelsRes] = await Promise.all([
        fetch(`${API_BASE}/api/marketing/campaigns`),
        fetch(`${API_BASE}/api/marketing/channels`)
      ]);
      const campaignsData = await campaignsRes.json();
      const channelsData = await channelsRes.json();
      setCampaigns(campaignsData.campaigns || []);
      setChannels(channelsData.channels || []);
      setStats({
        total: campaignsData.total || 0,
        active: campaignsData.active || 0,
        totalGenerated: campaignsData.totalGenerated || 0,
        avgConversion: campaignsData.avgConversion || "0%"
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createCampaign = async () => {
    const res = await fetch(`${API_BASE}/api/marketing/campaigns`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCampaign)
    });
    const data = await res.json();
    if (data.success) {
      await fetchData(); // Refresh all data including stats
      setShowCampaignDialog(false);
      setNewCampaign({ name: "", channel: "Multi-Channel", products: 100 });
    }
  };

  const deleteCampaign = async (id) => {
    await fetch(`${API_BASE}/api/marketing/campaigns/${id}`, { method: "DELETE" });
    await fetchData();
  };

  const toggleStatus = async (campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    await fetch(`${API_BASE}/api/marketing/campaigns/${campaign.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    await fetchData();
  };

  const runCampaign = async (campaign) => {
    setRunningCampaign(campaign.id);
    const res = await fetch(`${API_BASE}/api/marketing/campaigns/${campaign.id}/run`, { method: "POST" });
    const data = await res.json();
    setRunningCampaign(null);
    if (data.success) {
      await fetchData();
      alert(`✅ ${data.message}`);
    }
  };

  const createChannel = async () => {
    const res = await fetch(`${API_BASE}/api/marketing/channels`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newChannel)
    });
    const data = await res.json();
    if (data.success) {
      await fetchData();
      setShowChannelDialog(false);
      setNewChannel({ name: "", type: "marketplace", desc: "" });
    }
  };

  const deleteChannel = async (id) => {
    await fetch(`${API_BASE}/api/marketing/channels/${id}`, { method: "DELETE" });
    await fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#0066cc]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Marketing</h1>
            <p className="text-sm text-gray-500">SEO-optimierter Content für Sales Channels</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowChannelDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
              <Plus size={18} /> Neuer Channel
            </button>
            <button onClick={() => setShowCampaignDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">
              <Plus size={18} /> Neue Kampagne
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Kampagnen", value: stats.total, Icon: Package, color: "#0066cc" },
            { label: "Aktiv", value: stats.active, Icon: CheckCircle, color: "#059669" },
            { label: "Generiert", value: stats.totalGenerated?.toLocaleString() || 0, Icon: Zap, color: "#7c3aed" },
            { label: "Avg. Conversion", value: stats.avgConversion, Icon: TrendingUp, color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <s.Icon size={20} style={{ color: s.color }} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Campaigns */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kampagnen</h2>
          {campaigns.length === 0 ? (
            <EmptyState 
              icon={Zap} 
              title="Keine Kampagnen" 
              desc="Erstellen Sie Ihre erste Marketing-Kampagne um Content für Ihre Produkte zu generieren."
              action="Erste Kampagne erstellen"
              onAction={() => setShowCampaignDialog(true)}
            />
          ) : (
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:border-gray-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#0066cc]/10 flex items-center justify-center">
                      <Zap size={20} className="text-[#0066cc]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{c.name}</h3>
                      <p className="text-sm text-gray-500">
                        {c.channel} • {c.products || 0} Produkte • {(c.generated || 0).toLocaleString()} generiert
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{c.conversion}</span>
                    <StatusBadge status={c.status} />
                    <button 
                      onClick={() => runCampaign(c)} 
                      disabled={runningCampaign === c.id}
                      className="p-2 hover:bg-gray-200 rounded-lg text-[#0066cc]" 
                      title="Content generieren"
                    >
                      {runningCampaign === c.id ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                    </button>
                    <button onClick={() => toggleStatus(c)} className="p-2 hover:bg-gray-200 rounded-lg">
                      {c.status === "active" ? <Pause size={16} className="text-gray-500" /> : <Play size={16} className="text-green-500" />}
                    </button>
                    {!c.builtin && (
                      <button onClick={() => deleteCampaign(c.id)} className="p-2 hover:bg-gray-200 rounded-lg text-red-500 opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Channels */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sales Channels</h2>
            {channels.length > 0 && (
              <span className="text-sm text-gray-500">{channels.length} Channels</span>
            )}
          </div>
          {channels.length === 0 ? (
            <EmptyState 
              icon={Globe} 
              title="Keine Channels" 
              desc="Fügen Sie Sales Channels hinzu um Marketing-Content zu verteilen."
              action="Ersten Channel hinzufügen"
              onAction={() => setShowChannelDialog(true)}
            />
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {channels.map(ch => {
                const IconComponent = CHANNEL_ICONS[ch.type] || CHANNEL_ICONS.default;
                const color = ch.color || CHANNEL_COLORS[ch.type] || CHANNEL_COLORS.default;
                return (
                  <div key={ch.id} className="p-4 border border-gray-200 rounded-xl hover:border-[#0066cc] hover:shadow-md transition-all cursor-pointer group relative">
                    {!ch.builtin && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteChannel(ch.id); }}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${color}15` }}>
                      <IconComponent size={20} style={{ color }} />
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-[#0066cc]">{ch.name}</h3>
                    <p className="text-xs text-gray-500">{ch.desc || ch.type}</p>
                    {!ch.builtin && <span className="text-[10px] text-blue-500 mt-1 block">Custom</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Campaign Dialog */}
      <Dialog open={showCampaignDialog} onClose={() => setShowCampaignDialog(false)} title="Neue Kampagne erstellen">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Name</label>
            <input type="text" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Kampagnen Name" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Channel</label>
            <select value={newCampaign.channel} onChange={e => setNewCampaign({...newCampaign, channel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Multi-Channel</option>
              {channels.map(ch => <option key={ch.id} value={ch.name}>{ch.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Anzahl Produkte</label>
            <input type="number" value={newCampaign.products} onChange={e => setNewCampaign({...newCampaign, products: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="100" />
          </div>
          <button onClick={createCampaign} disabled={!newCampaign.name} className="w-full py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] disabled:opacity-50">
            Kampagne erstellen
          </button>
        </div>
      </Dialog>

      {/* Channel Dialog */}
      <Dialog open={showChannelDialog} onClose={() => setShowChannelDialog(false)} title="Neuen Channel hinzufügen">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Name</label>
            <input type="text" value={newChannel.name} onChange={e => setNewChannel({...newChannel, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="z.B. Otto.de" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Typ</label>
            <select value={newChannel.type} onChange={e => setNewChannel({...newChannel, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="marketplace">Marketplace</option>
              <option value="amazon">Amazon</option>
              <option value="shopify">Shopify</option>
              <option value="ebay">eBay</option>
              <option value="google">Google Shopping</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Beschreibung</label>
            <input type="text" value={newChannel.desc} onChange={e => setNewChannel({...newChannel, desc: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Kurze Beschreibung" />
          </div>
          <button onClick={createChannel} disabled={!newChannel.name} className="w-full py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] disabled:opacity-50">
            Channel hinzufügen
          </button>
        </div>
      </Dialog>
    </div>
  );
}
