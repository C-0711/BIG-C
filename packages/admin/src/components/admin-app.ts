import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService } from '../services/index.js';
import { authService } from '../services/auth-service.js';
import type { AuthUser } from '../services/auth-service.js';

import './admin-header.js';
import './admin-sidebar.js';
import './admin-content.js';
import './toast-container.js';
import './confirm-dialog.js';

@customElement('admin-app')
export class AdminApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--bg-primary, #121218);
      color: var(--text-primary, #ffffff);
    }

    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-layout {
      display: flex;
      flex: 1;
    }

    admin-sidebar {
      width: 260px;
      flex-shrink: 0;
    }

    admin-content {
      flex: 1;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      admin-sidebar {
        display: none;
      }
      
      admin-sidebar.open {
        display: block;
        position: fixed;
        left: 0;
        top: 60px;
        bottom: 0;
        z-index: 100;
        background: var(--bg-secondary);
      }
    }
  `;

  @state() private sidebarOpen = false;
  @state() private config: any = null;
  @state() private activePage = 'overview';
  @state() private user: AuthUser | null = null;
  @state() private authReady = false;

  async connectedCallback() {
    super.connectedCallback();

    // Handle OAuth callback first
    if (window.location.pathname.includes('/oauth/callback')) {
      const user = await authService.handleCallback();
      if (user) {
        this.user = user;
        this.authReady = true;
      }
    }

    // Check auth
    if (!this.authReady) {
      if (authService.isAuthenticated()) {
        this.user = authService.getUser();
        this.authReady = true;
      } else {
        this.authReady = true;
        // Will show login prompt in render()
        return;
      }
    }

    // Load config on app start (only if authenticated)
    await configService.load();
    configService.subscribe((config) => { this.config = config; });

    // Handle URL routing
    this.handleRoute();
    window.addEventListener('popstate', () => this.handleRoute());
  }

  private handleRoute() {
    const path = window.location.pathname;
    const match = path.match(/\/admin\/([^\/]+)/);
    if (match) {
      this.activePage = match[1];
    } else {
      this.activePage = 'overview';
    }
  }

  private handleNavigate(e: CustomEvent) {
    const page = e.detail;
    this.activePage = page;
    // Update URL
    window.history.pushState({}, '', `/admin/${page}`);
  }

  private toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private handleLogin() {
    authService.login();
  }

  private handleLogout() {
    authService.logout();
  }

  render() {
    // Loading
    if (!this.authReady) {
      return html`<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888">Loading...</div>`;
    }

    // Not authenticated — show login
    if (!this.user) {
      return html`
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:24px">
          <h1 style="font-size:28px;font-weight:700">0711 BIG-C Admin</h1>
          <p style="color:#888">Sign in to manage agents, workflows, and data sources.</p>
          <button @click=${this.handleLogin}
            style="padding:12px 32px;background:#7c3aed;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer">
            Sign in with 0711
          </button>
        </div>
      `;
    }

    return html`
      <div class="app-container">
        <admin-header @toggle-sidebar=${this.toggleSidebar}></admin-header>
        <div class="main-layout">
          <admin-sidebar
            class="${this.sidebarOpen ? 'open' : ''}"
            .currentRoute=${this.activePage}
            .config=${this.config}
            @navigate=${this.handleNavigate}
          ></admin-sidebar>
          <admin-content .activePage=${this.activePage} .config=${this.config}></admin-content>
        </div>
      </div>

      <toast-container></toast-container>
      <confirm-dialog></confirm-dialog>
    `;
  }
}
