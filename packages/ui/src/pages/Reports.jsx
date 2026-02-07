import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../config/ConfigProvider';

export default function Reports() {
  const navigate = useNavigate();
  const { config, getInstance, getEnabledWorkflows } = useConfig();
  const instance = getInstance();
  
  const reports = getEnabledWorkflows().filter(w => w.type === 'report');
  const templates = config?.reportTemplates || [
    { id: 'quality-report', name: 'Qualitätsbericht', description: 'Vollständige Datenqualitätsanalyse', icon: '📊' },
    { id: 'inventory-report', name: 'Bestandsübersicht', description: 'Aktueller Produktbestand', icon: '📦' },
    { id: 'change-report', name: 'Änderungsprotokoll', description: 'Alle Änderungen der letzten 7 Tage', icon: '📝' },
  ];

  const recentReports = [
    { id: 1, name: 'Qualitätsbericht KW5', template: 'quality-report', date: '2026-02-03', status: 'completed' },
    { id: 2, name: 'Bestandsübersicht Feb', template: 'inventory-report', date: '2026-02-01', status: 'completed' },
    { id: 3, name: 'Wöchentlicher Export', template: 'change-report', date: '2026-01-28', status: 'completed' },
  ];

  const handleRunReport = (templateId) => {
    console.log('Running report template:', templateId);
    // TODO: API call to run report
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📊 Reports</h1>
          <p className="subtitle">Berichte erstellen und verwalten</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/reports/new')}>
          + Neuer Bericht
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <span className="kpi-value">{templates.length}</span>
            <span className="kpi-label">Vorlagen</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">📄</div>
          <div className="kpi-content">
            <span className="kpi-value">{recentReports.length}</span>
            <span className="kpi-label">Erstellt</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">⚡</div>
          <div className="kpi-content">
            <span className="kpi-value">{reports.length}</span>
            <span className="kpi-label">Automatisiert</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">📅</div>
          <div className="kpi-content">
            <span className="kpi-value">Heute</span>
            <span className="kpi-label">Letzter Bericht</span>
          </div>
        </div>
      </div>

      {/* Template Cards */}
      <section className="section">
        <h2>Berichtsvorlagen</h2>
        <div className="template-grid">
          {templates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-icon">{template.icon}</div>
              <div className="template-content">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
              </div>
              <div className="template-actions">
                <button className="btn-secondary" onClick={() => handleRunReport(template.id)}>
                  Ausführen
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Reports List */}
      <section className="section">
        <h2>Letzte Berichte</h2>
        <div className="item-list">
          {recentReports.map(report => (
            <div key={report.id} className="item-row">
              <div className="item-info">
                <span className="item-name">{report.name}</span>
                <span className="item-meta">{report.date}</span>
              </div>
              <div className="item-status">
                <span className={`status-badge status-${report.status}`}>
                  {report.status === 'completed' ? '✓ Fertig' : 'Läuft...'}
                </span>
              </div>
              <div className="item-actions">
                <button className="btn-icon" title="Anzeigen">👁️</button>
                <button className="btn-icon" title="Download">⬇️</button>
                <button className="btn-icon" title="Teilen">📤</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .page-header h1 { margin: 0; font-size: 28px; }
        .subtitle { color: #888; margin-top: 4px; }
        
        .btn-primary { background: #22c55e; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; }
        .btn-secondary { background: #333; color: #fff; border: 1px solid #444; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
        .btn-icon { background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px 8px; }
        
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .kpi-card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; }
        .kpi-icon { font-size: 32px; }
        .kpi-content { display: flex; flex-direction: column; }
        .kpi-value { font-size: 24px; font-weight: 600; color: #22c55e; }
        .kpi-label { font-size: 13px; color: #888; }
        
        .section { margin-bottom: 32px; }
        .section h2 { font-size: 18px; margin-bottom: 16px; color: #ccc; }
        
        .template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .template-card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .template-icon { font-size: 32px; }
        .template-content h3 { margin: 0; font-size: 16px; }
        .template-content p { margin: 4px 0 0; font-size: 13px; color: #888; }
        .template-actions { margin-top: auto; }
        
        .item-list { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
        .item-row { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid #333; }
        .item-row:last-child { border-bottom: none; }
        .item-info { flex: 1; }
        .item-name { display: block; font-weight: 500; }
        .item-meta { font-size: 12px; color: #666; }
        .item-status { margin-right: 16px; }
        .status-badge { padding: 4px 10px; border-radius: 4px; font-size: 12px; }
        .status-completed { background: #22c55e20; color: #22c55e; }
        .item-actions { display: flex; gap: 4px; }
      `}</style>
    </div>
  );
}
