import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './modal';
import './form-elements';

@customElement('agent-edit-modal')
export class AgentEditModal extends LitElement {
  static styles = css`
    :host { display: block; }
    
    .skills-list, .sources-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    
    .skill-tag, .source-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: var(--bg-tertiary);
      border-radius: 4px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .skill-tag.selected, .source-tag.selected {
      background: var(--accent-primary);
      color: #000;
    }
    
    .skill-tag:hover, .source-tag:hover {
      cursor: pointer;
      opacity: 0.8;
    }
    
    .section-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
      margin-top: 16px;
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: Object }) agent: any = null;
  @property({ type: Object }) config: any = null;

  @state() editedAgent: any = {};

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('agent') && this.agent) {
      this.editedAgent = { ...this.agent };
    }
  }

  private close() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  private save() {
    this.dispatchEvent(new CustomEvent('save', { detail: this.editedAgent }));
  }

  private toggleSkill(skill: string) {
    const skills = this.editedAgent.skills || [];
    if (skills.includes(skill)) {
      this.editedAgent = { ...this.editedAgent, skills: skills.filter((s: string) => s !== skill) };
    } else {
      this.editedAgent = { ...this.editedAgent, skills: [...skills, skill] };
    }
  }

  private toggleDataSource(source: string) {
    const sources = this.editedAgent.dataSources || [];
    if (sources.includes(source)) {
      this.editedAgent = { ...this.editedAgent, dataSources: sources.filter((s: string) => s !== source) };
    } else {
      this.editedAgent = { ...this.editedAgent, dataSources: [...sources, source] };
    }
  }

  render() {
    const allSkills = this.config?.skills?.bundled || [];
    const allSources = Object.keys(this.config?.dataSources?.providers || {});
    const selectedSkills = this.editedAgent.skills || [];
    const selectedSources = this.editedAgent.dataSources || [];

    return html`
      <admin-modal 
        ?open=${this.open} 
        title="Edit Agent: ${this.agent?.id || ''}"
        @close=${this.close}
      >
        <form-input
          label="Name"
          .value=${this.editedAgent.identity?.name || ''}
          placeholder="Agent display name"
          @change=${(e: CustomEvent) => this.editedAgent = { 
            ...this.editedAgent, 
            identity: { ...this.editedAgent.identity, name: e.detail } 
          }}
        ></form-input>

        <form-input
          label="Emoji"
          .value=${this.editedAgent.identity?.emoji || ''}
          placeholder="🤖"
          @change=${(e: CustomEvent) => this.editedAgent = { 
            ...this.editedAgent, 
            identity: { ...this.editedAgent.identity, emoji: e.detail } 
          }}
        ></form-input>

        <form-input
          label="Model Override"
          .value=${this.editedAgent.model || ''}
          placeholder="Leave empty for default"
          hint="e.g., claude-3-opus, gpt-4"
          @change=${(e: CustomEvent) => this.editedAgent = { ...this.editedAgent, model: e.detail }}
        ></form-input>

        <form-toggle
          label="Enabled"
          description="Enable or disable this agent"
          ?checked=${this.editedAgent.enabled !== false}
          @change=${(e: CustomEvent) => this.editedAgent = { ...this.editedAgent, enabled: e.detail }}
        ></form-toggle>

        <div class="section-label">Skills</div>
        <div class="skills-list">
          ${allSkills.map((skill: string) => html`
            <span 
              class="skill-tag ${selectedSkills.includes(skill) ? 'selected' : ''}"
              @click=${() => this.toggleSkill(skill)}
            >
              ${skill}
            </span>
          `)}
        </div>

        <div class="section-label">Data Sources</div>
        <div class="sources-list">
          ${allSources.map((source: string) => html`
            <span 
              class="source-tag ${selectedSources.includes(source) ? 'selected' : ''}"
              @click=${() => this.toggleDataSource(source)}
            >
              ${source}
            </span>
          `)}
        </div>

        <div slot="footer">
          <form-button variant="secondary" @click=${this.close}>Cancel</form-button>
          <form-button variant="primary" @click=${this.save}>Save Changes</form-button>
        </div>
      </admin-modal>
    `;
  }
}
