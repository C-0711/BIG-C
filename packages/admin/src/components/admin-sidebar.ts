import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';

interface NavItem {
  id: string;
  iconKey: string;
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
      { id: 'chat', iconKey: 'messageSquare', label: 'Chat' },
    ],
  },
  {
    title: 'Control',
    items: [
      { id: 'overview', iconKey: 'layoutDashboard', label: 'Overview' },
      { id: 'channels', iconKey: 'link', label: 'Channels' },
      { id: 'instances', iconKey: 'radio', label: 'Instances' },
      { id: 'sessions', iconKey: 'activity', label: 'Sessions' },
      { id: 'cron-jobs', iconKey: 'clock', label: 'Cron Jobs' },
    ],
  },
  {
    title: 'Agent',
    items: [
      { id: 'agents', iconKey: 'bot', label: 'Agents' },
      { id: 'skills', iconKey: 'sparkles', label: 'Skills' },
      { id: 'nodes', iconKey: 'server', label: 'Nodes' },
    ],
  },
  {
    title: 'Data',
    items: [
      { id: 'data-sources', iconKey: 'plug', label: 'Datenquellen' },
      { id: 'widgets', iconKey: 'barChart3', label: 'Widgets' },
      { id: 'outputs', iconKey: 'upload', label: 'Ausgaben' },
      { id: 'template', iconKey: 'palette', label: 'Template & UI' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'config', iconKey: 'settings', label: 'Config' },
      { id: 'debug', iconKey: 'bug', label: 'Debug' },
      { id: 'logs', iconKey: 'fileText', label: 'Logs' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { id: 'docs', iconKey: 'bookOpen', label: 'Docs' },
    ],
  },
];

@customElement('admin-sidebar')
export class AdminSidebar extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: var(--sidebar-width, 220px);
      background: var(--bg-secondary, #16161e);
      border-right: 1px solid var(--border-color, #2a2a3a);
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
      color: var(--text-muted, #6b7280);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .group-divider {
      height: 1px;
      background: var(--border-subtle, #1e1e28);
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
      color: var(--text-secondary, #9ca3af);
      text-decoration: none;
      font-size: 13px;
      transition: all 0.15s ease;
    }
    
    .nav-item:hover {
      background: var(--bg-hover, #252532);
      color: var(--text-primary, #fff);
    }
    
    .nav-item.active {
      background: var(--accent-primary, #22c55e);
      color: #000;
      font-weight: 500;
    }
    
    .nav-item .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    
    .nav-item .icon svg {
      width: 18px;
      height: 18px;
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
      background: var(--bg-tertiary, #1e1e28);
      border-top: 1px solid var(--border-color, #2a2a3a);
      margin-top: auto;
    }
    
    .footer-info {
      font-size: 11px;
      color: var(--text-muted, #6b7280);
      line-height: 1.5;
    }
    
    .footer-info .version {
      color: var(--text-secondary, #9ca3af);
      font-weight: 500;
    }
    
    .footer-info .status {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--accent-primary, #22c55e);
    }
    
    .footer-info .status svg {
      width: 14px;
      height: 14px;
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
                <span class="icon">${unsafeHTML(icons[item.iconKey] || '')}</span>
                <span class="label">${item.label}</span>
              </a>
            `)}
          </div>
        `)}
        
        ${!this.collapsed ? html`
          <div class="sidebar-footer">
            <div class="footer-info">
              <div class="version">v2026.2.1</div>
              <div class="status">${unsafeHTML(icons.checkCircle)} Running</div>
              <div>${instanceName}</div>
              <div>${agentCount} Agents · ${workflowCount} Workflows</div>
            </div>
          </div>
        ` : ''}
      </nav>
    `;
  }
}
