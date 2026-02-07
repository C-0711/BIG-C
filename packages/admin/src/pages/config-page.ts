import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('config-page')
export class ConfigPage extends LitElement {
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
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .save-btn {
      background: var(--accent-primary);
      border: none;
      color: #000;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    
    .reset-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .editor-container {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .editor {
      width: 100%;
      min-height: 600px;
      padding: 20px;
      background: var(--bg-primary);
      border: none;
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.6;
      resize: vertical;
    }
    
    .editor:focus {
      outline: none;
    }
    
    .status-bar {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      border-top: 1px solid var(--border-color);
      font-size: 12px;
      color: var(--text-muted);
    }
    
    .status-valid {
      color: var(--accent-primary);
    }
    
    .status-invalid {
      color: var(--accent-danger);
    }
  `;

  @property({ type: Object }) config: any = null;
  @state() configText = '';
  @state() isValid = true;
  @state() errorMessage = '';

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('config') && this.config) {
      this.configText = JSON.stringify(this.config, null, 2);
    }
  }

  private handleInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.configText = textarea.value;
    
    try {
      JSON.parse(this.configText);
      this.isValid = true;
      this.errorMessage = '';
    } catch (err: any) {
      this.isValid = false;
      this.errorMessage = err.message;
    }
  }

  private handleSave() {
    if (!this.isValid) return;
    
    // TODO: Send config update via WebSocket
    console.log('Saving config...');
  }

  private handleReset() {
    this.configText = JSON.stringify(this.config, null, 2);
    this.isValid = true;
    this.errorMessage = '';
  }

  render() {
    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">Config</h1>
          <p class="page-subtitle">Raw JSON5 configuration editor</p>
        </div>
        <div class="actions">
          <button class="reset-btn" @click=${this.handleReset}>Reset</button>
          <button class="save-btn" @click=${this.handleSave} ?disabled=${!this.isValid}>
            Save
          </button>
        </div>
      </div>
      
      <div class="editor-container">
        <textarea
          class="editor"
          .value=${this.configText}
          @input=${this.handleInput}
          spellcheck="false"
        ></textarea>
        <div class="status-bar">
          <span class="${this.isValid ? 'status-valid' : 'status-invalid'}">
            ${this.isValid ? '✓ Valid JSON' : `✗ ${this.errorMessage}`}
          </span>
          <span>~/.0711/config.json</span>
        </div>
      </div>
    `;
  }
}
