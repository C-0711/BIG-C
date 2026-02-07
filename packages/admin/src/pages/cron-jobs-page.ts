import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService, toastService, modalService, api, type Config, type Workflow } from '../services/index.js';

@customElement('cron-jobs-page')
export class CronJobsPage extends LitElement {
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

    .table-container {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      padding: 14px 16px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary, #888);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: var(--bg-tertiary, #2a2a3a);
      border-bottom: 1px solid var(--border-color, #363646);
    }

    td {
      padding: 16px;
      border-bottom: 1px solid var(--border-color, #363646);
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover {
      background: var(--bg-tertiary, #2a2a3a);
    }

    .workflow-name {
      font-weight: 500;
    }

    .workflow-id {
      font-size: 12px;
      color: var(--text-secondary, #888);
      font-family: monospace;
    }

    .schedule {
      font-family: monospace;
      font-size: 13px;
      padding: 4px 8px;
      background: var(--bg-primary, #121218);
      border-radius: 4px;
    }

    .agents {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .agent-tag {
      font-size: 12px;
      padding: 2px 8px;
      background: var(--bg-primary, #121218);
      border-radius: 4px;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .status.enabled {
      color: #10b981;
    }

    .status.disabled {
      color: #ef4444;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .empty-state {
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
      width: 550px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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

    .run-result {
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--bg-primary, #121218);
      border-radius: 4px;
      font-size: 12px;
    }

    .run-result.success {
      border-left: 3px solid #10b981;
    }

    .run-result.error {
      border-left: 3px solid #ef4444;
    }
  `;

  @state() private workflows: Workflow[] = [];
  @state() private showModal = false;
  @state() private editingWorkflow: Workflow | null = null;
  @state() private saving = false;
  @state() private running: string | null = null;
  @state() private runResults: Record<string, { success: boolean; message: string }> = {};

  @state() private formId = '';
  @state() private formName = '';
  @state() private formTriggerType = 'cron';
  @state() private formSchedule = '';
  @state() private formEvent = '';
  @state() private formEnabled = true;

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      if (config) {
        this.workflows = config.workflows?.list || [];
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private getAgents(workflow: Workflow): string[] {
    const agents: string[] = [];
    workflow.steps?.forEach(step => {
      if (step.agent && !agents.includes(step.agent)) {
        agents.push(step.agent);
      }
    });
    return agents;
  }

  private formatSchedule(workflow: Workflow): string {
    if (workflow.trigger.type === 'cron') {
      return workflow.trigger.schedule || '';
    } else if (workflow.trigger.type === 'event') {
      return `on: ${workflow.trigger.event}`;
    }
    return workflow.trigger.type;
  }

  private openNewModal() {
    this.editingWorkflow = null;
    this.formId = '';
    this.formName = '';
    this.formTriggerType = 'cron';
    this.formSchedule = '0 8 * * *';
    this.formEvent = '';
    this.formEnabled = true;
    this.showModal = true;
  }

  private openEditModal(workflow: Workflow) {
    this.editingWorkflow = workflow;
    this.formId = workflow.id;
    this.formName = workflow.name;
    this.formTriggerType = workflow.trigger.type;
    this.formSchedule = workflow.trigger.schedule || '';
    this.formEvent = workflow.trigger.event || '';
    this.formEnabled = workflow.enabled;
    this.showModal = true;
  }

  private closeModal() {
    this.showModal = false;
    this.editingWorkflow = null;
  }

  private async handleSave() {
    if (!this.formId || !this.formName) {
      toastService.error('ID and Name are required');
      return;
    }

    this.saving = true;

    const workflowData: Workflow = {
      id: this.formId,
      name: this.formName,
      trigger: {
        type: this.formTriggerType,
        ...(this.formTriggerType === 'cron' && { schedule: this.formSchedule }),
        ...(this.formTriggerType === 'event' && { event: this.formEvent }),
      },
      steps: this.editingWorkflow?.steps || [],
      enabled: this.formEnabled,
    };

    let response;
    if (this.editingWorkflow) {
      response = await api.put(`/workflows/${this.editingWorkflow.id}`, workflowData);
    } else {
      response = await api.post('/workflows', workflowData);
    }

    if (response.ok) {
      toastService.success(this.editingWorkflow ? 'Workflow updated' : 'Workflow created');
      await configService.load();
      this.closeModal();
    } else {
      toastService.error(response.error?.message || 'Failed to save');
    }

    this.saving = false;
  }

  private async handleDelete(workflow: Workflow) {
    const confirmed = await modalService.confirmDelete(workflow.name);
    if (!confirmed) return;

    const response = await api.delete(`/workflows/${workflow.id}`);
    if (response.ok) {
      toastService.success('Workflow deleted');
      await configService.load();
    } else {
      toastService.error(response.error?.message || 'Failed to delete');
    }
  }

  private async handleRun(workflow: Workflow) {
    this.running = workflow.id;
    delete this.runResults[workflow.id];

    const response = await api.post<{ success: boolean; message: string }>(`/workflows/${workflow.id}/run`);
    
    if (response.ok && response.data) {
      this.runResults = {
        ...this.runResults,
        [workflow.id]: { success: true, message: response.data.message || 'Workflow triggered' }
      };
      toastService.success(`Workflow "${workflow.name}" triggered`);
    } else {
      this.runResults = {
        ...this.runResults,
        [workflow.id]: { success: false, message: response.error?.message || 'Failed to run' }
      };
      toastService.error(response.error?.message || 'Failed to run workflow');
    }
    
    this.running = null;
  }

  private async handleToggle(workflow: Workflow) {
    const response = await api.put(`/workflows/${workflow.id}`, {
      ...workflow,
      enabled: !workflow.enabled,
    });

    if (response.ok) {
      toastService.success(`Workflow ${workflow.enabled ? 'disabled' : 'enabled'}`);
      await configService.load();
    } else {
      toastService.error(response.error?.message || 'Failed to update');
    }
  }

  render() {
    return html`
      <div class="header">
        <div class="header-left">
          <h1>Cron Jobs</h1>
          <p>Scheduled workflows and automation tasks</p>
        </div>
        <button class="btn-primary" @click=${this.openNewModal}>
          + New Job
        </button>
      </div>

      <div class="table-container">
        ${this.workflows.length === 0 ? html`
          <div class="empty-state">
            <div class="icon">⏰</div>
            <h3>No workflows configured</h3>
            <p>Create scheduled jobs to automate tasks.</p>
          </div>
        ` : html`
          <table>
            <thead>
              <tr>
                <th>Workflow</th>
                <th>Schedule</th>
                <th>Agents</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.workflows.map(workflow => html`
                <tr>
                  <td>
                    <div class="workflow-name">${workflow.name}</div>
                    <div class="workflow-id">${workflow.id}</div>
                    ${this.runResults[workflow.id] ? html`
                      <div class="run-result ${this.runResults[workflow.id].success ? 'success' : 'error'}">
                        ${this.runResults[workflow.id].message}
                      </div>
                    ` : ''}
                  </td>
                  <td>
                    <span class="schedule">${this.formatSchedule(workflow)}</span>
                  </td>
                  <td>
                    <div class="agents">
                      ${this.getAgents(workflow).map(agent => html`
                        <span class="agent-tag">${agent}</span>
                      `)}
                    </div>
                  </td>
                  <td>
                    <span class="status ${workflow.enabled ? 'enabled' : 'disabled'}">
                      ${workflow.enabled ? '● Enabled' : '○ Disabled'}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button 
                        class="btn-success btn-sm" 
                        @click=${() => this.handleRun(workflow)}
                        ?disabled=${this.running === workflow.id}
                      >
                        ${this.running === workflow.id ? html`<span class="spinner"></span>` : '▶'} Run
                      </button>
                      <button class="btn-secondary btn-sm" @click=${() => this.openEditModal(workflow)}>
                        Edit
                      </button>
                      <button class="btn-secondary btn-sm" @click=${() => this.handleToggle(workflow)}>
                        ${workflow.enabled ? '⏸' : '▶'}
                      </button>
                      <button class="btn-danger btn-sm" @click=${() => this.handleDelete(workflow)}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        `}
      </div>

      ${this.showModal ? this.renderModal() : ''}
    `;
  }

  private renderModal() {
    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>${this.editingWorkflow ? 'Edit Workflow' : 'New Workflow'}</h3>
            <button class="modal-close" @click=${this.closeModal}>×</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Workflow ID *</label>
                <input 
                  type="text" 
                  .value=${this.formId}
                  @input=${(e: Event) => this.formId = (e.target as HTMLInputElement).value}
                  ?disabled=${!!this.editingWorkflow}
                  placeholder="daily-report"
                />
              </div>
              <div class="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  .value=${this.formName}
                  @input=${(e: Event) => this.formName = (e.target as HTMLInputElement).value}
                  placeholder="Daily Report"
                />
              </div>
            </div>
            <div class="form-group">
              <label>Trigger Type</label>
              <select 
                .value=${this.formTriggerType}
                @change=${(e: Event) => this.formTriggerType = (e.target as HTMLSelectElement).value}
              >
                <option value="cron">Cron Schedule</option>
                <option value="event">Event Trigger</option>
              </select>
            </div>
            ${this.formTriggerType === 'cron' ? html`
              <div class="form-group">
                <label>Cron Schedule</label>
                <input 
                  type="text" 
                  .value=${this.formSchedule}
                  @input=${(e: Event) => this.formSchedule = (e.target as HTMLInputElement).value}
                  placeholder="0 8 * * *"
                />
                <small style="color: var(--text-secondary); font-size: 11px; margin-top: 4px; display: block;">
                  Format: minute hour day month weekday (e.g., "0 8 * * *" = 8:00 AM daily)
                </small>
              </div>
            ` : html`
              <div class="form-group">
                <label>Event Name</label>
                <input 
                  type="text" 
                  .value=${this.formEvent}
                  @input=${(e: Event) => this.formEvent = (e.target as HTMLInputElement).value}
                  placeholder="product-created"
                />
              </div>
            `}
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
            <button class="btn-primary" @click=${this.handleSave} ?disabled=${this.saving}>
              ${this.saving ? html`<span class="spinner"></span>` : ''}
              ${this.editingWorkflow ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
