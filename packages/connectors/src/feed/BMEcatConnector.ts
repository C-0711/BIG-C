import * as fs from 'fs';
import { BaseConnector } from '../BaseConnector';
import { Schema, SchemaField, FieldMapping, SyncResult } from '../types';

interface BMEcatProduct {
  supplier_pid: string;
  description_short: string;
  description_long?: string;
  manufacturer_pid?: string;
  manufacturer_name?: string;
  ean?: string;
  keywords?: string[];
  features?: BMEcatFeature[];
  prices?: BMEcatPrice[];
  mime_info?: BMEcatMime[];
  category?: string;
}

interface BMEcatFeature {
  name: string;
  value: string;
  unit?: string;
}

interface BMEcatPrice {
  price_type: string;
  price_amount: number;
  price_currency: string;
  tax?: number;
}

interface BMEcatMime {
  mime_type: string;
  mime_source: string;
  mime_descr?: string;
}

/**
 * BMEcat Connector - Import product data from BMEcat XML files
 * 
 * Supports BMEcat 1.2 and 2005 formats.
 * Used extensively in B2B e-commerce, especially in Germany.
 * 
 * @example
 * const connector = new BMEcatConnector('bosch-catalog', 'Bosch Product Catalog');
 * await connector.connect({ filePath: './Bosch_ETIM10_BMEcat2.xml' });
 * const products = await connector.preview(10);
 */
export class BMEcatConnector extends BaseConnector {
  private filePath: string = '';
  private products: BMEcatProduct[] = [];
  private catalogInfo: {
    catalog_id?: string;
    catalog_version?: string;
    catalog_name?: string;
    supplier_name?: string;
    generation_date?: string;
  } = {};

  constructor(id: string, name: string) {
    super(id, name, 'bmecat' as any);
  }

  async connect(config: { filePath: string }): Promise<void> {
    this.filePath = config.filePath;
    
    // Read XML file
    const content = fs.readFileSync(this.filePath, 'utf-8');
    
    // Parse BMEcat XML
    this.parseBMEcat(content);
    
    this.connected = true;
    console.log(`[BMEcat] Loaded ${this.products.length} products from catalog`);
  }

  private parseBMEcat(xml: string): void {
    // Extract catalog info
    const catalogIdMatch = xml.match(/<CATALOG_ID>([^<]+)<\/CATALOG_ID>/);
    const catalogVersionMatch = xml.match(/<CATALOG_VERSION>([^<]+)<\/CATALOG_VERSION>/);
    const catalogNameMatch = xml.match(/<CATALOG_NAME>([^<]+)<\/CATALOG_NAME>/);
    const supplierNameMatch = xml.match(/<SUPPLIER_NAME>([^<]+)<\/SUPPLIER_NAME>/);
    
    this.catalogInfo = {
      catalog_id: catalogIdMatch?.[1],
      catalog_version: catalogVersionMatch?.[1],
      catalog_name: catalogNameMatch?.[1],
      supplier_name: supplierNameMatch?.[1],
    };

    // Extract products (simplified parser - production would use proper XML parser)
    const productMatches = xml.matchAll(/<PRODUCT[^>]*>([\s\S]*?)<\/PRODUCT>/g);
    
    for (const match of productMatches) {
      const productXml = match[1];
      
      const product: BMEcatProduct = {
        supplier_pid: this.extractValue(productXml, 'SUPPLIER_PID') || '',
        description_short: this.extractValue(productXml, 'DESCRIPTION_SHORT') || '',
        description_long: this.extractValue(productXml, 'DESCRIPTION_LONG'),
        manufacturer_pid: this.extractValue(productXml, 'MANUFACTURER_PID'),
        manufacturer_name: this.extractValue(productXml, 'MANUFACTURER_NAME'),
        ean: this.extractValue(productXml, 'EAN'),
        features: this.extractFeatures(productXml),
        prices: this.extractPrices(productXml),
        mime_info: this.extractMimeInfo(productXml),
      };
      
      if (product.supplier_pid) {
        this.products.push(product);
      }
    }
  }

  private extractValue(xml: string, tag: string): string | undefined {
    const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`));
    return match?.[1]?.trim();
  }

  private extractFeatures(productXml: string): BMEcatFeature[] {
    const features: BMEcatFeature[] = [];
    const featureMatches = productXml.matchAll(/<FEATURE>([\s\S]*?)<\/FEATURE>/g);
    
    for (const match of featureMatches) {
      const featureXml = match[1];
      const name = this.extractValue(featureXml, 'FNAME') || this.extractValue(featureXml, 'FNAME');
      const value = this.extractValue(featureXml, 'FVALUE');
      const unit = this.extractValue(featureXml, 'FUNIT');
      
      if (name && value) {
        features.push({ name, value, unit });
      }
    }
    
    return features;
  }

  private extractPrices(productXml: string): BMEcatPrice[] {
    const prices: BMEcatPrice[] = [];
    const priceMatches = productXml.matchAll(/<PRODUCT_PRICE[^>]*>([\s\S]*?)<\/PRODUCT_PRICE>/g);
    
    for (const match of priceMatches) {
      const priceXml = match[1];
      const amount = this.extractValue(priceXml, 'PRICE_AMOUNT');
      const currency = this.extractValue(priceXml, 'PRICE_CURRENCY') || 'EUR';
      
      if (amount) {
        prices.push({
          price_type: 'net',
          price_amount: parseFloat(amount),
          price_currency: currency,
        });
      }
    }
    
    return prices;
  }

  private extractMimeInfo(productXml: string): BMEcatMime[] {
    const mimes: BMEcatMime[] = [];
    const mimeMatches = productXml.matchAll(/<MIME>([\s\S]*?)<\/MIME>/g);
    
    for (const match of mimeMatches) {
      const mimeXml = match[1];
      const type = this.extractValue(mimeXml, 'MIME_TYPE') || 'image/jpeg';
      const source = this.extractValue(mimeXml, 'MIME_SOURCE');
      const descr = this.extractValue(mimeXml, 'MIME_DESCR');
      
      if (source) {
        mimes.push({ mime_type: type, mime_source: source, mime_descr: descr });
      }
    }
    
    return mimes;
  }

  async disconnect(): Promise<void> {
    this.products = [];
    this.catalogInfo = {};
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      return fs.existsSync(this.filePath);
    } catch {
      return false;
    }
  }

  getCatalogInfo() {
    return this.catalogInfo;
  }

  async getSchema(): Promise<Schema> {
    const fields: SchemaField[] = [
      { name: 'supplier_pid', type: 'string', nullable: false, sample: this.products[0]?.supplier_pid },
      { name: 'description_short', type: 'string', nullable: false, sample: this.products[0]?.description_short },
      { name: 'description_long', type: 'string', nullable: true },
      { name: 'manufacturer_pid', type: 'string', nullable: true },
      { name: 'manufacturer_name', type: 'string', nullable: true },
      { name: 'ean', type: 'string', nullable: true },
      { name: 'features', type: 'array', nullable: true },
      { name: 'prices', type: 'array', nullable: true },
      { name: 'mime_info', type: 'array', nullable: true },
    ];

    return { fields };
  }

  async preview(limit: number = 10): Promise<BMEcatProduct[]> {
    this.ensureConnected();
    return this.products.slice(0, limit);
  }

  async sync(mapping: FieldMapping[]): Promise<SyncResult> {
    this.ensureConnected();
    
    const startTime = Date.now();
    const errors: SyncResult['errors'] = [];
    let created = 0;
    let failed = 0;

    for (let i = 0; i < this.products.length; i++) {
      try {
        const product = this.products[i];
        const mapped: Record<string, any> = {};
        
        for (const map of mapping) {
          mapped[map.target] = (product as any)[map.source];
        }
        
        // Would insert into database here
        created++;
      } catch (err: any) {
        failed++;
        errors.push({ row: i, message: err.message });
      }
    }

    return {
      success: failed === 0,
      recordsProcessed: this.products.length,
      recordsCreated: created,
      recordsUpdated: 0,
      recordsFailed: failed,
      errors,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    };
  }
}
