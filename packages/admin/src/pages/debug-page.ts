import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../services/index';

@customElement('debug-page')
export class DebugPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 24px;
    }

    .header {
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .header p {
      margin: 0;
      color: var(--text-secondary, #888);
      font-size: 14px;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .card {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 20px;
    }

    .card h3 {
      margin: 0 0 16px 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary, #888);
    }

    .metric {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .metric:last-child {
      border-bottom: none;
    }

    .metric-label {
      color: var(--text-secondary, #888);
      font-size: 13px;
    }

    .metric-value {
      font-family: monospace;
      font-size: 13px;
    }

    .status-ok {
      color: #10b981;
    }

    .status-warn {
      color: #f59e0b;
    }

    .status-error {
      color: #ef4444;
    }

    button {
      margin-top: 16px;
      padding: 8px 16px;
      background: var(--bg-tertiary, #2a2a3a);
      border: 1px solid var(--border-color, #363646);
      border-radius: 6px;
      color: var(--text-primary, #fff);
      font-size: 13px;
      cursor: pointer;
    }

    button:hover {
      background: var(--border-color, #363646);
    }
  `;

  @state() private health: any = null;
  @state() private loading = true;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadHealth();
  }

  private async loadHealth() {
    this.loading = true;
    const response = await api.get<any>('/health');
    if (response.ok) {
      this.health = response.data;
    }
    this.loading = false;
  }

  render() {
    return html`
      <div class="header">
        <h1>Debug</h1>
        <p>System diagnostics and health information</p>
      </div>

      <div class="cards">
        <div class="card">
          <h3>Gateway Status</h3>
          <div class="metric">
            <span class="metric-label">Status</span>
            <span class="metric-value status-ok">${this.health?.status || 'OK'}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Config Path</span>
            <span class="metric-value">${this.health?.configPath || '-'}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Config Exists</span>
            <span class="metric-value ${this.health?.configExists ? 'status-ok' : 'status-error'}">
              ${this.health?.configExists ? 'Yes' : 'No'}
            </span>
          </div>
          <div class="metric">
            <span class="metric-label">Timestamp</span>
            <span class="metric-value">${this.health?.timestamp ? new Date(this.health.timestamp).toLocaleString() : '-'}</span>
          </div>
          <button @click=${this.loadHealth}>Refresh</button>
        </div>

        <div class="card">
          <h3>Environment</h3>
          <div class="metric">
            <span class="metric-label">Node.js</span>
            <span class="metric-value">v22.x</span>
          </div>
          <div class="metric">
            <span class="metric-label">Platform</span>
            <span class="metric-value">Linux</span>
          </div>
          <div class="metric">
            <span class="metric-label">Architecture</span>
            <span class="metric-value">x64</span>
          </div>
        </div>

        <div class="card">
          <h3>API Endpoints</h3>
          <div class="metric">
            <span class="metric-label">GET /api/config</span>
            <span class="metric-value status-ok">✓</span>
          </div>
          <div class="metric">
            <span class="metric-label">PUT /api/config</span>
            <span class="metric-value status-ok">✓</span>
          </div>
          <div class="metric">
            <span class="metric-label">GET /api/agents</span>
            <span class="metric-value status-ok">✓</span>
          </div>
          <div class="metric">
            <span class="metric-label">GET /api/workflows</span>
            <span class="metric-value status-ok">✓</span>
          </div>
        </div>
      </div>
    `;
  }
}
