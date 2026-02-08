import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService } from '../services/index.js';

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

  async connectedCallback() {
    super.connectedCallback();
    // Load config on app start
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

  render() {
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
