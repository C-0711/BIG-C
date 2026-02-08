/**
 * SimilarProductsWidget - Standard similar products recommendations widget
 * Uses MCP tool: search_similar_products
 * 
 * @0711/templates - Reusable across all clients
 */

import { WidgetBase, WidgetConfig, EventBus, EventTypes } from '@0711/core';

export interface SimilarProductsConfig extends WidgetConfig {
  settings?: {
    productId?: string;
    limit?: number;
    autoLoad?: boolean;
    /** MCP tool name override (default: search_similar_products) */
    mcpTool?: string;
  };
}

export interface SimilarProduct {
  id: string;
  name: string;
  category?: string;
  similarity?: number;
  price?: number;
  [key: string]: unknown;
}

export interface MCPClient {
  call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T>;
}

export class SimilarProductsWidget extends WidgetBase {
  private similarProducts: SimilarProduct[] = [];
  private currentProductId: string | null = null;
  private mcpClient: MCPClient | null = null;

  constructor(config: SimilarProductsConfig) {
    super({ 
      ...config, 
      type: 'similar-products',
      subscriptions: ['product.detail.loaded', ...(config.subscriptions || [])],
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
    
    const productId = (this.config as SimilarProductsConfig).settings?.productId;
    if (productId) {
      await this.loadSimilar(productId);
    }
  }

  protected handleEvent(event: string, payload: unknown): void {
    if (event === EventTypes.PRODUCT_DETAIL_LOADED || event === 'product.detail.loaded') {
      const settings = (this.config as SimilarProductsConfig).settings || {};
      const { productId } = payload as { productId: string };
      if (productId && settings.autoLoad !== false) {
        this.loadSimilar(productId);
      }
    }
  }

  /**
   * Load similar products via MCP tool: search_similar_products
   */
  async loadSimilar(productId: string): Promise<SimilarProduct[]> {
    try {
      this.state = 'loading';
      this.currentProductId = productId;
      const settings = (this.config as SimilarProductsConfig).settings || {};
      const limit = settings.limit || 5;
      const mcpTool = settings.mcpTool || 'search_similar_products';

      if (this.mcpClient) {
        this.similarProducts = await this.mcpClient.call<SimilarProduct[]>(mcpTool, {
          productId,
          limit,
        });
      } else {
        console.warn('SimilarProductsWidget: No MCP client configured');
        this.similarProducts = [];
      }

      EventBus.emit(EventTypes.PRODUCT_SIMILAR_LOADED, {
        productId,
        similarProducts: this.similarProducts,
        count: this.similarProducts.length,
        source: this.id,
        timestamp: Date.now(),
      });

      this.state = 'ready';
      return this.similarProducts;
    } catch (error) {
      this.setError(error as Error);
      return [];
    }
  }

  getSimilarProducts(): SimilarProduct[] {
    return this.similarProducts;
  }

  getCurrentProductId(): string | null {
    return this.currentProductId;
  }
}
