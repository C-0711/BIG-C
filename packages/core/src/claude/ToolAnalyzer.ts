/**
 * ToolAnalyzer - Claude-powered MCP tool analysis
 * Sprint 4.1 - Claude Integration
 */

import { ClaudeClient } from './ClaudeClient';
import { MCPToolSchema } from '../mcp/MCPClient';

export interface ToolCategory {
  name: string;
  description: string;
  tools: string[];
  icon?: string;
}

export interface ToolCluster {
  name: string;
  description: string;
  tools: string[];
  suggestedWidget?: string;
  suggestedSkill?: string;
}

export interface ToolAnalysis {
  categories: ToolCategory[];
  clusters: ToolCluster[];
  relationships: ToolRelationship[];
  summary: string;
}

export interface ToolRelationship {
  from: string;
  to: string;
  type: 'input-output' | 'complementary' | 'sequential' | 'alternative';
  description: string;
}

export interface WidgetSuggestion {
  type: string;
  name: string;
  description: string;
  tools: string[];
  category: string;
  events: {
    emits: string[];
    subscribes: string[];
  };
  defaultConfig: Record<string, unknown>;
  priority: 'high' | 'medium' | 'low';
}

export interface SkillSuggestion {
  name: string;
  description: string;
  tools: string[];
  steps: SkillStepSuggestion[];
  triggers: string[];
  outputs: string[];
}

export interface SkillStepSuggestion {
  tool: string;
  description: string;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
}

const TOOL_ANALYSIS_SYSTEM = `You are an expert at analyzing MCP (Model Context Protocol) tools for a product information system.

Your task is to analyze tool schemas and:
1. Categorize tools by their function
2. Identify tool clusters that work well together
3. Suggest widgets and skills based on tool combinations
4. Identify relationships between tools

Respond with structured JSON only.`;

const WIDGET_SUGGESTION_SYSTEM = `You are an expert at designing UI widgets for product information systems.

Given a set of MCP tools, suggest widgets that would provide value to users.
Each widget should:
- Have a clear purpose
- Use 1-3 MCP tools
- Define events it emits and subscribes to
- Include sensible default configuration

Respond with structured JSON only.`;

const SKILL_SUGGESTION_SYSTEM = `You are an expert at designing automated workflows (skills) for product information systems.

Given a set of MCP tools, suggest skills that chain tools together for common use cases.
Each skill should:
- Have a clear business purpose
- Chain 2-5 tools in sequence
- Define triggers (events or user actions)
- Map outputs from one tool to inputs of the next

Respond with structured JSON only.`;

export class ToolAnalyzer {
  private claude: ClaudeClient;
  private cache: Map<string, ToolAnalysis> = new Map();

  constructor(claude: ClaudeClient) {
    this.claude = claude;
  }

  /**
   * Analyze a set of MCP tools
   */
  async analyzeTools(tools: MCPToolSchema[]): Promise<ToolAnalysis> {
    const cacheKey = this.getCacheKey(tools);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const toolSummary = tools.map(t => ({
      name: t.name,
      description: t.description,
      inputs: t.inputSchema?.properties ? Object.keys(t.inputSchema.properties) : [],
      outputs: t.outputSchema?.properties ? Object.keys(t.outputSchema.properties) : [],
    }));

    const prompt = `Analyze these MCP tools for a product information system:

${JSON.stringify(toolSummary, null, 2)}

Return a JSON object with:
{
  "categories": [{ "name": string, "description": string, "tools": string[], "icon": string }],
  "clusters": [{ "name": string, "description": string, "tools": string[], "suggestedWidget": string, "suggestedSkill": string }],
  "relationships": [{ "from": string, "to": string, "type": "input-output"|"complementary"|"sequential"|"alternative", "description": string }],
  "summary": string
}`;

    const analysis = await this.claude.completeJSON<ToolAnalysis>(prompt, TOOL_ANALYSIS_SYSTEM);
    this.cache.set(cacheKey, analysis);
    
    return analysis;
  }

  /**
   * Suggest widgets based on tools
   */
  async suggestWidgets(tools: MCPToolSchema[], existingWidgets?: string[]): Promise<WidgetSuggestion[]> {
    const toolSummary = tools.map(t => ({
      name: t.name,
      description: t.description,
      inputs: t.inputSchema?.properties ? Object.keys(t.inputSchema.properties) : [],
    }));

    const prompt = `Given these MCP tools:

${JSON.stringify(toolSummary, null, 2)}

${existingWidgets?.length ? `Already existing widgets: ${existingWidgets.join(', ')}` : ''}

Suggest widgets that would provide value. Return a JSON array:
[{
  "type": string (kebab-case, e.g., "product-search"),
  "name": string (display name),
  "description": string,
  "tools": string[] (1-3 tool names),
  "category": string,
  "events": { "emits": string[], "subscribes": string[] },
  "defaultConfig": object,
  "priority": "high"|"medium"|"low"
}]

Suggest 5-10 widgets, prioritizing high-value combinations.`;

    return this.claude.completeJSON<WidgetSuggestion[]>(prompt, WIDGET_SUGGESTION_SYSTEM);
  }

  /**
   * Suggest skills based on tools
   */
  async suggestSkills(tools: MCPToolSchema[], existingSkills?: string[]): Promise<SkillSuggestion[]> {
    const toolSummary = tools.map(t => ({
      name: t.name,
      description: t.description,
      inputs: t.inputSchema?.properties,
      outputs: t.outputSchema?.properties,
    }));

    const prompt = `Given these MCP tools:

${JSON.stringify(toolSummary, null, 2)}

${existingSkills?.length ? `Already existing skills: ${existingSkills.join(', ')}` : ''}

Suggest skills (automated workflows) that chain tools together. Return a JSON array:
[{
  "name": string,
  "description": string,
  "tools": string[],
  "steps": [{ "tool": string, "description": string, "inputMapping": object, "outputMapping": object }],
  "triggers": string[] (events that trigger this skill),
  "outputs": string[] (what this skill produces)
}]

Suggest 5-8 skills for common product information use cases.`;

    return this.claude.completeJSON<SkillSuggestion[]>(prompt, SKILL_SUGGESTION_SYSTEM);
  }

  /**
   * Get widget configuration suggestions
   */
  async suggestWidgetConfig(
    widgetType: string,
    tools: MCPToolSchema[],
    context?: string
  ): Promise<Record<string, unknown>> {
    const toolsForWidget = tools.filter(t => 
      t.name.includes(widgetType.replace(/-/g, '_')) ||
      widgetType.includes(t.name.replace(/_/g, '-'))
    );

    const prompt = `For a "${widgetType}" widget using these tools:

${JSON.stringify(toolsForWidget.map(t => ({ name: t.name, inputs: t.inputSchema?.properties })), null, 2)}

${context ? `Context: ${context}` : ''}

Suggest a default configuration object with sensible defaults for common use cases.
Return a JSON object with the configuration.`;

    return this.claude.completeJSON<Record<string, unknown>>(prompt);
  }

  /**
   * Clear the analysis cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  private getCacheKey(tools: MCPToolSchema[]): string {
    return tools.map(t => t.name).sort().join(',');
  }
}
