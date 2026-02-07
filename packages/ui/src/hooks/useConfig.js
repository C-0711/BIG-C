import { useState, useEffect, useCallback, useRef } from 'react';

// Use current origin for API calls (works for any deployment)
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return window.location.origin;
};

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

/**
 * useIntelligenceConfig - Config Hook with WebSocket Real-time Updates
 */
export function useIntelligenceConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    const WS_URL = getWsUrl();

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
          }
        } catch (e) {
          console.error('[Config] Failed to parse WS message:', e);
        }
      };

      ws.onclose = () => {
        console.log('[Config] WebSocket closed, reconnecting...');
        setConnected(false);
        reconnectRef.current = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (err) => {
        console.error('[Config] WebSocket error:', err);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[Config] WebSocket connection failed:', err);
      reconnectRef.current = setTimeout(connectWebSocket, 3000);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    const API_URL = getApiUrl();
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/config`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConfig(data);
      setError(null);
    } catch (err) {
      console.error('[Config] Fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [fetchConfig, connectWebSocket]);

  // Derived state
  const enabledAgents = config?.agents?.list?.filter(a => a.enabled) || [];
  const enabledWorkflows = config?.workflows?.list?.filter(w => w.enabled) || [];
  const dataSources = config?.dataSources?.providers ? Object.entries(config.dataSources.providers) : [];
  const outputs = config?.outputs?.providers ? Object.entries(config.outputs.providers) : [];

  return {
    config,
    loading,
    error,
    connected,
    refetch: fetchConfig,
    // Derived
    enabledAgents,
    enabledWorkflows,
    dataSources,
    outputs,
    instanceName: config?.instance?.name || '0711-C Intelligence',
    branding: config?.ui?.branding || {},
  };
}

export default useIntelligenceConfig;
