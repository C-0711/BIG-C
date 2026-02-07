import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';
import { configService, toastService, api, type Config } from '../services/index';

interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  prompt?: string;
  tools?: string[];
  type: 'bundled' | 'workspace';
}

@customElement('skills-page')
export class SkillsPage extends LitElement {
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

    .header-actions {
      display: flex;
      gap: 12px;
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
      border: 1px solid var(--border-color, #2a2a3a);
      color: var(--text-primary, #fff);
    }

    .btn-secondary:hover {
      background: var(--bg-hover, #252532);
    }

    .btn-primary {
      background: var(--accent-primary, #22c55e);
      border: none;
      color: #000;
    }

    .btn-primary:hover {
      filter: brightness(1.1);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 24px;
      background: var(--bg-secondary, #16161e);
      padding: 4px;
      border-radius: 8px;
      width: fit-content;
    }

    .tab {
      padding: 10px 20px;
      border: none;
      background: transparent;
      color: var(--text-secondary, #888);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--text-primary, #fff);
    }

    .tab.active {
      background: var(--accent-primary, #22c55e);
      color: #000;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
    }

    .skill-card {
      background: var(--bg-secondary, #16161e);
      border: 1px solid var(--border-color, #2a2a3a);
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.2s;
    }

    .skill-card:hover {
      border-color: var(--accent-primary, #22c55e);
    }

    .skill-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--bg-tertiary, #1e1e28);
      border-bottom: 1px solid var(--border-color, #2a2a3a);
    }

    .skill-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .skill-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--accent-primary, #22c55e);
      border-radius: 6px;
      color: #000;
    }

    .skill-icon svg {
      width: 18px;
      height: 18px;
    }

    .skill-info h3 {
      margin: 0 0 2px 0;
      font-size: 15px;
      font-weight: 600;
    }

    .skill-info .id {
      font-size: 12px;
      color: var(--text-secondary, #888);
      font-family: monospace;
    }

    .skill-card-body {
      padding: 16px 20px;
    }

    .skill-desc {
      font-size: 13px;
      color: var(--text-secondary, #888);
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .skill-prompt-preview {
      background: var(--bg-tertiary, #1e1e28);
      border: 1px solid var(--border-color, #2a2a3a);
      border-radius: 6px;
      padding: 12px;
      font-size: 12px;
      color: var(--text-muted, #6b7280);
      font-family: monospace;
      max-height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre-wrap;
      margin-bottom: 12px;
    }

    .skill-prompt-preview.empty {
      font-style: italic;
      font-family: inherit;
    }

    .skill-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tag {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
      background: var(--bg-tertiary, #1e1e28);
      color: var(--text-secondary, #888);
    }

    .tag.bundled {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .tag.workspace {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .empty-state {
      background: var(--bg-secondary, #16161e);
      border: 1px solid var(--border-color, #2a2a3a);
      border-radius: 8px;
      padding: 60px 40px;
      text-align: center;
    }

    .empty-state .icon {
      margin-bottom: 16px;
      color: var(--text-muted, #6b7280);
    }

    .empty-state .icon svg {
      width: 48px;
      height: 48px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
    }

    .empty-state p {
      margin: 0 0 20px 0;
      color: var(--text-secondary, #888);
    }

    /* Modal */
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
      width: 650px;
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

    .form-group textarea.skill-prompt {
      min-height: 200px;
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

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #2a2a3a);
      background: var(--bg-tertiary, #1e1e28);
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
  @state() private activeTab: 'bundled' | 'workspace' = 'bundled';
  @state() private bundledSkills: SkillDefinition[] = [];
  @state() private workspaceSkills: SkillDefinition[] = [];
  @state() private showModal = false;
  @state() private editingSkill: SkillDefinition | null = null;
  @state() private saving = false;

  // Form state
  @state() private formId = '';
  @state() private formName = '';
  @state() private formDescription = '';
  @state() private formPrompt = '';
  @state() private formTools = '';

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      if (config) {
        this.config = config;
        this.loadSkills(config);
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private loadSkills(config: Config) {
    const bundledIds = config.skills?.bundled || [];
    const skillDefinitions = (config.skills as any)?.definitions || {};
    
    this.bundledSkills = bundledIds.map(id => {
      const def = skillDefinitions[id] || {};
      return {
        id,
        name: def.name || this.formatSkillName(id),
        description: def.description || this.getDefaultDescription(id),
        prompt: def.prompt || '',
        tools: def.tools || [],
        type: 'bundled' as const,
      };
    });

    // Load workspace skills
    const workspaceDefs = (config.skills as any)?.workspace_definitions || {};
    this.workspaceSkills = Object.entries(workspaceDefs).map(([id, def]: [string, any]) => ({
      id,
      name: def.name || this.formatSkillName(id),
      description: def.description || '',
      prompt: def.prompt || '',
      tools: def.tools || [],
      type: 'workspace' as const,
    }));
  }

  private formatSkillName(id: string): string {
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getDefaultDescription(id: string): string {
    const descriptions: Record<string, string> = {
      'search': 'Search products by name, SKU, or attributes',
      'describe': 'Generate detailed product descriptions',
      'compare': 'Compare multiple products side by side',
      'quality-audit': 'Audit product data for completeness and accuracy',
      'gap-analysis': 'Identify missing data fields and attributes',
      'product-description': 'Write compelling product descriptions',
      'seo-optimization': 'Optimize content for search engines',
      'multilingual': 'Translate content to multiple languages',
      'feed-generation': 'Generate marketplace feeds (Amazon, eBay)',
      'channel-mapping': 'Map products to channel-specific formats',
      'etim-eclass': 'Classify products using ETIM/ECLASS standards',
      'auto-categorize': 'Automatically categorize products',
      'report-generation': 'Generate analytics and status reports',
    };
    return descriptions[id] || `Skill for ${this.formatSkillName(id).toLowerCase()} operations.`;
  }

  private openEditModal(skill: SkillDefinition) {
    this.editingSkill = skill;
    this.formId = skill.id;
    this.formName = skill.name;
    this.formDescription = skill.description;
    this.formPrompt = skill.prompt || '';
    this.formTools = (skill.tools || []).join(', ');
    this.showModal = true;
  }

  private openNewModal() {
    this.editingSkill = null;
    this.formId = '';
    this.formName = '';
    this.formDescription = '';
    this.formPrompt = '';
    this.formTools = '';
    this.showModal = true;
  }

  private closeModal() {
    this.showModal = false;
    this.editingSkill = null;
  }

  private async handleSaveSkill() {
    if (!this.formId || !this.formName) {
      toastService.error('ID and Name are required');
      return;
    }

    this.saving = true;

    const skillData = {
      id: this.formId,
      name: this.formName,
      description: this.formDescription,
      prompt: this.formPrompt,
      tools: this.formTools.split(',').map(s => s.trim()).filter(s => s),
    };

    // Save skill definition
    const response = await api.put(`/skills/${this.formId}`, skillData);

    if (response.ok) {
      toastService.success('Skill saved');
      await configService.load();
      this.closeModal();
    } else {
      toastService.error(response.error?.message || 'Failed to save skill');
    }

    this.saving = false;
  }

  render() {
    return html`
      <div class="header">
        <div class="header-left">
          <h1>Skills</h1>
          <p>Agent capabilities and tool definitions</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click=${() => configService.load()}>
            ${unsafeHTML(icons.refreshCw)} Refresh
          </button>
          <button class="btn-primary" @click=${this.openNewModal}>
            + New Skill
          </button>
        </div>
      </div>

      <div class="tabs">
        <button 
          class="tab ${this.activeTab === 'bundled' ? 'active' : ''}"
          @click=${() => this.activeTab = 'bundled'}
        >
          Bundled (${this.bundledSkills.length})
        </button>
        <button 
          class="tab ${this.activeTab === 'workspace' ? 'active' : ''}"
          @click=${() => this.activeTab = 'workspace'}
        >
          Workspace (${this.workspaceSkills.length})
        </button>
      </div>

      ${this.activeTab === 'bundled' ? this.renderSkills(this.bundledSkills) : this.renderSkills(this.workspaceSkills)}
      
      ${this.showModal ? this.renderModal() : ''}
    `;
  }

  private renderSkills(skills: SkillDefinition[]) {
    if (skills.length === 0) {
      return html`
        <div class="empty-state">
          <div class="icon">${unsafeHTML(icons.sparkles)}</div>
          <h3>No ${this.activeTab === 'bundled' ? 'Bundled' : 'Workspace'} Skills</h3>
          <p>${this.activeTab === 'workspace' 
            ? 'Create custom skills to extend agent capabilities.' 
            : 'No bundled skills configured.'}</p>
          ${this.activeTab === 'workspace' ? html`
            <button class="btn-primary" @click=${this.openNewModal}>
              + Create Skill
            </button>
          ` : ''}
        </div>
      `;
    }

    return html`
      <div class="skills-grid">
        ${skills.map(skill => html`
          <div class="skill-card">
            <div class="skill-card-header">
              <div class="skill-title">
                <span class="skill-icon">${unsafeHTML(icons.sparkles)}</span>
                <div class="skill-info">
                  <h3>${skill.name}</h3>
                  <span class="id">${skill.id}</span>
                </div>
              </div>
              <button class="btn-secondary btn-sm" @click=${() => this.openEditModal(skill)}>
                ✏️ Edit
              </button>
            </div>
            <div class="skill-card-body">
              <p class="skill-desc">${skill.description}</p>
              <div class="skill-prompt-preview ${!skill.prompt ? 'empty' : ''}">
                ${skill.prompt 
                  ? skill.prompt.substring(0, 150) + (skill.prompt.length > 150 ? '...' : '')
                  : 'No prompt defined. Click Edit to add instructions.'}
              </div>
              <div class="skill-tags">
                <span class="tag ${skill.type}">${skill.type.toUpperCase()}</span>
                ${(skill.tools || []).slice(0, 3).map(tool => html`<span class="tag">${tool}</span>`)}
                ${(skill.tools || []).length > 3 ? html`<span class="tag">+${(skill.tools || []).length - 3} more</span>` : ''}
              </div>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private renderModal() {
    const isNew = !this.editingSkill;
    
    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>${isNew ? 'New Skill' : `Edit: ${this.editingSkill?.name}`}</h3>
            <button class="modal-close" @click=${this.closeModal}>×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Skill ID *</label>
              <input 
                type="text" 
                .value=${this.formId}
                @input=${(e: Event) => this.formId = (e.target as HTMLInputElement).value}
                ?disabled=${!isNew}
                placeholder="my-custom-skill"
              />
              <div class="hint">Unique identifier, lowercase with hyphens</div>
            </div>
            
            <div class="form-group">
              <label>Display Name *</label>
              <input 
                type="text" 
                .value=${this.formName}
                @input=${(e: Event) => this.formName = (e.target as HTMLInputElement).value}
                placeholder="My Custom Skill"
              />
            </div>
            
            <div class="form-group">
              <label>Description</label>
              <textarea 
                rows="2"
                .value=${this.formDescription}
                @input=${(e: Event) => this.formDescription = (e.target as HTMLTextAreaElement).value}
                placeholder="Brief description of what this skill does"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Skill Prompt / Instructions</label>
              <textarea 
                class="skill-prompt"
                .value=${this.formPrompt}
                @input=${(e: Event) => this.formPrompt = (e.target as HTMLTextAreaElement).value}
                placeholder="Define how this skill should work...

Example:
When this skill is activated, you should:
1. Analyze the input data
2. Apply the following rules...
3. Return the result in this format..."
              ></textarea>
              <div class="hint">Detailed instructions for how the agent should execute this skill</div>
            </div>
            
            <div class="form-group">
              <label>Tools (comma-separated)</label>
              <input 
                type="text" 
                .value=${this.formTools}
                @input=${(e: Event) => this.formTools = (e.target as HTMLInputElement).value}
                placeholder="web-search, file-read, api-call"
              />
              <div class="hint">External tools this skill can use</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click=${this.closeModal}>Cancel</button>
            <button class="btn-primary" @click=${this.handleSaveSkill} ?disabled=${this.saving}>
              ${this.saving ? html`<span class="spinner"></span>` : ''}
              ${isNew ? 'Create Skill' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
