import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService, toastService, type Config } from '../services/index.js';

@customElement('template-page')
export class TemplatePage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header-left h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .header-left p {
      margin: 0;
      color: var(--text-secondary, #888);
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    button {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border-color, #363646);
      color: var(--text-primary, #fff);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-tertiary, #2a2a3a);
    }

    .btn-primary {
      background: var(--accent-color, #3b82f6);
      border: none;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .sections {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .section {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 24px;
    }

    .section h2 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .section p {
      margin: 0 0 20px 0;
      color: var(--text-secondary, #888);
      font-size: 14px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #888);
    }

    input, select {
      padding: 10px 12px;
      background: var(--bg-tertiary, #2a2a3a);
      border: 1px solid var(--border-color, #363646);
      border-radius: 6px;
      color: var(--text-primary, #fff);
      font-size: 14px;
    }

    input:focus, select:focus {
      outline: none;
      border-color: var(--accent-color, #3b82f6);
    }

    select {
      cursor: pointer;
    }

    .color-input-wrapper {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    input[type="color"] {
      width: 50px;
      height: 38px;
      padding: 4px;
      cursor: pointer;
    }

    .color-preview {
      width: 80px;
      padding: 10px;
      border-radius: 6px;
      text-align: center;
      font-size: 12px;
      font-family: monospace;
    }

    .toggle-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--bg-tertiary, #2a2a3a);
      border-radius: 8px;
    }

    .toggle-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .toggle-label {
      font-size: 14px;
      font-weight: 500;
    }

    .toggle-desc {
      font-size: 12px;
      color: var(--text-secondary, #888);
    }

    .toggle {
      position: relative;
      width: 48px;
      height: 26px;
    }

    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--border-color, #363646);
      border-radius: 26px;
      transition: 0.3s;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 0.3s;
    }

    .toggle input:checked + .toggle-slider {
      background: var(--accent-color, #3b82f6);
    }

    .toggle input:checked + .toggle-slider:before {
      transform: translateX(22px);
    }

    .dirty-indicator {
      display: inline-block;
      margin-left: 8px;
      padding: 4px 8px;
      background: #f59e0b;
      color: #000;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
  `;

  @state() private config: Config | null = null;
  @state() private saving = false;
  @state() private isDirty = false;
  
  // Form state
  @state() private instanceName = '';
  @state() private locale = 'de-DE';
  @state() private logoUrl = '';
  @state() private theme = 'light';
  @state() private template = 'default';
  @state() private primaryColor = '#3b82f6';
  @state() private accentColor = '#10b981';
  @state() private showKPIs = true;
  @state() private showRecentActivity = true;
  @state() private showQuickActions = true;

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      if (config) {
        this.config = config;
        this.loadFromConfig(config);
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private loadFromConfig(config: Config) {
    this.instanceName = config.instance?.name || '';
    this.locale = config.instance?.locale || 'de-DE';
    this.logoUrl = config.instance?.logo || '';
    this.theme = config.ui?.theme || 'light';
    this.template = config.ui?.template || 'default';
    this.primaryColor = config.ui?.branding?.primaryColor || '#3b82f6';
    this.accentColor = config.ui?.branding?.accentColor || '#10b981';
    this.showKPIs = config.ui?.dashboard?.showKPIs ?? true;
    this.showRecentActivity = config.ui?.dashboard?.showRecentActivity ?? true;
    this.showQuickActions = config.ui?.dashboard?.showQuickActions ?? true;
    this.isDirty = false;
  }

  private markDirty() {
    this.isDirty = true;
  }

  private handlePreview() {
    window.open('/app', '_blank');
  }

  private async handleSave() {
    if (!this.config || this.saving) return;
    
    this.saving = true;
    
    const updatedConfig: Config = {
      ...this.config,
      instance: {
        ...this.config.instance,
        name: this.instanceName,
        locale: this.locale,
        logo: this.logoUrl || undefined,
      },
      ui: {
        ...this.config.ui,
        theme: this.theme,
        template: this.template,
        branding: {
          primaryColor: this.primaryColor,
          accentColor: this.accentColor,
        },
        dashboard: {
          showKPIs: this.showKPIs,
          showRecentActivity: this.showRecentActivity,
          showQuickActions: this.showQuickActions,
        },
      },
    };
    
    const success = await configService.save(updatedConfig);
    if (success) {
      this.isDirty = false;
    }
    
    this.saving = false;
  }

  render() {
    return html`
      <div class="header">
        <div class="header-left">
          <h1>
            Template & UI
            ${this.isDirty ? html`<span class="dirty-indicator">Unsaved</span>` : ''}
          </h1>
          <p>Customize the User Interface appearance</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click=${this.handlePreview}>
            👁️ Preview User UI
          </button>
          <button 
            class="btn-primary" 
            @click=${this.handleSave}
            ?disabled=${!this.isDirty || this.saving}
          >
            ${this.saving ? html`<span class="spinner"></span>` : ''}
            Save Changes
          </button>
        </div>
      </div>

      <div class="sections">
        <!-- Instance Section -->
        <div class="section">
          <h2>Instance</h2>
          <p>Basic instance configuration</p>
          <div class="form-grid">
            <div class="form-group">
              <label>Instance Name</label>
              <input 
                type="text" 
                .value=${this.instanceName}
                @input=${(e: Event) => { this.instanceName = (e.target as HTMLInputElement).value; this.markDirty(); }}
              />
            </div>
            <div class="form-group">
              <label>Locale</label>
              <select 
                .value=${this.locale}
                @change=${(e: Event) => { this.locale = (e.target as HTMLSelectElement).value; this.markDirty(); }}
              >
                <option value="de-DE">Deutsch (DE)</option>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Logo URL</label>
              <input 
                type="text" 
                .value=${this.logoUrl}
                @input=${(e: Event) => { this.logoUrl = (e.target as HTMLInputElement).value; this.markDirty(); }}
                placeholder="/logo.svg"
              />
            </div>
          </div>
        </div>

        <!-- Theme Section -->
        <div class="section">
          <h2>Theme</h2>
          <p>Visual appearance settings</p>
          <div class="form-grid">
            <div class="form-group">
              <label>Theme Mode</label>
              <select
                .value=${this.theme}
                @change=${(e: Event) => { this.theme = (e.target as HTMLSelectElement).value; this.markDirty(); }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Template</label>
              <select
                .value=${this.template}
                @change=${(e: Event) => { this.template = (e.target as HTMLSelectElement).value; this.markDirty(); }}
              >
                <option value="default">Default</option>
                <option value="enterprise">Enterprise</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div class="form-group">
              <label>Primary Color</label>
              <div class="color-input-wrapper">
                <input 
                  type="color" 
                  .value=${this.primaryColor}
                  @input=${(e: Event) => { this.primaryColor = (e.target as HTMLInputElement).value; this.markDirty(); }}
                />
                <div class="color-preview" style="background: ${this.primaryColor}; color: white;">
                  ${this.primaryColor.toUpperCase()}
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Accent Color</label>
              <div class="color-input-wrapper">
                <input 
                  type="color" 
                  .value=${this.accentColor}
                  @input=${(e: Event) => { this.accentColor = (e.target as HTMLInputElement).value; this.markDirty(); }}
                />
                <div class="color-preview" style="background: ${this.accentColor}; color: white;">
                  ${this.accentColor.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Options -->
        <div class="section">
          <h2>Dashboard Options</h2>
          <p>Configure dashboard components</p>
          <div class="toggle-group">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Show KPI Cards</span>
                <span class="toggle-desc">Display key performance indicators on dashboard</span>
              </div>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  .checked=${this.showKPIs}
                  @change=${(e: Event) => { this.showKPIs = (e.target as HTMLInputElement).checked; this.markDirty(); }}
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Show Recent Activity</span>
                <span class="toggle-desc">Display recent workflow runs and events</span>
              </div>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  .checked=${this.showRecentActivity}
                  @change=${(e: Event) => { this.showRecentActivity = (e.target as HTMLInputElement).checked; this.markDirty(); }}
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Show Quick Actions</span>
                <span class="toggle-desc">Display quick action buttons on dashboard</span>
              </div>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  .checked=${this.showQuickActions}
                  @change=${(e: Event) => { this.showQuickActions = (e.target as HTMLInputElement).checked; this.markDirty(); }}
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
