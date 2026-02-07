/**
 * Dashboard Component - User Frontend
 * Renders a dashboard with widgets
 */

import React, { useState, useEffect } from 'react';
import { WidgetRenderer } from './widgets';
import './widgets/widgets.css';

export function Dashboard({ dashboardId, apiBase = '' }) {
  const [dashboard, setDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        // If dashboardId provided, fetch specific dashboard
        // Otherwise fetch default dashboard
        let url = dashboardId 
          ? `${apiBase}/api/widgets/dashboards/${dashboardId}`
          : `${apiBase}/api/widgets/dashboards`;

        const response = await fetch(url);
        const data = await response.json();

        if (!dashboardId && data.dashboards) {
          // Find default dashboard or first one
          const defaultDash = data.dashboards.find(d => d.isDefault) || data.dashboards[0];
          if (defaultDash) {
            // Fetch full dashboard with widgets
            const fullResponse = await fetch(`${apiBase}/api/widgets/dashboards/${defaultDash.id}`);
            const fullData = await fullResponse.json();
            setDashboard(fullData.dashboard);
            setWidgets(fullData.widgets || []);
          } else {
            setError('Kein Dashboard verfügbar');
          }
        } else if (data.dashboard) {
          setDashboard(data.dashboard);
          setWidgets(data.widgets || []);
        } else {
          setError(data.error || 'Dashboard nicht gefunden');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [dashboardId, apiBase]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Dashboard wird geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Fehler</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboard || widgets.length === 0) {
    return (
      <div className="dashboard-empty">
        <h3>Keine Widgets</h3>
        <p>Dieses Dashboard enthält noch keine Widgets.</p>
      </div>
    );
  }

  const columns = dashboard.columns || 4;
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '20px',
    padding: '20px',
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{dashboard.name}</h1>
        {dashboard.description && <p>{dashboard.description}</p>}
      </div>

      <div className="dashboard" style={dashboard.layout === 'list' ? {} : gridStyle}>
        {widgets.map(widget => (
          <div 
            key={widget.id}
            className={`dashboard-widget w-${widget.position?.width || 1} h-${widget.position?.height || 1}`}
          >
            <WidgetRenderer config={widget} apiBase={apiBase} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Styles for dashboard container
const dashboardStyles = `
.dashboard-container {
  min-height: 100vh;
  background: var(--bg-primary, #12121a);
  color: var(--text-primary, #fff);
}

.dashboard-header {
  padding: 24px 20px 0;
}

.dashboard-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.dashboard-header p {
  margin: 0;
  color: var(--text-secondary, #888);
  font-size: 15px;
}

.dashboard-loading,
.dashboard-error,
.dashboard-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: var(--text-secondary, #888);
}

.dashboard-error h3,
.dashboard-empty h3 {
  margin: 0 0 8px 0;
  color: var(--text-primary, #fff);
}

.dashboard-error {
  color: #ef4444;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'dashboard-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = dashboardStyles;
    document.head.appendChild(style);
  }
}

export default Dashboard;
