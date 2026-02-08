/**
 * ProductSearchWidget - Standard product search widget
 * Uses MCP tool: search_products
 * 
 * @0711/templates - Reusable across all clients
 */

import { WidgetBase, WidgetConfig, EventBus, EventTypes, createProductSearchEvent } from '@0711/core';

export interface ProductSearchConfig extends WidgetConfig {
  settings?: {
    query?: string;
    filters?: Record<string, unknown>;
    limit?: number;
    /** MCP tool name override (default: search_products) */
    mcpTool?: string;
  };
}

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  category?: string;
  [key: string]: unknown;
}

export interface MCPClient {
  call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T>;
}

export class ProductSearchWidget extends WidgetBase {
  private results: SearchResult[] = [];
  private mcpClient: MCPClient | null = null;

  constructor(config: ProductSearchConfig) {
    super({ ...config, type: 'product-search' });
  }

  /**
   * Inject MCP client for real data fetching
   */
  setMCPClient(client: MCPClient): void {
    this.mcpClient = client;
  }

  async onMount(): Promise<void> {
    await super.onMount();
    
    this.emit(EventTypes.PRODUCT_SEARCH, {
      ...createProductSearchEvent('', this.config.settings?.filters),
      status: 'mounted',
    });

    // Auto-search if query provided
    const query = (this.config as ProductSearchConfig).settings?.query;
    if (query) {
      await this.search(query);
    }
  }

  protected handleEvent(event: string, payload: unknown): void {
    if (event === 'product.search.request') {
      const { query, filters } = payload as { query: string; filters?: Record<string, unknown> };
      this.search(query, filters);
    }
  }

  /**
   * Perform product search via MCP tool: search_products
   */
  async search(query: string, filters?: Record<string, unknown>): Promise<SearchResult[]> {
    try {
      this.state = 'loading';
      const settings = (this.config as ProductSearchConfig).settings || {};
      const limit = settings.limit || 20;
      const mcpTool = settings.mcpTool || 'search_products';

      if (this.mcpClient) {
        // Real MCP call
        this.results = await this.mcpClient.call<SearchResult[]>(mcpTool, {
          query,
          filters,
          limit,
        });
      } else {
        // No MCP client - return empty (or mock in dev)
        console.warn('ProductSearchWidget: No MCP client configured');
        this.results = [];
      }

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

  getResults(): SearchResult[] {
    return this.results;
  }
}
