import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const CONFIG_PATH = path.join(__dirname, '../../../../config/config.yaml');
const SCHEMA_PATH = path.join(__dirname, '../../../../config/config.schema.json');

export interface IntelligenceConfig {
  instance: {
    name: string;
    logo?: string;
    primaryColor: string;
    language: string;
  };
  dataSources: DataSourceConfig[];
  outputs: OutputConfig[];
  agents: AgentConfig[];
  workflows: WorkflowConfig[];
  modules: ModulesConfig;
}

export interface DataSourceConfig {
  id: string;
  name: string;
  type: 'csv' | 'excel' | 'bmecat' | 'rest' | 'mcp' | 'database';
  config: Record<string, any>;
  schedule?: string;
  enabled: boolean;
}

export interface OutputConfig {
  id: string;
  name: string;
  type: 'webhook' | 'email' | 'slack' | 'telegram' | 'whatsapp' | 'csv-export' | 'api-push' | 'ftp';
  config: Record<string, any>;
  triggers: string[];
  enabled: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  model: string;
  systemPrompt?: string;
  skills: string[];
  dataSources: string[];
  outputs: string[];
  enabled: boolean;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  trigger: Record<string, any>;
  steps: any[];
  enabled: boolean;
}

export interface ModulesConfig {
  dashboard: boolean;
  assistant: boolean;
  products: boolean;
  marketing: boolean;
  analytics: boolean;
  settings: boolean;
}

class ConfigService {
  private config: IntelligenceConfig | null = null;
  private lastModified: number = 0;

  loadConfig(): IntelligenceConfig {
    try {
      const stat = fs.statSync(CONFIG_PATH);
      
      // Reload if file changed
      if (stat.mtimeMs > this.lastModified || !this.config) {
        const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
        this.config = yaml.load(content) as IntelligenceConfig;
        this.lastModified = stat.mtimeMs;
        
        // Apply defaults
        this.config.dataSources = this.config.dataSources || [];
        this.config.outputs = this.config.outputs || [];
        this.config.agents = this.config.agents || [];
        this.config.workflows = this.config.workflows || [];
      }
      
      return this.config!;
    } catch (e) {
      console.error('Failed to load config:', e);
      return this.getDefaultConfig();
    }
  }

  saveConfig(config: IntelligenceConfig): void {
    const content = yaml.dump(config, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    });
    fs.writeFileSync(CONFIG_PATH, content, 'utf-8');
    this.config = config;
    this.lastModified = Date.now();
  }

  getSchema(): any {
    try {
      return JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
    } catch {
      return {};
    }
  }

  // Partial updates
  updateSection<K extends keyof IntelligenceConfig>(
    section: K, 
    data: IntelligenceConfig[K]
  ): IntelligenceConfig {
    const config = this.loadConfig();
    config[section] = data;
    this.saveConfig(config);
    return config;
  }

  // Add item to array section
  addItem(section: 'dataSources' | 'outputs' | 'agents' | 'workflows', item: any): IntelligenceConfig {
    const config = this.loadConfig();
    (config[section] as any[]).push(item);
    this.saveConfig(config);
    return config;
  }

  // Update item in array section
  updateItem(section: 'dataSources' | 'outputs' | 'agents' | 'workflows', id: string, updates: any): IntelligenceConfig {
    const config = this.loadConfig();
    const arr = config[section] as any[];
    const index = arr.findIndex(item => item.id === id);
    if (index !== -1) {
      arr[index] = { ...arr[index], ...updates };
      this.saveConfig(config);
    }
    return config;
  }

  // Delete item from array section
  deleteItem(section: 'dataSources' | 'outputs' | 'agents' | 'workflows', id: string): IntelligenceConfig {
    const config = this.loadConfig();
    const arr = config[section] as any[];
    const index = arr.findIndex(item => item.id === id);
    if (index !== -1) {
      arr.splice(index, 1);
      this.saveConfig(config);
    }
    return config;
  }

  private getDefaultConfig(): IntelligenceConfig {
    return {
      instance: {
        name: '0711-C Intelligence',
        primaryColor: '#3B82F6',
        language: 'de',
      },
      dataSources: [],
      outputs: [],
      agents: [],
      workflows: [],
      modules: {
        dashboard: true,
        assistant: true,
        products: true,
        marketing: false,
        analytics: true,
        settings: true,
      },
    };
  }
}

export const configService = new ConfigService();
export default configService;
