/**
 * Config Service - Singleton config manager with reactive updates
 */

import { api } from './api-client.js';
import { toastService } from './toast-service.js';

export interface Config {
  instance: {
    name: string;
    logo?: string;
    template: string;
    locale: string;
  };
  agents: {
    defaults: {
      workspace: string;
      model: {
        primary: string;
        fallbacks: string[];
      };
      thinkingDefault: string;
    };
    list: Agent[];
  };
  workflows: {
    list: Workflow[];
  };
  skills: {
    bundled: string[];
    workspace: string;
  };
  dataSources: {
    providers: Record<string, DataSource>;
  };
  outputs: {
    providers: Record<string, Output>;
  };
  ui: {
    template: string;
    theme: string;
    branding: {
      primaryColor: string;
      accentColor: string;
    };
    dashboard: {
      showKPIs: boolean;
      showRecentActivity: boolean;
      showQuickActions: boolean;
    };
  };
  auth: {
    mode: string;
  };
}

export interface Agent {
  id: string;
  identity: {
    name: string;
    emoji: string;
    theme?: string;
  };
  enabled: boolean;
  skills: string[];
  dataSources: string[];
  outputs?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  trigger: {
    type: string;
    schedule?: string;
    event?: string;
  };
  steps: any[];
  enabled: boolean;
}

export interface DataSource {
  type: string;
  connectionString?: string;
  path?: string;
  command?: string;
  args?: string[];
}

export interface Output {
  type: string;
  webhookUrl?: string;
  endpoint?: string;
}

type ConfigListener = (config: Config | null) => void;

class ConfigService {
  private config: Config | null = null;
  private listeners: Set<ConfigListener> = new Set();
  private loading = false;
  private dirty = false;

  private notify() {
    this.listeners.forEach(listener => listener(this.config));
  }

  subscribe(listener: ConfigListener): () => void {
    this.listeners.add(listener);
    if (this.config) {
      listener(this.config);
    }
    return () => this.listeners.delete(listener);
  }

  getConfig(): Config | null {
    return this.config;
  }

  isLoading(): boolean {
    return this.loading;
  }

  isDirty(): boolean {
    return this.dirty;
  }

  setDirty(dirty: boolean): void {
    this.dirty = dirty;
  }

  async load(): Promise<Config | null> {
    this.loading = true;
    const response = await api.get<Config>('/config');
    this.loading = false;

    if (response.ok && response.data) {
      this.config = response.data;
      this.dirty = false;
      this.notify();
      return this.config;
    } else {
      toastService.error(`Failed to load config: ${response.error?.message}`);
      return null;
    }
  }

  async save(config: Config): Promise<boolean> {
    this.loading = true;
    const response = await api.put<{ success: boolean }>('/config', config);
    this.loading = false;

    if (response.ok) {
      this.config = config;
      this.dirty = false;
      this.notify();
      toastService.success('Configuration saved successfully');
      return true;
    } else {
      toastService.error(`Failed to save config: ${response.error?.message}`);
      return false;
    }
  }

  async patch(path: string, value: any): Promise<boolean> {
    this.loading = true;
    const response = await api.patch<{ success: boolean }>('/config', { path, value });
    this.loading = false;

    if (response.ok) {
      // Reload to get updated config
      await this.load();
      toastService.success('Configuration updated');
      return true;
    } else {
      toastService.error(`Failed to update config: ${response.error?.message}`);
      return false;
    }
  }

  // Helper methods for common operations
  async addAgent(agent: Agent): Promise<boolean> {
    if (!this.config) return false;
    const newList = [...this.config.agents.list, agent];
    return this.patch('agents.list', newList);
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<boolean> {
    if (!this.config) return false;
    const newList = this.config.agents.list.map(a => 
      a.id === id ? { ...a, ...updates } : a
    );
    return this.patch('agents.list', newList);
  }

  async deleteAgent(id: string): Promise<boolean> {
    if (!this.config) return false;
    const newList = this.config.agents.list.filter(a => a.id !== id);
    return this.patch('agents.list', newList);
  }

  async addDataSource(id: string, dataSource: DataSource): Promise<boolean> {
    if (!this.config) return false;
    const newProviders = { ...this.config.dataSources.providers, [id]: dataSource };
    return this.patch('dataSources.providers', newProviders);
  }

  async deleteDataSource(id: string): Promise<boolean> {
    if (!this.config) return false;
    const newProviders = { ...this.config.dataSources.providers };
    delete newProviders[id];
    return this.patch('dataSources.providers', newProviders);
  }

  async addOutput(id: string, output: Output): Promise<boolean> {
    if (!this.config) return false;
    const newProviders = { ...this.config.outputs.providers, [id]: output };
    return this.patch('outputs.providers', newProviders);
  }

  async deleteOutput(id: string): Promise<boolean> {
    if (!this.config) return false;
    const newProviders = { ...this.config.outputs.providers };
    delete newProviders[id];
    return this.patch('outputs.providers', newProviders);
  }

  async addWorkflow(workflow: Workflow): Promise<boolean> {
    if (!this.config) return false;
    const newList = [...this.config.workflows.list, workflow];
    return this.patch('workflows.list', newList);
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<boolean> {
    if (!this.config) return false;
    const newList = this.config.workflows.list.map(w => 
      w.id === id ? { ...w, ...updates } : w
    );
    return this.patch('workflows.list', newList);
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    if (!this.config) return false;
    const newList = this.config.workflows.list.filter(w => w.id !== id);
    return this.patch('workflows.list', newList);
  }
}

// Singleton instance
export const configService = new ConfigService();
