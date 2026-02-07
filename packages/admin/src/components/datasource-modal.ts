import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './modal';
import './form-elements';

@customElement('datasource-modal')
export class DataSourceModal extends LitElement {
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
      background: var(--accent-primary)10;
    }
    
    .type-icon {
      font-size: 24px;
    }
    
    .type-label {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .type-option.selected .type-label {
      color: var(--accent-primary);
    }
    
    .divider {
      height: 1px;
      background: var(--border-color);
      margin: 20px 0;
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: Object }) dataSource: any = null; // null = add, object = edit

  @state() formData: any = {
    id: '',
    type: 'postgres',
    connectionString: '',
    path: '',
    endpoint: '',
    command: '',
    args: [],
  };

  private types = [
    { id: 'postgres', icon: '🐘', label: 'PostgreSQL' },
    { id: 'csv', icon: '📄', label: 'CSV' },
    { id: 'rest-api', icon: '🌐', label: 'REST API' },
    { id: 'mcp', icon: '🔌', label: 'MCP' },
    { id: 'excel', icon: '📊', label: 'Excel' },
    { id: 'mysql', icon: '🐬', label: 'MySQL' },
  ];

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('dataSource') && this.dataSource) {
      this.formData = { ...this.dataSource };
    } else if (changedProps.has('open') && this.open && !this.dataSource) {
      this.formData = { id: '', type: 'postgres', connectionString: '', path: '', endpoint: '', command: '', args: [] };
    }
  }

  private close() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  private save() {
    this.dispatchEvent(new CustomEvent('save', { detail: this.formData }));
  }

  private renderTypeFields() {
    switch (this.formData.type) {
      case 'postgres':
      case 'mysql':
        return html`
          <form-input
            label="Connection String"
            .value=${this.formData.connectionString || ''}
            placeholder="postgresql://user:pass@host:5432/db"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, connectionString: e.detail }}
          ></form-input>
        `;
      case 'csv':
      case 'excel':
        return html`
          <form-input
            label="File Path"
            .value=${this.formData.path || ''}
            placeholder="/path/to/file.csv"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, path: e.detail }}
          ></form-input>
        `;
      case 'rest-api':
        return html`
          <form-input
            label="Endpoint URL"
            .value=${this.formData.endpoint || ''}
            placeholder="https://api.example.com/data"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, endpoint: e.detail }}
          ></form-input>
          <form-input
            label="Auth Header (optional)"
            .value=${this.formData.authHeader || ''}
            placeholder="Bearer token..."
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, authHeader: e.detail }}
          ></form-input>
        `;
      case 'mcp':
        return html`
          <form-input
            label="Command"
            .value=${this.formData.command || ''}
            placeholder="npx -y @modelcontextprotocol/server-postgres"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, command: e.detail }}
          ></form-input>
          <form-input
            label="Arguments (comma separated)"
            .value=${(this.formData.args || []).join(', ')}
            placeholder="--db, mydb, --host, localhost"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, args: e.detail.split(',').map((s: string) => s.trim()) }}
          ></form-input>
        `;
      default:
        return html``;
    }
  }

  render() {
    const isEdit = !!this.dataSource;
    const title = isEdit ? `Edit: ${this.dataSource?.id}` : 'Add Data Source';

    return html`
      <admin-modal ?open=${this.open} title=${title} @close=${this.close}>
        ${!isEdit ? html`
          <form-input
            label="ID"
            .value=${this.formData.id || ''}
            placeholder="my-datasource"
            hint="Unique identifier (lowercase, no spaces)"
            @change=${(e: CustomEvent) => this.formData = { ...this.formData, id: e.detail }}
          ></form-input>
        ` : ''}

        <div class="section-label" style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
          Type
        </div>
        <div class="type-selector">
          ${this.types.map(t => html`
            <div 
              class="type-option ${this.formData.type === t.id ? 'selected' : ''}"
              @click=${() => this.formData = { ...this.formData, type: t.id }}
            >
              <span class="type-icon">${t.icon}</span>
              <span class="type-label">${t.label}</span>
            </div>
          `)}
        </div>

        <div class="divider"></div>

        ${this.renderTypeFields()}

        <form-input
          label="Sync Schedule (optional)"
          .value=${this.formData.sync?.schedule || ''}
          placeholder="0 */6 * * * (every 6 hours)"
          hint="Cron expression for auto-sync"
          @change=${(e: CustomEvent) => this.formData = { 
            ...this.formData, 
            sync: { ...this.formData.sync, schedule: e.detail } 
          }}
        ></form-input>

        <div slot="footer">
          <form-button variant="secondary" @click=${this.close}>Cancel</form-button>
          <form-button variant="primary" @click=${this.save}>
            ${isEdit ? 'Save Changes' : 'Add Data Source'}
          </form-button>
        </div>
      </admin-modal>
    `;
  }
}
