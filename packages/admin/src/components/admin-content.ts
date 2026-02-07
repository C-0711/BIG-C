import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../pages/overview-page';
import '../pages/agents-page';
import '../pages/skills-page';
import '../pages/cron-jobs-page';
import '../pages/data-sources-page';
import '../pages/outputs-page';
import '../pages/template-page';
import '../pages/config-page';
import '../pages/chat-page';
import '../pages/logs-page';

@customElement('admin-content')
export class AdminContent extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--bg-primary);
      overflow-y: auto;
    }
    
    .content {
      padding: 24px;
      max-width: 1400px;
    }
    
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      background: var(--bg-secondary);
      border-radius: 8px;
      border: 1px dashed var(--border-color);
    }
    
    .placeholder-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .placeholder-text {
      color: var(--text-muted);
    }
  `;

  @property({ type: String }) route = 'overview';
  @property({ type: Object }) config: any = null;

  private renderPage() {
    switch (this.route) {
      case 'overview':
        return html`<overview-page .config=${this.config}></overview-page>`;
      case 'chat':
        return html`<chat-page .config=${this.config}></chat-page>`;
      case 'agents':
        return html`<agents-page .config=${this.config}></agents-page>`;
      case 'skills':
        return html`<skills-page .config=${this.config}></skills-page>`;
      case 'cron-jobs':
        return html`<cron-jobs-page .config=${this.config}></cron-jobs-page>`;
      case 'data-sources':
        return html`<data-sources-page .config=${this.config}></data-sources-page>`;
      case 'outputs':
        return html`<outputs-page .config=${this.config}></outputs-page>`;
      case 'template':
        return html`<template-page .config=${this.config}></template-page>`;
      case 'config':
        return html`<config-page .config=${this.config}></config-page>`;
      case 'logs':
        return html`<logs-page .config=${this.config}></logs-page>`;
      default:
        return this.renderPlaceholder();
    }
  }

  private renderPlaceholder() {
    const pageInfo: Record<string, { icon: string; title: string }> = {
      'channels': { icon: '🔗', title: 'Channels' },
      'instances': { icon: '📡', title: 'Instances' },
      'sessions': { icon: '📊', title: 'Sessions' },
      'nodes': { icon: '📦', title: 'Nodes' },
      'debug': { icon: '🐛', title: 'Debug' },
      'docs': { icon: '📚', title: 'Docs' },
    };

    const info = pageInfo[this.route] || { icon: '📄', title: this.route };

    return html`
      <div class="placeholder">
        <span class="placeholder-icon">${info.icon}</span>
        <span class="placeholder-text">${info.title} — Coming Soon</span>
      </div>
    `;
  }

  render() {
    return html`
      <div class="content">
        ${this.renderPage()}
      </div>
    `;
  }
}
