import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('skills-page')
export class SkillsPage extends LitElement {
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
    
    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .tab {
      padding: 12px 20px;
      font-size: 13px;
      color: var(--text-secondary);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }
    
    .tab:hover { color: var(--text-primary); }
    
    .tab.active {
      color: var(--accent-primary);
      border-bottom-color: var(--accent-primary);
    }
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    
    .skill-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
    }
    
    .skill-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .skill-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      border-radius: 8px;
    }
    
    .skill-info { flex: 1; }
    
    .skill-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    
    .skill-id {
      font-size: 11px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    
    .skill-desc {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 12px;
    }
    
    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .tag {
      font-size: 10px;
      padding: 3px 8px;
      background: var(--bg-tertiary);
      border-radius: 4px;
      color: var(--text-muted);
    }
    
    .tag.bundled { background: var(--accent-primary); color: #000; }
    
    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--text-muted);
    }
  `;

  @property({ type: Object }) config: any = null;
  @state() activeTab = 'bundled';

  private getSkillIcon(id: string): string {
    const icons: Record<string, string> = {
      'product-search': '🔍',
      'catalog-browser': '📚',
      'price-checker': '💰',
      'stock-status': '📦',
      'compare-products': '⚖️',
      'product-details': '📋',
      'category-nav': '🗂️',
      'search-filters': '🎯',
      'bulk-operations': '⚡',
      'export-data': '📤',
      'import-data': '📥',
      'report-generator': '📊',
      'quality-check': '✅',
    };
    return icons[id] || '✨';
  }

  render() {
    const bundled = this.config?.skills?.bundled || [];
    const workspace = this.config?.skills?.workspace || [];
    const skills = this.activeTab === 'bundled' ? bundled : workspace;

    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Skills</h1>
          <p class="page-subtitle">Agent capabilities and tool definitions</p>
        </div>
      </div>
      
      <div class="tabs">
        <div 
          class="tab ${this.activeTab === 'bundled' ? 'active' : ''}"
          @click=${() => this.activeTab = 'bundled'}
        >
          Bundled (${bundled.length})
        </div>
        <div 
          class="tab ${this.activeTab === 'workspace' ? 'active' : ''}"
          @click=${() => this.activeTab = 'workspace'}
        >
          Workspace (${workspace.length})
        </div>
      </div>
      
      ${skills.length === 0 ? html`
        <div class="empty-state">
          <p>No ${this.activeTab} skills found</p>
        </div>
      ` : html`
        <div class="skills-grid">
          ${skills.map((skill: string) => html`
            <div class="skill-card">
              <div class="skill-header">
                <div class="skill-icon">${this.getSkillIcon(skill)}</div>
                <div class="skill-info">
                  <div class="skill-name">${skill.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                  <div class="skill-id">${skill}</div>
                </div>
              </div>
              <div class="skill-desc">
                Enterprise skill for ${skill.replace(/-/g, ' ')} operations.
              </div>
              <div class="skill-tags">
                <span class="tag bundled">BUNDLED</span>
                <span class="tag">enterprise</span>
              </div>
            </div>
          `)}
        </div>
      `}
    `;
  }
}
