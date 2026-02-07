import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '../utils/icons.js';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService, toastService, type Config } from '../services/index';

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

    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 24px;
      background: var(--bg-secondary, #1e1e2e);
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
      background: var(--accent-color, #3b82f6);
      color: white;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .skill-card {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      padding: 20px;
    }

    .skill-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .skill-icon {
      font-size: 24px;
    }

    .skill-info h3 {
      margin: 0 0 4px 0;
      font-size: 15px;
      font-weight: 600;
    }

    .skill-info .id {
      font-size: 12px;
      color: var(--text-secondary, #888);
      font-family: monospace;
    }

    .skill-desc {
      font-size: 13px;
      color: var(--text-secondary, #888);
      line-height: 1.5;
      margin-bottom: 12px;
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
      background: var(--bg-tertiary, #2a2a3a);
      color: var(--text-secondary, #888);
    }

    .tag.bundled {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .tag.workspace {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
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
    }

    .empty-state p {
      margin: 0 0 20px 0;
      color: var(--text-secondary, #888);
    }

    button {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--accent-color, #3b82f6);
      border: none;
      color: white;
    }

    .btn-primary:hover {
      filter: brightness(1.1);
    }
  `;

  @state() private config: Config | null = null;
  @state() private activeTab: 'bundled' | 'workspace' = 'bundled';
  @state() private bundledSkills: string[] = [];
  @state() private workspaceSkills: any[] = [];

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      if (config) {
        this.config = config;
        this.bundledSkills = config.skills?.bundled || [];
        // Generate some workspace skills for demo
        this.workspaceSkills = this.generateWorkspaceSkills();
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private generateWorkspaceSkills() {
    // In real implementation, these would come from the workspace directory
    return [];
  }

  private formatSkillName(id: string): string {
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getSkillDescription(id: string): string {
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
    return descriptions[id] || `Enterprise skill for ${this.formatSkillName(id).toLowerCase()} operations.`;
  }

  render() {
    return html`
      <div class="header">
        <div class="header-left">
          <h1>Skills</h1>
          <p>Agent capabilities and tool definitions</p>
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

      ${this.activeTab === 'bundled' ? this.renderBundledSkills() : this.renderWorkspaceSkills()}
    `;
  }

  private renderBundledSkills() {
    return html`
      <div class="skills-grid">
        ${this.bundledSkills.map(skillId => html`
          <div class="skill-card">
            <div class="skill-header">
              <span class="skill-icon">${unsafeHTML(icons.sparkles)}</span>
              <div class="skill-info">
                <h3>${this.formatSkillName(skillId)}</h3>
                <span class="id">${skillId}</span>
              </div>
            </div>
            <p class="skill-desc">${this.getSkillDescription(skillId)}</p>
            <div class="skill-tags">
              <span class="tag bundled">BUNDLED</span>
              <span class="tag">enterprise</span>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private renderWorkspaceSkills() {
    if (this.workspaceSkills.length === 0) {
      return html`
        <div class="empty-state">
          <div class="icon">📁</div>
          <h3>No Workspace Skills</h3>
          <p>Custom skills will appear here when added to the workspace.</p>
          <p style="font-size: 12px; color: var(--text-secondary);">
            Workspace: ${this.config?.skills?.workspace || '~/.0711/workspace/skills/'}
          </p>
        </div>
      `;
    }

    return html`
      <div class="skills-grid">
        ${this.workspaceSkills.map(skill => html`
          <div class="skill-card">
            <div class="skill-header">
              <span class="skill-icon">🔧</span>
              <div class="skill-info">
                <h3>${skill.name}</h3>
                <span class="id">${skill.id}</span>
              </div>
            </div>
            <p class="skill-desc">${skill.description}</p>
            <div class="skill-tags">
              <span class="tag workspace">WORKSPACE</span>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}
