// Types
export * from './types';

// Base
export { BaseConnector } from './BaseConnector';

// File Connectors
export { CSVConnector } from './file/CSVConnector';
export { ExcelConnector } from './file/ExcelConnector';

// Feed Connectors
export { BMEcatConnector } from './feed/BMEcatConnector';

// API Connectors
export { RESTConnector } from './api/RESTConnector';

// MCP Connector
export { MCPConnector, MCP_TEMPLATES } from './mcp/MCPConnector';

// Factory
import { DataConnector, ConnectorType } from './types';
import { CSVConnector } from './file/CSVConnector';
import { ExcelConnector } from './file/ExcelConnector';
import { BMEcatConnector } from './feed/BMEcatConnector';
import { RESTConnector } from './api/RESTConnector';
import { MCPConnector } from './mcp/MCPConnector';

export type ExtendedConnectorType = ConnectorType | 'mcp' | 'excel' | 'bmecat' | 'rest';

export function createConnector(type: ExtendedConnectorType, id: string, name: string): DataConnector {
  switch (type) {
    case 'csv':
      return new CSVConnector(id, name);
    case 'excel':
      return new ExcelConnector(id, name) as unknown as DataConnector;
    case 'bmecat':
      return new BMEcatConnector(id, name) as unknown as DataConnector;
    case 'rest':
      return new RESTConnector(id, name) as unknown as DataConnector;
    case 'mcp':
      return new MCPConnector(id, name) as unknown as DataConnector;
    default:
      throw new Error(`Unknown connector type: ${type}`);
  }
}

// Connector metadata for UI
export const CONNECTOR_TYPES = [
  { type: 'csv', name: 'CSV File', icon: 'FileSpreadsheet', category: 'file' },
  { type: 'excel', name: 'Excel File', icon: 'FileSpreadsheet', category: 'file' },
  { type: 'bmecat', name: 'BMEcat XML', icon: 'FileCode', category: 'feed' },
  { type: 'rest', name: 'REST API', icon: 'Globe', category: 'api' },
  { type: 'mcp', name: 'MCP Server', icon: 'Plug', category: 'mcp' },
] as const;
