import React from 'react';
import { useConfig } from '../config/ConfigProvider';

const typeIcons = {
  postgres: '🐘',
  mysql: '🐬',
  csv: '📄',
  excel: '📊',
  'rest-api': '🌐',
  mcp: '🔌',
  default: '📁'
};

const typeNames = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  csv: 'CSV',
  excel: 'Excel',
  'rest-api': 'REST API',
  mcp: 'MCP Server'
};

export default function Integrations() {
  const { config } = useConfig();
  const providers = config?.dataSources?.providers || {};
  const sources = Object.entries(providers).map(([id, source]) => ({ id, ...source }));

  // Mock sync status
  const getStatus = (source) => {
    const statuses = ['synced', 'syncing', 'error', 'pending'];
    return statuses[Math.floor(source.id.length % statuses.length)];
  };

  const getLastSync = (source) => {
    const times = ['vor 5 Min', 'vor 1 Std', 'vor 3 Std', 'Heute 08:00'];
    return times[Math.floor(source.id.length % times.length)];
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🔌 Integrationen</h1>
          <p className="subtitle">Datenquellen und Verbindungen</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">🔌</div>
          <div className="kpi-content">
            <span className="kpi-value">{sources.length}</span>
            <span className="kpi-label">Datenquellen</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <span className="kpi-value">{sources.filter(s => getStatus(s) === 'synced').length}</span>
            <span className="kpi-label">Synchronisiert</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">🔄</div>
          <div className="kpi-content">
            <span className="kpi-value">{sources.filter(s => s.sync?.schedule).length}</span>
            <span className="kpi-label">Auto-Sync</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-content">
            <span className="kpi-value">{sources.filter(s => getStatus(s) === 'error').length}</span>
            <span className="kpi-label">Fehler</span>
          </div>
        </div>
      </div>

      {/* Data Sources List */}
      <div className="sources-list">
        {sources.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>Keine Datenquellen</h3>
            <p>Datenquellen werden im Admin Dashboard konfiguriert.</p>
            <a href="/admin" className="btn-link">Admin Dashboard öffnen →</a>
          </div>
        ) : (
          sources.map(source => {
            const status = getStatus(source);
            const icon = typeIcons[source.type] || typeIcons.default;
            const typeName = typeNames[source.type] || source.type;
            
            return (
              <div key={source.id} className="source-card">
                <div className="source-icon">{icon}</div>
                <div className="source-info">
                  <h3>{source.id}</h3>
                  <span className="source-type">{typeName}</span>
                </div>
                <div className="source-meta">
                  <span className="meta-label">Letzter Sync</span>
                  <span className="meta-value">{getLastSync(source)}</span>
                </div>
                <div className="source-schedule">
                  <span className="meta-label">Schedule</span>
                  <span className="meta-value">{source.sync?.schedule || '—'}</span>
                </div>
                <div className={`source-status status-${status}`}>
                  {status === 'synced' && '✓ Synchronisiert'}
                  {status === 'syncing' && '🔄 Läuft...'}
                  {status === 'error' && '⚠️ Fehler'}
                  {status === 'pending' && '⏳ Ausstehend'}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { margin: 0; font-size: 28px; }
        .subtitle { color: #888; margin-top: 4px; }
        
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .kpi-card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; }
        .kpi-icon { font-size: 32px; }
        .kpi-content { display: flex; flex-direction: column; }
        .kpi-value { font-size: 24px; font-weight: 600; color: #22c55e; }
        .kpi-label { font-size: 13px; color: #888; }
        
        .sources-list { display: flex; flex-direction: column; gap: 12px; }
        .source-card { display: flex; align-items: center; gap: 20px; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; }
        .source-icon { font-size: 32px; }
        .source-info { flex: 1; }
        .source-info h3 { margin: 0; font-size: 16px; }
        .source-type { font-size: 12px; color: #888; }
        .source-meta, .source-schedule { text-align: center; min-width: 100px; }
        .meta-label { display: block; font-size: 11px; color: #666; margin-bottom: 2px; }
        .meta-value { font-size: 13px; color: #ccc; }
        .source-status { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; }
        .status-synced { background: #22c55e20; color: #22c55e; }
        .status-syncing { background: #3b82f620; color: #3b82f6; }
        .status-error { background: #ef444420; color: #ef4444; }
        .status-pending { background: #f59e0b20; color: #f59e0b; }
        
        .empty-state { text-align: center; padding: 48px; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; }
        .empty-icon { font-size: 48px; }
        .empty-state h3 { margin: 16px 0 8px; }
        .empty-state p { color: #888; margin: 0; }
        .btn-link { color: #22c55e; text-decoration: none; display: inline-block; margin-top: 16px; }
      `}</style>
    </div>
  );
}
