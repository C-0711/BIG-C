/**
 * Widget Renderer Component
 * Renders widgets based on their type and data
 */

import React, { useState, useEffect } from 'react';
import { StatsCard } from './StatsCard';
import { DataTable } from './DataTable';
import { ListWidget } from './ListWidget';
import './widgets.css';

export function WidgetRenderer({ config, apiBase = '' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!config?.id) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${apiBase}/api/widgets/${config.id}/data`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to load data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup refresh interval if configured
    if (config.refresh?.enabled && config.refresh?.interval) {
      const ms = parseInterval(config.refresh.interval);
      const interval = setInterval(fetchData, ms);
      return () => clearInterval(interval);
    }
  }, [config?.id, apiBase]);

  const parseInterval = (interval) => {
    const match = interval.match(/^(\d+)(s|m|h)$/);
    if (!match) return 60000;
    const value = parseInt(match[1]);
    switch (match[2]) {
      case 's': return value * 1000;
      case 'm': return value * 60000;
      case 'h': return value * 3600000;
      default: return 60000;
    }
  };

  if (loading) {
    return (
      <div className="widget">
        <div className="widget-header">
          <span className="widget-title">{config?.name || 'Loading...'}</span>
        </div>
        <div className="widget-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget">
        <div className="widget-header">
          <span className="widget-title">{config?.name || 'Error'}</span>
        </div>
        <div className="widget-error">{error}</div>
      </div>
    );
  }

  const renderWidget = () => {
    switch (config?.type) {
      case 'stats-card':
        return <StatsCard config={config} data={data} />;
      case 'data-table':
        return <DataTable config={config} data={data} />;
      case 'list':
        return <ListWidget config={config} data={data} />;
      default:
        return (
          <pre className="widget-raw">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="widget">
      <div className="widget-header">
        <span className="widget-title">{config?.name}</span>
      </div>
      {renderWidget()}
    </div>
  );
}

export default WidgetRenderer;
