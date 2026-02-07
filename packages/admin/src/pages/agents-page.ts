import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('agents-page')
export class AgentsPage extends LitElement {
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
    
    .refresh-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .refresh-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    .master-detail {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      min-height: 600px;
    }
    
    /* Master (Agent List) */
    .master {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .master-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .master-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px;
    }
    
    .master-count {
      font-size: 12px;
      color: var(--text-muted);
    }
    
    .agent-list {
      padding: 8px;
    }
    
    .agent-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      border: 2px solid transparent;
      margin-bottom: 4px;
    }
    
    .agent-card:hover {
      background: var(--bg-hover);
    }
    
    .agent-card.selected {
      border-color: var(--accent-primary);
      background: var(--bg-tertiary);
    }
    
    .agent-emoji {
      font-size: 24px;
    }
    
    .agent-info {
      flex: 1;
      min-width: 0;
    }
    
    .agent-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .agent-badge {
      font-size: 10px;
      color: var(--text-muted);
      background: var(--bg-primary);
      padding: 2px 6px;
      border-radius: 3px;
    }
    
    .agent-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-primary);
    }
    
    .agent-status.disabled {
      background: var(--text-muted);
    }
    
    .add-agent-btn {
      width: 100%;
      padding: 12px;
      margin-top: 8px;
      background: none;
      border: 1px dashed var(--border-color);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 13px;
    }
    
    .add-agent-btn:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
    
    /* Detail */
    .detail {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .detail-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .detail-title {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .detail-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
    
    .detail-id {
      font-size: 12px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    
    .detail-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
    }
    
    .tabs {
      display: flex;
      gap: 4px;
      padding: 0 20px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
      overflow-x: auto;
    }
    
    .tab {
      padding: 12px 16px;
      font-size: 12px;
      color: var(--text-secondary);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      white-space: nowrap;
    }
    
    .tab:hover {
      color: var(--text-primary);
    }
    
    .tab.active {
      color: var(--accent-primary);
      border-bottom-color: var(--accent-primary);
    }
    
    .detail-content {
      padding: 20px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .info-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 16px;
    }
    
    .info-card-title {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
    }
    
    .info-label {
      color: var(--text-secondary);
    }
    
    .info-value {
      color: var(--text-primary);
    }
    
    .info-value.enabled {
      color: var(--accent-primary);
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    
    .tag {
      font-size: 11px;
      padding: 4px 8px;
      background: var(--bg-secondary);
      border-radius: 4px;
      color: var(--text-secondary);
    }
    
    .cron-jobs {
      margin-top: 24px;
    }
    
    .cron-jobs-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }
    
    .cron-job {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      margin-bottom: 8px;
    }
    
    .cron-job-info {
      flex: 1;
    }
    
    .cron-job-name {
      font-size: 13px;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    
    .cron-job-schedule {
      font-size: 11px;
      color: var(--text-muted);
    }
    
    .cron-job-status {
      font-size: 11px;
      color: var(--accent-primary);
      margin-right: 12px;
    }
    
    .run-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .run-btn:hover {
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
  @state() selectedAgentId: string | null = null;
  @state() activeTab = 'overview';

  private get agents(): any[] {
    return this.config?.agents?.list || [];
  }

  private get selectedAgent(): any | null {
    if (!this.selectedAgentId && this.agents.length > 0) {
      this.selectedAgentId = this.agents[0].id;
    }
    return this.agents.find(a => a.id === this.selectedAgentId) || null;
  }

  private get workflows(): any[] {
    return this.config?.workflows?.list || [];
  }

  private getAgentWorkflows(agentId: string): any[] {
    return this.workflows.filter(w => 
      w.steps?.some((s: any) => s.agent === agentId)
    );
  }

  render() {
    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Agents</h1>
          <p class="page-subtitle">Manage agent workspaces, tools, and identities.</p>
        </div>
        <button class="refresh-btn">⟳ Refresh</button>
      </div>
      
      <div class="master-detail">
        ${this.renderMaster()}
        ${this.renderDetail()}
      </div>
    `;
  }

  private renderMaster() {
    return html`
      <div class="master">
        <div class="master-header">
          <h2 class="master-title">Agents</h2>
          <div class="master-count">${this.agents.length} configured.</div>
        </div>
        <div class="agent-list">
          ${this.agents.map(agent => html`
            <div 
              class="agent-card ${this.selectedAgentId === agent.id ? 'selected' : ''}"
              @click=${() => this.selectedAgentId = agent.id}
            >
              <span class="agent-emoji">${agent.identity?.emoji || '🤖'}</span>
              <div class="agent-info">
                <div class="agent-name">${agent.id}</div>
                <span class="agent-badge">DEFAULT</span>
              </div>
              <div class="agent-status ${agent.enabled === false ? 'disabled' : ''}"></div>
            </div>
          `)}
          <button class="add-agent-btn">+ Neuer Agent</button>
        </div>
      </div>
    `;
  }

  private renderDetail() {
    const agent = this.selectedAgent;
    
    if (!agent) {
      return html`
        <div class="detail">
          <div class="empty-state">
            <p>Kein Agent ausgewählt</p>
          </div>
        </div>
      `;
    }

    const agentWorkflows = this.getAgentWorkflows(agent.id);

    return html`
      <div class="detail">
        <div class="detail-header">
          <div class="detail-title">
            <div>
              <h2 class="detail-name">${agent.identity?.name || agent.id}</h2>
              <div class="detail-id">${agent.id}</div>
            </div>
            <span class="agent-badge">DEFAULT</span>
          </div>
          <p class="detail-desc">Agent workspace and routing.</p>
        </div>
        
        <div class="tabs">
          ${['Overview', 'Files', 'Tools', 'Skills', 'Channels', 'Cron Jobs', 'Datenquellen', 'Workflows', 'Ausgaben'].map(tab => html`
            <div 
              class="tab ${this.activeTab === tab.toLowerCase() ? 'active' : ''}"
              @click=${() => this.activeTab = tab.toLowerCase()}
            >
              ${tab}
            </div>
          `)}
        </div>
        
        <div class="detail-content">
          ${this.activeTab === 'overview' ? this.renderOverviewTab(agent, agentWorkflows) : html`
            <div class="empty-state">
              <p>${this.activeTab} — Coming Soon</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  private renderOverviewTab(agent: any, agentWorkflows: any[]) {
    return html`
      <div class="info-grid">
        <div class="info-card">
          <div class="info-card-title">Agent Context</div>
          <div class="info-row">
            <span class="info-label">Workspace</span>
            <span class="info-value">~/.0711/workspace/agents/${agent.id}/</span>
          </div>
          <div class="info-row">
            <span class="info-label">Primary Model</span>
            <span class="info-value">${agent.model || this.config?.agents?.defaults?.model?.primary || '—'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Identity Name</span>
            <span class="info-value">${agent.identity?.name || '—'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Skills</span>
          </div>
          <div class="tags">
            ${(agent.skills || []).map((s: string) => html`<span class="tag">${s}</span>`)}
          </div>
          <div class="info-row">
            <span class="info-label">Datenquellen</span>
          </div>
          <div class="tags">
            ${(agent.dataSources || []).map((d: string) => html`<span class="tag">${d}</span>`)}
          </div>
          <div class="info-row">
            <span class="info-label">Default</span>
            <span class="info-value">yes</span>
          </div>
          <div class="info-row">
            <span class="info-label">Enabled</span>
            <span class="info-value enabled">✅ ${agent.enabled !== false ? 'yes' : 'no'}</span>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-title">
            Scheduler
            <button class="refresh-btn" style="padding: 4px 8px; font-size: 11px;">⟳ Refresh</button>
          </div>
          <div class="info-row">
            <span class="info-label">ENABLED</span>
            <span class="info-value">Yes</span>
          </div>
          <div class="info-row">
            <span class="info-label">JOBS</span>
            <span class="info-value">${agentWorkflows.length}</span>
          </div>
          <div class="info-row">
            <span class="info-label">NEXT WAKE</span>
            <span class="info-value">08:00</span>
          </div>
        </div>
      </div>
      
      <div class="cron-jobs">
        <h3 class="cron-jobs-title">Agent Cron Jobs</h3>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
          Scheduled jobs targeting this agent.
        </p>
        ${agentWorkflows.length === 0 ? html`
          <div class="empty-state" style="padding: 24px;">
            <p>No workflows use this agent.</p>
          </div>
        ` : agentWorkflows.map(w => html`
          <div class="cron-job">
            <div class="cron-job-info">
              <div class="cron-job-name">${w.name || w.id}</div>
              <div class="cron-job-schedule">
                ${w.trigger?.schedule || w.trigger?.event || 'Manual'}
              </div>
            </div>
            <span class="cron-job-status">✅ Enabled</span>
            <button class="run-btn">Run</button>
          </div>
        `)}
      </div>
    `;
  }
}
