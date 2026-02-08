/**
 * LocalStoragePersistence - Browser localStorage persistence adapter
 * Sprint 3.1 - Dashboard Basics
 */

import { DashboardConfig } from '../DashboardConfig';
import { DashboardPersistence } from '../DashboardManager';

export class LocalStoragePersistence implements DashboardPersistence {
  private prefix: string;

  constructor(prefix = '0711-dashboard') {
    this.prefix = prefix;
  }

  private getKey(id: string): string {
    return `${this.prefix}:${id}`;
  }

  private getIndexKey(): string {
    return `${this.prefix}:__index__`;
  }

  async save(dashboard: DashboardConfig): Promise<void> {
    const key = this.getKey(dashboard.id);
    localStorage.setItem(key, JSON.stringify(dashboard));
    
    // Update index
    const index = this.getIndex();
    if (!index.includes(dashboard.id)) {
      index.push(dashboard.id);
      localStorage.setItem(this.getIndexKey(), JSON.stringify(index));
    }
  }

  async load(id: string): Promise<DashboardConfig | null> {
    const key = this.getKey(id);
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    try {
      return JSON.parse(data) as DashboardConfig;
    } catch {
      return null;
    }
  }

  async list(): Promise<DashboardConfig[]> {
    const index = this.getIndex();
    const dashboards: DashboardConfig[] = [];
    
    for (const id of index) {
      const dashboard = await this.load(id);
      if (dashboard) {
        dashboards.push(dashboard);
      }
    }
    
    return dashboards;
  }

  async delete(id: string): Promise<void> {
    const key = this.getKey(id);
    localStorage.removeItem(key);
    
    // Update index
    const index = this.getIndex().filter(i => i !== id);
    localStorage.setItem(this.getIndexKey(), JSON.stringify(index));
  }

  private getIndex(): string[] {
    const data = localStorage.getItem(this.getIndexKey());
    if (!data) return [];
    
    try {
      return JSON.parse(data) as string[];
    } catch {
      return [];
    }
  }

  /**
   * Clear all dashboards
   */
  async clear(): Promise<void> {
    const index = this.getIndex();
    for (const id of index) {
      localStorage.removeItem(this.getKey(id));
    }
    localStorage.removeItem(this.getIndexKey());
  }
}
