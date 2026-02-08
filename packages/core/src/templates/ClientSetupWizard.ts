/**
 * ClientSetupWizard - Guide new client deployments
 * Sprint 12.2 - Client Setup
 */

import { TemplateManager, Template, ExportedBundleTemplate } from './TemplateManager';
import { EventBus } from '../events/EventBus';

export interface ClientConfig {
  /** Client identifier */
  clientId: string;
  /** Client display name */
  clientName: string;
  /** MCP endpoint URL */
  mcpEndpoint: string;
  /** API key or auth token */
  apiKey?: string;
  /** Branding configuration */
  branding?: BrandingConfig;
  /** Selected templates to install */
  templates?: string[];
}

export interface BrandingConfig {
  /** Primary color (hex) */
  primaryColor?: string;
  /** Secondary color (hex) */
  secondaryColor?: string;
  /** Logo URL */
  logoUrl?: string;
  /** Favicon URL */
  faviconUrl?: string;
  /** App title */
  appTitle?: string;
}

export type SetupStep = 
  | 'connection'
  | 'discovery'
  | 'templates'
  | 'branding'
  | 'preview'
  | 'deploy'
  | 'complete';

export interface SetupState {
  step: SetupStep;
  config: Partial<ClientConfig>;
  discoveredTools: string[];
  selectedTemplates: Template[];
  connectionStatus: 'pending' | 'testing' | 'success' | 'failed';
  connectionError?: string;
  progress: number; // 0-100
  errors: string[];
}

export interface SetupResult {
  success: boolean;
  clientId: string;
  installedTemplates: string[];
  errors: string[];
}

export class ClientSetupWizard {
  private state: SetupState;
  private templateManager: TemplateManager;
  private mcpClient?: MCPClientInterface;

  constructor(templateManager: TemplateManager) {
    this.templateManager = templateManager;
    this.state = this.createInitialState();
  }

  /**
   * Create initial state
   */
  private createInitialState(): SetupState {
    return {
      step: 'connection',
      config: {},
      discoveredTools: [],
      selectedTemplates: [],
      connectionStatus: 'pending',
      progress: 0,
      errors: [],
    };
  }

  /**
   * Reset wizard to initial state
   */
  reset(): void {
    this.state = this.createInitialState();
    EventBus.emit('setup.reset', {});
  }

  /**
   * Get current state
   */
  getState(): SetupState {
    return { ...this.state };
  }

  /**
   * Step 1: Configure MCP connection
   */
  async configureConnection(endpoint: string, apiKey?: string): Promise<boolean> {
    this.state.config.mcpEndpoint = endpoint;
    this.state.config.apiKey = apiKey;
    this.state.connectionStatus = 'testing';

    EventBus.emit('setup.connection.testing', { endpoint });

    try {
      // Test connection
      const success = await this.testConnection(endpoint, apiKey);

      if (success) {
        this.state.connectionStatus = 'success';
        this.state.step = 'discovery';
        this.state.progress = 20;
        EventBus.emit('setup.connection.success', { endpoint });
        return true;
      } else {
        this.state.connectionStatus = 'failed';
        this.state.connectionError = 'Connection test failed';
        EventBus.emit('setup.connection.failed', { endpoint, error: 'Connection test failed' });
        return false;
      }
    } catch (error) {
      this.state.connectionStatus = 'failed';
      this.state.connectionError = error instanceof Error ? error.message : String(error);
      EventBus.emit('setup.connection.failed', { endpoint, error: this.state.connectionError });
      return false;
    }
  }

  /**
   * Step 2: Discover available tools
   */
  async discoverTools(): Promise<string[]> {
    if (this.state.step !== 'discovery') {
      throw new Error('Must complete connection step first');
    }

    EventBus.emit('setup.discovery.started', {});

    try {
      // Discover tools from MCP
      const tools = await this.listTools();
      this.state.discoveredTools = tools;
      this.state.step = 'templates';
      this.state.progress = 40;

      EventBus.emit('setup.discovery.completed', { toolCount: tools.length });

      return tools;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.state.errors.push(errorMsg);
      EventBus.emit('setup.discovery.failed', { error: errorMsg });
      throw error;
    }
  }

  /**
   * Step 3: Select templates
   */
  selectTemplates(templateIds: string[]): Template[] {
    if (this.state.step !== 'templates') {
      throw new Error('Must complete discovery step first');
    }

    const templates: Template[] = [];
    const errors: string[] = [];

    for (const id of templateIds) {
      const template = this.templateManager.get(id);
      if (template) {
        // Validate template against available tools
        const validation = this.templateManager.validate(template, this.state.discoveredTools);
        if (validation.missingTools.length > 0) {
          errors.push(`Template "${template.name}" requires missing tools: ${validation.missingTools.join(', ')}`);
        } else {
          templates.push(template);
        }
      } else {
        errors.push(`Template not found: ${id}`);
      }
    }

    this.state.selectedTemplates = templates;
    this.state.config.templates = templates.map(t => t.id);
    this.state.errors.push(...errors);

    if (templates.length > 0) {
      this.state.step = 'branding';
      this.state.progress = 60;
    }

    EventBus.emit('setup.templates.selected', {
      count: templates.length,
      errors: errors.length,
    });

    return templates;
  }

  /**
   * Get recommended templates based on discovered tools
   */
  getRecommendedTemplates(): Template[] {
    return this.templateManager.getAll().filter(template => {
      if (!template.requiredTools || template.requiredTools.length === 0) {
        return true;
      }
      return template.requiredTools.every(tool =>
        this.state.discoveredTools.includes(tool)
      );
    });
  }

  /**
   * Step 4: Configure branding
   */
  configureBranding(branding: BrandingConfig): void {
    if (this.state.step !== 'branding') {
      throw new Error('Must complete template selection first');
    }

    this.state.config.branding = branding;
    this.state.step = 'preview';
    this.state.progress = 80;

    EventBus.emit('setup.branding.configured', { branding });
  }

  /**
   * Skip branding step
   */
  skipBranding(): void {
    if (this.state.step === 'branding') {
      this.state.step = 'preview';
      this.state.progress = 80;
    }
  }

  /**
   * Step 5: Set client info
   */
  setClientInfo(clientId: string, clientName: string): void {
    this.state.config.clientId = clientId;
    this.state.config.clientName = clientName;
  }

  /**
   * Step 6: Deploy configuration
   */
  async deploy(): Promise<SetupResult> {
    if (this.state.step !== 'preview' && this.state.step !== 'deploy') {
      throw new Error('Must complete all previous steps first');
    }

    this.state.step = 'deploy';
    EventBus.emit('setup.deploy.started', { clientId: this.state.config.clientId });

    const installedTemplates: string[] = [];
    const errors: string[] = [];

    try {
      // Install selected templates
      for (const template of this.state.selectedTemplates) {
        try {
          await this.installTemplate(template);
          installedTemplates.push(template.id);
        } catch (error) {
          errors.push(`Failed to install ${template.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      this.state.step = 'complete';
      this.state.progress = 100;

      const result: SetupResult = {
        success: errors.length === 0,
        clientId: this.state.config.clientId || 'unknown',
        installedTemplates,
        errors,
      };

      EventBus.emit('setup.deploy.completed', result);

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);

      const result: SetupResult = {
        success: false,
        clientId: this.state.config.clientId || 'unknown',
        installedTemplates,
        errors,
      };

      EventBus.emit('setup.deploy.failed', result);

      return result;
    }
  }

  /**
   * Get setup summary
   */
  getSummary(): {
    clientName: string;
    mcpEndpoint: string;
    toolCount: number;
    templateCount: number;
    hasBranding: boolean;
  } {
    return {
      clientName: this.state.config.clientName || 'Unnamed Client',
      mcpEndpoint: this.state.config.mcpEndpoint || '',
      toolCount: this.state.discoveredTools.length,
      templateCount: this.state.selectedTemplates.length,
      hasBranding: !!this.state.config.branding,
    };
  }

  /**
   * Test MCP connection
   */
  private async testConnection(endpoint: string, apiKey?: string): Promise<boolean> {
    // In production, this would actually test the connection
    // For now, simulate a successful connection
    await new Promise(resolve => setTimeout(resolve, 500));
    return endpoint.length > 0;
  }

  /**
   * List available tools from MCP
   */
  private async listTools(): Promise<string[]> {
    // In production, this would call the MCP client
    // For now, return a mock list
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      'search_products',
      'get_product',
      'search_similar_products',
      'get_product_media',
      'get_product_documents',
      'aggregate_product_specs',
      'check_product_compatibility',
      'analyze_product_ecosystem',
    ];
  }

  /**
   * Install a template
   */
  private async installTemplate(template: Template): Promise<void> {
    // In production, this would actually install the template
    await new Promise(resolve => setTimeout(resolve, 200));
    
    EventBus.emit('setup.template.installed', {
      templateId: template.id,
      templateName: template.name,
    });
  }

  /**
   * Set MCP client for real connections
   */
  setMCPClient(client: MCPClientInterface): void {
    this.mcpClient = client;
  }
}

interface MCPClientInterface {
  connect(endpoint: string, apiKey?: string): Promise<boolean>;
  listTools(): Promise<string[]>;
}
