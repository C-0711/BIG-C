import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './modal';
import './form-elements';

@customElement('output-modal')
export class OutputModal extends LitElement {
  static styles = css`
    :host { display: block; }
    
    .type-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .type-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: var(--bg-tertiary);
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
    }
    
    .type-option:hover {
      border-color: var(--border-color);
    }
    
    .type-option.selected {
      border-color: var(--accent-primary);
    }
    
    .type-icon { font-size: 24px; }
    .type-label { font-size: 12px; color: var(--text-secondary); }
    
    .divider {
      height: 1px;
      background: var(--border-color);
      margin: 20px 0;
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: Object }) output: any = null;

  @state() formData: any = { id: '', type: 'slack', webhookUrl: '', botToken: '', chatId: '', endpoint: '' };

  private types = [
    { id: 'slack', icon: '💬', label: 'Slack' },
    { id: 'telegram', icon: '✈️', label: 'Telegram' },
    { id: 'webhook', icon: '🔗', label: 'Webhook' },
    { id: 'email', icon: '✉️', label: 'Email' },
    { id: 'api', icon: '🚀', label: 'API' },
    { id: 'ftp', icon: '📁', label: 'FTP' },
  ];

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('output') && this.output) {
      this.formData = { ...this.output };
    } else if (changedProps.has('open') && this.open && !this.output) {
      this.formData = { id: '', type: 'slack', webhookUrl: '', botToken: '', chatId: '', endpoint: '' };
    }
  }

  private close() { this.dispatchEvent(new CustomEvent('close')); }
  private save() { this.dispatchEvent(new CustomEvent('save', { detail: this.formData })); }

  private renderTypeFields() {
    switch (this.formData.type) {
      case 'slack':
        return html`
          <form-input label="Webhook URL" .value=${this.formData.webhookUrl || ''} 
            placeholder="https://hooks.slack.com/services/..." 
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, webhookUrl: e.detail }}
          ></form-input>
        `;
      case 'telegram':
        return html`
          <form-input label="Bot Token" .value=${this.formData.botToken || ''} 
            placeholder="123456789:ABC..."
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, botToken: e.detail }}
          ></form-input>
          <form-input label="Chat ID" .value=${this.formData.chatId || ''} 
            placeholder="-100123456789"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, chatId: e.detail }}
          ></form-input>
        `;
      case 'webhook':
      case 'api':
        return html`
          <form-input label="Endpoint URL" .value=${this.formData.endpoint || ''} 
            placeholder="https://api.example.com/webhook"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, endpoint: e.detail }}
          ></form-input>
        `;
      case 'email':
        return html`
          <form-input label="SMTP Host" .value=${this.formData.smtpHost || ''} 
            placeholder="smtp.gmail.com"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, smtpHost: e.detail }}
          ></form-input>
          <form-input label="From Address" .value=${this.formData.fromEmail || ''} 
            placeholder="noreply@company.com"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, fromEmail: e.detail }}
          ></form-input>
        `;
      case 'ftp':
        return html`
          <form-input label="FTP Host" .value=${this.formData.ftpHost || ''} 
            placeholder="ftp.example.com"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, ftpHost: e.detail }}
          ></form-input>
          <form-input label="Path" .value=${this.formData.ftpPath || ''} 
            placeholder="/uploads/"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, ftpPath: e.detail }}
          ></form-input>
        `;
      default:
        return html``;
    }
  }

  render() {
    const isEdit = !!this.output;
    return html`
      <admin-modal ?open=${this.open} title=${isEdit ? `Edit: ${this.output?.id}` : 'Add Output'} @close=${this.close}>
        ${!isEdit ? html`
          <form-input label="ID" .value=${this.formData.id || ''} placeholder="my-output"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, id: e.detail }}
          ></form-input>
        ` : ''}

        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">Type</div>
        <div class="type-selector">
          ${this.types.map(t => html`
            <div class="type-option ${this.formData.type === t.id ? 'selected' : ''}"
              @click=${() => this.formData = { ...this.formData, type: t.id }}>
              <span class="type-icon">${t.icon}</span>
              <span class="type-label">${t.label}</span>
            </div>
          `)}
        </div>
        <div class="divider"></div>
        ${this.renderTypeFields()}

        <div slot="footer">
          <form-button variant="secondary" @click=${this.close}>Cancel</form-button>
          <form-button variant="primary" @click=${this.save}>${isEdit ? 'Save' : 'Add Output'}</form-button>
        </div>
      </admin-modal>
    `;
  }
}
