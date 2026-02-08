/**
 * MediaGalleryWidget - Product media gallery with lightbox
 * Uses MCP tools: get_product_media, get_product_images
 * 
 * @0711/templates - Reusable across all clients
 */

import { WidgetBase, WidgetConfig, EventBus, EventTypes } from '@0711/core';

export interface MediaGalleryConfig extends WidgetConfig {
  settings?: {
    productId?: string;
    /** Show only images (no videos/docs) */
    imagesOnly?: boolean;
    /** Thumbnail size */
    thumbnailSize?: 'small' | 'medium' | 'large';
    /** Enable lightbox zoom */
    enableLightbox?: boolean;
    /** Auto-load on product select */
    autoLoad?: boolean;
  };
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document' | '3d';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface MCPClient {
  call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T>;
}

export class MediaGalleryWidget extends WidgetBase {
  private mediaItems: MediaItem[] = [];
  private selectedItem: MediaItem | null = null;
  private currentProductId: string | null = null;
  private mcpClient: MCPClient | null = null;
  private lightboxOpen = false;

  constructor(config: MediaGalleryConfig) {
    super({ 
      ...config, 
      type: 'media-gallery',
      subscriptions: ['product.selected', 'product.detail.loaded', ...(config.subscriptions || [])],
    });
  }

  setMCPClient(client: MCPClient): void {
    this.mcpClient = client;
  }

  async onMount(): Promise<void> {
    await super.onMount();
    
    const productId = (this.config as MediaGalleryConfig).settings?.productId;
    if (productId) {
      await this.loadMedia(productId);
    }
  }

  protected handleEvent(event: string, payload: unknown): void {
    const settings = (this.config as MediaGalleryConfig).settings || {};
    
    if ((event === EventTypes.PRODUCT_SELECTED || event === 'product.selected' ||
         event === EventTypes.PRODUCT_DETAIL_LOADED || event === 'product.detail.loaded') &&
        settings.autoLoad !== false) {
      const { productId } = payload as { productId: string };
      if (productId) {
        this.loadMedia(productId);
      }
    }
  }

  /**
   * Load media for a product via MCP tools
   */
  async loadMedia(productId: string): Promise<MediaItem[]> {
    try {
      this.state = 'loading';
      this.currentProductId = productId;
      const settings = (this.config as MediaGalleryConfig).settings || {};

      if (this.mcpClient) {
        if (settings.imagesOnly) {
          // Get images only
          this.mediaItems = await this.mcpClient.call<MediaItem[]>('get_product_images', {
            productId,
          });
        } else {
          // Get all media
          this.mediaItems = await this.mcpClient.call<MediaItem[]>('get_product_media', {
            productId,
          });
        }
      } else {
        console.warn('MediaGalleryWidget: No MCP client configured');
        this.mediaItems = [];
      }

      // Select first item by default
      if (this.mediaItems.length > 0) {
        this.selectedItem = this.mediaItems[0];
      }

      EventBus.emit('media.loaded', {
        productId,
        mediaItems: this.mediaItems,
        count: this.mediaItems.length,
        source: this.id,
        timestamp: Date.now(),
      });

      this.state = 'ready';
      return this.mediaItems;
    } catch (error) {
      this.setError(error as Error);
      return [];
    }
  }

  /**
   * Select a media item
   */
  selectItem(itemId: string): void {
    const item = this.mediaItems.find(m => m.id === itemId);
    if (item) {
      this.selectedItem = item;
      
      EventBus.emit('media.selected', {
        item,
        productId: this.currentProductId,
        source: this.id,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Open lightbox with selected item
   */
  openLightbox(itemId?: string): void {
    if (itemId) {
      this.selectItem(itemId);
    }
    this.lightboxOpen = true;
    
    EventBus.emit('media.lightbox.opened', {
      item: this.selectedItem,
      source: this.id,
      timestamp: Date.now(),
    });
  }

  /**
   * Close lightbox
   */
  closeLightbox(): void {
    this.lightboxOpen = false;
    
    EventBus.emit('media.lightbox.closed', {
      source: this.id,
      timestamp: Date.now(),
    });
  }

  /**
   * Navigate to next item in lightbox
   */
  nextItem(): void {
    if (!this.selectedItem) return;
    const currentIndex = this.mediaItems.findIndex(m => m.id === this.selectedItem!.id);
    const nextIndex = (currentIndex + 1) % this.mediaItems.length;
    this.selectItem(this.mediaItems[nextIndex].id);
  }

  /**
   * Navigate to previous item in lightbox
   */
  prevItem(): void {
    if (!this.selectedItem) return;
    const currentIndex = this.mediaItems.findIndex(m => m.id === this.selectedItem!.id);
    const prevIndex = (currentIndex - 1 + this.mediaItems.length) % this.mediaItems.length;
    this.selectItem(this.mediaItems[prevIndex].id);
  }

  /**
   * Filter media by type
   */
  getMediaByType(type: MediaItem['type']): MediaItem[] {
    return this.mediaItems.filter(m => m.type === type);
  }

  getMediaItems(): MediaItem[] {
    return this.mediaItems;
  }

  getSelectedItem(): MediaItem | null {
    return this.selectedItem;
  }

  isLightboxOpen(): boolean {
    return this.lightboxOpen;
  }

  getCurrentProductId(): string | null {
    return this.currentProductId;
  }
}
