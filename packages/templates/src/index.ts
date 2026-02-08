/**
 * @0711/templates - Standard Templates for 0711-BIG-C
 * 
 * Reusable widgets, skills, agents, and dashboards that work
 * with ANY client implementing the 27 standard MCP tools.
 */

// Widgets
export * from './widgets';

// Skills (TODO: Sprint 2)
// export * from './skills';

// Agents (TODO: Sprint 3)
// export * from './agents';

// Dashboards (TODO: Sprint 3)
// export * from './dashboards';

// MCP Tool catalog
export const STANDARD_MCP_TOOLS = {
  // Search & Discovery (7 tools)
  SEARCH_PRODUCTS: 'search_products',
  SEARCH_SIMILAR_PRODUCTS: 'search_similar_products',
  FIND_SIMILAR_PRODUCTS: 'find_similar_products',
  SEARCH_BY_ETIM_GROUP: 'search_by_etim_group',
  SEARCH_MASSIVE_PRODUCTS: 'search_massive_products',
  SEARCH_CATALOGS_SEMANTIC: 'search_catalogs_semantic',
  FIND_PRODUCT_IN_CATALOGS: 'find_product_in_catalogs',
  
  // Product Details (9 tools)
  GET_PRODUCT: 'get_product',
  GET_RELATED_PRODUCTS: 'get_related_products',
  GET_PRODUCT_MEDIA: 'get_product_media',
  GET_PRODUCT_IMAGES: 'get_product_images',
  GET_PRODUCT_DOCUMENTS: 'get_product_documents',
  GET_MASSIVE_PRODUCT: 'get_massive_product',
  LIST_MASSIVE_PRODUCTS: 'list_massive_products',
  GET_FACTSHEET_DATA: 'get_factsheet_data',
  GENERATE_FACTSHEET_ULTIMATE: 'generate_factsheet_ultimate',
  
  // Classification & Taxonomy (5 tools)
  GET_ETIM_GROUPS: 'get_etim_groups',
  RESOLVE_PRODUCT_FAMILY: 'resolve_product_family',
  RESOLVE_PRODUCT_FAMILY_ADVANCED: 'resolve_product_family_advanced',
  GET_PRODUCT_CLASS_TERMINOLOGY: 'get_product_class_terminology',
  VALIDATE_PRODUCT_TERMINOLOGY: 'validate_product_terminology',
  
  // Analytics & Intelligence (5 tools)
  GET_STATISTICS: 'get_statistics',
  AGGREGATE_PRODUCT_SPECS: 'aggregate_product_specs',
  CHECK_PRODUCT_COMPATIBILITY: 'check_product_compatibility',
  GET_PRODUCT_LINEAGE: 'get_product_lineage',
  ANALYZE_PRODUCT_ECOSYSTEM: 'analyze_product_ecosystem',
  
  // Data Access (2 tools)
  EXECUTE_SQL: 'execute_sql',
  EXECUTE_CYPHER: 'execute_cypher',
  
  // Catalogs (1 tool)
  LIST_CATALOGS: 'list_catalogs',
} as const;

export type MCPToolName = typeof STANDARD_MCP_TOOLS[keyof typeof STANDARD_MCP_TOOLS];
