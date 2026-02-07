import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('nodes-page')
export class NodesPage extends LitElement {
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
    
    .pair-btn {
      background: var(--accent-primary);
      border: none;
      color: #000;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    
    .empty-state {
      background: var(--bg-secondary);
      border: 1px dashed var(--border-color);
      border-radius: 8px;
      padding: 60px 40px;
      text-align: center;
    }
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    .empty-desc {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 400px;
      margin: 0 auto 24px;
      line-height: 1.5;
    }
    
    .nodes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    
    .node-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
    }
    
    .node-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .node-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .node-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .node-type {
      font-size: 12px;
      color: var(--text-muted);
    }
    
    .node-status {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--accent-primary);
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-primary);
    }
    
    .node-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }
    
    .info-label { color: var(--text-muted); }
    .info-value { color: var(--text-secondary); }
    
    .node-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    
    .action-btn {
      flex: 1;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
    }
    
    .action-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
  `;

  @property({ type: Object }) config: any = null;

  private nodes = [
    { id: 'macbook-pro', name: 'MacBook Pro', type: 'macOS', icon: '💻', status: 'online', lastSeen: 'Now', capabilities: ['camera', 'screen', 'location'] },
    { id: 'iphone-15', name: 'iPhone 15 Pro', type: 'iOS', icon: '📱', status: 'online', lastSeen: 'Now', capabilities: ['camera', 'location', 'notifications'] },
  ];

  render() {
    const hasNodes = this.nodes.length > 0;

    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Nodes</h1>
          <p class="page-subtitle">Paired devices and their capabilities</p>
        </div>
        <button class="pair-btn">+ Pair New Device</button>
      </div>
      
      ${!hasNodes ? html`
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-title">No Nodes Paired</div>
          <div class="empty-desc">
            Pair devices to enable camera access, screen capture, location services, and notifications.
          </div>
          <button class="pair-btn">Pair Device</button>
        </div>
      ` : html`
        <div class="nodes-grid">
          ${this.nodes.map(node => html`
            <div class="node-card">
              <div class="node-header">
                <div class="node-icon">${node.icon}</div>
                <div>
                  <div class="node-name">${node.name}</div>
                  <div class="node-type">${node.type}</div>
                </div>
                <div class="node-status">
                  <span class="status-dot"></span>
                  ${node.status}
                </div>
              </div>
              <div class="node-info">
                <div class="info-item">
                  <span class="info-label">Last Seen</span>
                  <span class="info-value">${node.lastSeen}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Capabilities</span>
                  <span class="info-value">${node.capabilities.join(', ')}</span>
                </div>
              </div>
              <div class="node-actions">
                <button class="action-btn">📷 Camera</button>
                <button class="action-btn">🔔 Notify</button>
                <button class="action-btn">⚙️ Config</button>
              </div>
            </div>
          `)}
        </div>
      `}
    `;
  }
}
