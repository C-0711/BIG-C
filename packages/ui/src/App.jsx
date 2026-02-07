import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { createContext, useState, useContext } from "react";
import { 
  Bot, LayoutDashboard, Megaphone, Package, BarChart3, Network, 
  Search, Headphones, FileCheck, ChevronLeft, ChevronRight, User, 
  Command, Map, Cpu, Database, Clock, Folder, Plug, Send, FileText, Image
} from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastProvider from "./components/ToastProvider";

// Pages
import IntelligenceAssistant from "./pages/IntelligenceAssistant";
import IntelligenceDashboard from "./pages/IntelligenceDashboard";
import MarketingPage from "./pages/MarketingPage";
import ProductPage from "./pages/ProductPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import IntelligencePage from "./pages/IntelligencePage";
import ResearchPage from "./pages/ResearchPage";
import ServicePage from "./pages/ServicePage";
import SearchPage from "./pages/SearchPage";
import GraphPage from "./pages/GraphPage";
import ProductsPage from "./pages/ProductsPage";
import CatalogPage from "./pages/CatalogPage";
import StatsPage from "./pages/StatsPage";
import GlobalNetworkPage from "./pages/GlobalNetworkPage";
import SupplyChainPage from "./pages/SupplyChainPage";
import ProductComparison from "./pages/ProductComparison";
import CatalogImpactPage from "./pages/CatalogImpactPage";
import ProductIntelligencePage from "./pages/ProductIntelligencePage";
import CommandCenter from "./pages/CommandCenter";
import MindMapView from "./pages/MindMapView";
import DigitalProductPass from "./pages/DigitalProductPass";
import SkillsPage from "./pages/SkillsPage";

// New Enterprise Hub Pages
import KnowledgeBase from "./pages/KnowledgeBase";
import AutomationHub from "./pages/AutomationHub";
import Workspaces from "./pages/Workspaces";
import Integrations from "./pages/Integrations";
import Publishing from "./pages/Publishing";
import Reports from "./pages/Reports";
import Gallery from "./pages/Gallery";

const SidebarContext = createContext({ expanded: true, setExpanded: () => {} });

// Main navigation - Enterprise Hub structure
const NAV_MAIN = [
  { id: "assistant", Icon: Bot, label: "Assistant", path: "/", gradient: true },
  { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
];

// Core Features
const NAV_CORE = [
  { id: "skills", Icon: Cpu, label: "Skills", path: "/skills" },
  { id: "knowledge", Icon: Database, label: "Knowledge Base", path: "/knowledge" },
  { id: "automation", Icon: Clock, label: "Automation", path: "/automation" },
  { id: "workspaces", Icon: Folder, label: "Workspaces", path: "/workspaces" },
];

// Data & Integration
const NAV_DATA = [
  { id: "integrations", Icon: Plug, label: "Integrations", path: "/integrations" },
  { id: "publishing", Icon: Send, label: "Publishing", path: "/publishing" },
  { id: "gallery", Icon: Image, label: "Bildergalerie", path: "/gallery" },
  { id: "reports", Icon: FileText, label: "Reports", path: "/reports" },
];

// Business Sections
const NAV_BUSINESS = [
  { id: "marketing", Icon: Megaphone, label: "Marketing", path: "/marketing" },
  { id: "product", Icon: Package, label: "Product", path: "/product" },
  { id: "analytics", Icon: BarChart3, label: "Analytics", path: "/analytics" },
  { id: "intelligence", Icon: Network, label: "Intelligence", path: "/intelligence" },
  { id: "dpp", Icon: FileCheck, label: "Product Pass", path: "/dpp" },
  { id: "service", Icon: Headphones, label: "Service", path: "/service" },
];

function Sidebar() {
  const location = useLocation();
  const { expanded, setExpanded } = useContext(SidebarContext);

  const isActive = (item) => {
    if (item.id === "assistant") return location.pathname === "/";
    if (item.id === "dpp") return location.pathname.startsWith("/dpp");
    return location.pathname.startsWith(item.path) && item.path !== "/";
  };

  const NavSection = ({ items, title }) => (
    <>
      {expanded && title && (
        <div className="text-[10px] uppercase text-[#5a6a7a] font-medium px-3 pt-4 pb-2">{title}</div>
      )}
      {!expanded && title && <div className="h-2" />}
      {items.map((item) => {
        const Icon = item.Icon;
        const active = isActive(item);
        return (
          <Link key={item.id} to={item.path} title={!expanded ? item.label : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 transition-all 
              ${active 
                ? item.gradient 
                  ? "bg-gradient-to-r from-[#0066cc] to-[#7c3aed] text-white" 
                  : "bg-[#0066cc] text-white" 
                : "text-[#8899aa] hover:bg-[#2a3a4a] hover:text-white"
              } 
              ${!expanded ? "justify-center" : ""}`}>
            <Icon size={18} />
            {expanded && <span className="text-sm">{item.label}</span>}
          </Link>
        );
      })}
    </>
  );

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-[#1e2a38] flex flex-col transition-all duration-300 z-50 ${expanded ? "w-56" : "w-16"}`}>
      <div className={`h-14 flex items-center border-b border-[#2a3a4a] ${expanded ? "justify-between px-4" : "justify-center px-2"}`}>
        {expanded && <span className="text-white font-semibold text-sm">Bosch Intelligence</span>}
        {!expanded && <span className="text-white font-bold text-lg">B</span>}
        <button onClick={() => setExpanded(!expanded)} 
          className="w-8 h-8 flex items-center justify-center text-[#8899aa] hover:text-white hover:bg-[#2a3a4a] rounded transition-colors">
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      
      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        <NavSection items={NAV_MAIN} />
        <NavSection items={NAV_CORE} title="Core" />
        <NavSection items={NAV_DATA} title="Data" />
        <NavSection items={NAV_BUSINESS} title="Business" />
      </nav>
      
      {/* Quick Actions */}
      {expanded && (
        <div className="px-4 pb-2">
          <div className="text-[10px] uppercase text-[#5a6a7a] font-medium mb-2">Quick Access</div>
          <div className="flex gap-2">
            <Link to="/command" className="flex-1 p-2 bg-[#2a3a4a] rounded-lg text-center hover:bg-[#3a4a5a] transition-colors">
              <Command size={14} className="mx-auto text-[#8899aa]" />
            </Link>
            <Link to="/mindmap" className="flex-1 p-2 bg-[#2a3a4a] rounded-lg text-center hover:bg-[#3a4a5a] transition-colors">
              <Map size={14} className="mx-auto text-[#8899aa]" />
            </Link>
            <Link to="/global-network" className="flex-1 p-2 bg-[#2a3a4a] rounded-lg text-center hover:bg-[#3a4a5a] transition-colors">
              <Network size={14} className="mx-auto text-[#8899aa]" />
            </Link>
          </div>
        </div>
      )}
      
      <div className="p-3 border-t border-[#2a3a4a]">
        {expanded ? (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">Christoph</div>
              <div className="text-xs text-[#8899aa]">Admin</div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-[#0066cc] flex items-center justify-center text-white">
            <User size={16} />
          </div>
        )}
      </div>
    </aside>
  );
}

function LayoutContent({ children }) {
  const location = useLocation();
  const { expanded } = useContext(SidebarContext);
  
  // Fullscreen pages (no sidebar margin)
  const fullscreen = ["/command", "/mindmap", "/global-network"];
  const dppDetail = location.pathname.match(/^\/dpp\/.+/);
  
  if (fullscreen.includes(location.pathname) || dppDetail) {
    return <div className="min-h-screen bg-[#f5f7fa]">{children}</div>;
  }
  
  return (
    <div className={`min-h-screen bg-[#f5f7fa] transition-all duration-300 ${expanded ? "ml-56" : "ml-16"}`}>
      {children}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Main Assistant - Homepage */}
      <Route path="/" element={<IntelligenceAssistant />} />
      
      {/* Dashboard */}
      <Route path="/dashboard" element={<IntelligenceDashboard />} />
      
      {/* Core Hub Features */}
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/knowledge" element={<KnowledgeBase />} />
      <Route path="/automation" element={<AutomationHub />} />
      <Route path="/workspaces" element={<Workspaces />} />
      
      {/* Data & Integration */}
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/publishing" element={<Publishing />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/reports" element={<Reports />} />
      
      {/* Business Sections */}
      <Route path="/marketing" element={<MarketingPage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/intelligence" element={<IntelligencePage />} />
      <Route path="/research" element={<ResearchPage />} />
      <Route path="/service" element={<ServicePage />} />
      
      {/* Feature Pages */}
      <Route path="/search" element={<SearchPage />} />
      <Route path="/graph" element={<GraphPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/catalogs" element={<CatalogPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/global-network" element={<GlobalNetworkPage />} />
      <Route path="/supply-chain" element={<SupplyChainPage />} />
      <Route path="/product-comparison" element={<ProductComparison />} />
      <Route path="/catalog-impact" element={<CatalogImpactPage />} />
      <Route path="/product-intelligence/:id" element={<ProductIntelligencePage />} />
      
      {/* Fullscreen Views */}
      <Route path="/command" element={<CommandCenter />} />
      <Route path="/mindmap" element={<MindMapView />} />
      
      {/* Digital Product Pass */}
      <Route path="/dpp" element={<DPPLanding />} />
      <Route path="/dpp/:id" element={<DigitalProductPass />} />
    </Routes>
  );
}

// DPP Landing
function DPPLanding() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const API = `http://${window.location.hostname}:8766`;

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 12 })
      });
      const data = await res.json();
      setResults(data.products || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-gradient-to-r from-[#1e2a38] to-[#2d3a4a] text-white px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0066cc] rounded-full text-sm mb-4">
            <FileCheck size={16} /> EU Digital Product Passport
          </div>
          <h1 className="text-3xl font-bold mb-4">Digital Product Pass</h1>
          <p className="text-white/70 mb-8">Complete product lifecycle documentation</p>
          <form onSubmit={e => { e.preventDefault(); search(); }} className="flex gap-3 max-w-xl mx-auto">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Enter Product ID..."
              className="flex-1 px-4 py-4 bg-white rounded-xl text-[#1a2b3c] placeholder-[#94a3b8] focus:outline-none" />
            <button type="submit" className="px-8 py-4 bg-[#0066cc] hover:bg-[#0052a3] rounded-xl font-medium">
              {loading ? "..." : "Find"}
            </button>
          </form>
        </div>
      </header>
      <main className="p-6 max-w-6xl mx-auto">
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {results.map((p, i) => (
              <Link key={`${p.id}-${i}`} to={`/dpp/${p.supplier_pid}`}
                className="bg-white rounded-xl border border-[#e2e8f0] p-5 hover:border-[#0066cc] hover:shadow-lg transition-all">
                <span className="font-mono text-[#0066cc] font-medium">{p.supplier_pid}</span>
                <p className="text-sm text-[#64748b] line-clamp-2 mt-2">{p.description_short}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <SidebarContext.Provider value={{ expanded, setExpanded }}>
            <Sidebar />
            <LayoutContent>
              <AppRoutes />
            </LayoutContent>
          </SidebarContext.Provider>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
