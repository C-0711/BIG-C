import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { toastService } from '../services/index';

@customElement('channels-page')
export class ChannelsPage extends LitElement {
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

    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border-color, #363646);
      color: var(--text-primary, #fff);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .channels-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .channel-card {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .channel-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .channel-icon {
      font-size: 32px;
    }

    .channel-details h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
    }

    .channel-details .type {
      font-size: 12px;
      color: var(--text-secondary, #888);
    }

    .channel-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot.connected {
      background: #10b981;
    }

    .status-dot.disconnected {
      background: #ef4444;
    }

    .channel-actions {
      display: flex;
      gap: 8px;
    }

    .empty-state {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 60px 40px;
      text-align: center;
    }

    .empty-state .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
    }

    .empty-state p {
      margin: 0;
      color: var(--text-secondary, #888);
    }

    .channel-types {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 24px;
    }

    .channel-type {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 24px;
      background: var(--bg-tertiary, #2a2a3a);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .channel-type:hover {
      background: var(--border-color, #363646);
    }

    .channel-type .icon {
      font-size: 28px;
    }

    .channel-type .name {
      font-size: 12px;
      color: var(--text-secondary);
    }
  `;

  @state() private channels: any[] = [];

  private handleAddChannel(type?: string) {
    toastService.info(`Channel configuration requires OpenClaw channel setup`);
  }

  render() {
    if (this.channels.length === 0) {
      return html`
        <div class="header">
          <div class="header-left">
            <h1>Channels</h1>
            <p>Communication channels and integrations</p>
          </div>
        </div>

        <div class="empty-state">
          <div class="icon">${unsafeHTML(icons.link)}</div>
          <h3>No Channels Configured</h3>
          <p>Connect messaging platforms to interact with your agents.</p>
          
          <div class="channel-types">
            <div class="channel-type" @click=${() => this.handleAddChannel('webchat')}>
              <span class="icon">${unsafeHTML(icons.messageSquare)}</span>
              <span class="name">Web Chat</span>
            </div>
            <div class="channel-type" @click=${() => this.handleAddChannel('telegram')}>
              <span class="icon">✈️</span>
              <span class="name">Telegram</span>
            </div>
            <div class="channel-type" @click=${() => this.handleAddChannel('slack')}>
              <span class="icon">💼</span>
              <span class="name">Slack</span>
            </div>
            <div class="channel-type" @click=${() => this.handleAddChannel('discord')}>
              <span class="icon">🎮</span>
              <span class="name">Discord</span>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="header">
        <div class="header-left">
          <h1>Channels</h1>
          <p>Communication channels and integrations</p>
        </div>
        <button class="btn-primary" @click=${() => this.handleAddChannel()}>
          + Add Channel
        </button>
      </div>

      <div class="channels-list">
        ${this.channels.map(channel => html`
          <div class="channel-card">
            <div class="channel-info">
              <span class="channel-icon">${channel.icon}</span>
              <div class="channel-details">
                <h3>${channel.name}</h3>
                <span class="type">${channel.type}</span>
              </div>
            </div>
            <div class="channel-status">
              <span class="status-dot ${channel.connected ? 'connected' : 'disconnected'}"></span>
              ${channel.connected ? 'Connected' : 'Disconnected'}
            </div>
            <div class="channel-actions">
              <button class="btn-secondary btn-sm">Configure</button>
              <button class="btn-secondary btn-sm">Test</button>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}
