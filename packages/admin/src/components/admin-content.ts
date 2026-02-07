import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import all 16 pages
import '../pages/overview-page';
import '../pages/chat-page';
import '../pages/channels-page';
import '../pages/instances-page';
import '../pages/sessions-page';
import '../pages/cron-jobs-page';
import '../pages/agents-page';
import '../pages/skills-page';
import '../pages/nodes-page';
import '../pages/data-sources-page';
import '../pages/outputs-page';
import '../pages/template-page';
import '../pages/config-page';
import '../pages/debug-page';
import '../pages/logs-page';
import '../pages/docs-page';

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
  `;

  @property({ type: String }) route = 'overview';
  @property({ type: Object }) config: any = null;

  private renderPage() {
    switch (this.route) {
      // Control
      case 'overview':
        return html`<overview-page .config=${this.config}></overview-page>`;
      case 'chat':
        return html`<chat-page .config=${this.config}></chat-page>`;
      case 'channels':
        return html`<channels-page .config=${this.config}></channels-page>`;
      case 'instances':
        return html`<instances-page .config=${this.config}></instances-page>`;
      case 'sessions':
        return html`<sessions-page .config=${this.config}></sessions-page>`;
      case 'cron-jobs':
        return html`<cron-jobs-page .config=${this.config}></cron-jobs-page>`;
      
      // Agent
      case 'agents':
        return html`<agents-page .config=${this.config}></agents-page>`;
      case 'skills':
        return html`<skills-page .config=${this.config}></skills-page>`;
      case 'nodes':
        return html`<nodes-page .config=${this.config}></nodes-page>`;
      
      // Data
      case 'data-sources':
        return html`<data-sources-page .config=${this.config}></data-sources-page>`;
      case 'outputs':
        return html`<outputs-page .config=${this.config}></outputs-page>`;
      case 'template':
        return html`<template-page .config=${this.config}></template-page>`;
      
      // Settings
      case 'config':
        return html`<config-page .config=${this.config}></config-page>`;
      case 'debug':
        return html`<debug-page .config=${this.config}></debug-page>`;
      case 'logs':
        return html`<logs-page .config=${this.config}></logs-page>`;
      
      // Resources
      case 'docs':
        return html`<docs-page .config=${this.config}></docs-page>`;
      
      default:
        return html`<overview-page .config=${this.config}></overview-page>`;
    }
  }

  render() {
    return html`
      <div class="content">
        ${this.renderPage()}
      </div>
    `;
  }
}
