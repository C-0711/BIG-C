import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import all pages with .js extensions for ESM
import '../pages/overview-page.js';
import '../pages/chat-page.js';
import '../pages/channels-page.js';
import '../pages/instances-page.js';
import '../pages/sessions-page.js';
import '../pages/cron-jobs-page.js';
import '../pages/agents-page.js';
import '../pages/skills-page.js';
import '../pages/nodes-page.js';
import '../pages/data-sources-page.js';
import '../pages/widgets-page.js';
import '../pages/dashboards-page.js';
import '../pages/outputs-page.js';
import '../pages/template-page.js';
import '../pages/config-page.js';
import '../pages/debug-page.js';
import '../pages/logs-page.js';
import '../pages/docs-page.js';

@customElement('admin-content')
export class AdminContent extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--bg-primary);
      overflow-y: auto;
    }
  `;

  @property({ type: String })
  activePage = 'overview';

  private renderPage() {
    switch (this.activePage) {
      case 'overview':
        return html`<overview-page></overview-page>`;
      case 'chat':
        return html`<chat-page></chat-page>`;
      case 'channels':
        return html`<channels-page></channels-page>`;
      case 'instances':
        return html`<instances-page></instances-page>`;
      case 'sessions':
        return html`<sessions-page></sessions-page>`;
      case 'cron-jobs':
      case 'workflows':
        return html`<cron-jobs-page></cron-jobs-page>`;
      case 'agents':
        return html`<agents-page></agents-page>`;
      case 'skills':
        return html`<skills-page></skills-page>`;
      case 'nodes':
        return html`<nodes-page></nodes-page>`;
      case 'data-sources':
      case 'datasources':
        return html`<data-sources-page></data-sources-page>`;
      case 'widgets':
        return html`<widgets-page></widgets-page>`;
      case 'dashboards':
        return html`<dashboards-page></dashboards-page>`;
      
      case 'outputs':
        return html`<outputs-page></outputs-page>`;
      case 'template':
        return html`<template-page></template-page>`;
      case 'config':
        return html`<config-page></config-page>`;
      case 'debug':
        return html`<debug-page></debug-page>`;
      case 'logs':
        return html`<logs-page></logs-page>`;
      case 'docs':
        return html`<docs-page></docs-page>`;
      default:
        return html`<overview-page></overview-page>`;
    }
  }

  render() {
    return this.renderPage();
  }
}
