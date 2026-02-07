import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService, toastService } from '../services/index';

@customElement('admin-header')
export class AdminHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--bg-secondary, #1a1a24);
      border-bottom: 1px solid var(--border-color, #2a2a3a);
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      height: 60px;
      box-sizing: border-box;
    }

    .left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-btn {
      background: none;
      border: none;
      color: var(--text-primary, #fff);
      font-size: 20px;
      cursor: pointer;
      padding: 8px;
      display: none;
    }

    @media (max-width: 768px) {
      .menu-btn {
        display: block;
      }
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 24px;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .logo-subtitle {
      font-size: 10px;
      color: var(--text-secondary, #888);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 20px;
      font-size: 12px;
      color: #10b981;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
    }

    button {
      background: var(--bg-tertiary, #2a2a3a);
      border: 1px solid var(--border-color, #363646);
      color: var(--text-primary, #fff);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    button:hover {
      background: var(--border-color, #363646);
    }

    button.active {
      background: var(--accent-color, #3b82f6);
      border-color: var(--accent-color, #3b82f6);
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  @state() private theme: 'light' | 'dark' = 'dark';
  @state() private refreshing = false;

  private handleMenuToggle() {
    this.dispatchEvent(new CustomEvent('toggle-sidebar'));
  }

  private handleThemeToggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
    toastService.info(`Switched to ${this.theme} mode`);
  }

  private async handleRefresh() {
    this.refreshing = true;
    await configService.load();
    this.refreshing = false;
    toastService.success('Data refreshed');
  }

  render() {
    return html`
      <header>
        <div class="left">
          <button class="menu-btn" @click=${this.handleMenuToggle}>☰</button>
          <div class="logo">
            <span class="logo-icon">📊</span>
            <div class="logo-text">
              <span class="logo-title">0711-C INTELLIGENCE</span>
              <span class="logo-subtitle">Gateway Dashboard</span>
            </div>
          </div>
        </div>

        <div class="right">
          <div class="status">
            <span class="status-dot"></span>
            Health OK
          </div>
          <button @click=${this.handleThemeToggle} title="Toggle theme">
            ${this.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button @click=${this.handleRefresh} title="Refresh data" ?disabled=${this.refreshing}>
            ${this.refreshing ? html`<span class="spinner"></span>` : '⟳'}
          </button>
        </div>
      </header>
    `;
  }
}
