import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService, toastService, modalService, api, type Config, type Output } from '../services/index.js';

@customElement('outputs-page')
export class OutputsPage extends LitElement {
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

    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border-color, #363646);
      color: var(--text-primary, #fff);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-tertiary, #2a2a3a);
    }

    .btn-primary {
      background: var(--accent-color, #3b82f6);
      border: none;
      color: white;
    }

    .btn-danger {
      background: #ef4444;
      border: none;
      color: white;
    }

    .btn-success {
      background: #10b981;
      border: none;
      color: white;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-title .icon {
      font-size: 24px;
    }

    .card-title h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
    }

    .card-title .type {
      font-size: 12px;
      color: var(--text-secondary, #888);
      font-family: monospace;
    }

    .card-actions {
      display: flex;
      gap: 8px;
    }

    .card-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-label {
      font-size: 11px;
      color: var(--text-secondary, #888);
      text-transform: uppercase;
    }

    .detail-value {
      font-size: 13px;
      font-family: monospace;
      word-break: break-all;
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
      font-size: 18px;
    }

    .empty-state p {
      margin: 0;
      color: var(--text-secondary, #888);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 12px;
      width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .modal-header h3 {
      margin: 0;
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-secondary, #888);
      font-size: 24px;
      cursor: pointer;
      padding: 0;
    }

    .modal-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #888);
    }

    .form-group input, .form-group select {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-tertiary, #2a2a3a);
      border: 1px solid var(--border-color, #363646);
      border-radius: 6px;
      color: var(--text-primary, #fff);
      font-size: 14px;
      box-sizing: border-box;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #363646);
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  @state() private outputs: Record<string, Output> = {};
  @state() private showModal = false;
  @state() private editingId: string | null = null;
  @state() private saving = false;
  @state() private testing: string | null = null;

  @state() private formId = '';
  @state() private formType = 'slack';
  @state() private formWebhookUrl = '';
  @state() private formEndpoint = '';

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      if (config) {
        this.outputs = config.outputs?.providers || {};
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private getIcon(type: string): string {
    switch (type) {
      case 'slack': return '💼';
      case 'telegram': return '✈️';
      case 'email': return icons.mail;
      case 'webhook': return icons.link;
      case 'api': return '🌐';
      default: return icons.upload;
    }
  }

  private openNewModal() {
    this.editingId = null;
    this.formId = '';
    this.formType = 'slack';
    this.formWebhookUrl = '';
    this.formEndpoint = '';
    this.showModal = true;
  }

  private openEditModal(id: string, output: Output) {
    this.editingId = id;
    this.formId = id;
    this.formType = output.type;
    this.formWebhookUrl = output.webhookUrl || '';
    this.formEndpoint = output.endpoint || '';
    this.showModal = true;
  }

  private closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  private async handleSave() {
    if (!this.formId) {
      toastService.error('ID is required');
      return;
    }

    this.saving = true;

    const output: Output = {
      type: this.formType,
      ...(this.formWebhookUrl && { webhookUrl: this.formWebhookUrl }),
      ...(this.formEndpoint && { endpoint: this.formEndpoint }),
    };

    let response;
    if (this.editingId) {
      response = await api.put(`/outputs/${this.editingId}`, output);
    } else {
      response = await api.post('/outputs', { id: this.formId, ...output });
    }

    if (response.ok) {
      toastService.success(this.editingId ? 'Output updated' : 'Output created');
      await configService.load();
      this.closeModal();
    } else {
      toastService.error(response.error?.message || 'Failed to save');
    }

    this.saving = false;
  }

  private async handleDelete(id: string) {
    const confirmed = await modalService.confirmDelete(id);
    if (!confirmed) return;

    const response = await api.delete(`/outputs/${id}`);
    if (response.ok) {
      toastService.success('Output deleted');
      await configService.load();
    } else {
      toastService.error(response.error?.message || 'Failed to delete');
    }
  }

  private async handleTest(id: string) {
    this.testing = id;
    const response = await api.post(`/outputs/${id}/test`);
    
    if (response.ok) {
      toastService.success('Test message sent!');
    } else {
      toastService.error(response.error?.message || 'Test failed');
    }
    
    this.testing = null;
  }

  render() {
    const entries = Object.entries(this.outputs);

    return html`
      <div class="header">
        <div class="header-left">
          <h1>Ausgaben</h1>
          <p>Output Provider für Benachrichtigungen und Feeds</p>
        </div>
        <button class="btn-primary" @click=${this.openNewModal}>
          + Neue Ausgabe
        </button>
      </div>

      ${entries.length === 0 ? html`
        <div class="empty-state">
          <div class="icon">${unsafeHTML(icons.upload)}</div>
          <h3>Keine Ausgaben konfiguriert</h3>
          <p>Füge Slack, Telegram, API oder andere Ausgabekanäle hinzu.</p>
        </div>
      ` : html`
        <div class="list">
          ${entries.map(([id, output]) => html`
            <div class="card">
              <div class="card-header">
                <div class="card-title">
                  <span class="icon">${this.getIcon(output.type)}</span>
                  <div>
                    <h3>${id}</h3>
                    <span class="type">${output.type}</span>
                  </div>
                </div>
                <div class="card-actions">
                  <button 
                    class="btn-success btn-sm" 
                    @click=${() => this.handleTest(id)}
                    ?disabled=${this.testing === id}
                  >
                    ${this.testing === id ? html`<span class="spinner"></span>` : '📤'} Test
                  </button>
                  <button class="btn-secondary btn-sm" @click=${() => this.openEditModal(id, output)}>
                    ✏️ Edit
                  </button>
                  <button class="btn-danger btn-sm" @click=${() => this.handleDelete(id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
              <div class="card-details">
                ${output.webhookUrl ? html`
                  <div class="detail-item">
                    <span class="detail-label">Webhook URL</span>
                    <span class="detail-value">${output.webhookUrl}</span>
                  </div>
                ` : ''}
                ${output.endpoint ? html`
                  <div class="detail-item">
                    <span class="detail-label">Endpoint</span>
                    <span class="detail-value">${output.endpoint}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `)}
        </div>
      `}

      ${this.showModal ? this.renderModal() : ''}
    `;
  }

  private renderModal() {
    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>${this.editingId ? 'Edit Output' : 'New Output'}</h3>
            <button class="modal-close" @click=${this.closeModal}>×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>ID *</label>
              <input 
                type="text" 
                .value=${this.formId}
                @input=${(e: Event) => this.formId = (e.target as HTMLInputElement).value}
                ?disabled=${!!this.editingId}
                placeholder="team-slack"
              />
            </div>
            <div class="form-group">
              <label>Type</label>
              <select 
                .value=${this.formType}
                @change=${(e: Event) => this.formType = (e.target as HTMLSelectElement).value}
              >
                <option value="slack">Slack</option>
                <option value="telegram">Telegram</option>
                <option value="email">Email</option>
                <option value="webhook">Webhook</option>
                <option value="api">REST API</option>
              </select>
            </div>
            ${this.formType === 'slack' || this.formType === 'webhook' ? html`
              <div class="form-group">
                <label>Webhook URL</label>
                <input 
                  type="text" 
                  .value=${this.formWebhookUrl}
                  @input=${(e: Event) => this.formWebhookUrl = (e.target as HTMLInputElement).value}
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
            ` : ''}
            ${this.formType === 'api' || this.formType === 'telegram' ? html`
              <div class="form-group">
                <label>Endpoint / Bot Token</label>
                <input 
                  type="text" 
                  .value=${this.formEndpoint}
                  @input=${(e: Event) => this.formEndpoint = (e.target as HTMLInputElement).value}
                  placeholder="${this.formType === 'telegram' ? 'bot123:ABC...' : 'https://api.example.com'}"
                />
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click=${this.closeModal}>Cancel</button>
            <button class="btn-primary" @click=${this.handleSave} ?disabled=${this.saving}>
              ${this.saving ? html`<span class="spinner"></span>` : ''}
              ${this.editingId ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
