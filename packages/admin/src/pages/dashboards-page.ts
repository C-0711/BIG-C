/**
 * Dashboards Page - Admin Dashboard Management
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';
import { configService, toastService, api } from '../services/index.js';

interface DashboardConfig {
  id?: string;
  name: string;
  description?: string;
  widgets: string[];
  layout?: string;
  columns?: number;
  published: boolean;
  isDefault?: boolean;
}

@customElement('dashboards-page')
export class DashboardsPage extends LitElement {
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

    .btn-primary { background: var(--accent-color, #3b82f6); color: white; }
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
      padding: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .card-title h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .card-title p {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary, #888);
    }

    .badge {
      font-size: 10px;
      padding: 4px 10px;
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

    .badge.default {
      background: #3b82f633;
      color: #3b82f6;
    }

    .widget-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .widget-tag {
      background: var(--bg-tertiary, #2a2a3a);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
    }

    .card-actions {
      display: flex;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color, #363646);
    }

    .empty-state {
      text-align: center;
      padding: 60px 40px;
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 12px;
    }

    .empty-state .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { margin: 0 0 8px 0; }
    .empty-state p { color: var(--text-secondary, #888); margin: 0 0 20px 0; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
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
      width: 600px;
      max-width: 95vw;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .modal-header h3 { margin: 0; font-size: 18px; }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-secondary, #888);
      font-size: 24px;
      cursor: pointer;
      padding: 0;
    }

    .modal-body { padding: 24px; }

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

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-tertiary, #2a2a3a);
      border: 1px solid var(--border-color, #363646);
      border-radius: 6px;
      color: var(--text-primary, #fff);
      font-size: 14px;
      box-sizing: border-box;
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      padding: 8px;
      background: var(--bg-tertiary, #2a2a3a);
      border-radius: 6px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: var(--bg-secondary, #1e1e2e);
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }

    .checkbox-item.selected {
      background: var(--accent-color, #3b82f6);
      color: white;
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #363646);
    }

    .modal-footer .left {
      display: flex;
      gap: 16px;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
    }

    .modal-footer .right {
      display: flex;
      gap: 12px;
    }
  `;

  @state() private dashboards: Record<string, DashboardConfig> = {};
  @state() private widgets: Record<string, any> = {};
  @state() private showModal = false;
  @state() private editingId: string | null = null;
  @state() private saving = false;

  @state() private formId = '';
  @state() private formName = '';
  @state() private formDescription = '';
  @state() private formWidgets: string[] = [];
  @state() private formLayout = 'grid';
  @state() private formColumns = 4;
  @state() private formPublished = false;
  @state() private formIsDefault = false;

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      if (config) {
        this.dashboards = config.dashboards || {};
        this.widgets = config.widgets || {};
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private openNewModal() {
    this.editingId = null;
    this.formId = '';
    this.formName = '';
    this.formDescription = '';
    this.formWidgets = [];
    this.formLayout = 'grid';
    this.formColumns = 4;
    this.formPublished = false;
    this.formIsDefault = false;
    this.showModal = true;
  }

  private openEditModal(id: string, dashboard: DashboardConfig) {
    this.editingId = id;
    this.formId = id;
    this.formName = dashboard.name;
    this.formDescription = dashboard.description || '';
    this.formWidgets = [...(dashboard.widgets || [])];
    this.formLayout = dashboard.layout || 'grid';
    this.formColumns = dashboard.columns || 4;
    this.formPublished = dashboard.published;
    this.formIsDefault = dashboard.isDefault || false;
    this.showModal = true;
  }

  private closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  private toggleWidget(widgetId: string) {
    if (this.formWidgets.includes(widgetId)) {
      this.formWidgets = this.formWidgets.filter(w => w !== widgetId);
    } else {
      this.formWidgets = [...this.formWidgets, widgetId];
    }
  }

  private async handleSave() {
    if (!this.formId || !this.formName) {
      toastService.error('ID und Name sind Pflichtfelder');
      return;
    }

    this.saving = true;

    const dashboard: DashboardConfig = {
      name: this.formName,
      description: this.formDescription,
      widgets: this.formWidgets,
      layout: this.formLayout,
      columns: this.formColumns,
      published: this.formPublished,
      isDefault: this.formIsDefault,
    };

    const config = configService.getConfig();
    if (!config.dashboards) config.dashboards = {};
    
    // If setting as default, unset others
    if (this.formIsDefault) {
      Object.keys(config.dashboards).forEach(id => {
        if (config.dashboards[id]) {
          config.dashboards[id].isDefault = false;
        }
      });
    }
    
    config.dashboards[this.formId] = dashboard;

    const response = await api.put('/config', config);

    if (response.ok) {
      toastService.success(this.editingId ? 'Dashboard aktualisiert' : 'Dashboard erstellt');
      await configService.load();
      this.closeModal();
    } else {
      toastService.error(response.error?.message || 'Speichern fehlgeschlagen');
    }

    this.saving = false;
  }

  private async handleDelete(id: string) {
    if (!confirm(`Dashboard "${id}" wirklich löschen?`)) return;

    const config = configService.getConfig();
    if (config.dashboards?.[id]) {
      delete config.dashboards[id];
      const response = await api.put('/config', config);
      if (response.ok) {
        toastService.success('Dashboard gelöscht');
        await configService.load();
      }
    }
  }

  render() {
    const entries = Object.entries(this.dashboards);

    return html`
      <div class="header">
        <div class="header-left">
          <h1>Dashboards</h1>
          <p>Widget-Layouts für das User Frontend</p>
        </div>
        <button class="btn-primary" @click=${this.openNewModal}>
          + Neues Dashboard
        </button>
      </div>

      ${entries.length === 0 ? html`
        <div class="empty-state">
          <div class="icon">${unsafeHTML(icons.layoutDashboard)}</div>
          <h3>Keine Dashboards</h3>
          <p>Erstelle Dashboards um Widgets im User Frontend anzuordnen.</p>
          <button class="btn-primary" @click=${this.openNewModal}>
            Dashboard erstellen
          </button>
        </div>
      ` : html`
        <div class="grid">
          ${entries.map(([id, dashboard]) => this.renderDashboardCard(id, dashboard as DashboardConfig))}
        </div>
      `}

      ${this.showModal ? this.renderModal() : ''}
    `;
  }

  private renderDashboardCard(id: string, dashboard: DashboardConfig) {
    return html`
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <h3>${dashboard.name}</h3>
            <p>${dashboard.description || `${dashboard.widgets?.length || 0} Widgets`}</p>
          </div>
          <div style="display: flex; gap: 6px;">
            ${dashboard.isDefault ? html`<span class="badge default">Default</span>` : ''}
            <span class="badge ${dashboard.published ? 'published' : 'draft'}">
              ${dashboard.published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        
        <div class="widget-list">
          ${(dashboard.widgets || []).slice(0, 6).map(wId => html`
            <span class="widget-tag">${wId}</span>
          `)}
          ${(dashboard.widgets || []).length > 6 ? html`
            <span class="widget-tag">+${dashboard.widgets.length - 6}</span>
          ` : ''}
        </div>

        <div class="card-actions">
          <button class="btn-secondary btn-sm" @click=${() => this.openEditModal(id, dashboard)}>
            ✏️ Bearbeiten
          </button>
          <button class="btn-danger btn-sm" @click=${() => this.handleDelete(id)}>
            🗑
          </button>
        </div>
      </div>
    `;
  }

  private renderModal() {
    const availableWidgets = Object.entries(this.widgets);

    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>${this.editingId ? 'Dashboard bearbeiten' : 'Neues Dashboard'}</h3>
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
                placeholder="main-dashboard"
              />
            </div>

            <div class="form-group">
              <label>Name *</label>
              <input 
                type="text"
                .value=${this.formName}
                @input=${(e: Event) => this.formName = (e.target as HTMLInputElement).value}
                placeholder="Haupt-Dashboard"
              />
            </div>

            <div class="form-group">
              <label>Beschreibung</label>
              <input 
                type="text"
                .value=${this.formDescription}
                @input=${(e: Event) => this.formDescription = (e.target as HTMLInputElement).value}
                placeholder="Übersicht der wichtigsten Metriken"
              />
            </div>

            <div class="form-group">
              <label>Widgets (${this.formWidgets.length} ausgewählt)</label>
              <div class="checkbox-group">
                ${availableWidgets.length === 0 ? html`
                  <span style="color: var(--text-secondary); font-size: 13px;">
                    Keine Widgets vorhanden. Erstelle zuerst Widgets.
                  </span>
                ` : availableWidgets.map(([wId, widget]) => html`
                  <div 
                    class="checkbox-item ${this.formWidgets.includes(wId) ? 'selected' : ''}"
                    @click=${() => this.toggleWidget(wId)}
                  >
                    ${(widget as any).name || wId}
                  </div>
                `)}
              </div>
            </div>

            <div class="form-group">
              <label>Layout</label>
              <select 
                .value=${this.formLayout}
                @change=${(e: Event) => this.formLayout = (e.target as HTMLSelectElement).value}
              >
                <option value="grid">Grid</option>
                <option value="list">Liste</option>
              </select>
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
              <label class="toggle-label">
                <input 
                  type="checkbox"
                  .checked=${this.formIsDefault}
                  @change=${(e: Event) => this.formIsDefault = (e.target as HTMLInputElement).checked}
                />
                Default
              </label>
            </div>
            <div class="right">
              <button class="btn-secondary" @click=${this.closeModal}>Abbrechen</button>
              <button class="btn-primary" @click=${this.handleSave} ?disabled=${this.saving}>
                ${this.editingId ? 'Speichern' : 'Erstellen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
