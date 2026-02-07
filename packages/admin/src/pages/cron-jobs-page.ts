import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('cron-jobs-page')
export class CronJobsPage extends LitElement {
  static styles = css`
    :host { display: block; }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px;
    }
    
    .page-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
    }
    
    .add-btn {
      background: var(--accent-primary);
      border: none;
      color: #000;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    
    .jobs-table {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 150px;
      padding: 12px 20px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 150px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-subtle);
      align-items: center;
    }
    
    .table-row:last-child { border-bottom: none; }
    
    .table-row:hover { background: var(--bg-hover); }
    
    .job-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .job-id {
      font-size: 11px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    
    .job-schedule {
      font-size: 12px;
      color: var(--text-secondary);
      font-family: var(--font-mono);
    }
    
    .job-agent {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 12px;
      background: var(--bg-primary);
    }
    
    .status-badge.enabled {
      color: var(--accent-primary);
    }
    
    .status-badge.disabled {
      color: var(--text-muted);
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .action-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
    }
    
    .action-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    .action-btn.run {
      background: var(--accent-primary);
      color: #000;
      border-color: var(--accent-primary);
    }
    
    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--text-muted);
    }
  `;

  @property({ type: Object }) config: any = null;

  private getScheduleDisplay(trigger: any): string {
    if (trigger?.schedule) return trigger.schedule;
    if (trigger?.event) return `on: ${trigger.event}`;
    return 'Manual';
  }

  private getAgentsFromSteps(steps: any[]): string[] {
    if (!steps) return [];
    return [...new Set(steps.map((s: any) => s.agent).filter(Boolean))];
  }

  render() {
    const workflows = this.config?.workflows?.list || [];

    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Cron Jobs</h1>
          <p class="page-subtitle">Scheduled workflows and automation tasks</p>
        </div>
        <button class="add-btn">+ New Job</button>
      </div>
      
      ${workflows.length === 0 ? html`
        <div class="jobs-table">
          <div class="empty-state">
            <p>No workflows configured</p>
          </div>
        </div>
      ` : html`
        <div class="jobs-table">
          <div class="table-header">
            <span>Workflow</span>
            <span>Schedule</span>
            <span>Agent</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          ${workflows.map((w: any) => html`
            <div class="table-row">
              <div>
                <div class="job-name">${w.name || w.id}</div>
                <div class="job-id">${w.id}</div>
              </div>
              <div class="job-schedule">${this.getScheduleDisplay(w.trigger)}</div>
              <div class="job-agent">${this.getAgentsFromSteps(w.steps).join(', ') || '—'}</div>
              <div>
                <span class="status-badge ${w.enabled !== false ? 'enabled' : 'disabled'}">
                  <span class="status-dot"></span>
                  ${w.enabled !== false ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div class="actions">
                <button class="action-btn run">Run</button>
                <button class="action-btn">Edit</button>
              </div>
            </div>
          `)}
        </div>
      `}
    `;
  }
}
