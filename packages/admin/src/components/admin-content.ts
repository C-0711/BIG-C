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

  @property({ type: String }) activePage = 'overview';
  @property({ type: Object }) config: any = null;

  private renderPage() {
    switch (this.activePage) {
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
      case 'workflows':
        return html`<cron-jobs-page .config=${this.config}></cron-jobs-page>`;
      case 'agents':
        return html`<agents-page .config=${this.config}></agents-page>`;
      case 'skills':
        return html`<skills-page .config=${this.config}></skills-page>`;
      case 'nodes':
        return html`<nodes-page .config=${this.config}></nodes-page>`;
      case 'data-sources':
      case 'datasources':
        return html`<data-sources-page .config=${this.config}></data-sources-page>`;
      case 'widgets':
        return html`<widgets-page .config=${this.config}></widgets-page>`;
      case 'dashboards':
        return html`<dashboards-page .config=${this.config}></dashboards-page>`;
      case 'outputs':
        return html`<outputs-page .config=${this.config}></outputs-page>`;
      case 'template':
      case 'templates':
        return html`<template-page .config=${this.config}></template-page>`;
      case 'config':
        return html`<config-page .config=${this.config}></config-page>`;
      case 'debug':
        return html`<debug-page .config=${this.config}></debug-page>`;
      case 'logs':
        return html`<logs-page .config=${this.config}></logs-page>`;
      case 'docs':
        return html`<docs-page .config=${this.config}></docs-page>`;
      default:
        return html`<overview-page .config=${this.config}></overview-page>`;
    }
  }

  render() {
    return this.renderPage();
  }
}
