/**
 * APIPersistence - Backend API persistence adapter
 * Sprint 3.1 - Dashboard Basics
 */

import { DashboardConfig } from '../DashboardConfig';
import { DashboardPersistence } from '../DashboardManager';

export interface APIPersistenceConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  /** Transform dashboard before saving */
  transformSave?: (dashboard: DashboardConfig) => unknown;
  /** Transform response after loading */
  transformLoad?: (data: unknown) => DashboardConfig;
}

export class APIPersistence implements DashboardPersistence {
  private config: APIPersistenceConfig;

  constructor(config: APIPersistenceConfig) {
    this.config = {
      ...config,
      transformSave: config.transformSave || ((d) => d),
      transformLoad: config.transformLoad || ((d) => d as DashboardConfig),
    };
  }

  async save(dashboard: DashboardConfig): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/dashboards/${dashboard.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
      body: JSON.stringify(this.config.transformSave!(dashboard)),
    });

    if (!response.ok) {
      throw new Error(`Failed to save dashboard: ${response.status}`);
    }
  }

  async load(id: string): Promise<DashboardConfig | null> {
    const response = await fetch(`${this.config.baseUrl}/dashboards/${id}`, {
      headers: this.config.headers,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to load dashboard: ${response.status}`);
    }

    const data = await response.json();
    return this.config.transformLoad!(data);
  }

  async list(): Promise<DashboardConfig[]> {
    const response = await fetch(`${this.config.baseUrl}/dashboards`, {
      headers: this.config.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to list dashboards: ${response.status}`);
    }

    const data = await response.json();
    return (data as unknown[]).map(d => this.config.transformLoad!(d));
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/dashboards/${id}`, {
      method: 'DELETE',
      headers: this.config.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete dashboard: ${response.status}`);
    }
  }
}
