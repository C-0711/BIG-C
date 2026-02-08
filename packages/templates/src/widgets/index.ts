/**
 * Standard Widget Templates
 * @0711/templates
 * 
 * These widgets work with any client that implements the 27 standard MCP tools.
 * No client-specific code - configure via settings or override mcpTool names.
 */

// Sprint 1.3 - Basic Widgets
export * from './ProductSearchWidget';
export * from './ProductDetailWidget';
export * from './SimilarProductsWidget';

// Sprint 2.2 - More Widgets
export * from './ETIMExplorerWidget';
export * from './MediaGalleryWidget';
export * from './DocumentCenterWidget';

// Widget catalog for discovery
export const STANDARD_WIDGETS = [
  // Search & Discovery
  {
    type: 'product-search',
    name: 'Product Search',
    description: 'Full-text product search with filters',
    mcpTools: ['search_products'],
    category: 'Search & Discovery',
  },
  {
    type: 'similar-products',
    name: 'Similar Products',
    description: 'Shows related/similar product recommendations',
    mcpTools: ['search_similar_products'],
    category: 'Search & Discovery',
  },
  {
    type: 'etim-explorer',
    name: 'ETIM Explorer',
    description: 'Navigate ETIM classification tree',
    mcpTools: ['get_etim_groups', 'search_by_etim_group'],
    category: 'Classification',
  },
  // Product Details
  {
    type: 'product-detail',
    name: 'Product Detail Card',
    description: 'Displays complete product information',
    mcpTools: ['get_product', 'get_factsheet_data'],
    category: 'Product Details',
  },
  {
    type: 'media-gallery',
    name: 'Media Gallery',
    description: 'Product images and media with lightbox',
    mcpTools: ['get_product_media', 'get_product_images'],
    category: 'Media & Documents',
  },
  {
    type: 'document-center',
    name: 'Document Center',
    description: 'Product documents, datasheets, manuals',
    mcpTools: ['get_product_documents'],
    category: 'Media & Documents',
  },
] as const;
