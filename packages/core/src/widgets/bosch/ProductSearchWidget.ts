/**
 * ProductSearchWidget - Bosch product search widget
 * Sprint 1.3 - Basic Widgets
 */

import { WidgetBase } from '../WidgetBase';
import { WidgetConfig } from '../WidgetConfig';
import { EventBus } from '../../events/EventBus';
import { EventTypes, createProductSearchEvent } from '../../events/EventTypes';

export interface ProductSearchConfig extends WidgetConfig {
  settings?: {
    query?: string;
    filters?: Record<string, unknown>;
    limit?: number;
  };
}

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  category?: string;
  [key: string]: unknown;
}

export class ProductSearchWidget extends WidgetBase {
  private results: SearchResult[] = [];

  constructor(config: ProductSearchConfig) {
    super({ ...config, type: 'product-search' });
  }

  async onMount(): Promise<void> {
    await super.onMount();
    
    // Emit search started event
    this.emit(EventTypes.PRODUCT_SEARCH, {
      ...createProductSearchEvent('', this.config.settings?.filters),
      status: 'started',
    });

    // Auto-search if query provided in config
    const query = (this.config as ProductSearchConfig).settings?.query;
    if (query) {
      await this.search(query);
    }
  }

  protected handleEvent(event: string, payload: unknown): void {
    // Listen for external search requests
    if (event === 'product.search.request') {
      const { query, filters } = payload as { query: string; filters?: Record<string, unknown> };
      this.search(query, filters);
    }
  }

  /**
   * Perform a product search
   * In production, this calls the bosch_search_products MCP tool
   */
  async search(query: string, filters?: Record<string, unknown>): Promise<SearchResult[]> {
    try {
      this.state = 'loading';
      const limit = (this.config as ProductSearchConfig).settings?.limit || 20;

      // TODO: Replace with actual MCP call to bosch_search_products
      // const results = await mcpClient.call('bosch_search_products', { query, filters, limit });
      
      // Mock implementation for now
      this.results = await this.mockSearch(query, filters, limit);

      // Emit results event
      EventBus.emit(EventTypes.PRODUCT_SEARCH, {
        ...createProductSearchEvent(query, filters),
        resultCount: this.results.length,
        results: this.results,
        source: this.id,
      });

      this.state = 'ready';
      return this.results;
    } catch (error) {
      this.setError(error as Error);
      return [];
    }
  }

  /**
   * Mock search implementation - replace with real MCP call
   */
  private async mockSearch(query: string, filters?: Record<string, unknown>, limit = 20): Promise<SearchResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock product data
    const mockProducts: SearchResult[] = [
      { id: 'GSR18V-60', name: 'Akku-Bohrschrauber GSR 18V-60', category: 'Akkuwerkzeuge' },
      { id: 'GBH2-26', name: 'Bohrhammer GBH 2-26 DRE', category: 'Bohrhämmer' },
      { id: 'GLM50-25G', name: 'Laser-Entfernungsmesser GLM 50-25 G', category: 'Messtechnik' },
      { id: 'GWS18V-10', name: 'Akku-Winkelschleifer GWS 18V-10', category: 'Akkuwerkzeuge' },
      { id: 'GST18V-LI', name: 'Akku-Stichsäge GST 18V-LI', category: 'Akkuwerkzeuge' },
    ];

    // Filter by query
    let results = mockProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.id.toLowerCase().includes(query.toLowerCase())
    );

    // Apply additional filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        results = results.filter(p => p[key] === value);
      }
    }

    return results.slice(0, limit);
  }

  getResults(): SearchResult[] {
    return this.results;
  }
}
