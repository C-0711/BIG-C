/**
 * Widgets Page - Admin Widget Management
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';
import { configService, toastService, api } from '../services/index.js';
import '../components/widget-renderer.js';

interface WidgetConfig {
  id?: string;
  name: string;
  description?: string;
  type: string;
  dataSource: string;
  tool: string;
  args?: Record<string, any>;
  mapping?: Record<string, any>;
  published: boolean;
}

@customElement('widgets-page')
export class WidgetsPage extends LitElement {
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
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: none;
    }

    .btn-primary {
      background: var(--accent-color, #3b82f6);
      color: white;
    }

    .btn-primary:hover { filter: brightness(1.1); }

    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border-color, #363646);
      color: var(--text-primary, #fff);
    }

    .btn-secondary:hover { background: var(--bg-tertiary, #2a2a3a); }

    .btn-success { background: #10b981; color: white; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .card {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 12px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-title .icon {
      width: 40px;
      height: 40px;
      background: var(--bg-tertiary, #2a2a3a);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-title h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .card-title .meta {
      font-size: 12px;
      color: var(--text-secondary, #888);
      display: flex;
      gap: 8px;
    }

    .badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
    }

    .badge.published {
      background: #10b98133;
      color: #10b981;
    }

    .badge.draft {
      background: #f5920033;
      color: #f59200;
    }

    .badge.type {
      background: var(--bg-tertiary, #2a2a3a);
      color: var(--text-secondary, #888);
    }

    .card-preview {
      padding: 20px;
      min-height: 120px;
      background: var(--bg-primary, #12121a);
    }

    .card-actions {
      display: flex;
      gap: 8px;
      padding: 12px 20px;
      border-top: 1px solid var(--border-color, #363646);
    }

    .card-actions button {
      flex: 1;
    }

    .empty-state {
      text-align: center;
      padding: 60px 40px;
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 12px;
    }

    .empty-state .icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
    }

    .empty-state p {
      color: var(--text-secondary, #888);
      margin: 0 0 20px 0;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 12px;
      width: 900px;
      max-width: 95vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
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
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }

    .modal-close:hover {
      background: var(--bg-tertiary, #2a2a3a);
    }

    .modal-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .modal-form {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      border-right: 1px solid var(--border-color, #363646);
    }

    .modal-preview {
      width: 350px;
      padding: 24px;
      background: var(--bg-primary, #12121a);
      overflow-y: auto;
    }

    .modal-preview h4 {
      margin: 0 0 16px 0;
      font-size: 12px;
      text-transform: uppercase;
      color: var(--text-secondary, #888);
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-group {
      margin-bottom: 20px;
      flex: 1;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #888);
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-tertiary, #2a2a3a);
      border: 1px solid var(--border-color, #363646);
      border-radius: 6px;
      color: var(--text-primary, #fff);
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-group textarea {
      min-height: 100px;
      font-family: monospace;
      font-size: 12px;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--accent-color, #3b82f6);
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #363646);
    }

    .modal-footer .left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-footer .right {
      display: flex;
      gap: 12px;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
    }

    .toggle-label input {
      width: 40px;
      height: 22px;
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

    .tool-info {
      background: var(--bg-tertiary, #2a2a3a);
      border-radius: 6px;
      padding: 12px;
      margin-top: 8px;
      font-size: 12px;
    }

    .tool-info .description {
      color: var(--text-secondary, #888);
      margin-bottom: 8px;
    }

    .tool-info .schema {
      font-family: monospace;
      font-size: 11px;
      color: var(--text-secondary, #888);
      max-height: 100px;
      overflow: auto;
    }
  `;

  @state() private widgets: Record<string, WidgetConfig> = {};
  @state() private dataSources: Record<string, any> = {};
  @state() private showModal = false;
  @state() private editingId: string | null = null;
  @state() private saving = false;
  @state() private previewData: any = null;
  @state() private previewLoading = false;
  @state() private availableTools: any[] = [];

  // Form state
  @state() private formId = '';
  @state() private formName = '';
  @state() private formDescription = '';
  @state() private formType = 'stats-card';
  @state() private formDataSource = '';
  @state() private formTool = '';
  @state() private formArgs = '{}';
  @state() private formMapping = '{}';
  @state() private formPublished = false;

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      if (config) {
        this.widgets = config.widgets || {};
        this.dataSources = config.dataSources?.providers || {};
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private getMcpDataSources() {
    return Object.entries(this.dataSources)
      .filter(([_, ds]: [string, any]) => ds.type === 'mcp')
      .map(([id, ds]: [string, any]) => ({ id, ...ds }));
  }

  private async loadTools(dataSourceId: string) {
    if (!dataSourceId) {
      this.availableTools = [];
      return;
    }

    try {
      const response = await api.post(`/mcp/${dataSourceId}/discover`);
      if (response.ok && response.data?.tools) {
        this.availableTools = response.data.tools;
      }
    } catch (e) {
      console.error('Failed to load tools:', e);
      this.availableTools = [];
    }
  }

  private getWidgetIcon(type: string): string {
    switch (type) {
      case 'stats-card': return icons.barChart3;
      case 'data-table': return icons.database;
      case 'list': return icons.fileText;
      case 'chart': return icons.activity;
      default: return icons.package;
    }
  }

  private openNewModal() {
    this.editingId = null;
    this.formId = '';
    this.formName = '';
    this.formDescription = '';
    this.formType = 'stats-card';
    this.formDataSource = '';
    this.formTool = '';
    this.formArgs = '{}';
    this.formMapping = '{"value": "$"}';
    this.formPublished = false;
    this.previewData = null;
    this.availableTools = [];
    this.showModal = true;
  }

  private openEditModal(id: string, widget: WidgetConfig) {
    this.editingId = id;
    this.formId = id;
    this.formName = widget.name;
    this.formDescription = widget.description || '';
    this.formType = widget.type;
    this.formDataSource = widget.dataSource;
    this.formTool = widget.tool;
    this.formArgs = JSON.stringify(widget.args || {}, null, 2);
    this.formMapping = JSON.stringify(widget.mapping || {}, null, 2);
    this.formPublished = widget.published;
    this.previewData = null;
    this.loadTools(widget.dataSource);
    this.showModal = true;
  }

  private closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.previewData = null;
  }

  private async handleDataSourceChange(e: Event) {
    const dsId = (e.target as HTMLSelectElement).value;
    this.formDataSource = dsId;
    this.formTool = '';
    await this.loadTools(dsId);
  }

  private async handlePreview() {
    if (!this.formDataSource || !this.formTool) {
      toastService.error('Wähle DataSource und Tool');
      return;
    }

    this.previewLoading = true;
    try {
      let args = {};
      try { args = JSON.parse(this.formArgs); } catch {}

      const response = await api.post('/admin/widgets/preview/test-tool', {
        dataSource: this.formDataSource,
        tool: this.formTool,
        args
      });

      if (response.ok) {
        // Parse MCP response
        let data = response.data?.result;
        if (data?.content?.[0]?.text) {
          try { data = JSON.parse(data.content[0].text); } catch {}
        }
        this.previewData = data;
      } else {
        toastService.error(response.error?.message || 'Preview failed');
      }
    } catch (e: any) {
      toastService.error(e.message);
    }
    this.previewLoading = false;
  }

  private async handleSave() {
    if (!this.formId || !this.formName) {
      toastService.error('ID und Name sind Pflichtfelder');
      return;
    }

    this.saving = true;

    let args = {}, mapping = {};
    try { args = JSON.parse(this.formArgs); } catch {}
    try { mapping = JSON.parse(this.formMapping); } catch {}

    const widget: WidgetConfig = {
      name: this.formName,
      description: this.formDescription,
      type: this.formType,
      dataSource: this.formDataSource,
      tool: this.formTool,
      args,
      mapping,
      published: this.formPublished,
    };

    // Update config
    const config = configService.getConfig();
    if (!config.widgets) config.widgets = {};
    config.widgets[this.formId] = widget;

    const response = await api.put('/config', config);

    if (response.ok) {
      toastService.success(this.editingId ? 'Widget aktualisiert' : 'Widget erstellt');
      await configService.load();
      this.closeModal();
    } else {
      toastService.error(response.error?.message || 'Speichern fehlgeschlagen');
    }

    this.saving = false;
  }

  private async handleDelete(id: string) {
    if (!confirm(`Widget "${id}" wirklich löschen?`)) return;

    const config = configService.getConfig();
    if (config.widgets?.[id]) {
      delete config.widgets[id];
      const response = await api.put('/config', config);
      if (response.ok) {
        toastService.success('Widget gelöscht');
        await configService.load();
      }
    }
  }

  private async handleTogglePublish(id: string, widget: WidgetConfig) {
    const config = configService.getConfig();
    if (config.widgets?.[id]) {
      config.widgets[id].published = !widget.published;
      const response = await api.put('/config', config);
      if (response.ok) {
        toastService.success(widget.published ? 'Widget unpublished' : 'Widget published');
        await configService.load();
      }
    }
  }

  private getSelectedTool() {
    return this.availableTools.find(t => t.name === this.formTool);
  }

  render() {
    const entries = Object.entries(this.widgets);

    return html`
      <div class="header">
        <div class="header-left">
          <h1>Widgets</h1>
          <p>Dashboard-Widgets mit MCP-Daten</p>
        </div>
        <button class="btn-primary" @click=${this.openNewModal}>
          + Neues Widget
        </button>
      </div>

      ${entries.length === 0 ? html`
        <div class="empty-state">
          <div class="icon">${unsafeHTML(icons.barChart3)}</div>
          <h3>Keine Widgets</h3>
          <p>Erstelle Widgets um MCP-Daten im Dashboard anzuzeigen.</p>
          <button class="btn-primary" @click=${this.openNewModal}>
            Widget erstellen
          </button>
        </div>
      ` : html`
        <div class="grid">
          ${entries.map(([id, widget]) => this.renderWidgetCard(id, widget as WidgetConfig))}
        </div>
      `}

      ${this.showModal ? this.renderModal() : ''}
    `;
  }

  private renderWidgetCard(id: string, widget: WidgetConfig) {
    return html`
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <div class="icon">${unsafeHTML(this.getWidgetIcon(widget.type))}</div>
            <div>
              <h3>${widget.name}</h3>
              <div class="meta">
                <span class="badge type">${widget.type}</span>
                <span>${widget.dataSource} → ${widget.tool}</span>
              </div>
            </div>
          </div>
          <span class="badge ${widget.published ? 'published' : 'draft'}">
            ${widget.published ? 'Published' : 'Draft'}
          </span>
        </div>
        <div class="card-preview">
          <widget-renderer
            .config=${{ id, ...widget }}
            .preview=${true}
          ></widget-renderer>
        </div>
        <div class="card-actions">
          <button class="btn-secondary btn-sm" @click=${() => this.openEditModal(id, widget)}>
            ✏️ Bearbeiten
          </button>
          <button 
            class="btn-sm ${widget.published ? 'btn-secondary' : 'btn-success'}"
            @click=${() => this.handleTogglePublish(id, widget)}
          >
            ${widget.published ? '📴 Unpublish' : '🚀 Publish'}
          </button>
          <button class="btn-danger btn-sm" @click=${() => this.handleDelete(id)}>
            🗑
          </button>
        </div>
      </div>
    `;
  }

  private renderModal() {
    const mcpSources = this.getMcpDataSources();
    const selectedTool = this.getSelectedTool();

    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>${this.editingId ? 'Widget bearbeiten' : 'Neues Widget'}</h3>
            <button class="modal-close" @click=${this.closeModal}>×</button>
          </div>

          <div class="modal-body">
            <div class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label>ID *</label>
                  <input 
                    type="text"
                    .value=${this.formId}
                    @input=${(e: Event) => this.formId = (e.target as HTMLInputElement).value}
                    ?disabled=${!!this.editingId}
                    placeholder="product-stats"
                  />
                </div>
                <div class="form-group">
                  <label>Name *</label>
                  <input 
                    type="text"
                    .value=${this.formName}
                    @input=${(e: Event) => this.formName = (e.target as HTMLInputElement).value}
                    placeholder="Produktstatistiken"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Beschreibung</label>
                <input 
                  type="text"
                  .value=${this.formDescription}
                  @input=${(e: Event) => this.formDescription = (e.target as HTMLInputElement).value}
                  placeholder="Zeigt Produktstatistiken an..."
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Widget-Typ</label>
                  <select 
                    .value=${this.formType}
                    @change=${(e: Event) => this.formType = (e.target as HTMLSelectElement).value}
                  >
                    <option value="stats-card">Stats Card</option>
                    <option value="data-table">Datentabelle</option>
                    <option value="list">Liste</option>
                    <option value="chart">Diagramm</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>DataSource (MCP)</label>
                  <select 
                    .value=${this.formDataSource}
                    @change=${this.handleDataSourceChange}
                  >
                    <option value="">-- Wählen --</option>
                    ${mcpSources.map(ds => html`
                      <option value=${ds.id}>${ds.name || ds.id}</option>
                    `)}
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Tool</label>
                <select 
                  .value=${this.formTool}
                  @change=${(e: Event) => this.formTool = (e.target as HTMLSelectElement).value}
                  ?disabled=${this.availableTools.length === 0}
                >
                  <option value="">-- Tool wählen --</option>
                  ${this.availableTools.map(tool => html`
                    <option value=${tool.name}>${tool.name}</option>
                  `)}
                </select>
                ${selectedTool ? html`
                  <div class="tool-info">
                    <div class="description">${selectedTool.description}</div>
                    <div class="schema">${JSON.stringify(selectedTool.inputSchema, null, 2)}</div>
                  </div>
                ` : ''}
              </div>

              <div class="form-group">
                <label>Tool Arguments (JSON)</label>
                <textarea 
                  .value=${this.formArgs}
                  @input=${(e: Event) => this.formArgs = (e.target as HTMLTextAreaElement).value}
                  placeholder='{}'
                ></textarea>
              </div>

              <div class="form-group">
                <label>Data Mapping (JSON)</label>
                <textarea 
                  .value=${this.formMapping}
                  @input=${(e: Event) => this.formMapping = (e.target as HTMLTextAreaElement).value}
                  placeholder='{"value": "$.total_products"}'
                ></textarea>
              </div>
            </div>

            <div class="modal-preview">
              <h4>Live Preview</h4>
              <button 
                class="btn-secondary btn-sm" 
                style="width: 100%; margin-bottom: 16px;"
                @click=${this.handlePreview}
                ?disabled=${this.previewLoading || !this.formTool}
              >
                ${this.previewLoading ? html`<span class="spinner"></span>` : '🔄'} 
                Daten laden
              </button>
              
              ${this.previewData ? html`
                <widget-renderer
                  .config=${{
                    id: 'preview',
                    name: this.formName || 'Preview',
                    type: this.formType,
                    mapping: (() => { try { return JSON.parse(this.formMapping); } catch { return {}; } })()
                  }}
                  .data=${this.previewData}
                  .preview=${true}
                ></widget-renderer>
                
                <details style="margin-top: 16px;">
                  <summary style="cursor: pointer; font-size: 12px; color: var(--text-secondary);">
                    Raw Data
                  </summary>
                  <pre style="font-size: 10px; overflow: auto; max-height: 200px; margin-top: 8px;">
${JSON.stringify(this.previewData, null, 2)}
                  </pre>
                </details>
              ` : html`
                <div style="color: var(--text-secondary); font-size: 13px; text-align: center; padding: 40px 20px;">
                  Klicke "Daten laden" um Preview zu sehen
                </div>
              `}
            </div>
          </div>

          <div class="modal-footer">
            <div class="left">
              <label class="toggle-label">
                <input 
                  type="checkbox"
                  .checked=${this.formPublished}
                  @change=${(e: Event) => this.formPublished = (e.target as HTMLInputElement).checked}
                />
                Published
              </label>
            </div>
            <div class="right">
              <button class="btn-secondary" @click=${this.closeModal}>Abbrechen</button>
              <button class="btn-primary" @click=${this.handleSave} ?disabled=${this.saving}>
                ${this.saving ? html`<span class="spinner"></span>` : ''}
                ${this.editingId ? 'Speichern' : 'Erstellen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
