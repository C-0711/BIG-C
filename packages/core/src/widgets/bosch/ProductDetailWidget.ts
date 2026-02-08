/**
 * ProductDetailWidget - Bosch product detail display widget
 * Sprint 1.3 - Basic Widgets
 */

import { WidgetBase } from '../WidgetBase';
import { WidgetConfig } from '../WidgetConfig';
import { EventBus } from '../../events/EventBus';
import { EventTypes } from '../../events/EventTypes';

export interface ProductDetailConfig extends WidgetConfig {
  settings?: {
    productId?: string;
    autoLoad?: boolean;
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
  [key: string]: unknown;
}

export class ProductDetailWidget extends WidgetBase {
  private product: ProductDetail | null = null;

  constructor(config: ProductDetailConfig) {
    super({ 
      ...config, 
      type: 'product-detail',
      subscriptions: ['product.selected', ...(config.subscriptions || [])],
    });
  }

  async onMount(): Promise<void> {
    await super.onMount();
    
    // Auto-load if productId provided
    const productId = (this.config as ProductDetailConfig).settings?.productId;
    const autoLoad = (this.config as ProductDetailConfig).settings?.autoLoad !== false;
    
    if (productId && autoLoad) {
      await this.loadProduct(productId);
    }
  }

  protected handleEvent(event: string, payload: unknown): void {
    // Listen for product selection events
    if (event === EventTypes.PRODUCT_SELECTED || event === 'product.selected') {
      const { productId } = payload as { productId: string };
      if (productId) {
        this.loadProduct(productId);
      }
    }
  }

  /**
   * Load product details
   * In production, this calls the bosch_get_product_details MCP tool
   */
  async loadProduct(productId: string): Promise<ProductDetail | null> {
    try {
      this.state = 'loading';

      // TODO: Replace with actual MCP call to bosch_get_product_details
      // const product = await mcpClient.call('bosch_get_product_details', { productId });
      
      // Mock implementation for now
      this.product = await this.mockGetProduct(productId);

      if (this.product) {
        // Emit detail loaded event
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

  /**
   * Mock product detail fetch - replace with real MCP call
   */
  private async mockGetProduct(productId: string): Promise<ProductDetail | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Mock product details
    const mockProducts: Record<string, ProductDetail> = {
      'GSR18V-60': {
        id: 'GSR18V-60',
        name: 'Akku-Bohrschrauber GSR 18V-60',
        description: 'Leistungsstarker 18V Akku-Bohrschrauber mit bürstenlosem Motor',
        category: 'Akkuwerkzeuge',
        specifications: {
          voltage: '18V',
          torque: '60 Nm',
          weight: '1.4 kg',
          chuck: '13 mm',
        },
        images: ['/images/gsr18v-60-1.jpg', '/images/gsr18v-60-2.jpg'],
        price: 189.99,
        availability: 'in_stock',
      },
      'GBH2-26': {
        id: 'GBH2-26',
        name: 'Bohrhammer GBH 2-26 DRE',
        description: 'Vielseitiger SDS-plus Bohrhammer für Beton und Mauerwerk',
        category: 'Bohrhämmer',
        specifications: {
          power: '800W',
          impact_energy: '2.7 J',
          weight: '2.7 kg',
        },
        images: ['/images/gbh2-26-1.jpg'],
        price: 249.99,
        availability: 'in_stock',
      },
      'GLM50-25G': {
        id: 'GLM50-25G',
        name: 'Laser-Entfernungsmesser GLM 50-25 G',
        description: 'Präziser grüner Laser für beste Sichtbarkeit',
        category: 'Messtechnik',
        specifications: {
          range: '50 m',
          accuracy: '±1.5 mm',
          laser_class: '2',
        },
        images: ['/images/glm50-25g-1.jpg'],
        price: 129.99,
        availability: 'in_stock',
      },
    };

    return mockProducts[productId] || null;
  }

  getProduct(): ProductDetail | null {
    return this.product;
  }
}
