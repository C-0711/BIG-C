/**
 * MemoryStore - Abstract memory storage interface
 * Sprint 6.2 - Memory Layer 1
 */

export interface MemoryEntry<T = unknown> {
  key: string;
  value: T;
  ttl?: number; // Time-to-live in seconds
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryStoreConfig {
  /** Default TTL in seconds */
  defaultTTL?: number;
  /** Maximum entries (0 = unlimited) */
  maxEntries?: number;
  /** Namespace prefix for keys */
  namespace?: string;
}

export interface MemoryStore {
  /** Get a value by key */
  get<T = unknown>(key: string): Promise<T | null>;
  
  /** Set a value with optional TTL */
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
  
  /** Delete a key */
  delete(key: string): Promise<boolean>;
  
  /** Check if key exists */
  has(key: string): Promise<boolean>;
  
  /** Get multiple values */
  getMany<T = unknown>(keys: string[]): Promise<Map<string, T | null>>;
  
  /** Set multiple values */
  setMany<T = unknown>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void>;
  
  /** Delete multiple keys */
  deleteMany(keys: string[]): Promise<number>;
  
  /** Get all keys matching a pattern */
  keys(pattern?: string): Promise<string[]>;
  
  /** Clear all entries */
  clear(): Promise<void>;
  
  /** Get entry with metadata */
  getEntry<T = unknown>(key: string): Promise<MemoryEntry<T> | null>;
  
  /** Get TTL remaining for a key */
  getTTL(key: string): Promise<number | null>;
  
  /** Update TTL for a key */
  setTTL(key: string, ttl: number): Promise<boolean>;
  
  /** Get store stats */
  stats(): Promise<MemoryStoreStats>;
}

export interface MemoryStoreStats {
  entries: number;
  memoryUsage?: number;
  hits: number;
  misses: number;
  expirations: number;
}

/**
 * In-memory implementation of MemoryStore
 */
export class InMemoryStore implements MemoryStore {
  private store: Map<string, MemoryEntry> = new Map();
  private config: Required<MemoryStoreConfig>;
  private _stats: { hits: number; misses: number; expirations: number } = {
    hits: 0,
    misses: 0,
    expirations: 0,
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: MemoryStoreConfig = {}) {
    this.config = {
      defaultTTL: config.defaultTTL || 0, // 0 = no expiration
      maxEntries: config.maxEntries || 0, // 0 = unlimited
      namespace: config.namespace || '',
    };

    // Start cleanup interval
    this.startCleanup();
  }

  private prefixKey(key: string): string {
    return this.config.namespace ? `${this.config.namespace}:${key}` : key;
  }

  private unprefixKey(key: string): string {
    if (this.config.namespace && key.startsWith(`${this.config.namespace}:`)) {
      return key.slice(this.config.namespace.length + 1);
    }
    return key;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const entry = await this.getEntry<T>(key);
    if (entry) {
      this._stats.hits++;
      return entry.value;
    }
    this._stats.misses++;
    return null;
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const prefixedKey = this.prefixKey(key);
    const now = Date.now();
    const effectiveTTL = ttl ?? this.config.defaultTTL;

    // Check max entries
    if (this.config.maxEntries > 0 && this.store.size >= this.config.maxEntries) {
      // Evict oldest entry
      const oldestKey = this.findOldestEntry();
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }

    const entry: MemoryEntry<T> = {
      key: prefixedKey,
      value,
      ttl: effectiveTTL || undefined,
      createdAt: now,
      updatedAt: now,
      expiresAt: effectiveTTL ? now + effectiveTTL * 1000 : undefined,
    };

    this.store.set(prefixedKey, entry);
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(this.prefixKey(key));
  }

  async has(key: string): Promise<boolean> {
    const entry = this.store.get(this.prefixKey(key));
    if (!entry) return false;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(this.prefixKey(key));
      this._stats.expirations++;
      return false;
    }
    return true;
  }

  async getMany<T = unknown>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    for (const key of keys) {
      results.set(key, await this.get<T>(key));
    }
    return results;
  }

  async setMany<T = unknown>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const { key, value, ttl } of entries) {
      await this.set(key, value, ttl);
    }
  }

  async deleteMany(keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      if (await this.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  }

  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.store.keys()).map(k => this.unprefixKey(k));
    
    if (!pattern) return allKeys;
    
    // Simple glob pattern matching
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    
    return allKeys.filter(key => regex.test(key));
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async getEntry<T = unknown>(key: string): Promise<MemoryEntry<T> | null> {
    const entry = this.store.get(this.prefixKey(key)) as MemoryEntry<T> | undefined;
    
    if (!entry) return null;
    
    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(this.prefixKey(key));
      this._stats.expirations++;
      return null;
    }
    
    return entry;
  }

  async getTTL(key: string): Promise<number | null> {
    const entry = await this.getEntry(key);
    if (!entry || !entry.expiresAt) return null;
    
    const remaining = Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000));
    return remaining;
  }

  async setTTL(key: string, ttl: number): Promise<boolean> {
    const prefixedKey = this.prefixKey(key);
    const entry = this.store.get(prefixedKey);
    
    if (!entry) return false;
    
    entry.ttl = ttl;
    entry.expiresAt = Date.now() + ttl * 1000;
    entry.updatedAt = Date.now();
    
    return true;
  }

  async stats(): Promise<MemoryStoreStats> {
    return {
      entries: this.store.size,
      hits: this._stats.hits,
      misses: this._stats.misses,
      expirations: this._stats.expirations,
    };
  }

  private findOldestEntry(): string | null {
    let oldest: { key: string; time: number } | null = null;
    
    for (const [key, entry] of this.store) {
      if (!oldest || entry.createdAt < oldest.time) {
        oldest = { key, time: entry.createdAt };
      }
    }
    
    return oldest?.key || null;
  }

  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store) {
        if (entry.expiresAt && now > entry.expiresAt) {
          this.store.delete(key);
          this._stats.expirations++;
        }
      }
    }, 60000);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}
