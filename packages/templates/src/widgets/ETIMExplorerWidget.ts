/**
 * ETIMExplorerWidget - ETIM classification tree navigation
 * Uses MCP tools: get_etim_groups, search_by_etim_group
 * 
 * @0711/templates - Reusable across all clients
 */

import { WidgetBase, WidgetConfig, EventBus } from '@0711/core';

export interface ETIMExplorerConfig extends WidgetConfig {
  settings?: {
    /** Initially expanded levels */
    expandedLevels?: number;
    /** Show product counts per category */
    showCounts?: boolean;
    /** Enable search within categories */
    enableSearch?: boolean;
  };
}

export interface ETIMGroup {
  id: string;
  code: string;
  name: string;
  description?: string;
  level: number;
  parentId?: string;
  children?: ETIMGroup[];
  productCount?: number;
}

export interface MCPClient {
  call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T>;
}

export class ETIMExplorerWidget extends WidgetBase {
  private etimTree: ETIMGroup[] = [];
  private selectedGroup: ETIMGroup | null = null;
  private expandedIds: Set<string> = new Set();
  private mcpClient: MCPClient | null = null;

  constructor(config: ETIMExplorerConfig) {
    super({ 
      ...config, 
      type: 'etim-explorer',
      subscriptions: ['navigation.breadcrumb_clicked', ...(config.subscriptions || [])],
    });
  }

  setMCPClient(client: MCPClient): void {
    this.mcpClient = client;
  }

  async onMount(): Promise<void> {
    await super.onMount();
    await this.loadETIMGroups();
  }

  protected handleEvent(event: string, payload: unknown): void {
    if (event === 'navigation.breadcrumb_clicked') {
      const { groupId } = payload as { groupId: string };
      if (groupId) {
        this.selectGroup(groupId);
      }
    }
  }

  /**
   * Load ETIM classification tree via MCP tool: get_etim_groups
   */
  async loadETIMGroups(): Promise<ETIMGroup[]> {
    try {
      this.state = 'loading';

      if (this.mcpClient) {
        this.etimTree = await this.mcpClient.call<ETIMGroup[]>('get_etim_groups', {});
        
        // Auto-expand first N levels
        const settings = (this.config as ETIMExplorerConfig).settings || {};
        const expandLevels = settings.expandedLevels || 1;
        this.autoExpand(this.etimTree, expandLevels);
      } else {
        console.warn('ETIMExplorerWidget: No MCP client configured');
        this.etimTree = [];
      }

      EventBus.emit('etim.tree.loaded', {
        tree: this.etimTree,
        source: this.id,
        timestamp: Date.now(),
      });

      this.state = 'ready';
      return this.etimTree;
    } catch (error) {
      this.setError(error as Error);
      return [];
    }
  }

  /**
   * Select a category and search products within it
   */
  async selectGroup(groupId: string): Promise<void> {
    const group = this.findGroup(this.etimTree, groupId);
    if (!group) return;

    this.selectedGroup = group;
    this.expandedIds.add(groupId);

    EventBus.emit('navigation.category_selected', {
      groupId: group.id,
      groupCode: group.code,
      groupName: group.name,
      level: group.level,
      source: this.id,
      timestamp: Date.now(),
    });

    // Search products in this category
    if (this.mcpClient) {
      try {
        const products = await this.mcpClient.call('search_by_etim_group', {
          etim_class: group.code,
        });

        EventBus.emit('etim.products.loaded', {
          groupId: group.id,
          products,
          source: this.id,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Failed to search ETIM group:', error);
      }
    }
  }

  /**
   * Toggle expansion of a group
   */
  toggleExpand(groupId: string): void {
    if (this.expandedIds.has(groupId)) {
      this.expandedIds.delete(groupId);
    } else {
      this.expandedIds.add(groupId);
    }
  }

  /**
   * Get breadcrumb path to a group
   */
  getBreadcrumb(groupId: string): ETIMGroup[] {
    const path: ETIMGroup[] = [];
    this.buildPath(this.etimTree, groupId, path);
    return path;
  }

  private findGroup(groups: ETIMGroup[], id: string): ETIMGroup | null {
    for (const group of groups) {
      if (group.id === id) return group;
      if (group.children) {
        const found = this.findGroup(group.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private buildPath(groups: ETIMGroup[], targetId: string, path: ETIMGroup[]): boolean {
    for (const group of groups) {
      if (group.id === targetId) {
        path.push(group);
        return true;
      }
      if (group.children && this.buildPath(group.children, targetId, path)) {
        path.unshift(group);
        return true;
      }
    }
    return false;
  }

  private autoExpand(groups: ETIMGroup[], levels: number, currentLevel = 0): void {
    if (currentLevel >= levels) return;
    for (const group of groups) {
      this.expandedIds.add(group.id);
      if (group.children) {
        this.autoExpand(group.children, levels, currentLevel + 1);
      }
    }
  }

  getTree(): ETIMGroup[] {
    return this.etimTree;
  }

  getSelectedGroup(): ETIMGroup | null {
    return this.selectedGroup;
  }

  isExpanded(groupId: string): boolean {
    return this.expandedIds.has(groupId);
  }
}
