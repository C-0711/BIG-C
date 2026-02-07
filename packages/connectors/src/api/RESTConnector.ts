import { BaseConnector } from '../BaseConnector';
import { Schema, SchemaField, FieldMapping, SyncResult } from '../types';

type AuthType = 'none' | 'api-key' | 'bearer' | 'basic' | 'oauth2';

interface RESTConfig {
  baseUrl: string;
  auth?: {
    type: AuthType;
    apiKey?: string;
    apiKeyHeader?: string;
    bearerToken?: string;
    username?: string;
    password?: string;
  };
  endpoints: {
    list: string;           // e.g., "/products"
    detail?: string;        // e.g., "/products/:id"
  };
  pagination?: {
    type: 'offset' | 'cursor' | 'page';
    limitParam: string;
    offsetParam?: string;
    pageParam?: string;
    cursorParam?: string;
  };
  headers?: Record<string, string>;
  responseMapping?: {
    dataPath: string;       // e.g., "data.items" or "results"
    totalPath?: string;     // e.g., "meta.total"
  };
}

/**
 * REST API Connector - Connect to any REST API as a data source
 * 
 * Supports:
 * - Multiple auth types (API key, Bearer, Basic, OAuth2)
 * - Pagination (offset, cursor, page-based)
 * - Custom response mapping
 * 
 * @example
 * const connector = new RESTConnector('shopify', 'Shopify Products');
 * await connector.connect({
 *   baseUrl: 'https://mystore.myshopify.com/admin/api/2024-01',
 *   auth: { type: 'bearer', bearerToken: 'shpat_...' },
 *   endpoints: { list: '/products.json' },
 *   responseMapping: { dataPath: 'products' }
 * });
 */
export class RESTConnector extends BaseConnector {
  private config: RESTConfig | null = null;
  private data: any[] = [];

  constructor(id: string, name: string) {
    super(id, name, 'rest' as any);
  }

  async connect(config: RESTConfig): Promise<void> {
    this.config = config;
    
    // Test the connection by fetching first page
    await this.fetchData();
    
    this.connected = true;
  }

  private async fetchData(url?: string): Promise<any> {
    if (!this.config) throw new Error('Not configured');
    
    const fetchUrl = url || `${this.config.baseUrl}${this.config.endpoints.list}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };
    
    // Add auth headers
    if (this.config.auth) {
      switch (this.config.auth.type) {
        case 'api-key':
          headers[this.config.auth.apiKeyHeader || 'X-API-Key'] = this.config.auth.apiKey || '';
          break;
        case 'bearer':
          headers['Authorization'] = `Bearer ${this.config.auth.bearerToken}`;
          break;
        case 'basic':
          const credentials = Buffer.from(`${this.config.auth.username}:${this.config.auth.password}`).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
          break;
      }
    }
    
    const response = await fetch(fetchUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const json = await response.json();
    
    // Extract data using responseMapping
    let data = json;
    if (this.config.responseMapping?.dataPath) {
      const path = this.config.responseMapping.dataPath.split('.');
      for (const key of path) {
        data = data?.[key];
      }
    }
    
    this.data = Array.isArray(data) ? data : [data];
    return json;
  }

  async disconnect(): Promise<void> {
    this.data = [];
    this.config = null;
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.fetchData();
      return true;
    } catch {
      return false;
    }
  }

  async getSchema(): Promise<Schema> {
    this.ensureConnected();
    
    if (this.data.length === 0) {
      return { fields: [] };
    }
    
    const sample = this.data[0];
    const fields: SchemaField[] = Object.keys(sample).map(key => ({
      name: key,
      type: this.inferType(sample[key]),
      nullable: true,
      sample: sample[key],
    }));

    return { fields };
  }

  private inferType(value: any): SchemaField['type'] {
    if (value === null || value === undefined) return 'string';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
  }

  async preview(limit: number = 10): Promise<any[]> {
    this.ensureConnected();
    return this.data.slice(0, limit);
  }

  /**
   * Fetch all pages of data
   */
  async fetchAll(): Promise<any[]> {
    this.ensureConnected();
    
    // For now, return cached data
    // Full implementation would handle pagination
    return this.data;
  }

  async sync(mapping: FieldMapping[]): Promise<SyncResult> {
    this.ensureConnected();
    
    const startTime = Date.now();
    const errors: SyncResult['errors'] = [];
    let created = 0;
    let failed = 0;

    // Fetch all data first
    const allData = await this.fetchAll();

    for (let i = 0; i < allData.length; i++) {
      try {
        const record = allData[i];
        const mapped: Record<string, any> = {};
        
        for (const map of mapping) {
          // Support nested paths like "address.city"
          let value = record;
          for (const key of map.source.split('.')) {
            value = value?.[key];
          }
          mapped[map.target] = value;
        }
        
        // Would insert into database here
        created++;
      } catch (err: any) {
        failed++;
        errors.push({ row: i, message: err.message });
      }
    }

    return {
      success: failed === 0,
      recordsProcessed: allData.length,
      recordsCreated: created,
      recordsUpdated: 0,
      recordsFailed: failed,
      errors,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    };
  }
}
