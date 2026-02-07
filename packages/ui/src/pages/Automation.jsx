import React, { useState } from 'react';
import { useConfig } from '../config/ConfigProvider';

export default function Automation() {
  const { config, getEnabledWorkflows } = useConfig();
  const [runningIds, setRunningIds] = useState([]);
  
  const automations = getEnabledWorkflows().filter(w => w.type === 'automation');

  const handleRunNow = (workflow) => {
    setRunningIds(prev => [...prev, workflow.id]);
    console.log('Running workflow:', workflow.id);
    
    // Simulate completion
    setTimeout(() => {
      setRunningIds(prev => prev.filter(id => id !== workflow.id));
    }, 3000);
  };

  const getNextRun = (workflow) => {
    if (!workflow.trigger?.schedule) return '—';
    // Mock next run times
    const times = ['in 1 Std', 'in 3 Std', 'Morgen 08:00', 'Mo 09:00'];
    return times[Math.floor(workflow.id.length % times.length)];
  };

  const getLastRun = (workflow) => {
    const times = ['vor 5 Min', 'vor 1 Std', 'Heute 06:00', 'Gestern'];
    return times[Math.floor(workflow.id.length % times.length)];
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>⚡ Automation</h1>
          <p className="subtitle">Automatisierte Workflows und Prozesse</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">⚡</div>
          <div className="kpi-content">
            <span className="kpi-value">{automations.length}</span>
            <span className="kpi-label">Workflows</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <span className="kpi-value">{automations.filter(a => a.enabled).length}</span>
            <span className="kpi-label">Aktiv</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">🔄</div>
          <div className="kpi-content">
            <span className="kpi-value">{runningIds.length}</span>
            <span className="kpi-label">Laufend</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <span className="kpi-value">42</span>
            <span className="kpi-label">Ausführungen (7d)</span>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="workflows-list">
        {automations.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">⚡</span>
            <h3>Keine Automatisierungen</h3>
            <p>Workflows werden im Admin Dashboard konfiguriert.</p>
            <a href="/admin" className="btn-link">Admin Dashboard öffnen →</a>
          </div>
        ) : (
          automations.map(workflow => {
            const isRunning = runningIds.includes(workflow.id);
            
            return (
              <div key={workflow.id} className="workflow-card">
                <div className="workflow-icon">⚡</div>
                <div className="workflow-info">
                  <h3>{workflow.name || workflow.id}</h3>
                  <span className="workflow-schedule">
                    {workflow.trigger?.schedule || 'Manuell'}
                  </span>
                </div>
                <div className="workflow-meta">
                  <span className="meta-label">Letzter Lauf</span>
                  <span className="meta-value">{getLastRun(workflow)}</span>
                </div>
                <div className="workflow-meta">
                  <span className="meta-label">Nächster Lauf</span>
                  <span className="meta-value">{getNextRun(workflow)}</span>
                </div>
                <div className={`workflow-status ${workflow.enabled ? 'active' : 'inactive'}`}>
                  {workflow.enabled ? '● Aktiv' : '○ Inaktiv'}
                </div>
                <button 
                  className={`run-btn ${isRunning ? 'running' : ''}`}
                  onClick={() => handleRunNow(workflow)}
                  disabled={isRunning}
                >
                  {isRunning ? '🔄 Läuft...' : '▶ Run Now'}
                </button>
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
        
        .workflows-list { display: flex; flex-direction: column; gap: 12px; }
        .workflow-card { display: flex; align-items: center; gap: 20px; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; }
        .workflow-icon { font-size: 28px; }
        .workflow-info { flex: 1; }
        .workflow-info h3 { margin: 0; font-size: 16px; }
        .workflow-schedule { font-size: 12px; color: #888; font-family: monospace; }
        .workflow-meta { text-align: center; min-width: 100px; }
        .meta-label { display: block; font-size: 11px; color: #666; margin-bottom: 2px; }
        .meta-value { font-size: 13px; color: #ccc; }
        .workflow-status { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; }
        .workflow-status.active { background: #22c55e20; color: #22c55e; }
        .workflow-status.inactive { background: #333; color: #888; }
        
        .run-btn { background: #333; color: #fff; border: 1px solid #444; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.15s; }
        .run-btn:hover:not(:disabled) { background: #22c55e; color: #000; border-color: #22c55e; }
        .run-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .run-btn.running { background: #3b82f620; color: #3b82f6; border-color: #3b82f6; }
        
        .empty-state { text-align: center; padding: 48px; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; }
        .empty-icon { font-size: 48px; }
        .empty-state h3 { margin: 16px 0 8px; }
        .empty-state p { color: #888; margin: 0; }
        .btn-link { color: #22c55e; text-decoration: none; display: inline-block; margin-top: 16px; }
      `}</style>
    </div>
  );
}
