/**
 * WorkingMemory - High-level working memory for agents and sessions
 * Sprint 6.2 - Memory Layer 1
 */

import { MemoryStore, InMemoryStore, MemoryStoreConfig } from './MemoryStore';
import { EventBus } from '../events/EventBus';

export interface WorkingMemoryConfig extends MemoryStoreConfig {
  /** Session ID for isolation */
  sessionId?: string;
  /** Auto-save to events */
  emitEvents?: boolean;
}

export interface ContextItem {
  type: 'product' | 'search' | 'comparison' | 'user_action' | 'agent_response' | 'custom';
  data: unknown;
  timestamp: number;
  source?: string;
  relevance?: number; // 0-1, for context selection
}

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class WorkingMemory {
  private store: MemoryStore;
  private config: Required<WorkingMemoryConfig>;
  
  // Key prefixes
  private readonly CONTEXT_PREFIX = 'context';
  private readonly CONVERSATION_PREFIX = 'conversation';
  private readonly STATE_PREFIX = 'state';
  private readonly CACHE_PREFIX = 'cache';

  constructor(config: WorkingMemoryConfig = {}, store?: MemoryStore) {
    this.config = {
      defaultTTL: config.defaultTTL || 3600, // 1 hour default
      maxEntries: config.maxEntries || 1000,
      namespace: config.namespace || 'wm',
      sessionId: config.sessionId || 'default',
      emitEvents: config.emitEvents ?? true,
    };

    this.store = store || new InMemoryStore({
      defaultTTL: this.config.defaultTTL,
      maxEntries: this.config.maxEntries,
      namespace: `${this.config.namespace}:${this.config.sessionId}`,
    });
  }

  // ============ Context Management ============

  /**
   * Add a context item
   */
  async addContext(type: ContextItem['type'], data: unknown, source?: string): Promise<void> {
    const item: ContextItem = {
      type,
      data,
      timestamp: Date.now(),
      source,
      relevance: 1.0,
    };

    const key = `${this.CONTEXT_PREFIX}:${type}:${Date.now()}`;
    await this.store.set(key, item);

    if (this.config.emitEvents) {
      EventBus.emit('memory.context.added', {
        sessionId: this.config.sessionId,
        type,
        source,
      });
    }
  }

  /**
   * Get recent context items
   */
  async getRecentContext(limit = 10, types?: ContextItem['type'][]): Promise<ContextItem[]> {
    const keys = await this.store.keys(`${this.CONTEXT_PREFIX}:*`);
    const entries = await this.store.getMany<ContextItem>(keys);
    
    let items = Array.from(entries.values())
      .filter((item): item is ContextItem => item !== null);
    
    // Filter by types
    if (types && types.length > 0) {
      items = items.filter(item => types.includes(item.type));
    }
    
    // Sort by timestamp descending and limit
    return items
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get context by type
   */
  async getContextByType(type: ContextItem['type']): Promise<ContextItem[]> {
    const keys = await this.store.keys(`${this.CONTEXT_PREFIX}:${type}:*`);
    const entries = await this.store.getMany<ContextItem>(keys);
    
    return Array.from(entries.values())
      .filter((item): item is ContextItem => item !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear old context items
   */
  async clearOldContext(maxAge: number): Promise<number> {
    const keys = await this.store.keys(`${this.CONTEXT_PREFIX}:*`);
    const entries = await this.store.getMany<ContextItem>(keys);
    const now = Date.now();
    let cleared = 0;

    for (const [key, item] of entries) {
      if (item && now - item.timestamp > maxAge) {
        await this.store.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  // ============ Conversation History ============

  /**
   * Add a conversation turn
   */
  async addTurn(role: ConversationTurn['role'], content: string, metadata?: Record<string, unknown>): Promise<void> {
    const turn: ConversationTurn = {
      role,
      content,
      timestamp: Date.now(),
      metadata,
    };

    const key = `${this.CONVERSATION_PREFIX}:${Date.now()}`;
    await this.store.set(key, turn);

    if (this.config.emitEvents) {
      EventBus.emit('memory.conversation.turn', {
        sessionId: this.config.sessionId,
        role,
      });
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(limit = 20): Promise<ConversationTurn[]> {
    const keys = await this.store.keys(`${this.CONVERSATION_PREFIX}:*`);
    const entries = await this.store.getMany<ConversationTurn>(keys);
    
    return Array.from(entries.values())
      .filter((turn): turn is ConversationTurn => turn !== null)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);
  }

  /**
   * Clear conversation history
   */
  async clearConversation(): Promise<void> {
    const keys = await this.store.keys(`${this.CONVERSATION_PREFIX}:*`);
    await this.store.deleteMany(keys);
  }

  // ============ State Management ============

  /**
   * Set a state value
   */
  async setState<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    await this.store.set(`${this.STATE_PREFIX}:${key}`, value, ttl);
  }

  /**
   * Get a state value
   */
  async getState<T = unknown>(key: string): Promise<T | null> {
    return this.store.get<T>(`${this.STATE_PREFIX}:${key}`);
  }

  /**
   * Delete a state value
   */
  async deleteState(key: string): Promise<boolean> {
    return this.store.delete(`${this.STATE_PREFIX}:${key}`);
  }

  /**
   * Get all state keys
   */
  async getStateKeys(): Promise<string[]> {
    const keys = await this.store.keys(`${this.STATE_PREFIX}:*`);
    return keys.map(k => k.replace(`${this.STATE_PREFIX}:`, ''));
  }

  // ============ Cache Management ============

  /**
   * Cache a value (shorter TTL)
   */
  async cache<T = unknown>(key: string, value: T, ttl = 300): Promise<void> {
    await this.store.set(`${this.CACHE_PREFIX}:${key}`, value, ttl);
  }

  /**
   * Get cached value
   */
  async getCached<T = unknown>(key: string): Promise<T | null> {
    return this.store.get<T>(`${this.CACHE_PREFIX}:${key}`);
  }

  /**
   * Get or compute cached value
   */
  async getOrCompute<T = unknown>(
    key: string,
    compute: () => Promise<T>,
    ttl = 300
  ): Promise<T> {
    const cached = await this.getCached<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await compute();
    await this.cache(key, value, ttl);
    return value;
  }

  // ============ Product-Specific Helpers ============

  /**
   * Remember selected product
   */
  async setSelectedProduct(productId: string, productData?: unknown): Promise<void> {
    await this.setState('selectedProduct', { id: productId, data: productData });
    await this.addContext('product', { productId, data: productData }, 'selection');
  }

  /**
   * Get selected product
   */
  async getSelectedProduct(): Promise<{ id: string; data?: unknown } | null> {
    return this.getState('selectedProduct');
  }

  /**
   * Remember search query
   */
  async setLastSearch(query: string, results?: unknown[]): Promise<void> {
    await this.setState('lastSearch', { query, results, timestamp: Date.now() });
    await this.addContext('search', { query, resultCount: results?.length }, 'search');
  }

  /**
   * Get last search
   */
  async getLastSearch(): Promise<{ query: string; results?: unknown[]; timestamp: number } | null> {
    return this.getState('lastSearch');
  }

  /**
   * Remember compared products
   */
  async setComparedProducts(productIds: string[]): Promise<void> {
    await this.setState('comparedProducts', productIds);
    await this.addContext('comparison', { productIds }, 'comparison');
  }

  /**
   * Get compared products
   */
  async getComparedProducts(): Promise<string[] | null> {
    return this.getState('comparedProducts');
  }

  // ============ Utilities ============

  /**
   * Get summary for agent context
   */
  async getSummary(): Promise<{
    selectedProduct: { id: string; data?: unknown } | null;
    lastSearch: { query: string; resultCount?: number } | null;
    comparedProducts: string[] | null;
    recentContext: ContextItem[];
    conversationLength: number;
  }> {
    const [selectedProduct, lastSearch, comparedProducts, recentContext, conversation] = await Promise.all([
      this.getSelectedProduct(),
      this.getLastSearch(),
      this.getComparedProducts(),
      this.getRecentContext(5),
      this.getConversation(100),
    ]);

    return {
      selectedProduct,
      lastSearch: lastSearch ? { query: lastSearch.query, resultCount: lastSearch.results?.length } : null,
      comparedProducts,
      recentContext,
      conversationLength: conversation.length,
    };
  }

  /**
   * Clear all working memory
   */
  async clear(): Promise<void> {
    await this.store.clear();
  }

  /**
   * Get memory stats
   */
  async getStats() {
    return this.store.stats();
  }
}
