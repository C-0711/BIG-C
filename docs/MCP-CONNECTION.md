# 0711-BIG-C MCP Connection Guide

## Overview

0711-BIG-C connects to client data via the **Model Context Protocol (MCP)**. Every client instance uses the same **27 standard MCP tools**, ensuring templates and widgets work identically across all deployments.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  0711-BIG-C Instance                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Widgets   │    │   Skills    │    │   Agents    │         │
│  │  (React UI) │    │ (Tool Chains│    │ (AI + Tools)│         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                   │                │
│         └──────────────────┼───────────────────┘                │
│                            │                                    │
│                   ┌────────▼────────┐                           │
│                   │   MCP Client    │                           │
│                   │ (Tool Executor) │                           │
│                   └────────┬────────┘                           │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Client MCP    │
                    │    Server       │
                    │                 │
                    │ • 27 Standard   │
                    │   Tools         │
                    │ • Custom Tools  │
                    │   (optional)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Client Data    │
                    │  (PostgreSQL,   │
                    │   Neo4j, etc.)  │
                    └─────────────────┘
```

## Standard MCP Tools (27 Tools)

These tools are **identical across all clients**. Only the underlying data differs.

### Search & Discovery (7 Tools)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `search_products` | Full-text product search | `{ query, filters?, limit? }` | `Product[]` |
| `search_similar_products` | Find similar products by ID | `{ productId, limit? }` | `Product[]` |
| `find_similar_products` | Find similar by specifications | `{ specs, criteria }` | `Product[]` |
| `search_by_etim_group` | Search within ETIM class | `{ etim_class, filters? }` | `Product[]` |
| `search_massive_products` | Search bulk/wholesale items | `{ query, filters? }` | `MassiveProduct[]` |
| `search_catalogs_semantic` | AI-powered catalog search | `{ natural_language_query }` | `CatalogEntry[]` |
| `find_product_in_catalogs` | Find product across catalogs | `{ productId }` | `CatalogLocation[]` |

### Product Details (9 Tools)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `get_product` | Get complete product details | `{ productId }` | `ProductDetail` |
| `get_related_products` | Get cross-sell products | `{ productId }` | `Product[]` |
| `get_product_media` | Get all media assets | `{ productId }` | `Media[]` |
| `get_product_images` | Get images only | `{ productId }` | `Image[]` |
| `get_product_documents` | Get PDFs, datasheets | `{ productId }` | `Document[]` |
| `get_massive_product` | Get bulk item details | `{ productId }` | `MassiveProductDetail` |
| `list_massive_products` | List bulk items | `{ filters? }` | `MassiveProduct[]` |
| `get_factsheet_data` | Get structured facts | `{ productId }` | `Factsheet` |
| `generate_factsheet_ultimate` | AI-generated datasheet | `{ productId }` | `RichFactsheet` |

### Classification & Taxonomy (5 Tools)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `get_etim_groups` | Get classification tree | `{}` | `ETIMTree` |
| `resolve_product_family` | Find product family | `{ productId }` | `FamilyInfo` |
| `resolve_product_family_advanced` | Extended family resolution | `{ criteria }` | `FamilyTree` |
| `get_product_class_terminology` | Get technical terms | `{ class_id }` | `Terminology` |
| `validate_product_terminology` | Validate terms | `{ terms }` | `ValidationResult` |

### Analytics & Intelligence (5 Tools)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `get_statistics` | Get catalog statistics | `{ scope? }` | `Statistics` |
| `aggregate_product_specs` | Aggregate specifications | `{ productIds }` | `AggregatedSpecs` |
| `check_product_compatibility` | Check compatibility | `{ productA, productB }` | `Compatibility` |
| `get_product_lineage` | Get version history | `{ productId }` | `Lineage` |
| `analyze_product_ecosystem` | Get ecosystem map | `{ productId }` | `Ecosystem` |

### Data Access (2 Tools)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `execute_sql` | Run SQL query | `{ query }` | `Rows` |
| `execute_cypher` | Run Neo4j query | `{ query }` | `GraphData` |

### Catalogs (1 Tool)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `list_catalogs` | List available catalogs | `{}` | `Catalog[]` |

## Client Configuration

### Environment Variables

```env
# MCP Connection
MCP_ENDPOINT=mcp://client-name.0711.io
MCP_API_KEY=your-api-key

# Optional: Override tool names for legacy systems
MCP_TOOL_PREFIX=client_  # e.g., client_search_products
```

### TypeScript Integration

```typescript
import { MCPClient } from '@0711/core';
import { ProductSearchWidget, STANDARD_MCP_TOOLS } from '@0711/templates';

// Initialize MCP client
const mcp = new MCPClient({
  endpoint: process.env.MCP_ENDPOINT,
  apiKey: process.env.MCP_API_KEY,
});

// Create widget with MCP
const searchWidget = new ProductSearchWidget({
  type: 'product-search',
  id: 'main-search',
  settings: { limit: 20 },
});
searchWidget.setMCPClient(mcp);

// Use widget
const results = await searchWidget.search('drill');
```

## Custom Tools

Clients can extend the standard toolset with custom tools:

```typescript
// config/custom-tools.json
{
  "customTools": [
    {
      "name": "get_dealer_prices",
      "description": "Get dealer-specific pricing",
      "input": { "productId": "string", "dealerId": "string" },
      "output": "DealerPrice"
    },
    {
      "name": "check_warranty_status",
      "description": "Check product warranty",
      "input": { "serialNumber": "string" },
      "output": "WarrantyStatus"
    }
  ]
}
```

Custom tools trigger a Claude re-analysis that suggests new widgets, skills, or agents combining standard and custom functionality.

## Widget ↔ MCP Tool Mapping

| Widget | Primary MCP Tool | Secondary Tools |
|--------|------------------|-----------------|
| ProductSearchWidget | `search_products` | - |
| ProductDetailWidget | `get_product` | `get_factsheet_data` |
| SimilarProductsWidget | `search_similar_products` | - |
| MediaGalleryWidget | `get_product_media` | `get_product_images` |
| ComparisonTableWidget | `aggregate_product_specs` | `get_product` |
| ETIMExplorerWidget | `get_etim_groups` | `search_by_etim_group` |
| CompatibilityCheckerWidget | `check_product_compatibility` | - |
| EcosystemMapWidget | `analyze_product_ecosystem` | `get_related_products` |
| DocumentCenterWidget | `get_product_documents` | - |
| FamilyTreeWidget | `resolve_product_family_advanced` | - |
| StatisticsDashboard | `get_statistics` | - |
| QueryBuilderWidget | `execute_sql`, `execute_cypher` | - |

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-08
