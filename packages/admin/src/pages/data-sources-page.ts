import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('data-sources-page')
export class DataSourcesPage extends LitElement {
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
    
    .add-btn {
      background: var(--accent-primary);
      border: none;
      color: #000;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    
    .add-btn:hover {
      opacity: 0.9;
    }
    
    .sources-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .source-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .source-icon {
      font-size: 32px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      border-radius: 8px;
    }
    
    .source-info {
      flex: 1;
    }
    
    .source-name {
      font-size: 15px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    
    .source-type {
      font-size: 12px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    
    .source-meta {
      text-align: right;
    }
    
    .source-status {
      font-size: 12px;
      color: var(--accent-primary);
      margin-bottom: 4px;
    }
    
    .source-schedule {
      font-size: 11px;
      color: var(--text-muted);
    }
    
    .source-actions {
      display: flex;
      gap: 8px;
    }
    
    .action-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .action-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    .action-btn.sync {
      background: var(--accent-primary);
      color: #000;
      border-color: var(--accent-primary);
    }
    
    .empty-state {
      text-align: center;
      padding: 48px;
      background: var(--bg-secondary);
      border: 1px dashed var(--border-color);
      border-radius: 8px;
      color: var(--text-muted);
    }
  `;

  @property({ type: Object }) config: any = null;

  private getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'postgres': '🐘',
      'mysql': '🐬',
      'sqlite': '📦',
      'csv': '📄',
      'excel': '📊',
      'rest-api': '🌐',
      'graphql': '◈',
      'mcp': '🔌',
    };
    return icons[type] || '📁';
  }

  render() {
    const providers = this.config?.dataSources?.providers || {};
    const sources = Object.entries(providers).map(([id, cfg]: [string, any]) => ({
      id,
      ...cfg,
    }));

    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Datenquellen</h1>
          <p class="page-subtitle">MCP-Verbindungen zu externen Datenquellen</p>
        </div>
        <button class="add-btn">+ Neue Datenquelle</button>
      </div>
      
      ${sources.length === 0 ? html`
        <div class="empty-state">
          <p>Keine Datenquellen konfiguriert</p>
          <p style="font-size: 12px; margin-top: 8px;">
            Füge PostgreSQL, CSV, REST API oder andere Datenquellen hinzu.
          </p>
        </div>
      ` : html`
        <div class="sources-list">
          ${sources.map(source => html`
            <div class="source-card">
              <div class="source-icon">${this.getTypeIcon(source.type)}</div>
              <div class="source-info">
                <div class="source-name">${source.id}</div>
                <div class="source-type">${source.type}</div>
              </div>
              <div class="source-meta">
                <div class="source-status">● Connected</div>
                <div class="source-schedule">
                  ${source.sync?.schedule ? `Sync: ${source.sync.schedule}` : 'Manual sync'}
                </div>
              </div>
              <div class="source-actions">
                <button class="action-btn sync">Sync</button>
                <button class="action-btn">Edit</button>
              </div>
            </div>
          `)}
        </div>
      `}
    `;
  }
}
