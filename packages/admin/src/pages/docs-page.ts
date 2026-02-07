import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('docs-page')
export class DocsPage extends LitElement {
  static styles = css`
    :host { display: block; }
    
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
    
    .docs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .doc-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .doc-card:hover {
      border-color: var(--accent-primary);
      transform: translateY(-2px);
    }
    
    .doc-icon {
      font-size: 32px;
      margin-bottom: 16px;
    }
    
    .doc-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    .doc-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    
    .links-list {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .link-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      transition: background 0.15s;
    }
    
    .link-item:last-child { border-bottom: none; }
    
    .link-item:hover {
      background: var(--bg-hover);
    }
    
    .link-icon {
      font-size: 20px;
    }
    
    .link-info { flex: 1; }
    
    .link-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    
    .link-url {
      font-size: 12px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    
    .link-arrow {
      color: var(--text-muted);
      font-size: 18px;
    }
  `;

  @property({ type: Object }) config: any = null;

  private docs = [
    { icon: '🚀', title: 'Getting Started', desc: 'Quick start guide and initial setup' },
    { icon: '⚙️', title: 'Configuration', desc: 'Config file structure and options' },
    { icon: '🤖', title: 'Agents', desc: 'Creating and managing AI agents' },
    { icon: '⚡', title: 'Workflows', desc: 'Automation and scheduled tasks' },
    { icon: '🔌', title: 'Data Sources', desc: 'Connecting external data via MCP' },
    { icon: '📤', title: 'Outputs', desc: 'Publishing to channels and APIs' },
  ];

  private links = [
    { icon: '📚', title: 'Documentation', url: 'https://docs.0711.io' },
    { icon: '💬', title: 'Discord Community', url: 'https://discord.gg/0711' },
    { icon: '🐙', title: 'GitHub Repository', url: 'https://github.com/0711/intelligence' },
    { icon: '🎯', title: 'API Reference', url: 'https://api.0711.io/docs' },
  ];

  private openLink(url: string) {
    window.open(url, '_blank');
  }

  render() {
    return html`
      <div class="page-header">
        <h1 class="page-title">Documentation</h1>
        <p class="page-subtitle">Guides, references, and resources</p>
      </div>
      
      <div class="section-title">Quick Guides</div>
      <div class="docs-grid">
        ${this.docs.map(doc => html`
          <div class="doc-card">
            <div class="doc-icon">${doc.icon}</div>
            <div class="doc-title">${doc.title}</div>
            <div class="doc-desc">${doc.desc}</div>
          </div>
        `)}
      </div>
      
      <div class="section-title">External Resources</div>
      <div class="links-list">
        ${this.links.map(link => html`
          <div class="link-item" @click=${() => this.openLink(link.url)}>
            <span class="link-icon">${link.icon}</span>
            <div class="link-info">
              <div class="link-title">${link.title}</div>
              <div class="link-url">${link.url}</div>
            </div>
            <span class="link-arrow">→</span>
          </div>
        `)}
      </div>
    `;
  }
}
