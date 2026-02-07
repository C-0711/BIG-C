import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('chat-page')
export class ChatPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    
    .chat-container {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 120px);
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-tertiary);
    }
    
    .agent-selector {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .agent-avatar {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--bg-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .agent-info {
      display: flex;
      flex-direction: column;
    }
    
    .agent-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .agent-status {
      font-size: 11px;
      color: var(--accent-primary);
    }
    
    .agent-select {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      color: var(--text-primary);
      font-size: 13px;
      cursor: pointer;
    }
    
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .message {
      display: flex;
      gap: 12px;
      max-width: 80%;
    }
    
    .message.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    
    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .message.user .message-avatar {
      background: var(--accent-primary);
    }
    
    .message-content {
      background: var(--bg-tertiary);
      border-radius: 12px;
      padding: 12px 16px;
    }
    
    .message.user .message-content {
      background: var(--accent-primary);
      color: #000;
    }
    
    .message-text {
      font-size: 13px;
      line-height: 1.5;
    }
    
    .message-time {
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    
    .message.user .message-time {
      color: rgba(0,0,0,0.5);
    }
    
    .input-area {
      padding: 16px 20px;
      border-top: 1px solid var(--border-color);
      background: var(--bg-tertiary);
    }
    
    .input-row {
      display: flex;
      gap: 12px;
    }
    
    .message-input {
      flex: 1;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px 16px;
      color: var(--text-primary);
      font-size: 14px;
      resize: none;
    }
    
    .message-input:focus {
      outline: none;
      border-color: var(--accent-primary);
    }
    
    .send-btn {
      background: var(--accent-primary);
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      color: #000;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    
    .send-btn:hover {
      opacity: 0.9;
    }
    
    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      padding: 40px;
    }
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .empty-text {
      font-size: 14px;
      text-align: center;
      max-width: 300px;
    }
  `;

  @property({ type: Object }) config: any = null;
  @state() selectedAgent = '';
  @state() messages: Array<{role: string; content: string; time: string}> = [];
  @state() inputValue = '';
  @state() sending = false;

  private get agents(): any[] {
    return this.config?.agents?.list?.filter((a: any) => a.enabled !== false) || [];
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.agents.length > 0 && !this.selectedAgent) {
      this.selectedAgent = this.agents[0].id;
    }
  }

  private get currentAgent(): any {
    return this.agents.find(a => a.id === this.selectedAgent);
  }

  private async sendMessage() {
    if (!this.inputValue.trim() || this.sending) return;
    
    const userMessage = this.inputValue.trim();
    this.inputValue = '';
    this.sending = true;
    
    // Add user message
    this.messages = [...this.messages, {
      role: 'user',
      content: userMessage,
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    }];
    
    // Simulate agent response (replace with actual API call)
    setTimeout(() => {
      this.messages = [...this.messages, {
        role: 'assistant',
        content: `Ich bin ${this.currentAgent?.identity?.name || this.selectedAgent}. Wie kann ich dir helfen?`,
        time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      }];
      this.sending = false;
    }, 1000);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  render() {
    const agent = this.currentAgent;
    
    return html`
      <div class="chat-container">
        <div class="chat-header">
          <div class="agent-selector">
            <div class="agent-avatar">${agent?.identity?.emoji || '🤖'}</div>
            <div class="agent-info">
              <span class="agent-name">${agent?.identity?.name || agent?.id || 'Select Agent'}</span>
              <span class="agent-status">● Online</span>
            </div>
          </div>
          
          <select 
            class="agent-select" 
            .value=${this.selectedAgent}
            @change=${(e: Event) => this.selectedAgent = (e.target as HTMLSelectElement).value}
          >
            ${this.agents.map(a => html`
              <option value=${a.id}>${a.identity?.name || a.id}</option>
            `)}
          </select>
        </div>
        
        <div class="messages">
          ${this.messages.length === 0 ? html`
            <div class="empty-state">
              <span class="empty-icon">💬</span>
              <p class="empty-text">
                Starte eine Konversation mit ${agent?.identity?.name || 'dem Agent'}.
                Stelle eine Frage oder gib eine Anweisung.
              </p>
            </div>
          ` : this.messages.map(msg => html`
            <div class="message ${msg.role}">
              <div class="message-avatar">
                ${msg.role === 'user' ? '👤' : (agent?.identity?.emoji || '🤖')}
              </div>
              <div class="message-content">
                <div class="message-text">${msg.content}</div>
                <div class="message-time">${msg.time}</div>
              </div>
            </div>
          `)}
        </div>
        
        <div class="input-area">
          <div class="input-row">
            <textarea
              class="message-input"
              placeholder="Nachricht eingeben..."
              rows="1"
              .value=${this.inputValue}
              @input=${(e: Event) => this.inputValue = (e.target as HTMLTextAreaElement).value}
              @keydown=${this.handleKeyDown}
            ></textarea>
            <button 
              class="send-btn" 
              @click=${this.sendMessage}
              ?disabled=${!this.inputValue.trim() || this.sending}
            >
              ${this.sending ? '...' : 'Senden'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
