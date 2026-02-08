/**
 * ToolSchemaParser - Parse MCP tool schemas into form fields
 * Sprint 2.1 - MCP Integration
 */

import { MCPToolSchema, JSONSchemaProperty } from './MCPClient';

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'boolean' 
  | 'select' 
  | 'multiselect'
  | 'array'
  | 'object'
  | 'textarea';

export interface FormField {
  name: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  items?: FormField; // For array types
  fields?: FormField[]; // For object types
}

export interface ParsedToolSchema {
  name: string;
  description: string;
  inputFields: FormField[];
  outputFields: FormField[];
  category?: string;
}

/**
 * Parse a JSON Schema property into a form field
 */
function parseProperty(
  name: string,
  prop: JSONSchemaProperty,
  required: boolean
): FormField {
  const field: FormField = {
    name,
    type: mapSchemaTypeToFieldType(prop),
    label: formatLabel(name),
    description: prop.description,
    required,
    defaultValue: prop.default,
  };

  // Handle enum values
  if (prop.enum) {
    field.type = 'select';
    field.options = prop.enum.map(v => ({ value: v, label: formatLabel(v) }));
  }

  // Handle number constraints
  if (prop.type === 'number' || prop.type === 'integer') {
    field.min = prop.minimum;
    field.max = prop.maximum;
  }

  // Handle array items
  if (prop.type === 'array' && prop.items) {
    field.items = parseProperty('item', prop.items, false);
  }

  // Handle nested objects
  if (prop.type === 'object' && prop.properties) {
    field.fields = Object.entries(prop.properties).map(([key, value]) =>
      parseProperty(key, value, false)
    );
  }

  return field;
}

/**
 * Map JSON Schema type to form field type
 */
function mapSchemaTypeToFieldType(prop: JSONSchemaProperty): FieldType {
  if (prop.enum) return 'select';
  
  switch (prop.type) {
    case 'string':
      // Use textarea for long descriptions
      if (prop.description?.toLowerCase().includes('query') ||
          prop.description?.toLowerCase().includes('text')) {
        return 'textarea';
      }
      return 'text';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    default:
      return 'text';
  }
}

/**
 * Format a camelCase or snake_case name to a readable label
 */
function formatLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\s/, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Parse an MCP tool schema into form fields
 */
export function parseToolSchema(tool: MCPToolSchema): ParsedToolSchema {
  const inputFields: FormField[] = [];
  const outputFields: FormField[] = [];

  // Parse input schema
  if (tool.inputSchema?.properties) {
    const required = tool.inputSchema.required || [];
    
    for (const [name, prop] of Object.entries(tool.inputSchema.properties)) {
      inputFields.push(parseProperty(name, prop, required.includes(name)));
    }
  }

  // Parse output schema
  if (tool.outputSchema?.properties) {
    for (const [name, prop] of Object.entries(tool.outputSchema.properties)) {
      outputFields.push(parseProperty(name, prop, false));
    }
  }

  return {
    name: tool.name,
    description: tool.description || '',
    inputFields,
    outputFields,
    category: categorizeToolName(tool.name),
  };
}

/**
 * Categorize a tool based on its name
 */
function categorizeToolName(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('search') || lowerName.includes('find')) {
    return 'Search & Discovery';
  }
  if (lowerName.includes('get_product') || lowerName.includes('factsheet')) {
    return 'Product Details';
  }
  if (lowerName.includes('etim') || lowerName.includes('family') || lowerName.includes('terminology')) {
    return 'Classification';
  }
  if (lowerName.includes('statistic') || lowerName.includes('aggregate') || 
      lowerName.includes('compatibility') || lowerName.includes('lineage') || 
      lowerName.includes('ecosystem')) {
    return 'Analytics';
  }
  if (lowerName.includes('sql') || lowerName.includes('cypher')) {
    return 'Data Access';
  }
  if (lowerName.includes('catalog')) {
    return 'Catalogs';
  }
  if (lowerName.includes('media') || lowerName.includes('image') || lowerName.includes('document')) {
    return 'Media & Documents';
  }
  
  return 'Other';
}

/**
 * Group tools by category
 */
export function groupToolsByCategory(tools: MCPToolSchema[]): Record<string, ParsedToolSchema[]> {
  const grouped: Record<string, ParsedToolSchema[]> = {};
  
  for (const tool of tools) {
    const parsed = parseToolSchema(tool);
    const category = parsed.category || 'Other';
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(parsed);
  }
  
  return grouped;
}

/**
 * Generate form data from field values
 */
export function generateToolParams(
  fields: FormField[],
  values: Record<string, unknown>
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  
  for (const field of fields) {
    const value = values[field.name];
    
    // Skip undefined optional fields
    if (value === undefined && !field.required) {
      continue;
    }
    
    // Include required fields even if empty
    if (field.required || value !== undefined) {
      params[field.name] = value ?? field.defaultValue;
    }
  }
  
  return params;
}
