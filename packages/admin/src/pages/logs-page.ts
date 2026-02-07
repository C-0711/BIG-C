import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('logs-page')
export class LogsPage extends LitElement {
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
    
    .controls {
      display: flex;
      gap: 8px;
    }
    
    .btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    .btn.active {
      background: var(--accent-primary);
      color: #000;
      border-color: var(--accent-primary);
    }
    
    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    
    .filter-group {
      display: flex;
      gap: 4px;
    }
    
    .filter-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
    }
    
    .filter-btn:hover {
      color: var(--text-primary);
    }
    
    .filter-btn.active {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border-color: var(--accent-primary);
    }
    
    .search-input {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      color: var(--text-primary);
      font-size: 12px;
      width: 200px;
    }
    
    .search-input:focus {
      outline: none;
      border-color: var(--accent-primary);
    }
    
    .logs-container {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      height: calc(100vh - 280px);
      display: flex;
      flex-direction: column;
    }
    
    .logs-header {
      display: grid;
      grid-template-columns: 80px 70px 140px 1fr;
      padding: 12px 16px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .logs-body {
      flex: 1;
      overflow-y: auto;
      font-family: var(--font-mono);
      font-size: 12px;
    }
    
    .log-entry {
      display: grid;
      grid-template-columns: 80px 70px 140px 1fr;
      padding: 8px 16px;
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .log-entry:hover {
      background: var(--bg-hover);
    }
    
    .log-time {
      color: var(--text-muted);
    }
    
    .log-level {
      font-weight: 600;
    }
    
    .log-level.info { color: var(--accent-secondary); }
    .log-level.warn { color: #f59e0b; }
    .log-level.error { color: var(--accent-danger); }
    .log-level.debug { color: var(--text-muted); }
    
    .log-source {
      color: var(--text-secondary);
    }
    
    .log-message {
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .status-bar {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--bg-tertiary);
      border-top: 1px solid var(--border-color);
      font-size: 11px;
      color: var(--text-muted);
    }
    
    .auto-scroll {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .toggle {
      width: 32px;
      height: 18px;
      background: var(--bg-primary);
      border-radius: 9px;
      cursor: pointer;
      position: relative;
    }
    
    .toggle.active {
      background: var(--accent-primary);
    }
    
    .toggle::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s;
    }
    
    .toggle.active::after {
      transform: translateX(14px);
    }
  `;

  @property({ type: Object }) config: any = null;
  @state() level = 'all';
  @state() autoScroll = true;
  @state() search = '';
  @state() logs: Array<{time: string; level: string; source: string; message: string}> = [];

  connectedCallback() {
    super.connectedCallback();
    // Generate sample logs
    this.logs = this.generateSampleLogs();
  }

  private generateSampleLogs() {
    const sources = ['Gateway', 'Config', 'WebSocket', 'Agent', 'Workflow'];
    const levels = ['info', 'info', 'info', 'warn', 'debug', 'error'];
    const messages = [
      'Client connected',
      'Config loaded successfully',
      'Workflow started: daily-quality-check',
      'Agent product-expert initialized',
      'WebSocket broadcast: config.changed',
      'Database connection established',
      'Cache cleared',
      'Session created: main',
      'Health check passed',
      'Warning: High memory usage detected',
    ];
    
    const logs = [];
    const now = new Date();
    
    for (let i = 0; i < 50; i++) {
      const time = new Date(now.getTime() - i * 30000);
      logs.push({
        time: time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        level: levels[Math.floor(Math.random() * levels.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
      });
    }
    
    return logs.reverse();
  }

  private get filteredLogs() {
    return this.logs.filter(log => {
      if (this.level !== 'all' && log.level !== this.level) return false;
      if (this.search && !log.message.toLowerCase().includes(this.search.toLowerCase())) return false;
      return true;
    });
  }

  render() {
    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Logs</h1>
          <p class="page-subtitle">Real-time gateway logs and events</p>
        </div>
        <div class="controls">
          <button class="btn" @click=${() => this.logs = this.generateSampleLogs()}>⟳ Refresh</button>
          <button class="btn">Clear</button>
        </div>
      </div>
      
      <div class="filters">
        <div class="filter-group">
          ${['all', 'info', 'warn', 'error', 'debug'].map(l => html`
            <button 
              class="filter-btn ${this.level === l ? 'active' : ''}"
              @click=${() => this.level = l}
            >
              ${l.toUpperCase()}
            </button>
          `)}
        </div>
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search logs..."
          .value=${this.search}
          @input=${(e: Event) => this.search = (e.target as HTMLInputElement).value}
        />
      </div>
      
      <div class="logs-container">
        <div class="logs-header">
          <span>Time</span>
          <span>Level</span>
          <span>Source</span>
          <span>Message</span>
        </div>
        
        <div class="logs-body">
          ${this.filteredLogs.map(log => html`
            <div class="log-entry">
              <span class="log-time">${log.time}</span>
              <span class="log-level ${log.level}">${log.level.toUpperCase()}</span>
              <span class="log-source">${log.source}</span>
              <span class="log-message">${log.message}</span>
            </div>
          `)}
        </div>
        
        <div class="status-bar">
          <span>${this.filteredLogs.length} entries</span>
          <div class="auto-scroll">
            <span>Auto-scroll</span>
            <div 
              class="toggle ${this.autoScroll ? 'active' : ''}"
              @click=${() => this.autoScroll = !this.autoScroll}
            ></div>
          </div>
        </div>
      </div>
    `;
  }
}
