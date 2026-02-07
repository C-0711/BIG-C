import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService, toastService, modalService, api, type Config, type Agent } from '../services/index.js';

@customElement('agents-page')
export class AgentsPage extends LitElement {
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

    .btn-primary:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .btn-danger {
      background: #ef4444;
      border: none;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .content {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
    }

    .sidebar {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .sidebar-header h2 {
      margin: 0 0 4px 0;
      font-size: 16px;
    }

    .sidebar-header span {
      font-size: 12px;
      color: var(--text-secondary, #888);
    }

    .agent-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .agent-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .agent-item:hover {
      background: var(--bg-tertiary, #2a2a3a);
    }

    .agent-item.active {
      background: var(--accent-color, #3b82f6);
    }

    .agent-item .emoji {
      font-size: 20px;
    }

    .agent-item .info {
      flex: 1;
      min-width: 0;
    }

    .agent-item .name {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .agent-item .badge {
      font-size: 10px;
      padding: 2px 6px;
      background: var(--bg-primary, #121218);
      border-radius: 4px;
      color: var(--text-secondary, #888);
    }

    .agent-item.active .badge {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    .add-agent-btn {
      width: 100%;
      justify-content: center;
      border-radius: 0;
      border: none;
      border-top: 1px solid var(--border-color, #363646);
      padding: 14px;
      background: var(--bg-tertiary, #2a2a3a);
    }

    .detail {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .detail-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .detail-title .emoji {
      font-size: 32px;
    }

    .detail-title h2 {
      margin: 0 0 4px 0;
      font-size: 20px;
    }

    .detail-title .id {
      font-size: 13px;
      color: var(--text-secondary, #888);
      font-family: monospace;
    }

    .detail-actions {
      display: flex;
      gap: 8px;
    }

    .detail-content {
      padding: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .info-label {
      font-size: 12px;
      color: var(--text-secondary, #888);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 14px;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      padding: 4px 10px;
      background: var(--bg-tertiary, #2a2a3a);
      border-radius: 4px;
      font-size: 12px;
    }

    .status-enabled {
      color: #10b981;
    }

    .status-disabled {
      color: #ef4444;
    }

    /* Modal styles */
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
      font-size: 18px;
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-secondary, #888);
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
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

    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-tertiary, #2a2a3a);
      border: 1px solid var(--border-color, #363646);
      border-radius: 6px;
      color: var(--text-primary, #fff);
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none;
      border-color: var(--accent-color, #3b82f6);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 80px;
      gap: 12px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #363646);
    }

    .empty-state {
      text-align: center;
      padding: 60px 40px;
      color: var(--text-secondary, #888);
    }

    .empty-state .icon {
      font-size: 48px;
      margin-bottom: 16px;
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

  @state() private config: Config | null = null;
  @state() private agents: Agent[] = [];
  @state() private selectedAgent: Agent | null = null;
  @state() private showModal = false;
  @state() private editingAgent: Agent | null = null;
  @state() private saving = false;

  // Form state
  @state() private formId = '';
  @state() private formName = '';
  @state() private formEmoji = '🤖';
  @state() private formTheme = '';
  @state() private formSkills = '';
  @state() private formEnabled = true;

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      if (config) {
        this.config = config;
        this.agents = config.agents?.list || [];
        if (!this.selectedAgent && this.agents.length > 0) {
          this.selectedAgent = this.agents[0];
        }
        // Update selected agent if it exists
        if (this.selectedAgent) {
          this.selectedAgent = this.agents.find(a => a.id === this.selectedAgent!.id) || this.agents[0] || null;
        }
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private selectAgent(agent: Agent) {
    this.selectedAgent = agent;
  }

  private openNewModal() {
    this.editingAgent = null;
    this.formId = '';
    this.formName = '';
    this.formEmoji = '🤖';
    this.formTheme = '';
    this.formSkills = '';
    this.formEnabled = true;
    this.showModal = true;
  }

  private openEditModal(agent: Agent) {
    this.editingAgent = agent;
    this.formId = agent.id;
    this.formName = agent.identity.name;
    this.formEmoji = agent.identity.emoji;
    this.formTheme = agent.identity.theme || '';
    this.formSkills = agent.skills.join(', ');
    this.formEnabled = agent.enabled;
    this.showModal = true;
  }

  private closeModal() {
    this.showModal = false;
    this.editingAgent = null;
  }

  private async handleSaveAgent() {
    if (!this.formId || !this.formName) {
      toastService.error('ID and Name are required');
      return;
    }

    this.saving = true;

    const agentData: Agent = {
      id: this.formId,
      identity: {
        name: this.formName,
        emoji: this.formEmoji,
        theme: this.formTheme || undefined,
      },
      enabled: this.formEnabled,
      skills: this.formSkills.split(',').map(s => s.trim()).filter(s => s),
      dataSources: this.editingAgent?.dataSources || [],
      outputs: this.editingAgent?.outputs || [],
    };

    let response;
    if (this.editingAgent) {
      response = await api.put(`/agents/${this.editingAgent.id}`, agentData);
    } else {
      response = await api.post('/agents', agentData);
    }

    if (response.ok) {
      toastService.success(this.editingAgent ? 'Agent updated' : 'Agent created');
      await configService.load();
      this.closeModal();
      this.selectedAgent = agentData;
    } else {
      toastService.error(response.error?.message || 'Failed to save agent');
    }

    this.saving = false;
  }

  private async handleDeleteAgent(agent: Agent) {
    const confirmed = await modalService.confirmDelete(agent.identity.name);
    if (!confirmed) return;

    const response = await api.delete(`/agents/${agent.id}`);
    if (response.ok) {
      toastService.success('Agent deleted');
      await configService.load();
      this.selectedAgent = this.agents[0] || null;
    } else {
      toastService.error(response.error?.message || 'Failed to delete agent');
    }
  }

  private async handleToggleEnabled(agent: Agent) {
    const response = await api.put(`/agents/${agent.id}`, {
      ...agent,
      enabled: !agent.enabled,
    });

    if (response.ok) {
      toastService.success(`Agent ${agent.enabled ? 'disabled' : 'enabled'}`);
      await configService.load();
    } else {
      toastService.error(response.error?.message || 'Failed to update agent');
    }
  }

  render() {
    return html`
      <div class="header">
        <div class="header-left">
          <h1>Agents</h1>
          <p>Manage agent workspaces, tools, and identities.</p>
        </div>
        <button class="btn-secondary" @click=${() => configService.load()}>
          ⟳ Refresh
        </button>
      </div>

      <div class="content">
        <div class="sidebar">
          <div class="sidebar-header">
            <h2>Agents</h2>
            <span>${this.agents.length} configured</span>
          </div>
          <div class="agent-list">
            ${this.agents.map(agent => html`
              <div 
                class="agent-item ${this.selectedAgent?.id === agent.id ? 'active' : ''}"
                @click=${() => this.selectAgent(agent)}
              >
                <span class="emoji">${agent.identity.emoji}</span>
                <div class="info">
                  <div class="name">${agent.id}</div>
                </div>
                <span class="badge">${agent.enabled ? 'ACTIVE' : 'OFF'}</span>
              </div>
            `)}
          </div>
          <button class="btn-primary add-agent-btn" @click=${this.openNewModal}>
            + Neuer Agent
          </button>
        </div>

        <div class="detail">
          ${this.selectedAgent ? this.renderAgentDetail(this.selectedAgent) : this.renderEmptyState()}
        </div>
      </div>

      ${this.showModal ? this.renderModal() : ''}
    `;
  }

  private renderAgentDetail(agent: Agent) {
    return html`
      <div class="detail-header">
        <div class="detail-title">
          <span class="emoji">${agent.identity.emoji}</span>
          <div>
            <h2>${agent.identity.name}</h2>
            <span class="id">${agent.id}</span>
          </div>
        </div>
        <div class="detail-actions">
          <button class="btn-secondary btn-sm" @click=${() => this.handleToggleEnabled(agent)}>
            ${agent.enabled ? '⏸ Disable' : '▶ Enable'}
          </button>
          <button class="btn-secondary btn-sm" @click=${() => this.openEditModal(agent)}>
            ✏️ Edit
          </button>
          <button class="btn-danger btn-sm" @click=${() => this.handleDeleteAgent(agent)}>
            🗑 Delete
          </button>
        </div>
      </div>
      <div class="detail-content">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Status</span>
            <span class="info-value ${agent.enabled ? 'status-enabled' : 'status-disabled'}">
              ${agent.enabled ? '● Enabled' : '○ Disabled'}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Workspace</span>
            <span class="info-value">~/.0711/workspace/agents/${agent.id}/</span>
          </div>
          <div class="info-item">
            <span class="info-label">Primary Model</span>
            <span class="info-value">${this.config?.agents?.defaults?.model?.primary || 'default'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Theme</span>
            <span class="info-value">${agent.identity.theme || '(none)'}</span>
          </div>
        </div>

        <div class="info-item" style="margin-bottom: 20px;">
          <span class="info-label">Skills</span>
          <div class="tags" style="margin-top: 8px;">
            ${agent.skills.length > 0 
              ? agent.skills.map(skill => html`<span class="tag">${skill}</span>`)
              : html`<span style="color: var(--text-secondary)">No skills assigned</span>`
            }
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">Data Sources</span>
          <div class="tags" style="margin-top: 8px;">
            ${agent.dataSources.length > 0 
              ? agent.dataSources.map(ds => html`<span class="tag">${ds}</span>`)
              : html`<span style="color: var(--text-secondary)">No data sources assigned</span>`
            }
          </div>
        </div>
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="icon">🤖</div>
        <h3>No Agent Selected</h3>
        <p>Select an agent from the list or create a new one.</p>
      </div>
    `;
  }

  private renderModal() {
    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>${this.editingAgent ? 'Edit Agent' : 'New Agent'}</h3>
            <button class="modal-close" @click=${this.closeModal}>×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Agent ID *</label>
              <input 
                type="text" 
                .value=${this.formId}
                @input=${(e: Event) => this.formId = (e.target as HTMLInputElement).value}
                ?disabled=${!!this.editingAgent}
                placeholder="product-expert"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Display Name *</label>
                <input 
                  type="text" 
                  .value=${this.formName}
                  @input=${(e: Event) => this.formName = (e.target as HTMLInputElement).value}
                  placeholder="Produkt-Experte"
                />
              </div>
              <div class="form-group">
                <label>Emoji</label>
                <input 
                  type="text" 
                  .value=${this.formEmoji}
                  @input=${(e: Event) => this.formEmoji = (e.target as HTMLInputElement).value}
                  placeholder="🤖"
                />
              </div>
            </div>
            <div class="form-group">
              <label>Theme / Description</label>
              <textarea 
                rows="2"
                .value=${this.formTheme}
                @input=${(e: Event) => this.formTheme = (e.target as HTMLTextAreaElement).value}
                placeholder="What this agent does..."
              ></textarea>
            </div>
            <div class="form-group">
              <label>Skills (comma-separated)</label>
              <input 
                type="text" 
                .value=${this.formSkills}
                @input=${(e: Event) => this.formSkills = (e.target as HTMLInputElement).value}
                placeholder="search, describe, compare"
              />
            </div>
            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  .checked=${this.formEnabled}
                  @change=${(e: Event) => this.formEnabled = (e.target as HTMLInputElement).checked}
                />
                Enabled
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click=${this.closeModal}>Cancel</button>
            <button class="btn-primary" @click=${this.handleSaveAgent} ?disabled=${this.saving}>
              ${this.saving ? html`<span class="spinner"></span>` : ''}
              ${this.editingAgent ? 'Save Changes' : 'Create Agent'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
