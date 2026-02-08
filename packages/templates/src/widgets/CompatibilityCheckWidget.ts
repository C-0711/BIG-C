/**
 * CompatibilityCheckWidget - Check product compatibility
 * Uses MCP tool: check_product_compatibility
 * 
 * @0711/templates - Reusable across all clients
 */

import { WidgetBase, WidgetConfig, EventBus } from '@0711/core';

export interface CompatibilityCheckConfig extends WidgetConfig {
  settings?: {
    /** Pre-selected product A */
    productAId?: string;
    /** Pre-selected product B */
    productBId?: string;
    /** Show detailed compatibility info */
    showDetails?: boolean;
    /** Auto-check when both products selected */
    autoCheck?: boolean;
  };
}

export interface CompatibilityResult {
  compatible: boolean;
  score: number; // 0-100
  level: 'full' | 'partial' | 'none';
  details: CompatibilityDetail[];
  recommendations?: string[];
  warnings?: string[];
}

export interface CompatibilityDetail {
  aspect: string;
  compatible: boolean;
  description: string;
  severity?: 'info' | 'warning' | 'error';
}

export interface SelectedProduct {
  id: string;
  name: string;
  image?: string;
}

export interface MCPClient {
  call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T>;
}

export class CompatibilityCheckWidget extends WidgetBase {
  private productA: SelectedProduct | null = null;
  private productB: SelectedProduct | null = null;
  private result: CompatibilityResult | null = null;
  private mcpClient: MCPClient | null = null;

  constructor(config: CompatibilityCheckConfig) {
    super({
      ...config,
      type: 'compatibility-check',
      subscriptions: ['product.selected', 'compatibility.check', ...(config.subscriptions || [])],
    });
  }

  setMCPClient(client: MCPClient): void {
    this.mcpClient = client;
  }

  async onMount(): Promise<void> {
    await super.onMount();

    const settings = (this.config as CompatibilityCheckConfig).settings || {};
    
    // Load pre-selected products
    if (settings.productAId) {
      await this.selectProductA(settings.productAId);
    }
    if (settings.productBId) {
      await this.selectProductB(settings.productBId);
    }
  }

  protected handleEvent(event: string, payload: unknown): void {
    if (event === 'product.selected') {
      const { productId, productName, slot } = payload as { 
        productId: string; 
        productName?: string;
        slot?: 'A' | 'B';
      };
      
      if (slot === 'A' || !this.productA) {
        this.selectProductA(productId, productName);
      } else if (slot === 'B' || !this.productB) {
        this.selectProductB(productId, productName);
      }
    }

    if (event === 'compatibility.check') {
      const { productAId, productBId } = payload as { productAId: string; productBId: string };
      this.checkCompatibility(productAId, productBId);
    }
  }

  /**
   * Select product A
   */
  async selectProductA(productId: string, name?: string): Promise<void> {
    this.productA = { id: productId, name: name || productId };
    this.result = null;

    if (this.mcpClient && !name) {
      try {
        const product = await this.mcpClient.call<{ id: string; name: string; image?: string }>('get_product', { productId });
        this.productA = product;
      } catch (error) {
        console.error('Failed to load product A:', error);
      }
    }

    EventBus.emit('compatibility.product_a.selected', {
      product: this.productA,
      source: this.id,
    });

    await this.autoCheckIfReady();
  }

  /**
   * Select product B
   */
  async selectProductB(productId: string, name?: string): Promise<void> {
    this.productB = { id: productId, name: name || productId };
    this.result = null;

    if (this.mcpClient && !name) {
      try {
        const product = await this.mcpClient.call<{ id: string; name: string; image?: string }>('get_product', { productId });
        this.productB = product;
      } catch (error) {
        console.error('Failed to load product B:', error);
      }
    }

    EventBus.emit('compatibility.product_b.selected', {
      product: this.productB,
      source: this.id,
    });

    await this.autoCheckIfReady();
  }

  /**
   * Clear product selection
   */
  clearProduct(slot: 'A' | 'B'): void {
    if (slot === 'A') {
      this.productA = null;
    } else {
      this.productB = null;
    }
    this.result = null;

    EventBus.emit('compatibility.product.cleared', {
      slot,
      source: this.id,
    });
  }

  /**
   * Swap products A and B
   */
  swapProducts(): void {
    const temp = this.productA;
    this.productA = this.productB;
    this.productB = temp;
    this.result = null;

    EventBus.emit('compatibility.products.swapped', {
      source: this.id,
    });
  }

  /**
   * Check compatibility between two products
   */
  async checkCompatibility(productAId?: string, productBId?: string): Promise<CompatibilityResult | null> {
    const idA = productAId || this.productA?.id;
    const idB = productBId || this.productB?.id;

    if (!idA || !idB) {
      EventBus.emit('compatibility.error', {
        error: 'Both products must be selected',
        source: this.id,
      });
      return null;
    }

    try {
      this.state = 'loading';

      if (this.mcpClient) {
        this.result = await this.mcpClient.call<CompatibilityResult>('check_product_compatibility', {
          productA: idA,
          productB: idB,
        });

        EventBus.emit('compatibility.checked', {
          productAId: idA,
          productBId: idB,
          result: this.result,
          source: this.id,
        });
      }

      this.state = 'ready';
      return this.result;
    } catch (error) {
      this.setError(error as Error);
      return null;
    }
  }

  /**
   * Auto-check if both products are selected and autoCheck is enabled
   */
  private async autoCheckIfReady(): Promise<void> {
    const settings = (this.config as CompatibilityCheckConfig).settings || {};
    
    if (settings.autoCheck !== false && this.productA && this.productB) {
      await this.checkCompatibility();
    }
  }

  /**
   * Get compatibility level badge color
   */
  static getLevelColor(level: CompatibilityResult['level']): string {
    switch (level) {
      case 'full': return '#22c55e'; // green
      case 'partial': return '#f59e0b'; // amber
      case 'none': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  }

  /**
   * Get compatibility level label
   */
  static getLevelLabel(level: CompatibilityResult['level']): string {
    switch (level) {
      case 'full': return 'Fully Compatible';
      case 'partial': return 'Partially Compatible';
      case 'none': return 'Not Compatible';
      default: return 'Unknown';
    }
  }

  getProductA(): SelectedProduct | null {
    return this.productA;
  }

  getProductB(): SelectedProduct | null {
    return this.productB;
  }

  getResult(): CompatibilityResult | null {
    return this.result;
  }

  canCheck(): boolean {
    return !!(this.productA && this.productB);
  }
}
