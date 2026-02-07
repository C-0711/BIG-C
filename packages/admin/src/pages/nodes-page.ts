import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { toastService } from '../services/index';

@customElement('nodes-page')
export class NodesPage extends LitElement {
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

    button {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: var(--accent-color, #3b82f6);
      border: none;
      color: white;
    }

    .btn-primary:hover {
      filter: brightness(1.1);
    }

    .empty-state {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 80px 40px;
      text-align: center;
    }

    .empty-state .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      margin: 0 0 12px 0;
      font-size: 20px;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: var(--text-secondary, #888);
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }

    .info-box {
      background: var(--bg-tertiary, #2a2a3a);
      border-radius: 8px;
      padding: 20px;
      margin-top: 24px;
      text-align: left;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .info-box h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: var(--text-primary);
    }

    .info-box ul {
      margin: 0;
      padding-left: 20px;
      color: var(--text-secondary, #888);
      font-size: 13px;
      line-height: 1.8;
    }
  `;

  @state() private nodes: any[] = [];

  private handlePairDevice() {
    toastService.info('Device pairing requires OpenClaw Node integration');
  }

  render() {
    if (this.nodes.length === 0) {
      return html`
        <div class="header">
          <div class="header-left">
            <h1>Nodes</h1>
            <p>Paired devices and their capabilities</p>
          </div>
          <button class="btn-primary" @click=${this.handlePairDevice}>
            + Pair New Device
          </button>
        </div>

        <div class="empty-state">
          <div class="icon">📱</div>
          <h3>No Devices Paired</h3>
          <p>Connect mobile devices or computers to extend your agent's capabilities with camera, notifications, and more.</p>
          
          <div class="info-box">
            <h4>How to pair a device:</h4>
            <ul>
              <li>Install OpenClaw on your device</li>
              <li>Open the app and go to Settings → Pairing</li>
              <li>Scan the QR code or enter the pairing code</li>
              <li>Approve the connection request</li>
            </ul>
          </div>
        </div>
      `;
    }

    return html`
      <div class="header">
        <div class="header-left">
          <h1>Nodes</h1>
          <p>Paired devices and their capabilities</p>
        </div>
        <button class="btn-primary" @click=${this.handlePairDevice}>
          + Pair New Device
        </button>
      </div>

      <div class="nodes-list">
        ${this.nodes.map(node => html`
          <div class="node-card">
            <!-- Node content would go here -->
          </div>
        `)}
      </div>
    `;
  }
}
