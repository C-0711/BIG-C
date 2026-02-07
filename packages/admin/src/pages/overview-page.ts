import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('overview-page')
export class OverviewPage extends LitElement {
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
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
    }
    
    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .stat-value.healthy {
      color: var(--accent-primary);
    }
    
    .section {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: var(--text-secondary);
    }
    
    .info-value {
      color: var(--text-primary);
      font-family: var(--font-mono);
    }
  `;

  @property({ type: Object }) config: any = null;

  render() {
    const agents = this.config?.agents?.list || [];
    const workflows = this.config?.workflows?.list || [];
    const dataSources = Object.keys(this.config?.dataSources?.providers || {});
    const outputs = Object.keys(this.config?.outputs?.providers || {});
    
    const enabledAgents = agents.filter((a: any) => a.enabled !== false).length;
    const enabledWorkflows = workflows.filter((w: any) => w.enabled !== false).length;

    return html`
      <div class="page-header">
        <h1 class="page-title">Overview</h1>
        <p class="page-subtitle">Gateway status and configuration summary</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Status</div>
          <div class="stat-value healthy">● OK</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Agents</div>
          <div class="stat-value">${enabledAgents}/${agents.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Workflows</div>
          <div class="stat-value">${enabledWorkflows}/${workflows.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Data Sources</div>
          <div class="stat-value">${dataSources.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Outputs</div>
          <div class="stat-value">${outputs.length}</div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Instance Information</h2>
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-value">${this.config?.instance?.name || '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Template</span>
          <span class="info-value">${this.config?.ui?.template || 'default'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Theme</span>
          <span class="info-value">${this.config?.ui?.theme || 'light'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Locale</span>
          <span class="info-value">${this.config?.instance?.locale || 'de-DE'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Auth Mode</span>
          <span class="info-value">${this.config?.auth?.mode || 'password'}</span>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Default Model</h2>
        <div class="info-row">
          <span class="info-label">Primary</span>
          <span class="info-value">${this.config?.agents?.defaults?.model?.primary || '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Thinking</span>
          <span class="info-value">${this.config?.agents?.defaults?.thinkingDefault || 'low'}</span>
        </div>
      </div>
    `;
  }
}
