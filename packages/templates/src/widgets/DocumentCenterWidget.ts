/**
 * DocumentCenterWidget - Product documents and datasheets
 * Uses MCP tool: get_product_documents
 * 
 * @0711/templates - Reusable across all clients
 */

import { WidgetBase, WidgetConfig, EventBus, EventTypes } from '@0711/core';

export interface DocumentCenterConfig extends WidgetConfig {
  settings?: {
    productId?: string;
    /** Filter by document types */
    documentTypes?: DocumentType[];
    /** Group documents by type */
    groupByType?: boolean;
    /** Show preview panel */
    showPreview?: boolean;
    /** Auto-load on product select */
    autoLoad?: boolean;
  };
}

export type DocumentType = 
  | 'datasheet'
  | 'manual'
  | 'certificate'
  | 'cad'
  | 'brochure'
  | 'safety'
  | 'warranty'
  | 'other';

export interface ProductDocument {
  id: string;
  type: DocumentType;
  name: string;
  description?: string;
  url: string;
  previewUrl?: string;
  mimeType: string;
  size: number;
  language?: string;
  version?: string;
  updatedAt?: string;
}

export interface MCPClient {
  call<T = unknown>(tool: string, params: Record<string, unknown>): Promise<T>;
}

export class DocumentCenterWidget extends WidgetBase {
  private documents: ProductDocument[] = [];
  private selectedDocument: ProductDocument | null = null;
  private currentProductId: string | null = null;
  private mcpClient: MCPClient | null = null;

  constructor(config: DocumentCenterConfig) {
    super({ 
      ...config, 
      type: 'document-center',
      subscriptions: ['product.selected', 'product.detail.loaded', ...(config.subscriptions || [])],
    });
  }

  setMCPClient(client: MCPClient): void {
    this.mcpClient = client;
  }

  async onMount(): Promise<void> {
    await super.onMount();
    
    const productId = (this.config as DocumentCenterConfig).settings?.productId;
    if (productId) {
      await this.loadDocuments(productId);
    }
  }

  protected handleEvent(event: string, payload: unknown): void {
    const settings = (this.config as DocumentCenterConfig).settings || {};
    
    if ((event === EventTypes.PRODUCT_SELECTED || event === 'product.selected' ||
         event === EventTypes.PRODUCT_DETAIL_LOADED || event === 'product.detail.loaded') &&
        settings.autoLoad !== false) {
      const { productId } = payload as { productId: string };
      if (productId) {
        this.loadDocuments(productId);
      }
    }
  }

  /**
   * Load documents for a product via MCP tool: get_product_documents
   */
  async loadDocuments(productId: string): Promise<ProductDocument[]> {
    try {
      this.state = 'loading';
      this.currentProductId = productId;
      const settings = (this.config as DocumentCenterConfig).settings || {};

      if (this.mcpClient) {
        let docs = await this.mcpClient.call<ProductDocument[]>('get_product_documents', {
          productId,
        });
        
        // Filter by types if specified
        if (settings.documentTypes && settings.documentTypes.length > 0) {
          docs = docs.filter(d => settings.documentTypes!.includes(d.type));
        }
        
        this.documents = docs;
      } else {
        console.warn('DocumentCenterWidget: No MCP client configured');
        this.documents = [];
      }

      EventBus.emit('documents.loaded', {
        productId,
        documents: this.documents,
        count: this.documents.length,
        source: this.id,
        timestamp: Date.now(),
      });

      this.state = 'ready';
      return this.documents;
    } catch (error) {
      this.setError(error as Error);
      return [];
    }
  }

  /**
   * Select a document for preview
   */
  selectDocument(documentId: string): void {
    const doc = this.documents.find(d => d.id === documentId);
    if (doc) {
      this.selectedDocument = doc;
      
      EventBus.emit('document.selected', {
        document: doc,
        productId: this.currentProductId,
        source: this.id,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Download a document
   */
  downloadDocument(documentId: string): void {
    const doc = this.documents.find(d => d.id === documentId);
    if (doc) {
      EventBus.emit('document.download.started', {
        document: doc,
        source: this.id,
        timestamp: Date.now(),
      });
      
      // Trigger download
      window.open(doc.url, '_blank');
    }
  }

  /**
   * Get documents grouped by type
   */
  getDocumentsByType(): Record<DocumentType, ProductDocument[]> {
    const grouped: Partial<Record<DocumentType, ProductDocument[]>> = {};
    
    for (const doc of this.documents) {
      if (!grouped[doc.type]) {
        grouped[doc.type] = [];
      }
      grouped[doc.type]!.push(doc);
    }
    
    return grouped as Record<DocumentType, ProductDocument[]>;
  }

  /**
   * Get document type label
   */
  static getTypeLabel(type: DocumentType): string {
    const labels: Record<DocumentType, string> = {
      datasheet: 'Datenblatt',
      manual: 'Anleitung',
      certificate: 'Zertifikat',
      cad: 'CAD-Daten',
      brochure: 'Broschüre',
      safety: 'Sicherheit',
      warranty: 'Garantie',
      other: 'Sonstige',
    };
    return labels[type] || type;
  }

  /**
   * Get document type icon
   */
  static getTypeIcon(type: DocumentType): string {
    const icons: Record<DocumentType, string> = {
      datasheet: '📄',
      manual: '📖',
      certificate: '🏅',
      cad: '📐',
      brochure: '📰',
      safety: '⚠️',
      warranty: '🛡️',
      other: '📎',
    };
    return icons[type] || '📄';
  }

  /**
   * Format file size
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getDocuments(): ProductDocument[] {
    return this.documents;
  }

  getSelectedDocument(): ProductDocument | null {
    return this.selectedDocument;
  }

  getCurrentProductId(): string | null {
    return this.currentProductId;
  }
}
