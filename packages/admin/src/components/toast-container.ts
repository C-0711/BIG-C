import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { toastService, type Toast } from '../services/index.js';

@customElement('toast-container')
export class ToastContainer extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: 8px;
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      min-width: 300px;
      max-width: 450px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
    }

    .toast.dismissing {
      animation: slideOut 0.2s ease-in forwards;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
      color: var(--text-primary, #fff);
    }

    .dismiss {
      background: none;
      border: none;
      color: var(--text-secondary, #888);
      cursor: pointer;
      padding: 4px;
      font-size: 18px;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .dismiss:hover {
      opacity: 1;
    }

    .toast.success {
      border-color: #10b981;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), var(--bg-secondary, #1e1e2e));
    }
    .toast.success .icon { color: #10b981; }

    .toast.error {
      border-color: #ef4444;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), var(--bg-secondary, #1e1e2e));
    }
    .toast.error .icon { color: #ef4444; }

    .toast.warning {
      border-color: #f59e0b;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), var(--bg-secondary, #1e1e2e));
    }
    .toast.warning .icon { color: #f59e0b; }

    .toast.info {
      border-color: #3b82f6;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), var(--bg-secondary, #1e1e2e));
    }
    .toast.info .icon { color: #3b82f6; }
  `;

  @state() private toasts: Toast[] = [];
  @state() private dismissing: Set<string> = new Set();
  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = toastService.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }

  private handleDismiss(id: string) {
    this.dismissing = new Set([...this.dismissing, id]);
    setTimeout(() => {
      toastService.dismiss(id);
      this.dismissing = new Set([...this.dismissing].filter(i => i !== id));
    }, 200);
  }

  render() {
    return html`
      ${this.toasts.map(toast => html`
        <div class="toast ${toast.type} ${this.dismissing.has(toast.id) ? 'dismissing' : ''}">
          <span class="icon">${this.getIcon(toast.type)}</span>
          <span class="message">${toast.message}</span>
          <button class="dismiss" @click=${() => this.handleDismiss(toast.id)}>×</button>
        </div>
      `)}
    `;
  }
}
