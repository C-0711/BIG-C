/**
 * Widget Renderer Component
 * Renders widgets based on their type and data
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';

interface WidgetConfig {
  id: string;
  name: string;
  type: string;
  dataSource: string;
  tool: string;
  args?: Record<string, any>;
  mapping?: Record<string, any>;
  published?: boolean;
}

@customElement('widget-renderer')
export class WidgetRenderer extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .widget {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 20px;
      height: 100%;
      box-sizing: border-box;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .widget-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary, #888);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .widget-status {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--bg-tertiary, #2a2a3a);
    }

    .widget-status.published {
      background: #10b98133;
      color: #10b981;
    }

    .widget-status.draft {
      background: #f5920033;
      color: #f59200;
    }

    /* Stats Card */
    .stats-card .value {
      font-size: 36px;
      font-weight: 700;
      color: var(--text-primary, #fff);
      margin-bottom: 4px;
    }

    .stats-card .subtitle {
      font-size: 14px;
      color: var(--text-secondary, #888);
    }

    .stats-card .trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      margin-top: 8px;
    }

    .stats-card .trend.up { color: #10b981; }
    .stats-card .trend.down { color: #ef4444; }

    /* Data Table */
    .data-table {
      width: 100%;
      overflow-x: auto;
    }

    .data-table table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .data-table th {
      text-align: left;
      padding: 8px 12px;
      background: var(--bg-tertiary, #2a2a3a);
      font-weight: 500;
      color: var(--text-secondary, #888);
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .data-table td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .data-table tr:hover {
      background: var(--bg-tertiary, #2a2a3a);
    }

    /* List */
    .list-widget ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .list-widget li {
      padding: 8px 0;
      border-bottom: 1px solid var(--border-color, #363646);
      font-size: 14px;
    }

    .list-widget li:last-child {
      border-bottom: none;
    }

    /* Loading & Error */
    .loading, .error {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      color: var(--text-secondary, #888);
    }

    .error {
      color: #ef4444;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--border-color);
      border-top-color: var(--accent-color, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  @property({ type: Object }) config!: WidgetConfig;
  @property({ type: Object }) data: any = null;
  @property({ type: Boolean }) loading = false;
  @property({ type: String }) error = '';
  @property({ type: Boolean }) preview = false;

  render() {
    return html`
      <div class="widget">
        <div class="widget-header">
          <span class="widget-title">${this.config?.name || 'Widget'}</span>
          ${this.preview ? html`
            <span class="widget-status ${this.config?.published ? 'published' : 'draft'}">
              ${this.config?.published ? 'Published' : 'Draft'}
            </span>
          ` : ''}
        </div>
        
        ${this.loading ? html`
          <div class="loading"><div class="spinner"></div></div>
        ` : this.error ? html`
          <div class="error">${this.error}</div>
        ` : this.renderWidget()}
      </div>
    `;
  }

  private renderWidget() {
    if (!this.data) {
      return html`<div class="loading">No data</div>`;
    }

    switch (this.config?.type) {
      case 'stats-card':
        return this.renderStatsCard();
      case 'data-table':
        return this.renderDataTable();
      case 'list':
        return this.renderList();
      default:
        return this.renderRawData();
    }
  }

  private renderStatsCard() {
    const mapping = this.config?.mapping || {};
    const value = this.resolvePath(this.data, mapping.value) || '-';
    const subtitle = mapping.subtitle ? this.resolveTemplate(mapping.subtitle) : '';
    
    return html`
      <div class="stats-card">
        <div class="value">${this.formatValue(value)}</div>
        ${subtitle ? html`<div class="subtitle">${subtitle}</div>` : ''}
      </div>
    `;
  }

  private renderDataTable() {
    const mapping = this.config?.mapping || {};
    const columns = mapping.columns || [];
    const rows = this.resolvePath(this.data, mapping.rows) || [];
    
    if (!Array.isArray(rows)) {
      return this.renderRawData();
    }

    return html`
      <div class="data-table">
        <table>
          <thead>
            <tr>
              ${columns.map((col: any) => html`<th>${col.label}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${rows.slice(0, 10).map((row: any) => html`
              <tr>
                ${columns.map((col: any) => html`
                  <td>${row[col.key] ?? '-'}</td>
                `)}
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderList() {
    const mapping = this.config?.mapping || {};
    const items = this.resolvePath(this.data, mapping.items) || [];
    
    if (!Array.isArray(items)) {
      return this.renderRawData();
    }

    return html`
      <div class="list-widget">
        <ul>
          ${items.slice(0, 10).map((item: any) => html`
            <li>${typeof item === 'object' ? JSON.stringify(item) : item}</li>
          `)}
        </ul>
      </div>
    `;
  }

  private renderRawData() {
    return html`
      <pre style="font-size: 11px; overflow: auto; max-height: 200px;">
${JSON.stringify(this.data, null, 2)}
      </pre>
    `;
  }

  private resolvePath(obj: any, path: string | undefined): any {
    if (!path || !obj) return obj;
    
    // Handle JSONPath-like syntax: $.field.subfield
    const cleanPath = path.replace(/^\$\.?/, '');
    if (!cleanPath) return obj;
    
    return cleanPath.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  private resolveTemplate(template: string): string {
    // Replace {{field}} with actual values
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return this.data?.[key] ?? '';
    });
  }

  private formatValue(value: any): string {
    if (typeof value === 'number') {
      return value.toLocaleString('de-DE');
    }
    return String(value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'widget-renderer': WidgetRenderer;
  }
}
