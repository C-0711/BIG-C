import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('sessions-page')
export class SessionsPage extends LitElement {
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
  `;

  @state() private sessions: any[] = [];

  render() {
    return html`
      <div class="header">
        <div class="header-left">
          <h1>Sessions</h1>
          <p>Active chat sessions and conversations</p>
        </div>
      </div>

      <div class="empty-state">
        <div class="icon">${unsafeHTML(icons.messageCircle)}</div>
        <h3>No Active Sessions</h3>
        <p>Chat sessions will appear here when users interact with agents.</p>
      </div>
    `;
  }
}
