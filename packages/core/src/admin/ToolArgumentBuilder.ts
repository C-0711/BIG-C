/**
 * ToolArgumentBuilder - Build form arguments from MCP tool schemas
 * Sprint 3.2 - Widget Admin
 */

import { MCPToolSchema, JSONSchemaProperty } from '../mcp/MCPClient';
import { FormField, parseToolSchema } from '../mcp/ToolSchemaParser';

export interface ArgumentValue {
  name: string;
  value: unknown;
  valid: boolean;
  error?: string;
}

export interface ArgumentBuilderState {
  tool: string;
  fields: FormField[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Set<string>;
}

export class ToolArgumentBuilder {
  private state: ArgumentBuilderState;

  constructor(toolSchema?: MCPToolSchema) {
    this.state = {
      tool: '',
      fields: [],
      values: {},
      errors: {},
      touched: new Set(),
    };

    if (toolSchema) {
      this.setTool(toolSchema);
    }
  }

  /**
   * Set the tool schema
   */
  setTool(schema: MCPToolSchema): void {
    const parsed = parseToolSchema(schema);
    
    this.state = {
      tool: schema.name,
      fields: parsed.inputFields,
      values: this.getDefaultValues(parsed.inputFields),
      errors: {},
      touched: new Set(),
    };
  }

  /**
   * Get current state
   */
  getState(): ArgumentBuilderState {
    return { ...this.state };
  }

  /**
   * Get all fields
   */
  getFields(): FormField[] {
    return [...this.state.fields];
  }

  /**
   * Get current values
   */
  getValues(): Record<string, unknown> {
    return { ...this.state.values };
  }

  /**
   * Set a field value
   */
  setValue(name: string, value: unknown): void {
    this.state.values[name] = value;
    this.state.touched.add(name);
    
    // Validate field
    const field = this.state.fields.find(f => f.name === name);
    if (field) {
      const error = this.validateField(field, value);
      if (error) {
        this.state.errors[name] = error;
      } else {
        delete this.state.errors[name];
      }
    }
  }

  /**
   * Set multiple values
   */
  setValues(values: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(values)) {
      this.setValue(name, value);
    }
  }

  /**
   * Get a field value
   */
  getValue(name: string): unknown {
    return this.state.values[name];
  }

  /**
   * Get field error
   */
  getError(name: string): string | undefined {
    return this.state.errors[name];
  }

  /**
   * Check if field has been touched
   */
  isTouched(name: string): boolean {
    return this.state.touched.has(name);
  }

  /**
   * Mark field as touched
   */
  touch(name: string): void {
    this.state.touched.add(name);
  }

  /**
   * Validate all fields
   */
  validate(): boolean {
    this.state.errors = {};
    
    for (const field of this.state.fields) {
      const value = this.state.values[field.name];
      const error = this.validateField(field, value);
      
      if (error) {
        this.state.errors[field.name] = error;
      }
    }
    
    return Object.keys(this.state.errors).length === 0;
  }

  /**
   * Check if form is valid
   */
  isValid(): boolean {
    return Object.keys(this.state.errors).length === 0;
  }

  /**
   * Get validation errors
   */
  getErrors(): Record<string, string> {
    return { ...this.state.errors };
  }

  /**
   * Reset to default values
   */
  reset(): void {
    this.state.values = this.getDefaultValues(this.state.fields);
    this.state.errors = {};
    this.state.touched.clear();
  }

  /**
   * Build final tool arguments
   */
  buildArguments(): Record<string, unknown> {
    const args: Record<string, unknown> = {};
    
    for (const field of this.state.fields) {
      const value = this.state.values[field.name];
      
      // Skip undefined optional fields
      if (value === undefined && !field.required) {
        continue;
      }
      
      // Include required fields and defined optional fields
      if (field.required || value !== undefined) {
        args[field.name] = value;
      }
    }
    
    return args;
  }

  /**
   * Get default values from fields
   */
  private getDefaultValues(fields: FormField[]): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    
    for (const field of fields) {
      if (field.defaultValue !== undefined) {
        values[field.name] = field.defaultValue;
      } else if (field.type === 'boolean') {
        values[field.name] = false;
      } else if (field.type === 'number') {
        values[field.name] = field.min ?? 0;
      } else if (field.type === 'array') {
        values[field.name] = [];
      } else if (field.type === 'object') {
        values[field.name] = {};
      }
    }
    
    return values;
  }

  /**
   * Validate a single field
   */
  private validateField(field: FormField, value: unknown): string | undefined {
    // Required check
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }
    
    // Skip further validation for empty optional fields
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    
    // Type-specific validation
    switch (field.type) {
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `${field.label} must be a number`;
        }
        if (field.min !== undefined && value < field.min) {
          return `${field.label} must be at least ${field.min}`;
        }
        if (field.max !== undefined && value > field.max) {
          return `${field.label} must be at most ${field.max}`;
        }
        break;
        
      case 'select':
        if (field.options && !field.options.some(o => o.value === value)) {
          return `Invalid selection for ${field.label}`;
        }
        break;
        
      case 'array':
        if (!Array.isArray(value)) {
          return `${field.label} must be an array`;
        }
        break;
        
      case 'object':
        if (typeof value !== 'object') {
          return `${field.label} must be an object`;
        }
        break;
    }
    
    return undefined;
  }
}

/**
 * Create a builder from a tool schema
 */
export function createArgumentBuilder(schema: MCPToolSchema): ToolArgumentBuilder {
  return new ToolArgumentBuilder(schema);
}
