import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { modalService, type ConfirmOptions } from '../services/index.js';

@customElement('confirm-dialog')
export class ConfirmDialog extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .dialog {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 12px;
      padding: 24px;
      min-width: 400px;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      animation: scaleIn 0.2s ease-out;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary, #fff);
      margin: 0 0 12px 0;
    }

    .message {
      font-size: 14px;
      color: var(--text-secondary, #888);
      line-height: 1.6;
      margin: 0 0 24px 0;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    button {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cancel {
      background: transparent;
      border: 1px solid var(--border-color, #363646);
      color: var(--text-primary, #fff);
    }

    .cancel:hover {
      background: var(--bg-tertiary, #2a2a3a);
    }

    .confirm {
      background: var(--accent-color, #3b82f6);
      border: none;
      color: white;
    }

    .confirm:hover {
      filter: brightness(1.1);
    }

    .confirm.danger {
      background: #ef4444;
    }
  `;

  @state() private visible = false;
  @state() private options: ConfirmOptions | null = null;
  private resolvePromise: ((value: boolean) => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    modalService.registerConfirmHandler(this.showConfirm.bind(this));
  }

  private showConfirm(options: ConfirmOptions): Promise<boolean> {
    this.options = options;
    this.visible = true;
    
    return new Promise(resolve => {
      this.resolvePromise = resolve;
    });
  }

  private handleConfirm() {
    this.visible = false;
    this.resolvePromise?.(true);
    this.resolvePromise = null;
  }

  private handleCancel() {
    this.visible = false;
    this.resolvePromise?.(false);
    this.resolvePromise = null;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.handleCancel();
    } else if (e.key === 'Enter') {
      this.handleConfirm();
    }
  }

  render() {
    if (!this.visible || !this.options) return null;

    return html`
      <div class="overlay" @click=${this.handleCancel} @keydown=${this.handleKeyDown}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <h2 class="title">${this.options.title}</h2>
          <p class="message">${this.options.message}</p>
          <div class="actions">
            <button class="cancel" @click=${this.handleCancel}>
              ${this.options.cancelText || 'Cancel'}
            </button>
            <button class="confirm ${this.options.danger ? 'danger' : ''}" @click=${this.handleConfirm}>
              ${this.options.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
