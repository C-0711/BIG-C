import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_STRUCTURE: NavGroup[] = [
  {
    title: 'Chat',
    items: [
      { id: 'chat', icon: '💬', label: 'Chat' },
    ],
  },
  {
    title: 'Control',
    items: [
      { id: 'overview', icon: '📋', label: 'Overview' },
      { id: 'channels', icon: '🔗', label: 'Channels' },
      { id: 'instances', icon: '📡', label: 'Instances' },
      { id: 'sessions', icon: '📊', label: 'Sessions' },
      { id: 'cron-jobs', icon: '⏰', label: 'Cron Jobs' },
    ],
  },
  {
    title: 'Agent',
    items: [
      { id: 'agents', icon: '■', label: 'Agents' },
      { id: 'skills', icon: '✨', label: 'Skills' },
      { id: 'nodes', icon: '📦', label: 'Nodes' },
    ],
  },
  {
    title: 'Data',
    items: [
      { id: 'data-sources', icon: '🔌', label: 'Datenquellen' },
      { id: 'outputs', icon: '📤', label: 'Ausgaben' },
      { id: 'template', icon: '🎨', label: 'Template & UI' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'config', icon: '⚙️', label: 'Config' },
      { id: 'debug', icon: '🐛', label: 'Debug' },
      { id: 'logs', icon: '📋', label: 'Logs' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { id: 'docs', icon: '📚', label: 'Docs' },
    ],
  },
];

@customElement('admin-sidebar')
export class AdminSidebar extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: var(--sidebar-width, 220px);
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
      transition: width 0.2s ease;
    }
    
    :host([collapsed]) {
      width: 60px;
    }
    
    .sidebar {
      padding: 12px 0;
    }
    
    .nav-group {
      margin-bottom: 8px;
    }
    
    .group-title {
      padding: 8px 16px 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .group-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: 0 16px 8px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      margin: 2px 8px;
      border-radius: 6px;
      cursor: pointer;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13px;
      transition: all 0.15s ease;
    }
    
    .nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    .nav-item.active {
      background: var(--accent-primary);
      color: #000;
      font-weight: 500;
    }
    
    .nav-item .icon {
      font-size: 14px;
      width: 20px;
      text-align: center;
    }
    
    .nav-item .label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    :host([collapsed]) .group-title,
    :host([collapsed]) .label {
      display: none;
    }
    
    :host([collapsed]) .nav-item {
      justify-content: center;
      padding: 10px;
      margin: 2px 4px;
    }
    
    :host([collapsed]) .nav-item .icon {
      font-size: 18px;
    }
    
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border-color);
      margin-top: auto;
    }
    
    .footer-info {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.4;
    }
    
    .footer-info .version {
      color: var(--text-secondary);
    }
    
    .footer-info .status {
      color: var(--accent-primary);
    }
  `;

  @property({ type: Boolean, reflect: true }) collapsed = false;
  @property({ type: String }) currentRoute = 'overview';
  @property({ type: Object }) config: any = null;

  private navigate(route: string) {
    this.dispatchEvent(new CustomEvent('navigate', { detail: route }));
  }

  render() {
    const instanceName = this.config?.instance?.name || '0711-C Intelligence';
    const agentCount = this.config?.agents?.list?.length || 0;
    const workflowCount = this.config?.workflows?.list?.length || 0;

    return html`
      <nav class="sidebar">
        ${NAV_STRUCTURE.map(group => html`
          <div class="nav-group">
            <div class="group-title">${group.title}</div>
            <div class="group-divider"></div>
            ${group.items.map(item => html`
              <a
                class="nav-item ${this.currentRoute === item.id ? 'active' : ''}"
                @click=${() => this.navigate(item.id)}
              >
                <span class="icon">${item.icon}</span>
                <span class="label">${item.label}</span>
              </a>
            `)}
          </div>
        `)}
        
        ${!this.collapsed ? html`
          <div class="sidebar-footer">
            <div class="footer-info">
              <div class="version">v2026.2.1</div>
              <div class="status">Gateway: ✅ Running</div>
              <div>${instanceName}</div>
              <div>${agentCount} Agents · ${workflowCount} Workflows</div>
            </div>
          </div>
        ` : ''}
      </nav>
    `;
  }
}
