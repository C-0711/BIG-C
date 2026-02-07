import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('logs-page')
export class LogsPage extends LitElement {
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

    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    select {
      padding: 8px 12px;
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 6px;
      color: var(--text-primary, #fff);
      font-size: 13px;
    }

    .log-container {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 16px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      line-height: 1.6;
      height: 500px;
      overflow-y: auto;
    }

    .log-line {
      padding: 4px 0;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .log-line:last-child {
      border-bottom: none;
    }

    .log-time {
      color: var(--text-secondary, #888);
      margin-right: 12px;
    }

    .log-level {
      padding: 2px 6px;
      border-radius: 3px;
      margin-right: 12px;
      font-size: 10px;
      font-weight: 600;
    }

    .log-level.info {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .log-level.warn {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .log-level.error {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .log-message {
      color: var(--text-primary, #fff);
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary, #888);
    }
  `;

  @state() private logs: any[] = [];
  @state() private filter = 'all';

  connectedCallback() {
    super.connectedCallback();
    // Generate some sample logs
    this.logs = this.generateSampleLogs();
  }

  private generateSampleLogs() {
    const now = new Date();
    return [
      { time: new Date(now.getTime() - 1000), level: 'info', message: 'Gateway started on port 7075' },
      { time: new Date(now.getTime() - 2000), level: 'info', message: 'Config loaded from ~/.0711-client1/config.json' },
      { time: new Date(now.getTime() - 3000), level: 'info', message: 'Admin UI serving at /admin' },
      { time: new Date(now.getTime() - 4000), level: 'info', message: 'User UI serving at /app' },
      { time: new Date(now.getTime() - 10000), level: 'info', message: '4 agents loaded' },
      { time: new Date(now.getTime() - 11000), level: 'info', message: '4 workflows loaded' },
    ];
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  render() {
    const filteredLogs = this.filter === 'all' 
      ? this.logs 
      : this.logs.filter(log => log.level === this.filter);

    return html`
      <div class="header">
        <div class="header-left">
          <h1>Logs</h1>
          <p>Application logs and events</p>
        </div>
      </div>

      <div class="filters">
        <select @change=${(e: Event) => this.filter = (e.target as HTMLSelectElement).value}>
          <option value="all">All Levels</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div class="log-container">
        ${filteredLogs.length === 0 ? html`
          <div class="empty-state">No logs to display</div>
        ` : filteredLogs.map(log => html`
          <div class="log-line">
            <span class="log-time">${this.formatTime(log.time)}</span>
            <span class="log-level ${log.level}">${log.level.toUpperCase()}</span>
            <span class="log-message">${log.message}</span>
          </div>
        `)}
      </div>
    `;
  }
}
