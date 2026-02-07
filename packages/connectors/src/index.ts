// Types
export * from './types';

// Base
export { BaseConnector } from './BaseConnector';

// File Connectors
export { CSVConnector } from './file/CSVConnector';

// Factory
import { DataConnector, ConnectorType } from './types';
import { CSVConnector } from './file/CSVConnector';

export function createConnector(type: ConnectorType, id: string, name: string): DataConnector {
  switch (type) {
    case 'csv':
      return new CSVConnector(id, name);
    // Add more connectors here
    default:
      throw new Error(\`Unknown connector type: \${type}\`);
  }
}
