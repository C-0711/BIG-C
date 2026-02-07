import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Send, Sparkles, Package, Search, BarChart3, Network, Image, FileText,
  ChevronRight, Loader2, Bot, User, Zap, Clock, CheckCircle, AlertCircle,
  TrendingUp, GitBranch, Layers, Settings, Command, ExternalLink, Copy
} from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

// Tool definitions - what the AI can do
const TOOLS = {
  search: { name: "Search Products", icon: Search, color: "#0066cc" },
  analyze: { name: "Analyze Data", icon: BarChart3, color: "#7c3aed" },
  network: { name: "Show Network", icon: Network, color: "#059669" },
  compare: { name: "Compare Products", icon: GitBranch, color: "#ea580c" },
  generate: { name: "Generate Content", icon: Sparkles, color: "#ec4899" },
};

// Message types for rich responses
const MessageTypes = {
  TEXT: "text",
  PRODUCTS: "products",
  STATS: "stats",
  CHART: "chart",
  ACTION: "action",
  THINKING: "thinking",
};

// Product Card Component
const ProductCard = ({ product }) => (
  <Link to={`/dpp/${product.supplier_pid}`}
    className="block p-3 bg-[#f5f7fa] rounded-lg hover:bg-[#e2e8f0] transition-colors group">
    <div className="flex items-center justify-between mb-1">
      <span className="font-mono text-[#0066cc] font-medium text-sm">{product.supplier_pid}</span>
      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
        product.product_status === "active" || product.product_status === "Aktiv" 
          ? "bg-[#059669]/10 text-[#059669]" : "bg-[#dc2626]/10 text-[#dc2626]"
      }`}>
        {product.product_status || "—"}
      </span>
    </div>
    <p className="text-xs text-[#64748b] line-clamp-2">{product.description_short}</p>
    <div className="flex items-center gap-1 mt-2 text-[10px] text-[#0066cc] opacity-0 group-hover:opacity-100 transition-opacity">
      View Product Pass <ChevronRight size={10} />
    </div>
  </Link>
);

// Stats Card Component
const StatsCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="p-3 bg-[#f5f7fa] rounded-lg">
    <div className="flex items-center justify-between mb-1">
      <Icon size={16} style={{ color }} />
      {trend && (
        <span className={`text-[10px] ${trend > 0 ? "text-[#059669]" : "text-[#dc2626]"}`}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
    <div className="text-lg font-semibold text-[#1a2b3c]">{value}</div>
    <div className="text-[10px] text-[#64748b]">{label}</div>
  </div>
);

// Thinking indicator
const ThinkingIndicator = ({ tool }) => (
  <div className="flex items-center gap-3 p-4 bg-[#f5f7fa] rounded-xl animate-pulse">
    <div className="w-8 h-8 rounded-lg bg-[#0066cc]/10 flex items-center justify-center">
      <Loader2 size={16} className="text-[#0066cc] animate-spin" />
    </div>
    <div>
      <div className="text-sm text-[#1a2b3c]">Thinking...</div>
      {tool && <div className="text-xs text-[#64748b]">Using {TOOLS[tool]?.name || tool}</div>}
    </div>
  </div>
);

// Message Component
const Message = ({ message, isLast }) => {
  const isUser = message.role === "user";
  const isThinking = message.type === MessageTypes.THINKING;

  if (isThinking) {
    return <ThinkingIndicator tool={message.tool} />;
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
        isUser ? "bg-[#1e2a38]" : "bg-gradient-to-br from-[#0066cc] to-[#7c3aed]"
      }`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? "text-right" : ""}`}>
        {/* Text content */}
        {message.content && (
          <div className={`inline-block p-4 rounded-2xl ${
            isUser 
              ? "bg-[#1e2a38] text-white rounded-tr-sm" 
              : "bg-white border border-[#e2e8f0] text-[#1a2b3c] rounded-tl-sm shadow-sm"
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        {/* Products grid */}
        {message.products && message.products.length > 0 && (
          <div className="mt-3 bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#64748b]">
                Found {message.products.length} products
              </span>
              <Link to="/search" className="text-xs text-[#0066cc] hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {message.products.slice(0, 4).map((p, i) => (
                <ProductCard key={`${p.id}-${i}`} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {message.stats && (
          <div className="mt-3 bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-4 gap-3">
              {message.stats.map((s, i) => (
                <StatsCard key={i} {...s} />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.actions.map((action, i) => (
              <Link key={i} to={action.path}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm text-[#64748b] hover:border-[#0066cc] hover:text-[#0066cc] transition-colors">
                {action.icon && <action.icon size={14} />}
                {action.label}
                <ExternalLink size={12} />
              </Link>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`mt-1 text-[10px] text-[#94a3b8] ${isUser ? "text-right" : ""}`}>
          {message.time || "just now"}
        </div>
      </div>
    </div>
  );
};

// Suggestion chips
const SUGGESTIONS = [
  { text: "Show me heat pump accessories", icon: Package },
  { text: "What are the top selling categories?", icon: TrendingUp },
  { text: "Find products similar to CS7000", icon: Search },
  { text: "Generate marketing content for buffer tanks", icon: Sparkles },
  { text: "Show product network for thermotechnology", icon: Network },
];

export default function IntelligenceAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hallo! Ich bin dein Bosch Intelligence Assistant. Ich kann dir helfen Produkte zu finden, Daten zu analysieren, Content zu generieren und vieles mehr. Was möchtest du wissen?",
      stats: [
        { label: "Products", value: "23,141", icon: Package, color: "#0066cc" },
        { label: "Active", value: "21,953", icon: CheckCircle, color: "#059669" },
        { label: "Relations", value: "267M", icon: GitBranch, color: "#7c3aed" },
        { label: "Categories", value: "167", icon: Layers, color: "#ea580c" },
      ],
      time: "now",
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Process user message
  const processMessage = async (text) => {
    if (!text.trim() || isProcessing) return;

    // Add user message
    const userMessage = { role: "user", content: text, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Add thinking indicator
    const thinkingId = Date.now();
    setMessages(prev => [...prev, { id: thinkingId, type: MessageTypes.THINKING, tool: detectTool(text) }]);

    try {
      // Detect intent and execute
      const response = await executeIntent(text);
      
      // Remove thinking, add response
      setMessages(prev => [
        ...prev.filter(m => m.id !== thinkingId),
        { role: "assistant", ...response, time: new Date().toLocaleTimeString() }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev.filter(m => m.id !== thinkingId),
        { role: "assistant", content: "Entschuldigung, da ist etwas schief gelaufen. Bitte versuche es erneut.", time: new Date().toLocaleTimeString() }
      ]);
    }
    
    setIsProcessing(false);
  };

  // Detect which tool to use
  const detectTool = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("such") || lower.includes("find") || lower.includes("zeig")) return "search";
    if (lower.includes("analys") || lower.includes("statistik") || lower.includes("top")) return "analyze";
    if (lower.includes("netzwerk") || lower.includes("network") || lower.includes("relation")) return "network";
    if (lower.includes("vergleich") || lower.includes("compar")) return "compare";
    if (lower.includes("generie") || lower.includes("content") || lower.includes("marketing")) return "generate";
    return "search";
  };

  // Execute based on intent
  const executeIntent = async (text) => {
    const lower = text.toLowerCase();

    // Search intent
    if (lower.includes("such") || lower.includes("find") || lower.includes("zeig") || lower.includes("show") || lower.includes("products")) {
      // Extract search term more intelligently
      let query = text
        .replace(/^(zeig|such|find|show)\s*(mir|me)?\s*/i, "")
        .replace(/\s*(produkte|products|nach|for)\s*/gi, " ")
        .trim();
      const res = await fetch(`${API}/api/products/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query || "waermepumpe", limit: 8 })
      });
      const data = await res.json();
      
      return {
        content: `Ich habe ${data.products?.length || 0} Produkte gefunden${query ? ` für "${query}"` : ""}:`,
        products: data.products || [],
        actions: [
          { label: "Alle anzeigen", path: `/search?q=${encodeURIComponent(query)}`, icon: Search },
          { label: "Im Netzwerk", path: "/global-network", icon: Network },
        ]
      };
    }

    // Statistics intent
    if (lower.includes("statistik") || lower.includes("top") || lower.includes("kategor") || lower.includes("overview")) {
      const res = await fetch(`${API}/api/statistics`);
      const stats = await res.json();
      
      return {
        content: "Hier ist eine Übersicht der aktuellen Plattform-Statistiken:",
        stats: [
          { label: "Total Products", value: stats.total_products?.toLocaleString(), icon: Package, color: "#0066cc" },
          { label: "Active", value: stats.active_products?.toLocaleString(), icon: CheckCircle, color: "#059669" },
          { label: "Discontinued", value: stats.discontinued_products?.toLocaleString(), icon: AlertCircle, color: "#dc2626" },
          { label: "ETIM Groups", value: stats.total_etim_groups, icon: Layers, color: "#7c3aed" },
        ],
        actions: [
          { label: "Detaillierte Stats", path: "/stats", icon: BarChart3 },
          { label: "Catalog Impact", path: "/catalog-impact", icon: TrendingUp },
        ]
      };
    }

    // Network intent
    if (lower.includes("netzwerk") || lower.includes("network") || lower.includes("relation") || lower.includes("connect")) {
      return {
        content: "Das Produkt-Netzwerk visualisiert die Beziehungen zwischen allen 23.000+ Produkten mit 267 Millionen Verbindungen. Möchtest du es erkunden?",
        stats: [
          { label: "Nodes", value: "23,141", icon: Package, color: "#0066cc" },
          { label: "Edges", value: "267M", icon: GitBranch, color: "#059669" },
          { label: "Clusters", value: "167", icon: Layers, color: "#7c3aed" },
          { label: "Avg. Connections", value: "11,574", icon: Network, color: "#ea580c" },
        ],
        actions: [
          { label: "Netzwerk öffnen", path: "/global-network", icon: Network },
          { label: "Supply Chain", path: "/supply-chain", icon: GitBranch },
        ]
      };
    }

    // Generate content intent
    if (lower.includes("generie") || lower.includes("content") || lower.includes("marketing") || lower.includes("text")) {
      return {
        content: "Ich kann SEO-optimierten Content für verschiedene Kanäle generieren:\n\n• **Amazon** - A+ Content, Bullet Points, Keywords\n• **Shopify** - Produktbeschreibungen, Meta Tags\n• **eBay** - Listing-Texte, Item Specifics\n• **Google Shopping** - Feed-Optimierung\n\nWähle einen Kanal oder nenne mir ein Produkt!",
        actions: [
          { label: "Marketing Hub", path: "/marketing", icon: Sparkles },
          { label: "Produkt suchen", path: "/search", icon: Search },
        ]
      };
    }

    // Default - search
    const res = await fetch(`${API}/api/products/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text, limit: 6 })
    });
    const data = await res.json();

    if (data.products?.length > 0) {
      return {
        content: `Ich habe nach "${text}" gesucht und ${data.products.length} Ergebnisse gefunden:`,
        products: data.products,
        actions: [
          { label: "Mehr Ergebnisse", path: `/search?q=${encodeURIComponent(text)}`, icon: Search },
        ]
      };
    }

    return {
      content: `Ich bin mir nicht sicher, was du meinst. Hier sind ein paar Dinge, die ich kann:\n\n• Produkte suchen ("Zeig mir Wärmepumpen")\n• Statistiken anzeigen ("Was sind die Top-Kategorien?")\n• Netzwerk erkunden ("Zeig das Produkt-Netzwerk")\n• Content generieren ("Generiere Marketing-Text")\n\nWas möchtest du tun?`,
      actions: [
        { label: "Suche", path: "/search", icon: Search },
        { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
      ]
    };
  };

  return (
    <div className="h-screen flex flex-col bg-[#f5f7fa]">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066cc] to-[#7c3aed] flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-[#1a2b3c]">Bosch Intelligence</h1>
            <div className="flex items-center gap-2 text-xs text-[#64748b]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                Online
              </span>
              <span>•</span>
              <span>23,141 products indexed</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/command" className="p-2 hover:bg-[#f5f7fa] rounded-lg transition-colors" title="Command Center">
            <Command size={18} className="text-[#64748b]" />
          </Link>
          <Link to="/dashboard" className="p-2 hover:bg-[#f5f7fa] rounded-lg transition-colors" title="Dashboard">
            <BarChart3 size={18} className="text-[#64748b]" />
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <Message key={i} message={msg} isLast={i === messages.length - 1} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-6 pb-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => processMessage(s.text)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#e2e8f0] rounded-full text-sm text-[#64748b] hover:border-[#0066cc] hover:text-[#0066cc] transition-colors">
                <s.icon size={14} />
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-[#e2e8f0]">
        <form onSubmit={e => { e.preventDefault(); processMessage(input); }} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Frag mich etwas... (z.B. 'Zeig mir Wärmepumpen' oder 'Was sind die Top-Kategorien?')"
                className="w-full px-4 py-3 bg-[#f5f7fa] border border-[#e2e8f0] rounded-xl text-[#1a2b3c] placeholder-[#94a3b8] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:outline-none transition-all"
                disabled={isProcessing}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white border border-[#e2e8f0] rounded text-[10px] text-[#94a3b8]">↵</kbd>
              </div>
            </div>
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="px-5 py-3 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              <span className="hidden sm:inline">Senden</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
