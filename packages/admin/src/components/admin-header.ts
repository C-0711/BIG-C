import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('admin-header')
export class AdminHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
    }
    
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--header-height, 48px);
      padding: 0 16px;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .menu-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      font-size: 18px;
    }
    
    .menu-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .logo-icon {
      font-size: 20px;
    }
    
    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    
    .logo-name {
      font-weight: 700;
      font-size: 14px;
      color: var(--text-primary);
      letter-spacing: 0.5px;
    }
    
    .logo-subtitle {
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 1px;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .health-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      background: var(--bg-tertiary);
    }
    
    .health-badge.healthy {
      color: var(--accent-primary);
    }
    
    .health-badge.unhealthy {
      color: var(--accent-danger);
    }
    
    .health-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    
    .icon-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .icon-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    .icon-btn.danger {
      color: var(--accent-danger);
    }
  `;

  @property({ type: Boolean }) healthy = true;
  @property({ type: Boolean }) connected = false;

  private toggleSidebar() {
    this.dispatchEvent(new CustomEvent('toggle-sidebar'));
  }

  render() {
    return html`
      <header class="header">
        <div class="header-left">
          <button class="menu-btn" @click=${this.toggleSidebar} title="Toggle Sidebar">
            ☰
          </button>
          
          <div class="logo">
            <span class="logo-icon">📊</span>
            <div class="logo-text">
              <span class="logo-name">0711-C INTELLIGENCE</span>
              <span class="logo-subtitle">GATEWAY DASHBOARD</span>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="health-badge ${this.healthy && this.connected ? 'healthy' : 'unhealthy'}">
            <span class="health-dot"></span>
            <span>${this.healthy && this.connected ? 'Health OK' : 'Disconnected'}</span>
          </div>
          
          <button class="icon-btn danger" title="Stop Gateway">
            🔴
          </button>
          
          <button class="icon-btn" title="Toggle Theme">
            ☀
          </button>
          
          <button class="icon-btn" title="Refresh">
            ⟳
          </button>
        </div>
      </header>
    `;
  }
}
