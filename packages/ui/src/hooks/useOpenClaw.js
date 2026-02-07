import { useState, useEffect, useCallback, useRef } from 'react';

const GATEWAY_URL = import.meta.env.VITE_OPENCLAW_WS || 'ws://localhost:18789';

/**
 * useOpenClaw - Connect to OpenClaw Gateway
 * 
 * Provides:
 * - WebSocket connection to Gateway
 * - Session management
 * - Agent execution
 * - Real-time updates
 */
export function useOpenClaw() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    setConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(GATEWAY_URL);
      
      ws.onopen = () => {
        console.log('[OpenClaw] Connected to Gateway');
        setConnected(true);
        setConnecting(false);
        
        // Request initial state
        ws.send(JSON.stringify({ type: 'sessions.list' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (e) {
          console.error('[OpenClaw] Failed to parse message:', e);
        }
      };

      ws.onclose = () => {
        console.log('[OpenClaw] Disconnected');
        setConnected(false);
        setConnecting(false);
        
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };

      ws.onerror = (e) => {
        console.error('[OpenClaw] WebSocket error:', e);
        setError('Failed to connect to OpenClaw Gateway');
        setConnecting(false);
      };

      wsRef.current = ws;
    } catch (e) {
      setError(e.message);
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const handleMessage = (data) => {
    switch (data.type) {
      case 'sessions.list':
        setSessions(data.sessions || []);
        break;
      case 'session.updated':
        setSessions(prev => 
          prev.map(s => s.key === data.session.key ? data.session : s)
        );
        break;
      default:
        console.log('[OpenClaw] Message:', data.type);
    }
  };

  // Send message to Gateway
  const send = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Execute agent with message
  const executeAgent = useCallback(async (message, options = {}) => {
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}`;
      
      const handler = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.requestId === requestId) {
            wsRef.current?.removeEventListener('message', handler);
            if (data.error) {
              reject(new Error(data.error));
            } else {
              resolve(data);
            }
          }
        } catch (e) {}
      };

      wsRef.current?.addEventListener('message', handler);
      
      send({
        type: 'agent.execute',
        requestId,
        message,
        ...options,
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        wsRef.current?.removeEventListener('message', handler);
        reject(new Error('Request timeout'));
      }, 60000);
    });
  }, [send]);

  // Run a cron job
  const runCronJob = useCallback((jobId) => {
    return send({ type: 'cron.run', jobId });
  }, [send]);

  // List cron jobs
  const listCronJobs = useCallback(() => {
    return send({ type: 'cron.list' });
  }, [send]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    connected,
    connecting,
    error,
    sessions,
    send,
    executeAgent,
    runCronJob,
    listCronJobs,
    connect,
    disconnect,
  };
}

export default useOpenClaw;
