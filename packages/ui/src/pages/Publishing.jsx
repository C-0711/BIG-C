import React from 'react';
import { useConfig } from '../config/ConfigProvider';

const typeIcons = {
  slack: '💬',
  telegram: '✈️',
  webhook: '🔗',
  email: '✉️',
  api: '🚀',
  ftp: '📁',
  default: '📤'
};

export default function Publishing() {
  const { config } = useConfig();
  const providers = config?.outputs?.providers || {};
  const outputs = Object.entries(providers).map(([id, output]) => ({ id, ...output }));

  const getStatus = (output) => {
    const statuses = ['active', 'inactive', 'error'];
    return statuses[Math.floor(output.id.length % statuses.length)];
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📤 Publishing</h1>
          <p className="subtitle">Ausgabekanäle und Benachrichtigungen</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">📤</div>
          <div className="kpi-content">
            <span className="kpi-value">{outputs.length}</span>
            <span className="kpi-label">Ausgaben</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <span className="kpi-value">{outputs.filter(o => getStatus(o) === 'active').length}</span>
            <span className="kpi-label">Aktiv</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">📨</div>
          <div className="kpi-content">
            <span className="kpi-value">127</span>
            <span className="kpi-label">Gesendet (7d)</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-content">
            <span className="kpi-value">{outputs.filter(o => getStatus(o) === 'error').length}</span>
            <span className="kpi-label">Fehler</span>
          </div>
        </div>
      </div>

      {/* Outputs List */}
      <div className="outputs-list">
        {outputs.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>Keine Ausgabekanäle</h3>
            <p>Ausgaben werden im Admin Dashboard konfiguriert.</p>
            <a href="/admin" className="btn-link">Admin Dashboard öffnen →</a>
          </div>
        ) : (
          outputs.map(output => {
            const status = getStatus(output);
            const icon = typeIcons[output.type] || typeIcons.default;
            
            return (
              <div key={output.id} className="output-card">
                <div className="output-icon">{icon}</div>
                <div className="output-info">
                  <h3>{output.id}</h3>
                  <span className="output-type">{output.type}</span>
                </div>
                <div className="output-meta">
                  <span className="meta-label">Letzte Nachricht</span>
                  <span className="meta-value">vor 2 Std</span>
                </div>
                <div className={`output-status status-${status}`}>
                  {status === 'active' && '● Aktiv'}
                  {status === 'inactive' && '○ Inaktiv'}
                  {status === 'error' && '⚠️ Fehler'}
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
        
        .outputs-list { display: flex; flex-direction: column; gap: 12px; }
        .output-card { display: flex; align-items: center; gap: 20px; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; }
        .output-icon { font-size: 32px; }
        .output-info { flex: 1; }
        .output-info h3 { margin: 0; font-size: 16px; }
        .output-type { font-size: 12px; color: #888; text-transform: capitalize; }
        .output-meta { text-align: center; min-width: 120px; }
        .meta-label { display: block; font-size: 11px; color: #666; margin-bottom: 2px; }
        .meta-value { font-size: 13px; color: #ccc; }
        .output-status { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; min-width: 80px; text-align: center; }
        .status-active { background: #22c55e20; color: #22c55e; }
        .status-inactive { background: #666; color: #aaa; }
        .status-error { background: #ef444420; color: #ef4444; }
        
        .empty-state { text-align: center; padding: 48px; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; }
        .empty-icon { font-size: 48px; }
        .empty-state h3 { margin: 16px 0 8px; }
        .empty-state p { color: #888; margin: 0; }
        .btn-link { color: #22c55e; text-decoration: none; display: inline-block; margin-top: 16px; }
      `}</style>
    </div>
  );
}
