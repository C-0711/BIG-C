import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('outputs-page')
export class OutputsPage extends LitElement {
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
    
    .outputs-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .output-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .output-icon {
      font-size: 32px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      border-radius: 8px;
    }
    
    .output-info {
      flex: 1;
    }
    
    .output-name {
      font-size: 15px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    
    .output-type {
      font-size: 12px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    
    .output-status {
      font-size: 12px;
      color: var(--accent-primary);
    }
    
    .output-status.error {
      color: var(--accent-danger);
    }
    
    .output-actions {
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
      'slack': '💬',
      'telegram': '✈️',
      'whatsapp': '📱',
      'email': '✉️',
      'api': '🚀',
      'webhook': '🔗',
      'ftp': '📁',
      'csv-export': '📤',
    };
    return icons[type] || '📤';
  }

  render() {
    const providers = this.config?.outputs?.providers || {};
    const outputs = Object.entries(providers).map(([id, cfg]: [string, any]) => ({
      id,
      ...cfg,
    }));

    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Ausgaben</h1>
          <p class="page-subtitle">Output Provider für Benachrichtigungen und Feeds</p>
        </div>
        <button class="add-btn">+ Neue Ausgabe</button>
      </div>
      
      ${outputs.length === 0 ? html`
        <div class="empty-state">
          <p>Keine Ausgaben konfiguriert</p>
          <p style="font-size: 12px; margin-top: 8px;">
            Füge Slack, Telegram, API oder andere Ausgabekanäle hinzu.
          </p>
        </div>
      ` : html`
        <div class="outputs-list">
          ${outputs.map(output => html`
            <div class="output-card">
              <div class="output-icon">${this.getTypeIcon(output.type)}</div>
              <div class="output-info">
                <div class="output-name">${output.id}</div>
                <div class="output-type">${output.type}</div>
              </div>
              <div class="output-status">● Ready</div>
              <div class="output-actions">
                <button class="action-btn">Test</button>
                <button class="action-btn">Edit</button>
              </div>
            </div>
          `)}
        </div>
      `}
    `;
  }
}
