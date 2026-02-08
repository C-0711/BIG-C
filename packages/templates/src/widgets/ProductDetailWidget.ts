/**
 * ProductDetailWidget - Standard product detail widget
 * Uses MCP tools: get_product, get_factsheet_data
 * 
 * @0711/templates - Reusable across all clients
 */

import { WidgetBase, WidgetConfig, EventBus, EventTypes } from '@0711/core';

export interface ProductDetailConfig extends WidgetConfig {
  settings?: {
    productId?: string;
    autoLoad?: boolean;
    /** Include factsheet data (default: true) */
    includeFactsheet?: boolean;
    /** MCP tool name override (default: get_product) */
    mcpTool?: string;
  };
}

export interface ProductDetail {
  id: string;
  name: string;
  description?: string;
  category?: string;
  specifications?: Record<string, string | number>;
  images?: string[];
  price?: number;
  availability?: string;
  factsheet?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MCPClient {
  call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T>;
}

export class ProductDetailWidget extends WidgetBase {
  private product: ProductDetail | null = null;
  private mcpClient: MCPClient | null = null;

  constructor(config: ProductDetailConfig) {
    super({ 
      ...config, 
      type: 'product-detail',
      subscriptions: ['product.selected', ...(config.subscriptions || [])],
    });
  }

  /**
   * Inject MCP client for real data fetching
   */
  setMCPClient(client: MCPClient): void {
    this.mcpClient = client;
  }

  async onMount(): Promise<void> {
    await super.onMount();
    
    const settings = (this.config as ProductDetailConfig).settings || {};
    const productId = settings.productId;
    const autoLoad = settings.autoLoad !== false;
    
    if (productId && autoLoad) {
      await this.loadProduct(productId);
    }
  }

  protected handleEvent(event: string, payload: unknown): void {
    if (event === EventTypes.PRODUCT_SELECTED || event === 'product.selected') {
      const { productId } = payload as { productId: string };
      if (productId) {
        this.loadProduct(productId);
      }
    }
  }

  /**
   * Load product details via MCP tool: get_product
   * Optionally enriches with factsheet data via: get_factsheet_data
   */
  async loadProduct(productId: string): Promise<ProductDetail | null> {
    try {
      this.state = 'loading';
      const settings = (this.config as ProductDetailConfig).settings || {};
      const mcpTool = settings.mcpTool || 'get_product';
      const includeFactsheet = settings.includeFactsheet !== false;

      if (this.mcpClient) {
        // Get basic product data
        this.product = await this.mcpClient.call<ProductDetail>(mcpTool, { productId });
        
        // Optionally enrich with factsheet
        if (includeFactsheet && this.product) {
          try {
            const factsheet = await this.mcpClient.call<Record<string, unknown>>('get_factsheet_data', { productId });
            this.product.factsheet = factsheet;
          } catch {
            // Factsheet is optional, don't fail if not available
          }
        }
      } else {
        console.warn('ProductDetailWidget: No MCP client configured');
        this.product = null;
      }

      if (this.product) {
        EventBus.emit(EventTypes.PRODUCT_DETAIL_LOADED, {
          productId,
          product: this.product,
          source: this.id,
          timestamp: Date.now(),
        });
      }

      this.state = 'ready';
      return this.product;
    } catch (error) {
      this.setError(error as Error);
      return null;
    }
  }

  getProduct(): ProductDetail | null {
    return this.product;
  }
}
