/**
 * Agent Types with MCP Integration
 * 0711-C-Intelligence
 */

export interface AgentMCPAccess {
  // DataSource ID -> Tool access config
  [dataSourceId: string]: {
    // Allowed tools (supports wildcards: "search_*", "*")
    allowedTools: string[];
    // Rate limiting
    rateLimit?: string;  // "100/hour", "1000/day"
    // Max tokens per request
    maxTokens?: number;
  };
}

export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  model?: {
    primary?: string;
    fallbacks?: string[];
  };
  
  // MCP Data Access
  mcpAccess?: AgentMCPAccess;
  
  // Skills/Tools
  skills?: string[];
  
  // Behavior
  temperature?: number;
  maxTokens?: number;
  
  // State
  published?: boolean;
  enabled?: boolean;
}

// Tool call tracking for rate limiting
export interface ToolCallRecord {
  agentId: string;
  dataSource: string;
  tool: string;
  timestamp: number;
  success: boolean;
}

// Check if a tool pattern matches
export function matchesToolPattern(toolName: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern === toolName) return true;
  
  // Wildcard matching: "search_*" matches "search_products", "search_similar"
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return toolName.startsWith(prefix);
  }
  
  return false;
}

// Check if agent can access a tool
export function canAccessTool(
  agent: AgentConfig,
  dataSourceId: string,
  toolName: string
): boolean {
  const access = agent.mcpAccess?.[dataSourceId];
  if (!access) return false;
  
  return access.allowedTools.some(pattern => 
    matchesToolPattern(toolName, pattern)
  );
}
