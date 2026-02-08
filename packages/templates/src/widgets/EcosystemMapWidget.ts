/**
 * EcosystemMapWidget - Visualize product ecosystem (accessories, replacements, etc.)
 * Uses MCP tools: analyze_product_ecosystem, get_related_products
 * 
 * @0711/templates - Reusable across all clients
 */

import { WidgetBase, WidgetConfig, EventBus, EventTypes } from '@0711/core';

export interface EcosystemMapConfig extends WidgetConfig {
  settings?: {
    productId?: string;
    /** Relationship types to show */
    relationTypes?: EcosystemRelationType[];
    /** Maximum depth of relationships */
    maxDepth?: number;
    /** Layout type */
    layout?: 'radial' | 'tree' | 'force';
    /** Auto-load on product select */
    autoLoad?: boolean;
  };
}

export type EcosystemRelationType = 
  | 'accessory'
  | 'replacement'
  | 'consumable'
  | 'compatible'
  | 'upgrade'
  | 'bundle'
  | 'variant';

export interface EcosystemNode {
  id: string;
  name: string;
  type: 'product' | 'category' | 'group';
  image?: string;
  isCenter?: boolean;
  depth: number;
}

export interface EcosystemEdge {
  source: string;
  target: string;
  relationType: EcosystemRelationType;
  label?: string;
  strength?: number; // 0-1, for force-directed layout
}

export interface EcosystemData {
  nodes: EcosystemNode[];
  edges: EcosystemEdge[];
  centerProduct: {
    id: string;
    name: string;
  };
  stats: {
    totalRelated: number;
    byType: Record<EcosystemRelationType, number>;
  };
}

export interface MCPClient {
  call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T>;
}

export class EcosystemMapWidget extends WidgetBase {
  private ecosystemData: EcosystemData | null = null;
  private currentProductId: string | null = null;
  private selectedNode: EcosystemNode | null = null;
  private mcpClient: MCPClient | null = null;

  constructor(config: EcosystemMapConfig) {
    super({
      ...config,
      type: 'ecosystem-map',
      subscriptions: ['product.selected', 'product.detail.loaded', ...(config.subscriptions || [])],
    });
  }

  setMCPClient(client: MCPClient): void {
    this.mcpClient = client;
  }

  async onMount(): Promise<void> {
    await super.onMount();

    const productId = (this.config as EcosystemMapConfig).settings?.productId;
    if (productId) {
      await this.loadEcosystem(productId);
    }
  }

  protected handleEvent(event: string, payload: unknown): void {
    const settings = (this.config as EcosystemMapConfig).settings || {};

    if ((event === EventTypes.PRODUCT_SELECTED || event === 'product.selected' ||
         event === EventTypes.PRODUCT_DETAIL_LOADED || event === 'product.detail.loaded') &&
        settings.autoLoad !== false) {
      const { productId } = payload as { productId: string };
      if (productId) {
        this.loadEcosystem(productId);
      }
    }
  }

  /**
   * Load ecosystem for a product via MCP tool: analyze_product_ecosystem
   */
  async loadEcosystem(productId: string): Promise<EcosystemData | null> {
    try {
      this.state = 'loading';
      this.currentProductId = productId;
      this.selectedNode = null;

      const settings = (this.config as EcosystemMapConfig).settings || {};

      if (this.mcpClient) {
        this.ecosystemData = await this.mcpClient.call<EcosystemData>('analyze_product_ecosystem', {
          productId,
          relationTypes: settings.relationTypes,
          maxDepth: settings.maxDepth || 2,
        });

        // Mark center product
        const centerNode = this.ecosystemData.nodes.find(n => n.id === productId);
        if (centerNode) {
          centerNode.isCenter = true;
        }

        EventBus.emit('ecosystem.loaded', {
          productId,
          nodeCount: this.ecosystemData.nodes.length,
          edgeCount: this.ecosystemData.edges.length,
          source: this.id,
          timestamp: Date.now(),
        });
      }

      this.state = 'ready';
      return this.ecosystemData;
    } catch (error) {
      this.setError(error as Error);
      return null;
    }
  }

  /**
   * Select a node in the ecosystem graph
   */
  selectNode(nodeId: string): void {
    const node = this.ecosystemData?.nodes.find(n => n.id === nodeId);
    if (!node) return;

    this.selectedNode = node;

    EventBus.emit('ecosystem.node.selected', {
      node,
      source: this.id,
      timestamp: Date.now(),
    });

    // If it's a product node, emit product.selected
    if (node.type === 'product') {
      EventBus.emit(EventTypes.PRODUCT_SELECTED, {
        productId: node.id,
        productName: node.name,
        source: this.id,
      });
    }
  }

  /**
   * Navigate to a node (load its ecosystem)
   */
  async navigateToNode(nodeId: string): Promise<void> {
    const node = this.ecosystemData?.nodes.find(n => n.id === nodeId);
    if (!node || node.type !== 'product') return;

    await this.loadEcosystem(nodeId);

    EventBus.emit('ecosystem.navigated', {
      fromProductId: this.currentProductId,
      toProductId: nodeId,
      source: this.id,
    });
  }

  /**
   * Filter edges by relation type
   */
  filterByRelationType(types: EcosystemRelationType[]): void {
    // This is for UI filtering, actual data remains unchanged
    EventBus.emit('ecosystem.filtered', {
      relationTypes: types,
      source: this.id,
    });
  }

  /**
   * Get nodes by depth level
   */
  getNodesByDepth(depth: number): EcosystemNode[] {
    if (!this.ecosystemData) return [];
    return this.ecosystemData.nodes.filter(n => n.depth === depth);
  }

  /**
   * Get edges for a specific node
   */
  getNodeEdges(nodeId: string): EcosystemEdge[] {
    if (!this.ecosystemData) return [];
    return this.ecosystemData.edges.filter(
      e => e.source === nodeId || e.target === nodeId
    );
  }

  /**
   * Get related products by type
   */
  getRelatedByType(type: EcosystemRelationType): EcosystemNode[] {
    if (!this.ecosystemData) return [];
    
    const relatedIds = this.ecosystemData.edges
      .filter(e => e.relationType === type)
      .flatMap(e => [e.source, e.target])
      .filter(id => id !== this.currentProductId);
    
    return this.ecosystemData.nodes.filter(n => relatedIds.includes(n.id));
  }

  /**
   * Get relation type icon
   */
  static getRelationIcon(type: EcosystemRelationType): string {
    const icons: Record<EcosystemRelationType, string> = {
      accessory: '🔌',
      replacement: '🔄',
      consumable: '📦',
      compatible: '✓',
      upgrade: '⬆️',
      bundle: '📦',
      variant: '🔀',
    };
    return icons[type] || '🔗';
  }

  /**
   * Get relation type label
   */
  static getRelationLabel(type: EcosystemRelationType): string {
    const labels: Record<EcosystemRelationType, string> = {
      accessory: 'Accessory',
      replacement: 'Replacement',
      consumable: 'Consumable',
      compatible: 'Compatible',
      upgrade: 'Upgrade',
      bundle: 'Bundle',
      variant: 'Variant',
    };
    return labels[type] || type;
  }

  getEcosystemData(): EcosystemData | null {
    return this.ecosystemData;
  }

  getCurrentProductId(): string | null {
    return this.currentProductId;
  }

  getSelectedNode(): EcosystemNode | null {
    return this.selectedNode;
  }
}
