import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { BaseConnector } from '../BaseConnector';
import { Schema, SchemaField, FieldMapping, SyncResult } from '../types';

export class ExcelConnector extends BaseConnector {
  private filePath: string = '';
  private sheetName: string = '';
  private headers: string[] = [];
  private data: any[] = [];
  private workbook: XLSX.WorkBook | null = null;

  constructor(id: string, name: string) {
    super(id, name, 'excel');
  }

  async connect(config: { filePath: string; sheetName?: string }): Promise<void> {
    this.filePath = config.filePath;
    
    // Read Excel file
    const buffer = fs.readFileSync(this.filePath);
    this.workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Use specified sheet or first sheet
    this.sheetName = config.sheetName || this.workbook.SheetNames[0];
    const sheet = this.workbook.Sheets[this.sheetName];
    
    // Convert to JSON
    this.data = XLSX.utils.sheet_to_json(sheet);
    
    if (this.data.length > 0) {
      this.headers = Object.keys(this.data[0]);
    }
    
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.data = [];
    this.headers = [];
    this.workbook = null;
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      return fs.existsSync(this.filePath);
    } catch {
      return false;
    }
  }

  /**
   * Get available sheet names
   */
  getSheetNames(): string[] {
    return this.workbook?.SheetNames || [];
  }

  async getSchema(): Promise<Schema> {
    this.ensureConnected();
    
    const fields: SchemaField[] = this.headers.map(header => {
      const sample = this.data[0]?.[header];
      return {
        name: header,
        type: this.inferType(sample),
        nullable: this.data.some(row => row[header] === null || row[header] === undefined),
        sample,
      };
    });

    return { fields };
  }

  private inferType(value: any): SchemaField['type'] {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (!isNaN(Number(value))) return 'number';
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
        
        // Would insert into database here
        created++;
      } catch (err: any) {
        failed++;
        errors.push({ row: i, message: err.message });
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
