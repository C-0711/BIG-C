import { DataConnector, ConnectorType, Schema, FieldMapping, SyncResult } from './types';

export abstract class BaseConnector implements DataConnector {
  id: string;
  name: string;
  type: ConnectorType;
  protected config: Record<string, any> = {};
  protected connected: boolean = false;

  constructor(id: string, name: string, type: ConnectorType) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  abstract connect(config: Record<string, any>): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract testConnection(): Promise<boolean>;
  abstract getSchema(): Promise<Schema>;
  abstract sync(mapping: FieldMapping[]): Promise<SyncResult>;
  abstract preview(limit?: number): Promise<any[]>;

  protected ensureConnected(): void {
    if (!this.connected) {
      throw new Error(`Connector ${this.name} is not connected`);
    }
  }
}
