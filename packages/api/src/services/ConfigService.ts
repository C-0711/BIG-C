import * as fs from 'fs';
import * as path from 'path';
import JSON5 from 'json5';
import Ajv from 'ajv';
import { watch, FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';

// ─── PATHS ───────────────────────────────────────────────────────────────────
const CONFIG_DIR = process.env.CONFIG_DIR || path.join(process.env.HOME || '~', '.0711');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
const SCHEMA_PATH = path.join(CONFIG_DIR, 'config.schema.json');

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface IntelligenceConfig {
  instance: {
    name: string;
    logo?: string | null;
    template: string;
    locale: string;
  };
  dataSources: {
    providers: Record<string, DataSourceProvider>;
  };
  outputs: {
    providers: Record<string, OutputProvider>;
  };
  agents: {
    defaults: AgentDefaults;
    list: AgentConfig[];
  };
  workflows: {
    list: WorkflowConfig[];
  };
  skills: {
    bundled: string[];
    workspace: string;
  };
  ui: UIConfig;
  auth: AuthConfig;
}

export interface DataSourceProvider {
  type: 'postgres' | 'mysql' | 'sqlite' | 'csv' | 'excel' | 'rest-api' | 'graphql' | 'mcp';
  connection?: string;
  path?: string;
  endpoint?: string;
  auth?: Record<string, any>;
  sync?: { schedule?: string; enabled?: boolean };
  enabled?: boolean;
}

export interface OutputProvider {
  type: 'slack' | 'telegram' | 'whatsapp' | 'email' | 'api' | 'webhook' | 'ftp' | 'csv-export';
  webhook?: string;
  endpoint?: string;
  auth?: Record<string, any>;
  enabled?: boolean;
}

export interface AgentDefaults {
  workspace: string;
  model: { primary: string; fallbacks?: string[] };
  thinkingDefault: string;
}

export interface AgentConfig {
  id: string;
  identity: { name: string; emoji?: string; theme?: string };
  model?: string;
  dataSources?: string[];
  outputs?: string[];
  skills?: string[];
  enabled: boolean;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  trigger: { type: 'cron' | 'event' | 'manual'; schedule?: string; event?: string; path?: string };
  steps: any[];
  enabled: boolean;
}

export interface UIConfig {
  template: string;
  theme: 'light' | 'dark' | 'auto';
  branding: { primaryColor: string; accentColor?: string };
  dashboard: { showKPIs: boolean; showRecentActivity: boolean; showQuickActions: boolean };
}

export interface AuthConfig {
  mode: 'password' | 'sso' | 'token';
  sso?: Record<string, any>;
}

// ─── CONFIG SERVICE ──────────────────────────────────────────────────────────
class ConfigService extends EventEmitter {
  private config: IntelligenceConfig | null = null;
  private schema: any = null;
  private ajv: Ajv;
  private watcher: FSWatcher | null = null;
  private lastHash: string = '';

  constructor() {
    super();
    this.ajv = new Ajv({ allErrors: true, useDefaults: true });
  }

  // ─── LOAD CONFIG ─────────────────────────────────────────────────────────
  loadConfig(): IntelligenceConfig {
    try {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      let parsed = JSON5.parse(raw);
      
      // Process $include directives
      parsed = this.processIncludes(parsed, CONFIG_DIR);
      
      // Substitute environment variables
      parsed = this.substituteEnvVars(parsed);
      
      // Validate against schema
      if (this.schema) {
        const validate = this.ajv.compile(this.schema);
        if (!validate(parsed)) {
          console.warn('[Config] Validation warnings:', validate.errors);
        }
      }
      
      this.config = parsed as IntelligenceConfig;
      this.lastHash = this.hashConfig(raw);
      
      console.log(`[Config] Loaded: ${this.config.instance.name}`);
      return this.config;
    } catch (e: any) {
      console.error('[Config] Failed to load:', e.message);
      return this.getDefaultConfig();
    }
  }

  // ─── $INCLUDE SUPPORT ────────────────────────────────────────────────────
  private processIncludes(obj: any, baseDir: string): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.processIncludes(item, baseDir));
    }
    
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$include' && typeof value === 'string') {
        // Load and merge the included file
        const includePath = path.resolve(baseDir, value);
        try {
          const includeRaw = fs.readFileSync(includePath, 'utf-8');
          const includeData = JSON5.parse(includeRaw);
          return this.processIncludes(includeData, path.dirname(includePath));
        } catch (e: any) {
          console.warn(`[Config] Failed to include ${value}:`, e.message);
          return {};
        }
      } else {
        result[key] = this.processIncludes(value, baseDir);
      }
    }
    return result;
  }

  // ─── ENV VAR SUBSTITUTION ────────────────────────────────────────────────
  private substituteEnvVars(obj: any): any {
    if (typeof obj === 'string') {
      // Replace ${VAR} with process.env.VAR
      return obj.replace(/\$\{([^}]+)\}/g, (match, varName) => {
        return process.env[varName] || match;
      });
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.substituteEnvVars(item));
    }
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.substituteEnvVars(value);
      }
      return result;
    }
    return obj;
  }

  // ─── SAVE CONFIG ─────────────────────────────────────────────────────────
  saveConfig(config: IntelligenceConfig): void {
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(CONFIG_PATH, content, 'utf-8');
    this.config = config;
    this.lastHash = this.hashConfig(content);
    this.emit('changed', config);
    console.log('[Config] Saved');
  }

  // ─── PATCH CONFIG (partial update) ───────────────────────────────────────
  patchConfig(patch: Partial<IntelligenceConfig>): IntelligenceConfig {
    const config = this.loadConfig();
    const merged = this.deepMerge(config, patch);
    this.saveConfig(merged as IntelligenceConfig);
    return merged as IntelligenceConfig;
  }

  private deepMerge(target: any, source: any): any {
    if (typeof source !== 'object' || source === null) return source;
    if (Array.isArray(source)) return source;
    
    const result = { ...target };
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.deepMerge(result[key] || {}, value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  // ─── HOT RELOAD (watch for changes) ──────────────────────────────────────
  startWatching(): void {
    if (this.watcher) return;
    
    this.watcher = watch(CONFIG_PATH, { persistent: true });
    this.watcher.on('change', () => {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const newHash = this.hashConfig(raw);
      
      if (newHash !== this.lastHash) {
        console.log('[Config] File changed, reloading...');
        const newConfig = this.loadConfig();
        this.emit('changed', newConfig);
      }
    });
    
    console.log('[Config] Watching for changes...');
  }

  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  // ─── SCHEMA ──────────────────────────────────────────────────────────────
  loadSchema(): any {
    try {
      this.schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
      return this.schema;
    } catch {
      return null;
    }
  }

  getSchema(): any {
    return this.schema || this.loadSchema();
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  private hashConfig(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      hash = ((hash << 5) - hash) + content.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(16);
  }

  getConfig(): IntelligenceConfig {
    return this.config || this.loadConfig();
  }

  // ─── CONVENIENCE GETTERS ─────────────────────────────────────────────────
  getEnabledAgents(): AgentConfig[] {
    return this.getConfig().agents.list.filter(a => a.enabled !== false);
  }

  getEnabledWorkflows(): WorkflowConfig[] {
    return this.getConfig().workflows.list.filter(w => w.enabled !== false);
  }

  getEnabledDataSources(): Record<string, DataSourceProvider> {
    const providers = this.getConfig().dataSources.providers;
    return Object.fromEntries(
      Object.entries(providers).filter(([_, p]) => p.enabled !== false)
    );
  }

  getEnabledOutputs(): Record<string, OutputProvider> {
    const providers = this.getConfig().outputs.providers;
    return Object.fromEntries(
      Object.entries(providers).filter(([_, p]) => p.enabled !== false)
    );
  }

  // ─── DEFAULT CONFIG ──────────────────────────────────────────────────────
  private getDefaultConfig(): IntelligenceConfig {
    return {
      instance: { name: '0711-C Intelligence', template: 'default', locale: 'de-DE' },
      dataSources: { providers: {} },
      outputs: { providers: {} },
      agents: {
        defaults: {
          workspace: '~/.0711/workspace',
          model: { primary: 'anthropic/claude-sonnet-4-20250514' },
          thinkingDefault: 'low',
        },
        list: [],
      },
      workflows: { list: [] },
      skills: { bundled: [], workspace: '~/.0711/workspace/skills/' },
      ui: {
        template: 'default',
        theme: 'light',
        branding: { primaryColor: '#3B82F6' },
        dashboard: { showKPIs: true, showRecentActivity: true, showQuickActions: true },
      },
      auth: { mode: 'password' },
    };
  }
}

// Singleton export
export const configService = new ConfigService();
export default configService;
