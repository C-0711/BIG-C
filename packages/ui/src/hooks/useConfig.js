import { useState, useEffect, useCallback, useRef } from "react";

// Dynamic URLs based on current location
const getApiUrl = () => import.meta.env.VITE_API_URL || window.location.origin;
const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
};

export function useIntelligenceConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(getWsUrl());
      ws.onopen = () => { console.log("[Config] WS connected"); setConnected(true); };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "config.init" || msg.type === "config.changed") {
            setConfig(msg.config);
            setLoading(false);
          }
        } catch (err) { console.error("[Config] Parse error:", err); }
      };
      ws.onclose = () => { setConnected(false); reconnectRef.current = setTimeout(connectWebSocket, 3000); };
      ws.onerror = () => { console.error("[Config] WebSocket error"); setConnected(false); };
      wsRef.current = ws;
    } catch (err) { console.error("[Config] WS error:", err); }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${getApiUrl()}/api/config`);
      if (!res.ok) throw new Error("Failed to fetch config");
      const data = await res.json();
      setConfig(data);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  const patchConfig = useCallback(async (patch) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Patch failed");
      await fetchConfig();
      return true;
    } catch (err) { console.error(err); return false; }
  }, [fetchConfig]);

  // Getters
  const getInstance = useCallback(() => config?.instance || {}, [config]);
  const getAgents = useCallback(() => config?.agents?.list || [], [config]);
  const getEnabledAgents = useCallback(() => getAgents().filter(a => a.enabled !== false), [getAgents]);
  const getWorkflows = useCallback(() => config?.workflows?.list || [], [config]);
  const getEnabledWorkflows = useCallback(() => getWorkflows().filter(w => w.enabled !== false), [getWorkflows]);
  const getDataSources = useCallback(() => Object.entries(config?.dataSources?.providers || {}), [config]);
  const getOutputs = useCallback(() => Object.entries(config?.outputs?.providers || {}), [config]);
  const getSkills = useCallback(() => ({ bundled: config?.skills?.bundled || [], workspace: config?.skills?.workspace || "" }), [config]);
  const getUI = useCallback(() => config?.ui || {}, [config]);
  const getBranding = useCallback(() => config?.ui?.branding || {}, [config]);
  const getDashboard = useCallback(() => config?.ui?.dashboard || {}, [config]);

  const getNavigation = useCallback(() => {
    if (!config) return { main: [], core: [], data: [], business: [] };
    const agents = getEnabledAgents();
    const workflows = getEnabledWorkflows();
    const dataSources = getDataSources();
    const outputs = getOutputs();
    const skills = getSkills();
    return {
      main: [
        { id: "assistant", icon: "Bot", label: "Assistant", path: "/" },
        { id: "dashboard", icon: "LayoutDashboard", label: "Dashboard", path: "/dashboard" },
      ],
      core: [
        skills.bundled.length > 0 && { id: "skills", icon: "Sparkles", label: "Skills", path: "/skills" },
        dataSources.length > 0 && { id: "knowledge", icon: "BookOpen", label: "Knowledge Base", path: "/knowledge" },
        workflows.filter(w => w.type === "automation").length > 0 && { id: "automation", icon: "Zap", label: "Automation", path: "/automation" },
        agents.length > 0 && { id: "workspaces", icon: "FolderOpen", label: "Workspaces", path: "/workspaces" },
      ].filter(Boolean),
      data: [
        dataSources.length > 0 && { id: "integrations", icon: "Plug", label: "Integrations", path: "/integrations" },
        outputs.length > 0 && { id: "publishing", icon: "Upload", label: "Publishing", path: "/publishing" },
        workflows.filter(w => w.type === "report").length > 0 && { id: "reports", icon: "FileText", label: "Reports", path: "/reports" },
      ].filter(Boolean),
      business: [
        agents.find(a => a.id === "content-writer") && { id: "marketing", icon: "Megaphone", label: "Marketing", path: "/marketing" },
        agents.find(a => a.id === "product-expert") && { id: "product", icon: "Package", label: "Product", path: "/product" },
        { id: "intelligence", icon: "Brain", label: "Intelligence", path: "/intelligence" },
      ].filter(Boolean),
    };
  }, [config, getEnabledAgents, getEnabledWorkflows, getDataSources, getOutputs, getSkills]);

  useEffect(() => {
    connectWebSocket();
    fetchConfig();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket, fetchConfig]);

  return {
    config, loading, error, connected,
    fetchConfig, patchConfig,
    getInstance, getAgents, getEnabledAgents, getWorkflows, getEnabledWorkflows,
    getDataSources, getOutputs, getSkills, getUI, getBranding, getDashboard, getNavigation,
  };
}

export default useIntelligenceConfig;
