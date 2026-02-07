import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// ─── INPUT FIELD ───────────────────────────────────────────────────────────
@customElement('form-input')
export class FormInput extends LitElement {
  static styles = css`
    :host { display: block; margin-bottom: 16px; }
    
    label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
    
    input, textarea {
      width: 100%;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 13px;
      color: var(--text-primary);
      box-sizing: border-box;
    }
    
    input:focus, textarea:focus {
      outline: none;
      border-color: var(--accent-primary);
    }
    
    .hint {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }
  `;

  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) type = 'text';
  @property({ type: Boolean }) multiline = false;

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.dispatchEvent(new CustomEvent('change', { detail: target.value }));
  }

  render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : ''}
      ${this.multiline ? html`
        <textarea 
          .value=${this.value}
          placeholder=${this.placeholder}
          rows="3"
          @input=${this.handleInput}
        ></textarea>
      ` : html`
        <input 
          type=${this.type}
          .value=${this.value}
          placeholder=${this.placeholder}
          @input=${this.handleInput}
        />
      `}
      ${this.hint ? html`<div class="hint">${this.hint}</div>` : ''}
    `;
  }
}

// ─── SELECT ────────────────────────────────────────────────────────────────
@customElement('form-select')
export class FormSelect extends LitElement {
  static styles = css`
    :host { display: block; margin-bottom: 16px; }
    
    label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
    
    select {
      width: 100%;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 13px;
      color: var(--text-primary);
      cursor: pointer;
    }
    
    select:focus {
      outline: none;
      border-color: var(--accent-primary);
    }
  `;

  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Array }) options: Array<{value: string; label: string}> = [];

  private handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.dispatchEvent(new CustomEvent('change', { detail: target.value }));
  }

  render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : ''}
      <select .value=${this.value} @change=${this.handleChange}>
        ${this.options.map(opt => html`
          <option value=${opt.value} ?selected=${opt.value === this.value}>${opt.label}</option>
        `)}
      </select>
    `;
  }
}

// ─── TOGGLE ────────────────────────────────────────────────────────────────
@customElement('form-toggle')
export class FormToggle extends LitElement {
  static styles = css`
    :host { display: block; margin-bottom: 16px; }
    
    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .toggle-label {
      font-size: 13px;
      color: var(--text-primary);
    }
    
    .toggle-desc {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    
    .toggle {
      width: 44px;
      height: 24px;
      background: var(--bg-tertiary);
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      transition: background 0.2s;
    }
    
    .toggle.active {
      background: var(--accent-primary);
    }
    
    .toggle::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s;
    }
    
    .toggle.active::after {
      transform: translateX(20px);
    }
  `;

  @property({ type: String }) label = '';
  @property({ type: String }) description = '';
  @property({ type: Boolean }) checked = false;

  private handleClick() {
    this.dispatchEvent(new CustomEvent('change', { detail: !this.checked }));
  }

  render() {
    return html`
      <div class="toggle-row">
        <div>
          <div class="toggle-label">${this.label}</div>
          ${this.description ? html`<div class="toggle-desc">${this.description}</div>` : ''}
        </div>
        <div class="toggle ${this.checked ? 'active' : ''}" @click=${this.handleClick}></div>
      </div>
    `;
  }
}

// ─── BUTTON ────────────────────────────────────────────────────────────────
@customElement('form-button')
export class FormButton extends LitElement {
  static styles = css`
    button {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    
    button.primary {
      background: var(--accent-primary);
      border: none;
      color: #000;
    }
    
    button.primary:hover {
      opacity: 0.9;
    }
    
    button.secondary {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }
    
    button.secondary:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    button.danger {
      background: transparent;
      border: 1px solid var(--accent-danger);
      color: var(--accent-danger);
    }
    
    button.danger:hover {
      background: var(--accent-danger);
      color: white;
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  @property({ type: String }) variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @property({ type: Boolean }) disabled = false;

  render() {
    return html`
      <button class=${this.variant} ?disabled=${this.disabled}>
        <slot></slot>
      </button>
    `;
  }
}
