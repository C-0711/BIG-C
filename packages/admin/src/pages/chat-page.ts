import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { configService, toastService, type Config, type Agent } from '../services/index';

@customElement('chat-page')
export class ChatPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 24px;
      height: calc(100vh - 120px);
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-color, #363646);
    }

    .agent-icon {
      font-size: 32px;
    }

    .agent-info h2 {
      margin: 0 0 4px 0;
      font-size: 18px;
    }

    .agent-info .status {
      font-size: 13px;
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    select {
      padding: 8px 12px;
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 6px;
      color: var(--text-primary, #fff);
      font-size: 14px;
      margin-left: auto;
    }

    .chat-container {
      flex: 1;
      background: var(--bg-secondary, #1e1e2e);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
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
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
    }

    .message.user {
      align-self: flex-end;
      background: var(--accent-color, #3b82f6);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message.agent {
      align-self: flex-start;
      background: var(--bg-tertiary, #2a2a3a);
      border-bottom-left-radius: 4px;
    }

    .message.system {
      align-self: center;
      background: transparent;
      color: var(--text-secondary, #888);
      font-size: 13px;
    }

    .input-area {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid var(--border-color, #363646);
    }

    input {
      flex: 1;
      padding: 12px 16px;
      background: var(--bg-tertiary, #2a2a3a);
      border: 1px solid var(--border-color, #363646);
      border-radius: 8px;
      color: var(--text-primary, #fff);
      font-size: 14px;
    }

    input:focus {
      outline: none;
      border-color: var(--accent-color, #3b82f6);
    }

    button {
      padding: 12px 24px;
      background: var(--accent-color, #3b82f6);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    button:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      align-self: flex-start;
    }

    .typing span {
      width: 8px;
      height: 8px;
      background: var(--text-secondary, #888);
      border-radius: 50%;
      animation: bounce 1.4s infinite;
    }

    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
  `;

  @state() private config: Config | null = null;
  @state() private agents: Agent[] = [];
  @state() private selectedAgent: Agent | null = null;
  @state() private messages: Array<{ type: 'user' | 'agent' | 'system'; text: string }> = [];
  @state() private inputText = '';
  @state() private sending = false;

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = configService.subscribe(config => {
      if (config) {
        this.config = config;
        this.agents = config.agents?.list?.filter(a => a.enabled) || [];
        if (!this.selectedAgent && this.agents.length > 0) {
          this.selectedAgent = this.agents[0];
          this.messages = [
            { type: 'system', text: `Chat with ${this.selectedAgent.identity.name} started` }
          ];
        }
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private handleAgentChange(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    this.selectedAgent = this.agents.find(a => a.id === id) || null;
    this.messages = [
      { type: 'system', text: `Switched to ${this.selectedAgent?.identity.name}` }
    ];
  }

  private async handleSend() {
    if (!this.inputText.trim() || !this.selectedAgent || this.sending) return;

    const userMessage = this.inputText.trim();
    this.messages = [...this.messages, { type: 'user', text: userMessage }];
    this.inputText = '';
    this.sending = true;

    // Simulate agent response
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const responses = [
      `I understand you're asking about "${userMessage.slice(0, 30)}...". Let me help you with that.`,
      `Based on your query, here's what I found regarding "${userMessage.slice(0, 20)}...".`,
      `I've processed your request. Here's the relevant information.`,
      `That's a great question! Let me analyze this for you.`,
    ];

    this.messages = [...this.messages, { 
      type: 'agent', 
      text: responses[Math.floor(Math.random() * responses.length)]
    }];
    this.sending = false;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSend();
    }
  }

  render() {
    return html`
      <div class="header">
        <span class="agent-icon">${this.selectedAgent?.identity.emoji || '🤖'}</span>
        <div class="agent-info">
          <h2>${this.selectedAgent?.identity.name || 'Select Agent'}</h2>
          <div class="status">● Online</div>
        </div>
        <select @change=${this.handleAgentChange} .value=${this.selectedAgent?.id || ''}>
          ${this.agents.map(agent => html`
            <option value=${agent.id}>${agent.identity.name}</option>
          `)}
        </select>
      </div>

      <div class="chat-container">
        <div class="messages">
          ${this.messages.map(msg => html`
            <div class="message ${msg.type}">${msg.text}</div>
          `)}
          ${this.sending ? html`
            <div class="typing">
              <span></span><span></span><span></span>
            </div>
          ` : ''}
        </div>

        <div class="input-area">
          <input
            type="text"
            placeholder="Type a message..."
            .value=${this.inputText}
            @input=${(e: Event) => this.inputText = (e.target as HTMLInputElement).value}
            @keydown=${this.handleKeyDown}
            ?disabled=${this.sending}
          />
          <button @click=${this.handleSend} ?disabled=${!this.inputText.trim() || this.sending}>
            Send
          </button>
        </div>
      </div>
    `;
  }
}
