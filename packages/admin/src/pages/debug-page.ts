import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('debug-page')
export class DebugPage extends LitElement {
  static styles = css`
    :host { display: block; }
    
    .page-header {
      margin-bottom: 24px;
    }
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px;
    }
    
    .page-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    
    .card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }
    
    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .card-badge {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 12px;
    }
    
    .card-badge.ok {
      background: var(--accent-primary);
      color: #000;
    }
    
    .card-badge.warn {
      background: #f59e0b;
      color: #000;
    }
    
    .card-badge.error {
      background: var(--accent-danger);
      color: #fff;
    }
    
    .card-body {
      padding: 16px 20px;
    }
    
    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .metric-row:last-child {
      border-bottom: none;
    }
    
    .metric-label {
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .metric-value {
      font-size: 13px;
      color: var(--text-primary);
      font-family: var(--font-mono);
    }
    
    .metric-value.ok { color: var(--accent-primary); }
    .metric-value.warn { color: #f59e0b; }
    .metric-value.error { color: var(--accent-danger); }
    
    .progress-bar {
      width: 100px;
      height: 6px;
      background: var(--bg-primary);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: var(--accent-primary);
      border-radius: 3px;
    }
    
    .progress-fill.warn { background: #f59e0b; }
    .progress-fill.error { background: var(--accent-danger); }
    
    .event-list {
      max-height: 200px;
      overflow-y: auto;
    }
    
    .event {
      display: flex;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 12px;
    }
    
    .event:last-child { border-bottom: none; }
    
    .event-time {
      color: var(--text-muted);
      font-family: var(--font-mono);
      flex-shrink: 0;
    }
    
    .event-msg {
      color: var(--text-secondary);
    }
    
    .actions {
      margin-top: 20px;
      display: flex;
      gap: 12px;
    }
    
    .action-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .action-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    .action-btn.danger {
      border-color: var(--accent-danger);
      color: var(--accent-danger);
    }
    
    .action-btn.danger:hover {
      background: var(--accent-danger);
      color: #fff;
    }
  `;

  @property({ type: Object }) config: any = null;
  
  private events = [
    { time: '12:28:15', msg: 'Config reloaded successfully' },
    { time: '12:27:42', msg: 'WebSocket client connected' },
    { time: '12:25:10', msg: 'Workflow daily-quality-check completed' },
    { time: '12:20:00', msg: 'Gateway started' },
    { time: '12:19:55', msg: 'Database connection established' },
  ];

  render() {
    return html`
      <div class="page-header">
        <h1 class="page-title">Debug</h1>
        <p class="page-subtitle">System health and diagnostic information</p>
      </div>
      
      <div class="grid">
        <!-- Gateway Health -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Gateway Health</span>
            <span class="card-badge ok">● Healthy</span>
          </div>
          <div class="card-body">
            <div class="metric-row">
              <span class="metric-label">Status</span>
              <span class="metric-value ok">Running</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Uptime</span>
              <span class="metric-value">2h 15m</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Version</span>
              <span class="metric-value">2026.2.1</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Port</span>
              <span class="metric-value">7074</span>
            </div>
          </div>
        </div>
        
        <!-- System Resources -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">System Resources</span>
            <span class="card-badge ok">Normal</span>
          </div>
          <div class="card-body">
            <div class="metric-row">
              <span class="metric-label">CPU</span>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 15%"></div>
                </div>
                <span class="metric-value">15%</span>
              </div>
            </div>
            <div class="metric-row">
              <span class="metric-label">Memory</span>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 42%"></div>
                </div>
                <span class="metric-value">42%</span>
              </div>
            </div>
            <div class="metric-row">
              <span class="metric-label">Disk</span>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="progress-bar">
                  <div class="progress-fill warn" style="width: 82%"></div>
                </div>
                <span class="metric-value warn">82%</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Config Status -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Config Status</span>
            <span class="card-badge ok">Valid</span>
          </div>
          <div class="card-body">
            <div class="metric-row">
              <span class="metric-label">File</span>
              <span class="metric-value">~/.0711/config.json</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Last Modified</span>
              <span class="metric-value">${new Date().toLocaleString('de-DE')}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Agents</span>
              <span class="metric-value">${this.config?.agents?.list?.length || 0}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Workflows</span>
              <span class="metric-value">${this.config?.workflows?.list?.length || 0}</span>
            </div>
          </div>
        </div>
        
        <!-- Recent Events -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Recent Events</span>
          </div>
          <div class="card-body">
            <div class="event-list">
              ${this.events.map(e => html`
                <div class="event">
                  <span class="event-time">${e.time}</span>
                  <span class="event-msg">${e.msg}</span>
                </div>
              `)}
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button class="action-btn">⟳ Reload Config</button>
        <button class="action-btn">📋 Export Diagnostics</button>
        <button class="action-btn danger">🗑️ Clear Cache</button>
      </div>
    `;
  }
}
