import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('onboarding-page')
export class OnboardingPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .wizard {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
    }

    .wizard-header {
      padding: 32px;
      text-align: center;
      border-bottom: 1px solid var(--border-color);
    }

    .wizard-header h1 {
      margin: 0 0 8px;
      font-size: 28px;
    }

    .wizard-header p {
      margin: 0;
      color: var(--text-muted);
    }

    .progress-bar {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
    }

    .progress-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--bg-tertiary);
      transition: all 0.3s;
    }

    .progress-dot.active {
      background: var(--accent-primary);
      transform: scale(1.2);
    }

    .progress-dot.completed {
      background: var(--accent-primary);
    }

    .wizard-content {
      padding: 40px;
    }

    .step-title {
      font-size: 20px;
      margin: 0 0 24px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .form-group input, .form-group select {
      width: 100%;
      padding: 12px 16px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: var(--accent-primary);
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--bg-tertiary);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .checkbox-item:hover {
      background: var(--bg-hover);
    }

    .checkbox-item.selected {
      border: 1px solid var(--accent-primary);
      background: var(--accent-primary)10;
    }

    .checkbox-icon {
      font-size: 24px;
    }

    .checkbox-content {
      flex: 1;
    }

    .checkbox-content h4 {
      margin: 0;
      font-size: 14px;
    }

    .checkbox-content p {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--text-muted);
    }

    .wizard-footer {
      display: flex;
      justify-content: space-between;
      padding: 24px 40px;
      border-top: 1px solid var(--border-color);
      background: var(--bg-tertiary);
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-secondary {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }

    .btn-primary {
      background: var(--accent-primary);
      border: none;
      color: #000;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .success-icon {
      font-size: 64px;
      text-align: center;
      margin-bottom: 24px;
    }

    .success-text {
      text-align: center;
    }

    .success-text h2 {
      margin: 0 0 8px;
    }

    .success-text p {
      color: var(--text-muted);
      margin: 0;
    }

    .link-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 32px;
    }

    .link-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--bg-tertiary);
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.15s;
    }

    .link-item:hover {
      background: var(--bg-hover);
    }
  `;

  @state() currentStep = 0;
  @state() formData = {
    instanceName: '0711 C-Intelligence',
    locale: 'de-DE',
    selectedAgents: ['product-expert', 'quality-checker'],
    selectedSkills: ['product-search', 'data-validation'],
  };

  private steps = [
    { title: 'Willkommen', icon: '👋' },
    { title: 'Instanz', icon: '🏢' },
    { title: 'Agents', icon: '🤖' },
    { title: 'Skills', icon: '🛠️' },
    { title: 'Fertig!', icon: '🎉' },
  ];

  private agents = [
    { id: 'product-expert', name: 'Produkt-Experte', desc: 'Produktsuche und -informationen', icon: '📦' },
    { id: 'quality-checker', name: 'Qualitätsprüfer', desc: 'Datenqualität validieren', icon: '✅' },
    { id: 'content-writer', name: 'Content Writer', desc: 'Marketing-Inhalte erstellen', icon: '✍️' },
    { id: 'feed-manager', name: 'Feed Manager', desc: 'Feeds und Exporte verwalten', icon: '📤' },
  ];

  private skills = [
    { id: 'product-search', name: 'Produktsuche', desc: 'Volltextsuche in Produktdaten', icon: '🔍' },
    { id: 'data-validation', name: 'Datenvalidierung', desc: 'Qualitätsprüfung der Daten', icon: '✓' },
    { id: 'content-generation', name: 'Content-Generierung', desc: 'KI-gestützte Texterstellung', icon: '📝' },
    { id: 'image-processing', name: 'Bildverarbeitung', desc: 'Bildoptimierung und -analyse', icon: '🖼️' },
  ];

  private toggleAgent(id: string) {
    const selected = this.formData.selectedAgents;
    if (selected.includes(id)) {
      this.formData = { ...this.formData, selectedAgents: selected.filter(a => a !== id) };
    } else {
      this.formData = { ...this.formData, selectedAgents: [...selected, id] };
    }
  }

  private toggleSkill(id: string) {
    const selected = this.formData.selectedSkills;
    if (selected.includes(id)) {
      this.formData = { ...this.formData, selectedSkills: selected.filter(s => s !== id) };
    } else {
      this.formData = { ...this.formData, selectedSkills: [...selected, id] };
    }
  }

  private next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  private back() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  private finish() {
    // Save config and redirect
    console.log('Saving config:', this.formData);
    window.location.href = '/admin/overview';
  }

  private renderStep() {
    switch (this.currentStep) {
      case 0:
        return html`
          <div class="success-icon">🚀</div>
          <div class="success-text">
            <h2>Willkommen bei 0711 C-Intelligence</h2>
            <p>In wenigen Schritten richten wir Ihre Enterprise Intelligence Platform ein.</p>
          </div>
        `;
      case 1:
        return html`
          <h3 class="step-title">Instanz konfigurieren</h3>
          <div class="form-group">
            <label>Instanz-Name</label>
            <input 
              type="text" 
              .value=${this.formData.instanceName}
              @input=${(e: Event) => this.formData = { ...this.formData, instanceName: (e.target as HTMLInputElement).value }}
              placeholder="Meine Intelligence"
            />
          </div>
          <div class="form-group">
            <label>Sprache</label>
            <select 
              .value=${this.formData.locale}
              @change=${(e: Event) => this.formData = { ...this.formData, locale: (e.target as HTMLSelectElement).value }}
            >
              <option value="de-DE">Deutsch</option>
              <option value="en-US">English</option>
              <option value="fr-FR">Français</option>
            </select>
          </div>
        `;
      case 2:
        return html`
          <h3 class="step-title">Agents aktivieren</h3>
          <div class="checkbox-group">
            ${this.agents.map(agent => html`
              <div 
                class="checkbox-item ${this.formData.selectedAgents.includes(agent.id) ? 'selected' : ''}"
                @click=${() => this.toggleAgent(agent.id)}
              >
                <span class="checkbox-icon">${agent.icon}</span>
                <div class="checkbox-content">
                  <h4>${agent.name}</h4>
                  <p>${agent.desc}</p>
                </div>
              </div>
            `)}
          </div>
        `;
      case 3:
        return html`
          <h3 class="step-title">Skills auswählen</h3>
          <div class="checkbox-group">
            ${this.skills.map(skill => html`
              <div 
                class="checkbox-item ${this.formData.selectedSkills.includes(skill.id) ? 'selected' : ''}"
                @click=${() => this.toggleSkill(skill.id)}
              >
                <span class="checkbox-icon">${skill.icon}</span>
                <div class="checkbox-content">
                  <h4>${skill.name}</h4>
                  <p>${skill.desc}</p>
                </div>
              </div>
            `)}
          </div>
        `;
      case 4:
        return html`
          <div class="success-icon">🎉</div>
          <div class="success-text">
            <h2>Setup abgeschlossen!</h2>
            <p>Ihre 0711 C-Intelligence ist bereit.</p>
          </div>
          <div class="link-list">
            <a href="/admin/overview" class="link-item">
              <span>📊</span>
              <span>Admin Dashboard öffnen</span>
            </a>
            <a href="/app" class="link-item">
              <span>🚀</span>
              <span>User Interface starten</span>
            </a>
          </div>
        `;
      default:
        return html``;
    }
  }

  render() {
    const isLast = this.currentStep === this.steps.length - 1;
    const isFirst = this.currentStep === 0;

    return html`
      <div class="wizard">
        <div class="wizard-header">
          <h1>Setup Wizard</h1>
          <p>${this.steps[this.currentStep].icon} ${this.steps[this.currentStep].title}</p>
          <div class="progress-bar">
            ${this.steps.map((_, i) => html`
              <div class="progress-dot ${i === this.currentStep ? 'active' : ''} ${i < this.currentStep ? 'completed' : ''}"></div>
            `)}
          </div>
        </div>
        <div class="wizard-content">
          ${this.renderStep()}
        </div>
        <div class="wizard-footer">
          <button 
            class="btn btn-secondary" 
            @click=${this.back}
            ?disabled=${isFirst}
          >
            ← Zurück
          </button>
          ${isLast ? html`
            <button class="btn btn-primary" @click=${this.finish}>
              Fertig ✓
            </button>
          ` : html`
            <button class="btn btn-primary" @click=${this.next}>
              Weiter →
            </button>
          `}
        </div>
      </div>
    `;
  }
}
