import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService, toastService, modalService, api, type Config, type DataSource } from '../services/index.js';

@customElement('data-sources-page')
export class DataSourcesPage extends LitElement {
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

    .btn-danger {
      background: #ef4444;
      border: none;
      color: white;
    }

    .btn-success {
      background: #10b981;
      border: none;
      color: white;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-title .icon {
      font-size: 24px;
    }

    .card-title h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
    }

    .card-title .type {
      font-size: 12px;
      color: var(--text-secondary, #888);
      font-family: monospace;
    }

    .card-actions {
      display: flex;
      gap: 8px;
    }

    .card-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-label {
      font-size: 11px;
      color: var(--text-secondary, #888);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 13px;
      font-family: monospace;
      word-break: break-all;
    }

    .empty-state {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 60px 40px;
      text-align: center;
    }

    .empty-state .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .empty-state p {
      margin: 0;
      color: var(--text-secondary, #888);
      font-size: 14px;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 12px;
      width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-secondary, #888);
      font-size: 24px;
      cursor: pointer;
      padding: 0;
    }

    .modal-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #888);
    }

    .form-group input, .form-group select {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-tertiary, #2a2a3a);
      border: 1px solid var(--border-color, #363646);
      border-radius: 6px;
      color: var(--text-primary, #fff);
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: var(--accent-color, #3b82f6);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #363646);
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
  `;

  @state() private dataSources: Record<string, DataSource> = {};
  @state() private showModal = false;
  @state() private editingId: string | null = null;
  @state() private saving = false;
  @state() private testing: string | null = null;
  @state() private discovering: string | null = null;
  @state() private discoveredTools: Record<string, any[]> = {};

  // Form state
  @state() private formId = '';
  @state() private formType = 'postgres';
  @state() private formConnectionString = '';
  @state() private formPath = '';

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      if (config) {
        this.dataSources = config.dataSources?.providers || {};
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private getIcon(type: string): string {
    switch (type) {
      case 'postgres': return icons.database;
      case 'mysql': return icons.database;
      case 'csv': return icons.fileSpreadsheet;
      case 'api': return '🌐';
      case 'mcp': return icons.plug;
      default: return icons.package;
    }
  }

  private openNewModal() {
    this.editingId = null;
    this.formId = '';
    this.formType = 'postgres';
    this.formConnectionString = '';
    this.formPath = '';
    this.showModal = true;
  }

  private openEditModal(id: string, ds: DataSource) {
    this.editingId = id;
    this.formId = id;
    this.formType = ds.type;
    this.formConnectionString = ds.connectionString || '';
    this.formPath = ds.path || '';
    this.showModal = true;
  }

  private closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  private async handleSave() {
    if (!this.formId) {
      toastService.error('ID is required');
      return;
    }

    this.saving = true;

    const dataSource: DataSource = {
      type: this.formType,
      ...(this.formConnectionString && { connectionString: this.formConnectionString }),
      ...(this.formPath && { path: this.formPath }),
    };

    let response;
    if (this.editingId) {
      response = await api.put(`/datasources/${this.editingId}`, dataSource);
    } else {
      response = await api.post('/datasources', { id: this.formId, ...dataSource });
    }

    if (response.ok) {
      toastService.success(this.editingId ? 'Data source updated' : 'Data source created');
      await configService.load();
      this.closeModal();
    } else {
      toastService.error(response.error?.message || 'Failed to save');
    }

    this.saving = false;
  }

  private async handleDelete(id: string) {
    const confirmed = await modalService.confirmDelete(id);
    if (!confirmed) return;

    const response = await api.delete(`/datasources/${id}`);
    if (response.ok) {
      toastService.success('Data source deleted');
      await configService.load();
    } else {
      toastService.error(response.error?.message || 'Failed to delete');
    }
  }

  private async handleTest(id: string) {
    this.testing = id;
    const response = await api.post(`/datasources/${id}/test`);
    
    if (response.ok) {
      toastService.success('Connection successful!');
    } else {
      toastService.error(response.error?.message || 'Connection failed');
    }
    
    this.testing = null;
  }

  private async handleDiscover(id: string) {
    this.discovering = id;
    try {
      const response = await api.post(`/mcp/${id}/discover`);
      if (response.ok && response.data?.tools) {
        this.discoveredTools = { ...this.discoveredTools, [id]: response.data.tools };
        toastService.success(`Found ${response.data.tools.length} tools`);
      } else {
        toastService.error(response.error?.message || 'Discovery failed');
      }
    } catch (err: any) {
      toastService.error(err.message || 'Discovery failed');
    }
    this.discovering = null;
  }

  render() {
    const entries = Object.entries(this.dataSources);

    return html`
      <div class="header">
        <div class="header-left">
          <h1>Datenquellen</h1>
          <p>MCP-Verbindungen zu externen Datenquellen</p>
        </div>
        <button class="btn-primary" @click=${this.openNewModal}>
          + Neue Datenquelle
        </button>
      </div>

      ${entries.length === 0 ? html`
        <div class="empty-state">
          <div class="icon">${unsafeHTML(icons.plug)}</div>
          <h3>Keine Datenquellen konfiguriert</h3>
          <p>Füge PostgreSQL, CSV, REST API oder andere Datenquellen hinzu.</p>
        </div>
      ` : html`
        <div class="list">
          ${entries.map(([id, ds]) => html`
            <div class="card">
              <div class="card-header">
                <div class="card-title">
                  <span class="icon">${unsafeHTML(this.getIcon(ds.type))}</span>
                  <div>
                    <h3>${id}</h3>
                    <span class="type">${ds.type}</span>
                  </div>
                </div>
                <div class="card-actions">
                  <button 
                    class="btn-success btn-sm" 
                    @click=${() => this.handleTest(id)}
                    ?disabled=${this.testing === id}
                  >
                    ${this.testing === id ? html`<span class="spinner"></span>` : '🔗'} Test
                  </button>
                  ${ds.type === 'mcp' ? html`
                    <button 
                      class="btn-secondary btn-sm" 
                      @click=${() => this.handleDiscover(id)}
                      ?disabled=${this.discovering === id}
                    >
                      ${this.discovering === id ? html`<span class="spinner"></span>` : html`<span style="display:inline-flex">${unsafeHTML(icons.search)}</span>`} Discover
                    </button>
                  ` : ''}
                  <button class="btn-secondary btn-sm" @click=${() => this.openEditModal(id, ds)}>
                    ✏️ Edit
                  </button>
                  <button class="btn-danger btn-sm" @click=${() => this.handleDelete(id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
              <div class="card-details">
                ${ds.connectionString ? html`
                  <div class="detail-item">
                    <span class="detail-label">Connection String</span>
                    <span class="detail-value">${ds.connectionString}</span>
                  </div>
                ` : ''}
                ${ds.path ? html`
                  <div class="detail-item">
                    <span class="detail-label">Path</span>
                    <span class="detail-value">${ds.path}</span>
                  </div>
                ` : ''}
              </div>
              ${this.discoveredTools[id]?.length ? html`
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color, #363646);">
                  <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Discovered Tools (${this.discoveredTools[id].length})
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${this.discoveredTools[id].map((tool: any) => html`
                      <span style="background: var(--bg-tertiary, #2a2a3a); padding: 4px 10px; border-radius: 4px; font-size: 12px; font-family: monospace;">
                        ${tool.name}
                      </span>
                    `)}
                  </div>
                </div>
              ` : ''}
            </div>
          `)}
        </div>
      `}

      ${this.showModal ? this.renderModal() : ''}
    `;
  }

  private renderModal() {
    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>${this.editingId ? 'Edit Data Source' : 'New Data Source'}</h3>
            <button class="modal-close" @click=${this.closeModal}>×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>ID *</label>
              <input 
                type="text" 
                .value=${this.formId}
                @input=${(e: Event) => this.formId = (e.target as HTMLInputElement).value}
                ?disabled=${!!this.editingId}
                placeholder="my-database"
              />
            </div>
            <div class="form-group">
              <label>Type</label>
              <select 
                .value=${this.formType}
                @change=${(e: Event) => this.formType = (e.target as HTMLSelectElement).value}
              >
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="csv">CSV File</option>
                <option value="api">REST API</option>
                <option value="mcp">MCP Server</option>
              </select>
            </div>
            ${this.formType === 'postgres' || this.formType === 'mysql' ? html`
              <div class="form-group">
                <label>Connection String</label>
                <input 
                  type="text" 
                  .value=${this.formConnectionString}
                  @input=${(e: Event) => this.formConnectionString = (e.target as HTMLInputElement).value}
                  placeholder="postgresql://user:pass@host:5432/db"
                />
              </div>
            ` : ''}
            ${this.formType === 'csv' || this.formType === 'mcp' ? html`
              <div class="form-group">
                <label>Path</label>
                <input 
                  type="text" 
                  .value=${this.formPath}
                  @input=${(e: Event) => this.formPath = (e.target as HTMLInputElement).value}
                  placeholder="/data/products.csv"
                />
              </div>
            ` : ''}
            ${this.formType === 'api' ? html`
              <div class="form-group">
                <label>Endpoint URL</label>
                <input 
                  type="text" 
                  .value=${this.formConnectionString}
                  @input=${(e: Event) => this.formConnectionString = (e.target as HTMLInputElement).value}
                  placeholder="https://api.example.com/data"
                />
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click=${this.closeModal}>Cancel</button>
            <button class="btn-primary" @click=${this.handleSave} ?disabled=${this.saving}>
              ${this.saving ? html`<span class="spinner"></span>` : ''}
              ${this.editingId ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
