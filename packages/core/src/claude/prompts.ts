/**
 * Claude Prompt Templates
 * Sprint 4.1 - Claude Integration
 */

/**
 * System prompts for different tasks
 */
export const SYSTEM_PROMPTS = {
  TOOL_ANALYSIS: `You are an expert at analyzing MCP (Model Context Protocol) tools for product information management systems.

Your role is to:
- Categorize tools by function (search, details, classification, analytics, etc.)
- Identify tool clusters that work well together
- Spot relationships between tools (input/output chains, complements, alternatives)
- Suggest UI components and workflows based on tool capabilities

Always respond with structured, valid JSON. Be concise but thorough.`,

  WIDGET_SUGGESTION: `You are a UI/UX expert specializing in product information dashboards.

Your role is to:
- Design widgets that provide real business value
- Create intuitive user experiences
- Ensure widgets work well together via events
- Balance simplicity with functionality

Consider: product managers, sales teams, technical writers, and data analysts as users.
Always respond with structured, valid JSON.`,

  SKILL_SUGGESTION: `You are a workflow automation expert for product information systems.

Your role is to:
- Design skills (automated workflows) that chain MCP tools
- Identify common use cases that benefit from automation
- Create efficient, error-tolerant workflows
- Map data transformations between tool calls

Skills should save users time and reduce errors.
Always respond with structured, valid JSON.`,

  DASHBOARD_SUGGESTION: `You are a dashboard designer for product information systems.

Your role is to:
- Create dashboard layouts that support common workflows
- Position widgets for optimal user experience
- Configure event wiring between widgets
- Balance information density with usability

Always respond with structured, valid JSON.`,

  AGENT_ASSISTANT: `You are a helpful product information assistant with access to MCP tools.

Your role is to:
- Help users find and understand product information
- Use available tools to answer questions
- Explain technical specifications clearly
- Suggest related products or alternatives when relevant

Be concise, accurate, and helpful. If you're unsure, say so.`,

  CONFIG_HELPER: `You are a configuration assistant for widget setup.

Your role is to:
- Suggest sensible default values
- Explain what each setting does
- Recommend settings based on use case
- Validate configuration consistency

Always respond with structured, valid JSON for configuration objects.`,
};

/**
 * Few-shot examples for better Claude responses
 */
export const FEW_SHOT_EXAMPLES = {
  WIDGET_SUGGESTION: `Example widget suggestion:
{
  "type": "product-comparison",
  "name": "Product Comparison Table",
  "description": "Compare specifications of multiple products side-by-side",
  "tools": ["get_product", "aggregate_product_specs"],
  "category": "Analytics",
  "events": {
    "emits": ["comparison.updated", "comparison.product.removed"],
    "subscribes": ["product.compared", "product.selected"]
  },
  "defaultConfig": {
    "maxProducts": 4,
    "highlightDifferences": true,
    "showImages": true
  },
  "priority": "high"
}`,

  SKILL_SUGGESTION: `Example skill suggestion:
{
  "name": "Complete Product Research",
  "description": "Comprehensive product research combining search, details, similar products, and ecosystem analysis",
  "tools": ["search_products", "get_product", "search_similar_products", "analyze_product_ecosystem"],
  "steps": [
    { "tool": "search_products", "description": "Find matching products", "inputMapping": { "query": "$.input.query" }, "outputMapping": { "products": "$.results" } },
    { "tool": "get_product", "description": "Get details of top result", "inputMapping": { "productId": "$.products[0].id" }, "outputMapping": { "product": "$.detail" } },
    { "tool": "search_similar_products", "description": "Find alternatives", "inputMapping": { "productId": "$.product.id" }, "outputMapping": { "similar": "$.alternatives" } },
    { "tool": "analyze_product_ecosystem", "description": "Map the ecosystem", "inputMapping": { "productId": "$.product.id" }, "outputMapping": { "ecosystem": "$.related" } }
  ],
  "triggers": ["research.requested", "deep_search.initiated"],
  "outputs": ["product", "alternatives", "ecosystem"]
}`,

  DASHBOARD_LAYOUT: `Example dashboard layout:
{
  "name": "Product Research Dashboard",
  "description": "Complete product research and comparison workspace",
  "widgets": [
    { "type": "product-search", "position": { "x": 0, "y": 0, "w": 6, "h": 2 } },
    { "type": "product-detail", "position": { "x": 6, "y": 0, "w": 6, "h": 4 } },
    { "type": "similar-products", "position": { "x": 0, "y": 2, "w": 6, "h": 2 } },
    { "type": "media-gallery", "position": { "x": 0, "y": 4, "w": 4, "h": 3 } },
    { "type": "document-center", "position": { "x": 4, "y": 4, "w": 4, "h": 3 } },
    { "type": "ecosystem-map", "position": { "x": 8, "y": 4, "w": 4, "h": 3 } }
  ],
  "wiring": [
    { "from": "product-search", "event": "product.selected", "to": ["product-detail", "media-gallery", "document-center"] },
    { "from": "product-detail", "event": "product.detail.loaded", "to": ["similar-products", "ecosystem-map"] }
  ]
}`,
};

/**
 * Build a prompt with optional few-shot examples
 */
export function buildPrompt(
  template: string,
  variables: Record<string, string>,
  examples?: string[]
): string {
  let prompt = template;
  
  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  
  // Add examples if provided
  if (examples && examples.length > 0) {
    prompt += '\n\nExamples:\n' + examples.join('\n\n');
  }
  
  return prompt;
}

/**
 * Prompt templates for common tasks
 */
export const PROMPT_TEMPLATES = {
  ANALYZE_TOOLS: `Analyze these MCP tools:

{{tools}}

Return JSON with:
- categories: group tools by function
- clusters: identify tools that work well together
- relationships: how tools relate (input/output, complementary, etc.)
- summary: brief overview of capabilities`,

  SUGGEST_WIDGETS: `Given these MCP tools:

{{tools}}

{{existingWidgets}}

Suggest widgets that provide value to product information users.
Each widget should use 1-3 tools and define its events.

Return a JSON array of widget suggestions.`,

  SUGGEST_SKILLS: `Given these MCP tools with their schemas:

{{tools}}

{{existingSkills}}

Suggest automated workflows (skills) that chain tools together.
Each skill should have clear steps with input/output mappings.

Return a JSON array of skill suggestions.`,

  CONFIGURE_WIDGET: `Configure a "{{widgetType}}" widget using:

Tools: {{tools}}
Context: {{context}}

Suggest sensible defaults for this use case.
Return a JSON configuration object.`,

  SUGGEST_DASHBOARD: `Create a dashboard layout for:

Purpose: {{purpose}}
Available widgets: {{widgets}}
User role: {{userRole}}

Return a JSON dashboard configuration with widget positions and event wiring.`,
};
