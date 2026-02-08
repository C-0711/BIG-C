/**
 * SimilarProductsWidget - Bosch similar products recommendations widget
 * Sprint 1.3 - Basic Widgets
 */

import { WidgetBase } from '../WidgetBase';
import { WidgetConfig } from '../WidgetConfig';
import { EventBus } from '../../events/EventBus';
import { EventTypes } from '../../events/EventTypes';

export interface SimilarProductsConfig extends WidgetConfig {
  settings?: {
    productId?: string;
    limit?: number;
    autoLoad?: boolean;
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

export class SimilarProductsWidget extends WidgetBase {
  private similarProducts: SimilarProduct[] = [];
  private currentProductId: string | null = null;

  constructor(config: SimilarProductsConfig) {
    super({ 
      ...config, 
      type: 'similar-products',
      subscriptions: ['product.detail.loaded', ...(config.subscriptions || [])],
    });
  }

  async onMount(): Promise<void> {
    await super.onMount();
    
    // Auto-load if productId provided
    const productId = (this.config as SimilarProductsConfig).settings?.productId;
    if (productId) {
      await this.loadSimilar(productId);
    }
  }

  protected handleEvent(event: string, payload: unknown): void {
    // Listen for product detail loaded events to auto-load similar products
    if (event === EventTypes.PRODUCT_DETAIL_LOADED || event === 'product.detail.loaded') {
      const { productId } = payload as { productId: string };
      if (productId && (this.config as SimilarProductsConfig).settings?.autoLoad !== false) {
        this.loadSimilar(productId);
      }
    }
  }

  /**
   * Load similar products
   * In production, this calls the bosch_get_similar_products MCP tool
   */
  async loadSimilar(productId: string): Promise<SimilarProduct[]> {
    try {
      this.state = 'loading';
      this.currentProductId = productId;
      const limit = (this.config as SimilarProductsConfig).settings?.limit || 5;

      // TODO: Replace with actual MCP call to bosch_get_similar_products
      // const similar = await mcpClient.call('bosch_get_similar_products', { productId, limit });
      
      // Mock implementation for now
      this.similarProducts = await this.mockGetSimilar(productId, limit);

      // Emit similar loaded event
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

  /**
   * Mock similar products fetch - replace with real MCP call
   */
  private async mockGetSimilar(productId: string, limit: number): Promise<SimilarProduct[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock similar products based on category
    const mockSimilarByProduct: Record<string, SimilarProduct[]> = {
      'GSR18V-60': [
        { id: 'GSR18V-90', name: 'Akku-Bohrschrauber GSR 18V-90', category: 'Akkuwerkzeuge', similarity: 0.95, price: 229.99 },
        { id: 'GSR12V-35', name: 'Akku-Bohrschrauber GSR 12V-35', category: 'Akkuwerkzeuge', similarity: 0.85, price: 149.99 },
        { id: 'GSB18V-55', name: 'Akku-Schlagbohrschrauber GSB 18V-55', category: 'Akkuwerkzeuge', similarity: 0.80, price: 199.99 },
        { id: 'GDR18V-200', name: 'Akku-Drehschlagschrauber GDR 18V-200', category: 'Akkuwerkzeuge', similarity: 0.75, price: 179.99 },
        { id: 'GDX18V-210', name: 'Akku-Schlagschrauber GDX 18V-210', category: 'Akkuwerkzeuge', similarity: 0.70, price: 219.99 },
      ],
      'GBH2-26': [
        { id: 'GBH2-28', name: 'Bohrhammer GBH 2-28 F', category: 'Bohrhämmer', similarity: 0.92, price: 289.99 },
        { id: 'GBH4-32', name: 'Bohrhammer GBH 4-32 DFR', category: 'Bohrhämmer', similarity: 0.85, price: 449.99 },
        { id: 'GBH18V-26', name: 'Akku-Bohrhammer GBH 18V-26', category: 'Bohrhämmer', similarity: 0.78, price: 329.99 },
      ],
      'GLM50-25G': [
        { id: 'GLM50-27CG', name: 'Laser-Entfernungsmesser GLM 50-27 CG', category: 'Messtechnik', similarity: 0.90, price: 159.99 },
        { id: 'GLM100-25C', name: 'Laser-Entfernungsmesser GLM 100-25 C', category: 'Messtechnik', similarity: 0.82, price: 249.99 },
        { id: 'GLL3-80', name: 'Linienlaser GLL 3-80', category: 'Messtechnik', similarity: 0.65, price: 399.99 },
      ],
    };

    const similar = mockSimilarByProduct[productId] || [
      { id: 'GSR18V-60', name: 'Akku-Bohrschrauber GSR 18V-60', category: 'Akkuwerkzeuge', similarity: 0.60, price: 189.99 },
      { id: 'GBH2-26', name: 'Bohrhammer GBH 2-26 DRE', category: 'Bohrhämmer', similarity: 0.55, price: 249.99 },
    ];

    return similar.slice(0, limit);
  }

  getSimilarProducts(): SimilarProduct[] {
    return this.similarProducts;
  }

  getCurrentProductId(): string | null {
    return this.currentProductId;
  }
}
