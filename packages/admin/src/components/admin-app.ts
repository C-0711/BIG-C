import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './admin-header';
import './admin-sidebar';
import './admin-content';

@customElement('admin-app')
export class AdminApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
    
    .app-layout {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg-primary);
    }
    
    .app-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    admin-sidebar {
      flex-shrink: 0;
    }
    
    admin-content {
      flex: 1;
      overflow: auto;
    }
  `;

  @state() sidebarCollapsed = false;
  @state() currentRoute = 'overview';
  @state() config: any = null;
  @state() connected = false;
  @state() healthy = true;

  private ws: WebSocket | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.connectWebSocket();
    this.handleRouteChange();
    window.addEventListener('popstate', () => this.handleRouteChange());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.ws?.close();
  }

  private connectWebSocket() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${location.host}/ws`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this.connected = true;
    };
    
    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'config.init' || msg.type === 'config.changed') {
          this.config = msg.config;
          console.log('[WS] Config loaded:', this.config?.instance?.name);
        }
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };
    
    this.ws.onclose = () => {
      console.log('[WS] Disconnected');
      this.connected = false;
      // Reconnect after 3s
      setTimeout(() => this.connectWebSocket(), 3000);
    };
    
    this.ws.onerror = () => {
      this.healthy = false;
    };
  }

  private handleRouteChange() {
    const path = location.pathname.replace('/admin/', '').replace('/admin', '') || 'overview';
    this.currentRoute = path;
  }

  private navigate(route: string) {
    history.pushState(null, '', `/admin/${route}`);
    this.currentRoute = route;
  }

  private toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  render() {
    return html`
      <div class="app-layout">
        <admin-header
          .healthy=${this.healthy}
          .connected=${this.connected}
          @toggle-sidebar=${() => this.toggleSidebar()}
        ></admin-header>
        
        <div class="app-body">
          <admin-sidebar
            .collapsed=${this.sidebarCollapsed}
            .currentRoute=${this.currentRoute}
            .config=${this.config}
            @navigate=${(e: CustomEvent) => this.navigate(e.detail)}
          ></admin-sidebar>
          
          <admin-content
            .route=${this.currentRoute}
            .config=${this.config}
          ></admin-content>
        </div>
      </div>
    `;
  }
}
