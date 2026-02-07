// Data Source Connector Types

export interface ConnectorConfig {
  id: string;
  name: string;
  type: ConnectorType;
  config: Record<string, any>;
  schedule?: CronSchedule;
}

export type ConnectorType = 'csv' | 'excel' | 'json' | 'bmecat' | 'etim' | 'rest' | 'graphql' | 'postgres' | 'mysql' | 'mongodb';

export interface CronSchedule {
  expression: string;  // cron expression
  timezone?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: SyncError[];
  duration: number;  // ms
  timestamp: Date;
}

export interface SyncError {
  row?: number;
  field?: string;
  message: string;
  data?: any;
}

export interface FieldMapping {
  source: string;
  target: string;
  transform?: string;  // optional transform function name
}

export interface Schema {
  fields: SchemaField[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  nullable: boolean;
  sample?: any;
}

export interface DataConnector {
  id: string;
  name: string;
  type: ConnectorType;
  
  // Lifecycle
  connect(config: Record<string, any>): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;
  
  // Schema
  getSchema(): Promise<Schema>;
  
  // Sync
  sync(mapping: FieldMapping[]): Promise<SyncResult>;
  
  // Preview
  preview(limit?: number): Promise<any[]>;
}

// MCP-specific types
export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  mimeType?: string;
}
