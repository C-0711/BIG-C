/**
 * Workspace Config Loader
 *
 * Loads a workspace template from configs/{workspace}/ and resolves
 * $include directives, environment variables, and directory includes.
 *
 * Workspace structure:
 *   configs/{name}/workspace.json   — master config
 *   configs/{name}/agents/*.json    — agent definitions
 *   configs/{name}/workflows/*.json — workflow definitions
 *   configs/{name}/dashboards/*.json — dashboard definitions
 */

import fs from "fs";
import path from "path";

interface WorkspaceConfig {
  id: string;
  name: string;
  version: string;
  [key: string]: any;
}

/**
 * Resolve environment variable references like ${VAR_NAME}
 */
function resolveEnvVars(obj: any): any {
  if (typeof obj === "string") {
    return obj.replace(/\$\{(\w+)\}/g, (_, key) => process.env[key] || "");
  }
  if (Array.isArray(obj)) {
    return obj.map(resolveEnvVars);
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveEnvVars(value);
    }
    return result;
  }
  return obj;
}

/**
 * Load all JSON files from a directory into an array
 */
function loadDirectory(dirPath: string): any[] {
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json")).sort();
  return files.map((f) => {
    const content = fs.readFileSync(path.join(dirPath, f), "utf-8");
    return JSON.parse(content);
  });
}

/**
 * Resolve $include directives.
 * - "$include:agents/" → loads all JSON files from agents/ directory
 * - "$include:file.json" → loads a single JSON file
 */
function resolveIncludes(obj: any, basePath: string): any {
  if (typeof obj === "string" && obj.startsWith("$include:")) {
    const ref = obj.slice("$include:".length);
    const fullPath = path.join(basePath, ref);
    if (ref.endsWith("/")) {
      return loadDirectory(fullPath);
    }
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      return JSON.parse(content);
    }
    console.warn(`[workspace] Include not found: ${fullPath}`);
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => resolveIncludes(item, basePath));
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveIncludes(value, basePath);
    }
    return result;
  }
  return obj;
}

/**
 * Load a complete workspace config from configs/{workspaceId}/
 */
export function loadWorkspace(workspaceId: string, configsDir?: string): WorkspaceConfig | null {
  const baseDir = configsDir || path.join(__dirname, "../../../configs");
  const wsDir = path.join(baseDir, workspaceId);
  const wsFile = path.join(wsDir, "workspace.json");

  if (!fs.existsSync(wsFile)) {
    console.error(`[workspace] Not found: ${wsFile}`);
    return null;
  }

  try {
    const raw = fs.readFileSync(wsFile, "utf-8");
    let config = JSON.parse(raw);

    // Resolve $include directives (agents/, workflows/, dashboards/)
    config = resolveIncludes(config, wsDir);

    // Resolve environment variables
    config = resolveEnvVars(config);

    console.log(
      `[workspace] Loaded "${config.name}" — ` +
        `${config.agents?.list?.length || 0} agents, ` +
        `${config.workflows?.length || 0} workflows, ` +
        `${config.dashboards?.list?.length || 0} dashboards`
    );

    return config;
  } catch (err) {
    console.error(`[workspace] Failed to load ${workspaceId}:`, err);
    return null;
  }
}

/**
 * Generate a runtime config.json from workspace config.
 * Merges workspace settings into the BIG-C config format.
 */
export function workspaceToConfig(workspace: WorkspaceConfig): any {
  return {
    instance: {
      name: workspace.instance?.name || workspace.name,
      template: workspace.id,
      locale: workspace.instance?.locale || "en-US",
    },
    branding: workspace.branding || {},
    agents: {
      defaults: workspace.agents?.defaults || {},
      list: workspace.agents?.list || [],
    },
    workflows: {
      list: (workspace.workflows || []).map((w: any, i: number) => ({
        ...w,
        id: w.id || w.name.toLowerCase().replace(/\s+/g, "-"),
        enabled: true,
      })),
    },
    dashboards: {
      default: workspace.dashboards?.default || null,
      list: workspace.dashboards?.list || [],
    },
    dataSources: workspace.dataSources || { providers: {} },
    skills: workspace.skills || { bundled: [] },
    modules: workspace.modules || {},
    features: workspace.features || {},
    ui: {
      modules: workspace.modules || {},
      features: workspace.features || {},
    },
  };
}

/**
 * List available workspace templates
 */
export function listWorkspaces(configsDir?: string): string[] {
  const baseDir = configsDir || path.join(__dirname, "../../../configs");
  if (!fs.existsSync(baseDir)) return [];
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(baseDir, d.name, "workspace.json")))
    .map((d) => d.name);
}
