import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';
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
      background: var(--accent-primary, #22c55e);
      border: none;
      color: #000;
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
      background: var(--bg-secondary, #16161e);
      border: 1px solid var(--border-color, #2a2a3a);
      border-radius: 8px;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color, #2a2a3a);
      background: var(--bg-tertiary, #1e1e28);
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
      border-bottom: 1px solid var(--border-color, #2a2a3a);
    }

    .agent-item:hover {
      background: var(--bg-hover, #252532);
    }

    .agent-item.active {
      background: var(--accent-primary, #22c55e);
      color: #000;
    }

    .agent-item .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .agent-item .icon svg {
      width: 20px;
      height: 20px;
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
      background: var(--bg-primary, #0d0d12);
      border-radius: 4px;
      color: var(--text-secondary, #888);
    }

    .agent-item.active .badge {
      background: rgba(0,0,0,0.2);
      color: #000;
    }

    .add-agent-btn {
      width: 100%;
      justify-content: center;
      border-radius: 0;
      border: none;
      border-top: 1px solid var(--border-color, #2a2a3a);
      padding: 14px;
      background: var(--bg-tertiary, #1e1e28);
    }

    .detail {
      background: var(--bg-secondary, #16161e);
      border: 1px solid var(--border-color, #2a2a3a);
      border-radius: 8px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color, #2a2a3a);
      background: var(--bg-tertiary, #1e1e28);
    }

    .detail-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .detail-title .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--accent-primary, #22c55e);
      border-radius: 8px;
      color: #000;
    }

    .detail-title .icon svg {
      width: 24px;
      height: 24px;
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
      background: var(--bg-tertiary, #1e1e28);
      border-radius: 4px;
      font-size: 12px;
    }

    .status-enabled {
      color: #22c55e;
    }

    .status-disabled {
      color: #ef4444;
    }

    /* System Prompt Section */
    .prompt-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color, #2a2a3a);
    }

    .prompt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .prompt-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary, #888);
    }

    .prompt-content {
      background: var(--bg-tertiary, #1e1e28);
      border: 1px solid var(--border-color, #2a2a3a);
      border-radius: 8px;
      padding: 16px;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      font-family: inherit;
      color: var(--text-primary, #fff);
      max-height: 200px;
      overflow-y: auto;
    }

    .prompt-empty {
      color: var(--text-muted, #6b7280);
      font-style: italic;
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: var(--bg-secondary, #16161e);
      border: 1px solid var(--border-color, #2a2a3a);
      border-radius: 12px;
      width: 600px;
      max-height: 85vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color, #2a2a3a);
      background: var(--bg-tertiary, #1e1e28);
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

    .modal-close:hover {
      color: var(--text-primary, #fff);
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
      background: var(--bg-tertiary, #1e1e28);
      border: 1px solid var(--border-color, #2a2a3a);
      border-radius: 6px;
      color: var(--text-primary, #fff);
      font-size: 14px;
      box-sizing: border-box;
      font-family: inherit;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-group textarea.prompt-textarea {
      min-height: 150px;
      font-family: inherit;
      line-height: 1.5;
    }

    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none;
      border-color: var(--accent-primary, #22c55e);
    }

    .form-group .hint {
      margin-top: 6px;
      font-size: 12px;
      color: var(--text-muted, #6b7280);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 80px;
      gap: 12px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .checkbox-label input {
      width: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #2a2a3a);
      background: var(--bg-tertiary, #1e1e28);
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
  @state() private formEmoji = '';
  @state() private formTheme = '';
  @state() private formSystemPrompt = '';
  @state() private formMcpAccess = '{}';
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
    this.formEmoji = '';
    this.formTheme = '';
    this.formSystemPrompt = '';
    this.formMcpAccess = '{}';
    this.formSkills = '';
    this.formEnabled = true;
    this.showModal = true;
  }

  private openEditModal(agent: Agent) {
    this.editingAgent = agent;
    this.formId = agent.id;
    this.formName = agent.identity?.name || '';
    this.formEmoji = agent.identity?.emoji || '';
    this.formTheme = agent.identity?.theme || '';
    this.formSystemPrompt = (agent as any).systemPrompt || '';
    this.formMcpAccess = JSON.stringify((agent as any).mcpAccess || {}, null, 2);
    this.formSkills = (agent.skills || []).join(', ');
    this.formEnabled = agent.enabled !== false;
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

    const agentData: any = {
      id: this.formId,
      identity: {
        name: this.formName,
        emoji: this.formEmoji || undefined,
        theme: this.formTheme || undefined,
      },
      enabled: this.formEnabled,
      skills: this.formSkills.split(',').map(s => s.trim()).filter(s => s),
      dataSources: this.editingAgent?.dataSources || [],
      outputs: this.editingAgent?.outputs || [],
    };

    // Add system prompt if provided
    if (this.formSystemPrompt.trim()) {
      agentData.systemPrompt = this.formSystemPrompt.trim();
    }
    
    if (this.formMcpAccess.trim()) {
      try {
        agentData.mcpAccess = JSON.parse(this.formMcpAccess);
      } catch {}
    }

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
    const confirmed = await modalService.confirmDelete(agent.identity?.name || agent.id);
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
          <p>Manage agent workspaces, prompts, and capabilities.</p>
        </div>
        <button class="btn-secondary" @click=${() => configService.load()}>
          ${unsafeHTML(icons.refreshCw)} Refresh
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
                <span class="icon">${unsafeHTML(icons.bot)}</span>
                <div class="info">
                  <div class="name">${agent.identity?.name || agent.id}</div>
                </div>
                <span class="badge">${agent.enabled !== false ? 'ACTIVE' : 'OFF'}</span>
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
    const systemPrompt = (agent as any).systemPrompt;
    
    return html`
      <div class="detail-header">
        <div class="detail-title">
          <span class="icon">${unsafeHTML(icons.bot)}</span>
          <div>
            <h2>${agent.identity?.name || agent.id}</h2>
            <span class="id">${agent.id}</span>
          </div>
        </div>
        <div class="detail-actions">
          <button class="btn-secondary btn-sm" @click=${() => this.handleToggleEnabled(agent)}>
            ${agent.enabled !== false ? '⏸ Disable' : '▶ Enable'}
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
            <span class="info-value ${agent.enabled !== false ? 'status-enabled' : 'status-disabled'}">
              ${agent.enabled !== false ? '● Enabled' : '○ Disabled'}
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
            <span class="info-value">${agent.identity?.theme || '(none)'}</span>
          </div>
        </div>

        <div class="info-item" style="margin-bottom: 20px;">
          <span class="info-label">Skills</span>
          <div class="tags" style="margin-top: 8px;">
            ${(agent.skills || []).length > 0 
              ? (agent.skills || []).map(skill => html`<span class="tag">${skill}</span>`)
              : html`<span style="color: var(--text-secondary)">No skills assigned</span>`
            }
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">Data Sources</span>
          <div class="tags" style="margin-top: 8px;">
            ${(agent.dataSources || []).length > 0 
              ? (agent.dataSources || []).map(ds => html`<span class="tag">${ds}</span>`)
              : html`<span style="color: var(--text-secondary)">No data sources assigned</span>`
            }
          </div>
        </div>

        <!-- System Prompt Section -->
        <div class="prompt-section">
          <div class="prompt-header">
            <h3>System Prompt</h3>
            <button class="btn-secondary btn-sm" @click=${() => this.openEditModal(agent)}>
              ✏️ Edit Prompt
            </button>
          </div>
          <div class="prompt-content">
            ${systemPrompt 
              ? systemPrompt 
              : html`<span class="prompt-empty">No system prompt defined. Click "Edit Prompt" to add one.</span>`
            }
          </div>
        </div>
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="icon">${unsafeHTML(icons.bot)}</div>
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
              <div class="hint">Unique identifier, lowercase with hyphens</div>
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
              <label>Description / Theme</label>
              <input 
                type="text"
                .value=${this.formTheme}
                @input=${(e: Event) => this.formTheme = (e.target as HTMLInputElement).value}
                placeholder="Brief description of what this agent does"
              />
            </div>
            
            <div class="form-group">
              <label>System Prompt</label>
              <textarea 
                class="prompt-textarea"
                .value=${this.formSystemPrompt}
                @input=${(e: Event) => this.formSystemPrompt = (e.target as HTMLTextAreaElement).value}
                placeholder="You are a helpful assistant that specializes in...

Define the agent's personality, capabilities, and behavior here."
              ></textarea>
              <div class="hint">The system prompt defines the agent's behavior and personality</div>
            </div>
            
            <div class="form-group">
              <label>Skills (comma-separated)</label>
              <input 
                type="text" 
                .value=${this.formSkills}
                @input=${(e: Event) => this.formSkills = (e.target as HTMLInputElement).value}
                placeholder="search, describe, compare"
              />
              <div class="hint">Skills this agent can use</div>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
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
