// Types
export * from './types';

// Base
export { BaseConnector } from './BaseConnector';

// File Connectors
export { CSVConnector } from './file/CSVConnector';

// MCP Connector
export { MCPConnector, MCP_TEMPLATES } from './mcp/MCPConnector';

// Factory
import { DataConnector, ConnectorType } from './types';
import { CSVConnector } from './file/CSVConnector';
import { MCPConnector } from './mcp/MCPConnector';

export type ExtendedConnectorType = ConnectorType | 'mcp';

export function createConnector(type: ExtendedConnectorType, id: string, name: string): DataConnector {
  switch (type) {
    case 'csv':
      return new CSVConnector(id, name);
    case 'mcp':
      return new MCPConnector(id, name) as unknown as DataConnector;
    default:
      throw new Error(`Unknown connector type: ${type}`);
  }
}
