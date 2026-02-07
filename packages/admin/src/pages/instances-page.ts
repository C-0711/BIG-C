import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService, type Config } from '../services/index';

@customElement('instances-page')
export class InstancesPage extends LitElement {
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

    .instance-card {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 24px;
    }

    .instance-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .instance-icon {
      font-size: 40px;
    }

    .instance-title h2 {
      margin: 0 0 4px 0;
      font-size: 20px;
    }

    .instance-title .status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #10b981;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .info-label {
      font-size: 12px;
      color: var(--text-secondary, #888);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 14px;
      font-family: monospace;
    }
  `;

  @state() private config: Config | null = null;
  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      this.config = config;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  render() {
    return html`
      <div class="header">
        <h1>Instance</h1>
        <p>Current instance information and status</p>
      </div>

      <div class="instance-card">
        <div class="instance-header">
          <span class="instance-icon">📊</span>
          <div class="instance-title">
            <h2>${this.config?.instance?.name || '0711-C-Intelligence'}</h2>
            <div class="status">
              <span class="status-dot"></span>
              Running
            </div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Instance Name</span>
            <span class="info-value">${this.config?.instance?.name || '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Template</span>
            <span class="info-value">${this.config?.instance?.template || 'default'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Locale</span>
            <span class="info-value">${this.config?.instance?.locale || 'en-US'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Auth Mode</span>
            <span class="info-value">${this.config?.auth?.mode || 'password'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Agents</span>
            <span class="info-value">${this.config?.agents?.list?.length || 0} configured</span>
          </div>
          <div class="info-item">
            <span class="info-label">Workflows</span>
            <span class="info-value">${this.config?.workflows?.list?.length || 0} configured</span>
          </div>
          <div class="info-item">
            <span class="info-label">Theme</span>
            <span class="info-value">${this.config?.ui?.theme || 'light'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Primary Color</span>
            <span class="info-value">${this.config?.ui?.branding?.primaryColor || '#3B82F6'}</span>
          </div>
        </div>
      </div>
    `;
  }
}
