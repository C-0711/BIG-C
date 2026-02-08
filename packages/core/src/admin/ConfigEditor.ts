/**
 * ConfigEditor - Widget configuration editing utilities
 * Sprint 3.2 - Widget Admin
 */

import { WidgetConfig } from '../widgets/WidgetConfig';

export interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigError[];
}

export interface ConfigError {
  path: string;
  message: string;
  type: 'error' | 'warning';
}

export interface ConfigDiff {
  path: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Parse JSON safely
 */
export function parseJSON<T = unknown>(json: string): { success: true; data: T } | { success: false; error: string } {
  try {
    return { success: true, data: JSON.parse(json) as T };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

/**
 * Stringify with formatting
 */
export function formatJSON(obj: unknown, indent = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get a value at a path (e.g., "settings.limit")
 */
export function getAtPath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  
  return current;
}

/**
 * Set a value at a path
 */
export function setAtPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  
  current[parts[parts.length - 1]] = value;
}

/**
 * Delete a value at a path
 */
export function deleteAtPath(obj: Record<string, unknown>, path: string): boolean {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      return false;
    }
    current = current[part] as Record<string, unknown>;
  }
  
  const lastPart = parts[parts.length - 1];
  if (lastPart in current) {
    delete current[lastPart];
    return true;
  }
  
  return false;
}

/**
 * Compare two configs and return differences
 */
export function diffConfigs(oldConfig: unknown, newConfig: unknown, path = ''): ConfigDiff[] {
  const diffs: ConfigDiff[] = [];
  
  if (typeof oldConfig !== typeof newConfig) {
    diffs.push({ path: path || 'root', oldValue: oldConfig, newValue: newConfig });
    return diffs;
  }
  
  if (typeof oldConfig !== 'object' || oldConfig === null) {
    if (oldConfig !== newConfig) {
      diffs.push({ path: path || 'root', oldValue: oldConfig, newValue: newConfig });
    }
    return diffs;
  }
  
  const oldObj = oldConfig as Record<string, unknown>;
  const newObj = newConfig as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  
  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;
    
    if (!(key in oldObj)) {
      diffs.push({ path: fullPath, oldValue: undefined, newValue: newObj[key] });
    } else if (!(key in newObj)) {
      diffs.push({ path: fullPath, oldValue: oldObj[key], newValue: undefined });
    } else {
      diffs.push(...diffConfigs(oldObj[key], newObj[key], fullPath));
    }
  }
  
  return diffs;
}

/**
 * Merge two configs (deep merge)
 */
export function mergeConfigs<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = deepClone(base);
  
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      (result as Record<string, unknown>)[key] = mergeConfigs(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      (result as Record<string, unknown>)[key] = deepClone(value);
    }
  }
  
  return result;
}

/**
 * Validate a widget config against a schema
 */
export function validateConfig(
  config: unknown,
  schema?: Record<string, unknown>
): ConfigValidationResult {
  const errors: ConfigError[] = [];
  
  if (typeof config !== 'object' || config === null) {
    errors.push({
      path: '',
      message: 'Configuration must be an object',
      type: 'error',
    });
    return { valid: false, errors };
  }
  
  const c = config as WidgetConfig;
  
  // Required fields
  if (!c.type) {
    errors.push({
      path: 'type',
      message: 'Widget type is required',
      type: 'error',
    });
  }
  
  // Type validation
  if (c.id !== undefined && typeof c.id !== 'string') {
    errors.push({
      path: 'id',
      message: 'ID must be a string',
      type: 'error',
    });
  }
  
  if (c.title !== undefined && typeof c.title !== 'string') {
    errors.push({
      path: 'title',
      message: 'Title must be a string',
      type: 'error',
    });
  }
  
  // Settings validation
  if (c.settings !== undefined && typeof c.settings !== 'object') {
    errors.push({
      path: 'settings',
      message: 'Settings must be an object',
      type: 'error',
    });
  }
  
  // Layout validation
  if (c.layout !== undefined) {
    if (typeof c.layout !== 'object') {
      errors.push({
        path: 'layout',
        message: 'Layout must be an object',
        type: 'error',
      });
    }
  }
  
  return {
    valid: errors.filter(e => e.type === 'error').length === 0,
    errors,
  };
}

/**
 * Get all paths in an object
 */
export function getAllPaths(obj: unknown, prefix = ''): string[] {
  const paths: string[] = [];
  
  if (typeof obj !== 'object' || obj === null) {
    return paths;
  }
  
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    paths.push(path);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      paths.push(...getAllPaths(value, path));
    }
  }
  
  return paths;
}
