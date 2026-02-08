/**
 * ComparisonTableWidget - Compare product specifications side-by-side
 * Uses MCP tools: get_product, aggregate_product_specs
 * 
 * @0711/templates - Reusable across all clients
 */

import { WidgetBase, WidgetConfig, EventBus } from '@0711/core';

export interface ComparisonTableConfig extends WidgetConfig {
  settings?: {
    /** Maximum products to compare */
    maxProducts?: number;
    /** Highlight differences */
    highlightDifferences?: boolean;
    /** Show product images */
    showImages?: boolean;
    /** Spec categories to show (empty = all) */
    categories?: string[];
  };
}

export interface ComparedProduct {
  id: string;
  name: string;
  image?: string;
  specs: Record<string, string | number | boolean>;
}

export interface AggregatedSpecs {
  categories: SpecCategory[];
  allSpecs: string[];
  differences: string[];
}

export interface SpecCategory {
  name: string;
  specs: SpecRow[];
}

export interface SpecRow {
  name: string;
  values: (string | number | boolean | null)[];
  isDifferent: boolean;
}

export interface MCPClient {
  call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T>;
}

export class ComparisonTableWidget extends WidgetBase {
  private products: ComparedProduct[] = [];
  private aggregatedSpecs: AggregatedSpecs | null = null;
  private mcpClient: MCPClient | null = null;

  constructor(config: ComparisonTableConfig) {
    super({
      ...config,
      type: 'comparison-table',
      subscriptions: ['product.compared', 'comparison.add', ...(config.subscriptions || [])],
    });
  }

  setMCPClient(client: MCPClient): void {
    this.mcpClient = client;
  }

  async onMount(): Promise<void> {
    await super.onMount();
  }

  protected handleEvent(event: string, payload: unknown): void {
    if (event === 'product.compared' || event === 'comparison.add') {
      const { productId } = payload as { productId: string };
      if (productId) {
        this.addProduct(productId);
      }
    }
    
    if (event === 'comparison.remove') {
      const { productId } = payload as { productId: string };
      if (productId) {
        this.removeProduct(productId);
      }
    }
    
    if (event === 'comparison.clear') {
      this.clearProducts();
    }
  }

  /**
   * Add a product to comparison
   */
  async addProduct(productId: string): Promise<boolean> {
    const settings = (this.config as ComparisonTableConfig).settings || {};
    const maxProducts = settings.maxProducts || 4;

    if (this.products.length >= maxProducts) {
      EventBus.emit('comparison.max_reached', {
        maxProducts,
        source: this.id,
      });
      return false;
    }

    if (this.products.some(p => p.id === productId)) {
      return false; // Already in comparison
    }

    try {
      this.state = 'loading';

      if (this.mcpClient) {
        // Get product details
        const product = await this.mcpClient.call<ComparedProduct>('get_product', { productId });
        this.products.push(product);

        // Re-aggregate specs
        await this.aggregateSpecs();

        EventBus.emit('comparison.product.added', {
          productId,
          productCount: this.products.length,
          source: this.id,
        });
      }

      this.state = 'ready';
      return true;
    } catch (error) {
      this.setError(error as Error);
      return false;
    }
  }

  /**
   * Remove a product from comparison
   */
  removeProduct(productId: string): boolean {
    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) return false;

    this.products.splice(index, 1);
    
    if (this.products.length > 0) {
      this.aggregateSpecs();
    } else {
      this.aggregatedSpecs = null;
    }

    EventBus.emit('comparison.product.removed', {
      productId,
      productCount: this.products.length,
      source: this.id,
    });

    return true;
  }

  /**
   * Clear all products from comparison
   */
  clearProducts(): void {
    this.products = [];
    this.aggregatedSpecs = null;

    EventBus.emit('comparison.cleared', {
      source: this.id,
    });
  }

  /**
   * Aggregate specs across all products
   */
  private async aggregateSpecs(): Promise<void> {
    if (this.products.length === 0 || !this.mcpClient) {
      this.aggregatedSpecs = null;
      return;
    }

    try {
      const productIds = this.products.map(p => p.id);
      
      this.aggregatedSpecs = await this.mcpClient.call<AggregatedSpecs>('aggregate_product_specs', {
        productIds,
      });

      EventBus.emit('comparison.updated', {
        productIds,
        specCount: this.aggregatedSpecs.allSpecs.length,
        differenceCount: this.aggregatedSpecs.differences.length,
        source: this.id,
      });
    } catch (error) {
      console.error('Failed to aggregate specs:', error);
    }
  }

  /**
   * Highlight a specific spec row
   */
  highlightSpec(specName: string): void {
    EventBus.emit('comparison.spec_highlighted', {
      specName,
      source: this.id,
    });
  }

  /**
   * Get comparison data for rendering
   */
  getComparisonData(): {
    products: ComparedProduct[];
    specs: AggregatedSpecs | null;
    canAddMore: boolean;
  } {
    const settings = (this.config as ComparisonTableConfig).settings || {};
    const maxProducts = settings.maxProducts || 4;

    return {
      products: this.products,
      specs: this.aggregatedSpecs,
      canAddMore: this.products.length < maxProducts,
    };
  }

  getProducts(): ComparedProduct[] {
    return [...this.products];
  }

  getAggregatedSpecs(): AggregatedSpecs | null {
    return this.aggregatedSpecs;
  }
}
