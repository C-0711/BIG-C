import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('sessions-page')
export class SessionsPage extends LitElement {
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
    
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
    }
    
    .stat-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .stat-value.active { color: var(--accent-primary); }
    
    .sessions-table {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .table-header {
      display: grid;
      grid-template-columns: 1fr 120px 100px 140px 100px;
      padding: 12px 20px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 1fr 120px 100px 140px 100px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-subtle);
      align-items: center;
    }
    
    .table-row:hover { background: var(--bg-hover); }
    
    .session-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .session-avatar {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    
    .session-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .session-key {
      font-size: 11px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    
    .session-agent {
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 12px;
      background: var(--bg-primary);
    }
    
    .status-badge.active {
      color: var(--accent-primary);
    }
    
    .status-badge.idle {
      color: var(--text-muted);
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    
    .session-time {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .action-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 6px 12px;
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
  @state() sessions = this.generateSessions();

  private generateSessions() {
    const agents = ['product-expert', 'quality-checker', 'content-writer', 'feed-manager'];
    const statuses = ['active', 'active', 'idle', 'idle'];
    
    return agents.map((agent, i) => ({
      key: `session_${Math.random().toString(36).substr(2, 8)}`,
      agent,
      emoji: ['🔍', '✅', '✍️', '📤'][i],
      status: statuses[i],
      messages: Math.floor(Math.random() * 50) + 5,
      lastActive: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      created: new Date(Date.now() - Math.random() * 86400000).toLocaleString('de-DE'),
    }));
  }

  render() {
    const activeSessions = this.sessions.filter(s => s.status === 'active').length;
    const totalMessages = this.sessions.reduce((acc, s) => acc + s.messages, 0);

    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Sessions</h1>
          <p class="page-subtitle">Active agent sessions and conversations</p>
        </div>
      </div>
      
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Total Sessions</div>
          <div class="stat-value">${this.sessions.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active</div>
          <div class="stat-value active">${activeSessions}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Messages</div>
          <div class="stat-value">${totalMessages}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Duration</div>
          <div class="stat-value">12m</div>
        </div>
      </div>
      
      <div class="sessions-table">
        <div class="table-header">
          <span>Session</span>
          <span>Agent</span>
          <span>Status</span>
          <span>Last Active</span>
          <span>Action</span>
        </div>
        
        ${this.sessions.map(session => html`
          <div class="table-row">
            <div class="session-info">
              <div class="session-avatar">${session.emoji}</div>
              <div>
                <div class="session-name">${session.agent}</div>
                <div class="session-key">${session.key}</div>
              </div>
            </div>
            <div class="session-agent">${session.messages} msgs</div>
            <div>
              <span class="status-badge ${session.status}">
                <span class="status-dot"></span>
                ${session.status}
              </span>
            </div>
            <div class="session-time">${session.lastActive}</div>
            <div>
              <button class="action-btn">View</button>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}
