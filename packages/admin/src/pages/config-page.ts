import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService, toastService, modalService } from '../services/index.js';

@customElement('config-page')
export class ConfigPage extends LitElement {
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

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .editor-container {
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      overflow: hidden;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--bg-tertiary, #2a2a3a);
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .status.valid {
      color: #10b981;
    }

    .status.invalid {
      color: #ef4444;
    }

    .status.dirty {
      color: #f59e0b;
    }

    .file-path {
      font-size: 12px;
      color: var(--text-secondary, #888);
      font-family: monospace;
    }

    textarea {
      width: 100%;
      min-height: 600px;
      padding: 16px;
      background: var(--bg-secondary, #1e1e2e);
      border: none;
      color: var(--text-primary, #fff);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.5;
      resize: vertical;
      box-sizing: border-box;
    }

    textarea:focus {
      outline: none;
    }

    .keyboard-hint {
      padding: 12px 16px;
      background: var(--bg-tertiary, #2a2a3a);
      border-top: 1px solid var(--border-color, #363646);
      font-size: 12px;
      color: var(--text-secondary, #888);
    }

    kbd {
      background: var(--bg-primary, #121218);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      border: 1px solid var(--border-color, #363646);
    }
  `;

  @state() private configText = '';
  @state() private originalText = '';
  @state() private isValid = true;
  @state() private isDirty = false;
  @state() private saving = false;
  @state() private loading = true;
  @state() private errorMessage = '';

  async connectedCallback() {
    super.connectedCallback();
    await this.loadConfig();
    
    // Listen for keyboard shortcuts
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (this.isDirty && this.isValid && !this.saving) {
        this.handleSave();
      }
    }
  };

  private async loadConfig() {
    this.loading = true;
    const config = await configService.load();
    if (config) {
      const text = JSON.stringify(config, null, 2);
      this.configText = text;
      this.originalText = text;
      this.isValid = true;
      this.isDirty = false;
    }
    this.loading = false;
  }

  private handleInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.configText = textarea.value;
    this.isDirty = this.configText !== this.originalText;
    
    // Validate JSON
    try {
      JSON.parse(this.configText);
      this.isValid = true;
      this.errorMessage = '';
    } catch (err: any) {
      this.isValid = false;
      this.errorMessage = err.message;
    }
  }

  private async handleSave() {
    if (!this.isValid || this.saving) return;
    
    this.saving = true;
    
    try {
      const config = JSON.parse(this.configText);
      const success = await configService.save(config);
      
      if (success) {
        this.originalText = this.configText;
        this.isDirty = false;
      }
    } catch (err: any) {
      toastService.error(`Failed to save: ${err.message}`);
    }
    
    this.saving = false;
  }

  private async handleReset() {
    if (!this.isDirty) return;
    
    const confirmed = await modalService.confirmDiscard();
    if (confirmed) {
      this.configText = this.originalText;
      this.isDirty = false;
      this.isValid = true;
      this.errorMessage = '';
    }
  }

  private formatJson() {
    if (!this.isValid) return;
    
    try {
      const config = JSON.parse(this.configText);
      this.configText = JSON.stringify(config, null, 2);
    } catch (err) {
      // Ignore
    }
  }

  render() {
    return html`
      <div class="header">
        <div class="header-left">
          <h1>Config</h1>
          <p>Raw JSON configuration editor</p>
        </div>
        <div class="header-actions">
          <button 
            class="btn-secondary" 
            @click=${this.formatJson}
            ?disabled=${!this.isValid || this.saving}
          >
            Format
          </button>
          <button 
            class="btn-secondary" 
            @click=${this.handleReset}
            ?disabled=${!this.isDirty || this.saving}
          >
            Reset
          </button>
          <button 
            class="btn-primary" 
            @click=${this.handleSave}
            ?disabled=${!this.isDirty || !this.isValid || this.saving}
          >
            ${this.saving ? html`<span class="spinner"></span>` : ''}
            Save
          </button>
        </div>
      </div>

      <div class="editor-container">
        <div class="editor-header">
          <div class="status ${this.isValid ? (this.isDirty ? 'dirty' : 'valid') : 'invalid'}">
            ${this.isValid 
              ? (this.isDirty ? '● Unsaved changes' : '✓ Valid JSON')
              : `✕ Invalid JSON: ${this.errorMessage}`
            }
          </div>
          <div class="file-path">~/.0711/config.json</div>
        </div>
        
        <textarea
          .value=${this.configText}
          @input=${this.handleInput}
          ?disabled=${this.loading}
          placeholder=${this.loading ? 'Loading...' : ''}
          spellcheck="false"
        ></textarea>
        
        <div class="keyboard-hint">
          <kbd>Ctrl</kbd> + <kbd>S</kbd> to save
        </div>
      </div>
    `;
  }
}
