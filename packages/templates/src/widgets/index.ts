/**
 * Standard Widget Templates
 * @0711/templates
 * 
 * These widgets work with any client that implements the 27 standard MCP tools.
 * No client-specific code - configure via settings or override mcpTool names.
 */

export * from './ProductSearchWidget';
export * from './ProductDetailWidget';
export * from './SimilarProductsWidget';

// Widget catalog for discovery
export const STANDARD_WIDGETS = [
  {
    type: 'product-search',
    name: 'Product Search',
    description: 'Full-text product search with filters',
    mcpTools: ['search_products'],
    category: 'Search & Discovery',
  },
  {
    type: 'product-detail',
    name: 'Product Detail Card',
    description: 'Displays complete product information',
    mcpTools: ['get_product', 'get_factsheet_data'],
    category: 'Product Details',
  },
  {
    type: 'similar-products',
    name: 'Similar Products',
    description: 'Shows related/similar product recommendations',
    mcpTools: ['search_similar_products'],
    category: 'Search & Discovery',
  },
] as const;
