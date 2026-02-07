import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('template-page')
export class TemplatePage extends LitElement {
  static styles = css`
    :host { display: block; }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
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
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .save-btn {
      background: var(--accent-primary);
      border: none;
      color: #000;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    
    .preview-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .sections {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .section {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .section-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-tertiary);
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px;
    }
    
    .section-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin: 0;
    }
    
    .section-body {
      padding: 20px;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-group.full {
      grid-column: 1 / -1;
    }
    
    .form-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
    }
    
    .form-input {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 13px;
      color: var(--text-primary);
    }
    
    .form-input:focus {
      outline: none;
      border-color: var(--accent-primary);
    }
    
    .form-select {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 13px;
      color: var(--text-primary);
      cursor: pointer;
    }
    
    .color-picker {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .color-input {
      width: 48px;
      height: 36px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .color-value {
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .toggle-row:last-child { border-bottom: none; }
    
    .toggle-label {
      font-size: 13px;
      color: var(--text-primary);
    }
    
    .toggle-desc {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    
    .toggle {
      position: relative;
      width: 44px;
      height: 24px;
      background: var(--bg-tertiary);
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .toggle.active {
      background: var(--accent-primary);
    }
    
    .toggle::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s;
    }
    
    .toggle.active::after {
      transform: translateX(20px);
    }
    
    .preview-box {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      margin-top: 16px;
    }
    
    .preview-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .preview-sidebar {
      display: flex;
      gap: 8px;
    }
    
    .preview-item {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      background: var(--bg-secondary);
      color: var(--text-secondary);
    }
    
    .preview-item.active {
      background: var(--accent-primary);
      color: #000;
    }
  `;

  @property({ type: Object }) config: any = null;
  @state() theme = 'light';
  @state() primaryColor = '#22c55e';
  @state() showKPIs = true;
  @state() showRecentActivity = true;
  @state() showQuickActions = true;

  render() {
    const ui = this.config?.ui || {};
    const instance = this.config?.instance || {};
    
    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Template & UI</h1>
          <p class="page-subtitle">Customize the User Interface appearance</p>
        </div>
        <div class="actions">
          <button class="preview-btn" @click=${() => window.open('/app', '_blank')}>
            👁️ Preview User UI
          </button>
          <button class="save-btn">Save Changes</button>
        </div>
      </div>
      
      <div class="sections">
        <!-- Instance -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Instance</h2>
            <p class="section-desc">Basic instance configuration</p>
          </div>
          <div class="section-body">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Instance Name</label>
                <input class="form-input" type="text" value="${instance.name || '0711-C Intelligence'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Locale</label>
                <select class="form-select">
                  <option value="de-DE" ?selected=${instance.locale === 'de-DE'}>Deutsch (DE)</option>
                  <option value="en-US" ?selected=${instance.locale === 'en-US'}>English (US)</option>
                  <option value="en-GB" ?selected=${instance.locale === 'en-GB'}>English (UK)</option>
                </select>
              </div>
              <div class="form-group full">
                <label class="form-label">Logo URL</label>
                <input class="form-input" type="text" value="${instance.logo || ''}" placeholder="/logo.svg" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Theme -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Theme</h2>
            <p class="section-desc">Visual appearance settings</p>
          </div>
          <div class="section-body">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Theme Mode</label>
                <select class="form-select" @change=${(e: Event) => this.theme = (e.target as HTMLSelectElement).value}>
                  <option value="light" ?selected=${ui.theme === 'light'}>Light</option>
                  <option value="dark" ?selected=${ui.theme === 'dark'}>Dark</option>
                  <option value="auto" ?selected=${ui.theme === 'auto'}>Auto (System)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Template</label>
                <select class="form-select">
                  <option value="default" ?selected=${ui.template === 'default'}>Default</option>
                  <option value="enterprise" ?selected=${ui.template === 'enterprise'}>Enterprise</option>
                  <option value="minimal" ?selected=${ui.template === 'minimal'}>Minimal</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Primary Color</label>
                <div class="color-picker">
                  <input class="color-input" type="color" value="${ui.branding?.primaryColor || '#22c55e'}" />
                  <span class="color-value">${ui.branding?.primaryColor || '#22c55e'}</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Accent Color</label>
                <div class="color-picker">
                  <input class="color-input" type="color" value="${ui.branding?.accentColor || '#3b82f6'}" />
                  <span class="color-value">${ui.branding?.accentColor || '#3b82f6'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Dashboard -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Dashboard Options</h2>
            <p class="section-desc">Configure dashboard components</p>
          </div>
          <div class="section-body">
            <div class="toggle-row">
              <div>
                <div class="toggle-label">Show KPI Cards</div>
                <div class="toggle-desc">Display key performance indicators on dashboard</div>
              </div>
              <div class="toggle ${ui.dashboard?.showKPIs !== false ? 'active' : ''}" 
                   @click=${() => this.showKPIs = !this.showKPIs}></div>
            </div>
            <div class="toggle-row">
              <div>
                <div class="toggle-label">Show Recent Activity</div>
                <div class="toggle-desc">Display recent workflow runs and events</div>
              </div>
              <div class="toggle ${ui.dashboard?.showRecentActivity !== false ? 'active' : ''}"
                   @click=${() => this.showRecentActivity = !this.showRecentActivity}></div>
            </div>
            <div class="toggle-row">
              <div>
                <div class="toggle-label">Show Quick Actions</div>
                <div class="toggle-desc">Display quick action buttons on dashboard</div>
              </div>
              <div class="toggle ${ui.dashboard?.showQuickActions !== false ? 'active' : ''}"
                   @click=${() => this.showQuickActions = !this.showQuickActions}></div>
            </div>
            
            <div class="preview-box">
              <div class="preview-label">Sidebar Preview</div>
              <div class="preview-sidebar">
                <div class="preview-item active">Dashboard</div>
                <div class="preview-item">Skills</div>
                <div class="preview-item">Knowledge</div>
                <div class="preview-item">Reports</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
