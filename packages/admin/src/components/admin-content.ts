import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../pages/overview-page';
import '../pages/agents-page';
import '../pages/data-sources-page';
import '../pages/outputs-page';
import '../pages/config-page';

@customElement('admin-content')
export class AdminContent extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--bg-primary);
      overflow-y: auto;
    }
    
    .content {
      padding: 24px;
      max-width: 1400px;
    }
    
    .page-header {
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
    
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      background: var(--bg-secondary);
      border-radius: 8px;
      border: 1px dashed var(--border-color);
    }
    
    .placeholder-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .placeholder-text {
      color: var(--text-muted);
    }
  `;

  @property({ type: String }) route = 'overview';
  @property({ type: Object }) config: any = null;

  private renderPage() {
    switch (this.route) {
      case 'overview':
        return html`<overview-page .config=${this.config}></overview-page>`;
      case 'agents':
        return html`<agents-page .config=${this.config}></agents-page>`;
      case 'data-sources':
        return html`<data-sources-page .config=${this.config}></data-sources-page>`;
      case 'outputs':
        return html`<outputs-page .config=${this.config}></outputs-page>`;
      case 'config':
        return html`<config-page .config=${this.config}></config-page>`;
      default:
        return this.renderPlaceholder();
    }
  }

  private renderPlaceholder() {
    const pageInfo: Record<string, { icon: string; title: string }> = {
      'chat': { icon: '💬', title: 'Chat' },
      'channels': { icon: '🔗', title: 'Channels' },
      'instances': { icon: '📡', title: 'Instances' },
      'sessions': { icon: '📊', title: 'Sessions' },
      'cron-jobs': { icon: '⏰', title: 'Cron Jobs' },
      'skills': { icon: '✨', title: 'Skills' },
      'nodes': { icon: '📦', title: 'Nodes' },
      'template': { icon: '🎨', title: 'Template & UI' },
      'debug': { icon: '🐛', title: 'Debug' },
      'logs': { icon: '📋', title: 'Logs' },
      'docs': { icon: '📚', title: 'Docs' },
    };

    const info = pageInfo[this.route] || { icon: '📄', title: this.route };

    return html`
      <div class="placeholder">
        <span class="placeholder-icon">${info.icon}</span>
        <span class="placeholder-text">${info.title} — Coming Soon</span>
      </div>
    `;
  }

  render() {
    return html`
      <div class="content">
        ${this.renderPage()}
      </div>
    `;
  }
}
