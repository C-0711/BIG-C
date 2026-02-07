import { parse } from 'csv-parse';
import * as fs from 'fs';
import { BaseConnector } from '../BaseConnector';
import { Schema, SchemaField, FieldMapping, SyncResult } from '../types';

export class CSVConnector extends BaseConnector {
  private filePath: string = '';
  private delimiter: string = ',';
  private headers: string[] = [];
  private data: any[] = [];

  constructor(id: string, name: string) {
    super(id, name, 'csv');
  }

  async connect(config: { filePath: string; delimiter?: string }): Promise<void> {
    this.filePath = config.filePath;
    this.delimiter = config.delimiter || ',';
    
    // Read and parse CSV
    const content = fs.readFileSync(this.filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      parse(content, {
        delimiter: this.delimiter,
        columns: true,
        skip_empty_lines: true,
      }, (err, records) => {
        if (err) {
          reject(err);
          return;
        }
        this.data = records;
        if (records.length > 0) {
          this.headers = Object.keys(records[0]);
        }
        this.connected = true;
        resolve();
      });
    });
  }

  async disconnect(): Promise<void> {
    this.data = [];
    this.headers = [];
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      return fs.existsSync(this.filePath);
    } catch {
      return false;
    }
  }

  async getSchema(): Promise<Schema> {
    this.ensureConnected();
    
    const fields: SchemaField[] = this.headers.map(header => {
      const sample = this.data[0]?.[header];
      return {
        name: header,
        type: this.inferType(sample),
        nullable: this.data.some(row => !row[header]),
        sample,
      };
    });

    return { fields };
  }

  private inferType(value: any): SchemaField['type'] {
    if (value === null || value === undefined) return 'string';
    if (!isNaN(Number(value))) return 'number';
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(Date.parse(value))) return 'date';
    return 'string';
  }

  async preview(limit: number = 10): Promise<any[]> {
    this.ensureConnected();
    return this.data.slice(0, limit);
  }

  async sync(mapping: FieldMapping[]): Promise<SyncResult> {
    this.ensureConnected();
    
    const startTime = Date.now();
    const errors: SyncResult['errors'] = [];
    let created = 0;
    let failed = 0;

    for (let i = 0; i < this.data.length; i++) {
      try {
        const row = this.data[i];
        const mapped: Record<string, any> = {};
        
        for (const map of mapping) {
          mapped[map.target] = row[map.source];
        }
        
        // Here you would insert into your database
        // For now, we just count
        created++;
      } catch (err: any) {
        failed++;
        errors.push({
          row: i,
          message: err.message,
        });
      }
    }

    return {
      success: failed === 0,
      recordsProcessed: this.data.length,
      recordsCreated: created,
      recordsUpdated: 0,
      recordsFailed: failed,
      errors,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    };
  }
}
