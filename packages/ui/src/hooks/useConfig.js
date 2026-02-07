import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7074';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:7074/ws';

/**
 * useIntelligenceConfig - Config Hook with WebSocket Real-time Updates
 * 
 * Features:
 * - Fetch full config from API
 * - WebSocket subscription for real-time updates
 * - CRUD operations for config sections
 * - Derived state for UI rendering
 */
export function useIntelligenceConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  // ─── WEBSOCKET CONNECTION ────────────────────────────────────────────────
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        console.log('[Config] WebSocket connected');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'config.init' || msg.type === 'config.changed') {
            console.log('[Config] Received update:', msg.type);
            setConfig(msg.config);
            setLoading(false);
          }
        } catch (e) {
          console.error('[Config] Parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('[Config] WebSocket disconnected');
        setConnected(false);
        // Reconnect after 3s
        reconnectRef.current = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        setConnected(false);
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('[Config] WebSocket error:', e);
    }
  }, []);

  // ─── FETCH CONFIG (FALLBACK) ─────────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/config`);
      if (!res.ok) throw new Error('Failed to fetch config');
      const data = await res.json();
      setConfig(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── PATCH CONFIG ────────────────────────────────────────────────────────
  const patchConfig = useCallback(async (patch) => {
    try {
      // Send via WebSocket if connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'config.patch', patch }));
        return true;
      }
      
      // Fallback to REST
      const res = await fetch(`${API_URL}/api/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('Failed to patch config');
      await fetchConfig();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }, [fetchConfig]);

  // ─── SECTION OPERATIONS ──────────────────────────────────────────────────
  const updateSection = useCallback((section, data) => {
    return patchConfig({ [section]: data });
  }, [patchConfig]);

  const updateAgent = useCallback((agentId, data) => {
    if (!config) return false;
    const agents = config.agents.list.map(a => 
      a.id === agentId ? { ...a, ...data } : a
    );
    return patchConfig({ agents: { ...config.agents, list: agents } });
  }, [config, patchConfig]);

  const updateWorkflow = useCallback((workflowId, data) => {
    if (!config) return false;
    const workflows = config.workflows.list.map(w => 
      w.id === workflowId ? { ...w, ...data } : w
    );
    return patchConfig({ workflows: { ...config.workflows, list: workflows } });
  }, [config, patchConfig]);

  const toggleAgent = useCallback((agentId, enabled) => {
    return updateAgent(agentId, { enabled });
  }, [updateAgent]);

  const toggleWorkflow = useCallback((workflowId, enabled) => {
    return updateWorkflow(workflowId, { enabled });
  }, [updateWorkflow]);

  // ─── DERIVED STATE ───────────────────────────────────────────────────────
  const getInstance = useCallback(() => config?.instance || {}, [config]);
  const getAgents = useCallback(() => config?.agents?.list || [], [config]);
  const getEnabledAgents = useCallback(() => 
    getAgents().filter(a => a.enabled !== false), [getAgents]);
  const getWorkflows = useCallback(() => config?.workflows?.list || [], [config]);
  const getEnabledWorkflows = useCallback(() => 
    getWorkflows().filter(w => w.enabled !== false), [getWorkflows]);
  const getDataSources = useCallback(() => 
    Object.entries(config?.dataSources?.providers || {}).map(([id, cfg]) => ({ id, ...cfg })), [config]);
  const getOutputs = useCallback(() => 
    Object.entries(config?.outputs?.providers || {}).map(([id, cfg]) => ({ id, ...cfg })), [config]);
  const getSkills = useCallback(() => ({
    bundled: config?.skills?.bundled || [],
    workspace: config?.skills?.workspace || [],
  }), [config]);
  const getUI = useCallback(() => config?.ui || {}, [config]);
  const getBranding = useCallback(() => config?.ui?.branding || {}, [config]);
  const getDashboard = useCallback(() => config?.ui?.dashboard || {}, [config]);

  // ─── NAVIGATION GENERATOR ────────────────────────────────────────────────
  const getNavigation = useCallback(() => {
    if (!config) return { main: [], core: [], data: [], business: [] };
    
    const agents = getEnabledAgents();
    const workflows = getEnabledWorkflows();
    const dataSources = getDataSources();
    const outputs = getOutputs();
    const skills = getSkills();

    return {
      main: [
        { id: 'assistant', icon: '🤖', label: 'Assistant', path: '/' },
        { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/dashboard' },
      ],
      core: [
        skills.bundled.length > 0 && { id: 'skills', icon: '✨', label: 'Skills', path: '/skills' },
        dataSources.length > 0 && { id: 'knowledge', icon: '📚', label: 'Knowledge Base', path: '/knowledge' },
        workflows.filter(w => w.type === 'automation').length > 0 && { id: 'automation', icon: '⚡', label: 'Automation', path: '/automation' },
        agents.length > 0 && { id: 'workspaces', icon: '📁', label: 'Workspaces', path: '/workspaces' },
      ].filter(Boolean),
      data: [
        dataSources.length > 0 && { id: 'integrations', icon: '🔌', label: 'Integrations', path: '/integrations' },
        outputs.length > 0 && { id: 'publishing', icon: '📤', label: 'Publishing', path: '/publishing' },
        skills.bundled.includes('image-gallery') && { id: 'gallery', icon: '🖼️', label: 'Gallery', path: '/gallery' },
        workflows.filter(w => w.type === 'report').length > 0 && { id: 'reports', icon: '📋', label: 'Reports', path: '/reports' },
      ].filter(Boolean),
      business: [
        agents.find(a => a.id === 'content-writer') && { id: 'marketing', icon: '📣', label: 'Marketing', path: '/marketing' },
        agents.find(a => a.id === 'product-expert') && { id: 'product', icon: '📦', label: 'Product', path: '/product' },
        workflows.filter(w => w.type === 'analytics').length > 0 && { id: 'analytics', icon: '📈', label: 'Analytics', path: '/analytics' },
        { id: 'intelligence', icon: '🧠', label: 'Intelligence', path: '/intelligence' },
        skills.bundled.includes('product-pass') && { id: 'dpp', icon: '📋', label: 'Product Pass', path: '/dpp' },
      ].filter(Boolean),
    };
  }, [config, getEnabledAgents, getEnabledWorkflows, getDataSources, getOutputs, getSkills]);

  // ─── LIFECYCLE ───────────────────────────────────────────────────────────
  useEffect(() => {
    connectWebSocket();
    fetchConfig(); // Initial fetch as fallback
    
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket, fetchConfig]);

  return {
    // State
    config,
    loading,
    error,
    connected,
    
    // Operations
    fetchConfig,
    patchConfig,
    updateSection,
    updateAgent,
    updateWorkflow,
    toggleAgent,
    toggleWorkflow,
    
    // Getters
    getInstance,
    getAgents,
    getEnabledAgents,
    getWorkflows,
    getEnabledWorkflows,
    getDataSources,
    getOutputs,
    getSkills,
    getUI,
    getBranding,
    getDashboard,
    getNavigation,
  };
}

export default useIntelligenceConfig;
