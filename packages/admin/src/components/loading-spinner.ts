import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('loading-spinner')
export class LoadingSpinner extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .small {
      width: 14px;
      height: 14px;
    }

    .medium {
      width: 20px;
      height: 20px;
    }

    .large {
      width: 32px;
      height: 32px;
      border-width: 3px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium';

  render() {
    return html`<div class="spinner ${this.size}"></div>`;
  }
}
