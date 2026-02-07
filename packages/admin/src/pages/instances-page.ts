import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('instances-page')
export class InstancesPage extends LitElement {
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
    
    .instances-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    
    .instance-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .instance-card.primary {
      border-color: var(--accent-primary);
    }
    
    .instance-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }
    
    .instance-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .instance-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--accent-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    
    .instance-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .instance-id {
      font-size: 11px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    
    .instance-badge {
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      background: var(--accent-primary);
      color: #000;
      font-weight: 600;
    }
    
    .instance-body {
      padding: 16px 20px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 13px;
    }
    
    .info-row:last-child { border-bottom: none; }
    
    .info-label { color: var(--text-secondary); }
    .info-value { color: var(--text-primary); }
    .info-value.online { color: var(--accent-primary); }
    
    .instance-footer {
      padding: 12px 20px;
      background: var(--bg-tertiary);
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: 8px;
    }
    
    .action-btn {
      flex: 1;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .action-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
  `;

  @property({ type: Object }) config: any = null;

  render() {
    const instanceName = this.config?.instance?.name || '0711-C Intelligence';
    
    return html`
      <div class="page-header">
        <h1 class="page-title">Instances</h1>
        <p class="page-subtitle">Gateway instances and presence</p>
      </div>
      
      <div class="instances-grid">
        <div class="instance-card primary">
          <div class="instance-header">
            <div class="instance-info">
              <div class="instance-icon">📊</div>
              <div>
                <div class="instance-name">${instanceName}</div>
                <div class="instance-id">primary-001</div>
              </div>
            </div>
            <span class="instance-badge">PRIMARY</span>
          </div>
          <div class="instance-body">
            <div class="info-row">
              <span class="info-label">Status</span>
              <span class="info-value online">● Online</span>
            </div>
            <div class="info-row">
              <span class="info-label">Host</span>
              <span class="info-value">localhost:7074</span>
            </div>
            <div class="info-row">
              <span class="info-label">Uptime</span>
              <span class="info-value">2h 35m</span>
            </div>
            <div class="info-row">
              <span class="info-label">Version</span>
              <span class="info-value">2026.2.1</span>
            </div>
            <div class="info-row">
              <span class="info-label">Agents</span>
              <span class="info-value">${this.config?.agents?.list?.length || 0}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Active Sessions</span>
              <span class="info-value">4</span>
            </div>
          </div>
          <div class="instance-footer">
            <button class="action-btn">Restart</button>
            <button class="action-btn">Logs</button>
            <button class="action-btn">Config</button>
          </div>
        </div>
      </div>
    `;
  }
}
