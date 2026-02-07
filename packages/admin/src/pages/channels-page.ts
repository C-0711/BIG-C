import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('channels-page')
export class ChannelsPage extends LitElement {
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
    
    .channels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .channel-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
    }
    
    .channel-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .channel-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    
    .channel-icon.telegram { background: #0088cc20; }
    .channel-icon.slack { background: #4a154b20; }
    .channel-icon.discord { background: #5865f220; }
    .channel-icon.webchat { background: #22c55e20; }
    
    .channel-info { flex: 1; }
    
    .channel-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    
    .channel-type {
      font-size: 12px;
      color: var(--text-muted);
    }
    
    .channel-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .status-dot.connected { background: var(--accent-primary); }
    .status-dot.disconnected { background: var(--accent-danger); }
    
    .channel-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .stat-label {
      font-size: 11px;
      color: var(--text-muted);
    }
    
    .channel-actions {
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
      font-size: 12px;
    }
    
    .action-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
  `;

  @property({ type: Object }) config: any = null;

  private channels = [
    { id: 'webchat', name: 'Web Chat', type: 'webchat', icon: '💬', status: 'connected', messages: 142, sessions: 8 },
    { id: 'telegram', name: 'Telegram Bot', type: 'telegram', icon: '✈️', status: 'connected', messages: 89, sessions: 3 },
    { id: 'slack', name: 'Slack Workspace', type: 'slack', icon: '💼', status: 'disconnected', messages: 0, sessions: 0 },
  ];

  render() {
    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Channels</h1>
          <p class="page-subtitle">Communication channels and integrations</p>
        </div>
        <button class="add-btn">+ Add Channel</button>
      </div>
      
      <div class="channels-grid">
        ${this.channels.map(ch => html`
          <div class="channel-card">
            <div class="channel-header">
              <div class="channel-icon ${ch.type}">${ch.icon}</div>
              <div class="channel-info">
                <div class="channel-name">${ch.name}</div>
                <div class="channel-type">${ch.type}</div>
              </div>
              <div class="channel-status">
                <span class="status-dot ${ch.status}"></span>
                ${ch.status}
              </div>
            </div>
            
            <div class="channel-stats">
              <div class="stat">
                <div class="stat-value">${ch.messages}</div>
                <div class="stat-label">Messages Today</div>
              </div>
              <div class="stat">
                <div class="stat-value">${ch.sessions}</div>
                <div class="stat-label">Active Sessions</div>
              </div>
            </div>
            
            <div class="channel-actions">
              <button class="action-btn">Configure</button>
              <button class="action-btn">Test</button>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}
