/**
 * DashboardTemplates - Pre-built dashboard templates
 * Sprint 7.1 - Dashboard Builder
 */

import { DashboardConfig, DashboardWidget } from './DashboardConfig';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage?: string;
  userRoles: string[];
  config: Omit<DashboardConfig, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Standard dashboard templates
 */
export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'product-research',
    name: 'Product Research',
    description: 'Complete workspace for researching and comparing products',
    category: 'Research',
    userRoles: ['product_manager', 'sales', 'technical'],
    config: {
      name: 'Product Research Dashboard',
      columns: 12,
      rowHeight: 100,
      widgets: [
        {
          id: 'search',
          config: { type: 'product-search', title: 'Product Search' },
          layout: { x: 0, y: 0, w: 6, h: 2 },
        },
        {
          id: 'detail',
          config: { type: 'product-detail', title: 'Product Details' },
          layout: { x: 6, y: 0, w: 6, h: 4 },
        },
        {
          id: 'similar',
          config: { type: 'similar-products', title: 'Similar Products' },
          layout: { x: 0, y: 2, w: 6, h: 2 },
        },
        {
          id: 'media',
          config: { type: 'media-gallery', title: 'Media' },
          layout: { x: 0, y: 4, w: 4, h: 3 },
        },
        {
          id: 'docs',
          config: { type: 'document-center', title: 'Documents' },
          layout: { x: 4, y: 4, w: 4, h: 3 },
        },
        {
          id: 'ecosystem',
          config: { type: 'ecosystem-map', title: 'Ecosystem' },
          layout: { x: 8, y: 4, w: 4, h: 3 },
        },
      ],
    },
  },
  {
    id: 'comparison-workspace',
    name: 'Product Comparison',
    description: 'Side-by-side product comparison and compatibility checking',
    category: 'Analysis',
    userRoles: ['sales', 'technical', 'support'],
    config: {
      name: 'Comparison Workspace',
      columns: 12,
      rowHeight: 100,
      widgets: [
        {
          id: 'search',
          config: { type: 'product-search', title: 'Find Products' },
          layout: { x: 0, y: 0, w: 4, h: 2 },
        },
        {
          id: 'comparison',
          config: { type: 'comparison-table', title: 'Comparison Table' },
          layout: { x: 4, y: 0, w: 8, h: 4 },
        },
        {
          id: 'compatibility',
          config: { type: 'compatibility-check', title: 'Compatibility Check' },
          layout: { x: 0, y: 2, w: 4, h: 3 },
        },
        {
          id: 'detail-1',
          config: { type: 'product-detail', title: 'Product A' },
          layout: { x: 0, y: 5, w: 6, h: 3 },
        },
        {
          id: 'detail-2',
          config: { type: 'product-detail', title: 'Product B' },
          layout: { x: 6, y: 5, w: 6, h: 3 },
        },
      ],
    },
  },
  {
    id: 'catalog-explorer',
    name: 'Catalog Explorer',
    description: 'Browse product catalog by category and classification',
    category: 'Navigation',
    userRoles: ['product_manager', 'content', 'all'],
    config: {
      name: 'Catalog Explorer',
      columns: 12,
      rowHeight: 100,
      widgets: [
        {
          id: 'etim',
          config: { type: 'etim-explorer', title: 'Categories' },
          layout: { x: 0, y: 0, w: 3, h: 6 },
        },
        {
          id: 'search',
          config: { type: 'product-search', title: 'Search Results' },
          layout: { x: 3, y: 0, w: 5, h: 3 },
        },
        {
          id: 'detail',
          config: { type: 'product-detail', title: 'Product Detail' },
          layout: { x: 8, y: 0, w: 4, h: 4 },
        },
        {
          id: 'similar',
          config: { type: 'similar-products', title: 'Related' },
          layout: { x: 3, y: 3, w: 5, h: 3 },
        },
        {
          id: 'docs',
          config: { type: 'document-center', title: 'Documents' },
          layout: { x: 8, y: 4, w: 4, h: 2 },
        },
      ],
    },
  },
  {
    id: 'sales-assistant',
    name: 'Sales Assistant',
    description: 'Quick access to product info for sales conversations',
    category: 'Sales',
    userRoles: ['sales'],
    config: {
      name: 'Sales Assistant',
      columns: 12,
      rowHeight: 100,
      widgets: [
        {
          id: 'search',
          config: { type: 'product-search', title: 'Quick Search' },
          layout: { x: 0, y: 0, w: 12, h: 2 },
        },
        {
          id: 'detail',
          config: { type: 'product-detail', title: 'Product Info' },
          layout: { x: 0, y: 2, w: 6, h: 4 },
        },
        {
          id: 'media',
          config: { type: 'media-gallery', title: 'Images' },
          layout: { x: 6, y: 2, w: 3, h: 2 },
        },
        {
          id: 'docs',
          config: { type: 'document-center', title: 'Datasheets' },
          layout: { x: 9, y: 2, w: 3, h: 2 },
        },
        {
          id: 'similar',
          config: { type: 'similar-products', title: 'Alternatives' },
          layout: { x: 6, y: 4, w: 6, h: 2 },
        },
      ],
    },
  },
  {
    id: 'technical-analysis',
    name: 'Technical Analysis',
    description: 'Deep-dive into product specifications and compatibility',
    category: 'Technical',
    userRoles: ['technical', 'engineering'],
    config: {
      name: 'Technical Analysis',
      columns: 12,
      rowHeight: 100,
      widgets: [
        {
          id: 'search',
          config: { type: 'product-search', title: 'Find Product' },
          layout: { x: 0, y: 0, w: 4, h: 2 },
        },
        {
          id: 'detail',
          config: { type: 'product-detail', title: 'Specifications' },
          layout: { x: 4, y: 0, w: 8, h: 3 },
        },
        {
          id: 'ecosystem',
          config: { type: 'ecosystem-map', title: 'Product Ecosystem' },
          layout: { x: 0, y: 2, w: 4, h: 4 },
        },
        {
          id: 'compatibility',
          config: { type: 'compatibility-check', title: 'Compatibility' },
          layout: { x: 4, y: 3, w: 4, h: 3 },
        },
        {
          id: 'docs',
          config: { type: 'document-center', title: 'Technical Docs' },
          layout: { x: 8, y: 3, w: 4, h: 3 },
        },
      ],
    },
  },
];

/**
 * Get all templates
 */
export function getTemplates(): DashboardTemplate[] {
  return DASHBOARD_TEMPLATES;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): DashboardTemplate[] {
  return DASHBOARD_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates for a user role
 */
export function getTemplatesForRole(role: string): DashboardTemplate[] {
  return DASHBOARD_TEMPLATES.filter(
    t => t.userRoles.includes(role) || t.userRoles.includes('all')
  );
}

/**
 * Get a template by ID
 */
export function getTemplate(id: string): DashboardTemplate | undefined {
  return DASHBOARD_TEMPLATES.find(t => t.id === id);
}

/**
 * Create a dashboard from a template
 */
export function createDashboardFromTemplate(
  templateId: string,
  overrides?: Partial<DashboardConfig>
): DashboardConfig | null {
  const template = getTemplate(templateId);
  if (!template) return null;

  return {
    ...template.config,
    id: `${templateId}-${Date.now()}`,
    ...overrides,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): string[] {
  const categories = new Set(DASHBOARD_TEMPLATES.map(t => t.category));
  return Array.from(categories);
}
