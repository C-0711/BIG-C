# 0711-C-Intelligence: Widget Wizard & AI-Bootstrapped Platform

## Konzept-Dokument v1.2
**Datum:** 2026-02-08  
**Status:** IN DEVELOPMENT  
**Änderung v1.2:** Sprint 1.1 & 1.2 tasks updated - Widget Framework & Event Bus COMPLETE

---

## 🚀 Development Progress

| Sprint | Name | Status | Notes |
|--------|------|--------|-------|
| 1.1 | Widget Framework | ✅ COMPLETE | WidgetBase, WidgetRegistry, WidgetConfig, WidgetRenderer |
| 1.2 | Event Bus | ✅ COMPLETE | EventBus, EventQueue, EventTypes, useWidgetEvents |
| 1.3 | Basic Widgets (3) | ✅ COMPLETE | ProductSearch, ProductDetail, SimilarProducts |
| 2.1 | MCP Integration | ✅ COMPLETE | MCPClient, ToolSchemaParser, ToolExecutor |
| 2.2 | More Widgets (3) | ✅ COMPLETE | ETIMExplorer, MediaGallery, DocumentCenter |
| 2.3 | Widget Wiring | ✅ COMPLETE | WidgetWiring, EventBuffer, subscription matrix |
| 3.1 | Dashboard Basics | ✅ COMPLETE | DashboardManager, Layout, Persistence |
| 3.2 | Widget Admin | ✅ COMPLETE | WidgetCreator, ConfigEditor, ToolArgumentBuilder |
| 3.3 | Testing & Polish | ✅ COMPLETE | Tests, ErrorBoundary, LoadingStates |

**PHASE 1 COMPLETE!** 🎉

**Last Updated:** 2026-02-08 11:45
**Architecture:** Core (@0711/core) + Templates (@0711/templates) - fully client-agnostic

### Phase 1 Summary:
- 6 Standard Widgets in @0711/templates
- MCP Integration with 27 standard tools
- Dashboard system with drag-drop, persistence
- Widget admin utilities
- Full test coverage for core modules
- Error handling and loading states

---

# Teil 0: Deployment-Architektur

## 0.1 Single-Instance per Client

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT MODEL                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Jeder Client erhält eine eigene 0711-C-Intelligence Instanz:  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   CLIENT A      │  │   CLIENT B      │  │   CLIENT C      │ │
│  │   (Bosch)       │  │   (Eaton)       │  │   (Haupa)       │ │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤ │
│  │ 0711-C-Intel    │  │ 0711-C-Intel    │  │ 0711-C-Intel    │ │
│  │ Instance        │  │ Instance        │  │ Instance        │ │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │ │
│  │ │ Client MCP  │ │  │ │ Client MCP  │ │  │ │ Client MCP  │ │ │
│  │ │ (Standard + │ │  │ │ (Standard + │ │  │ │ (Standard + │ │ │
│  │ │  Custom)    │ │  │ │  Custom)    │ │  │ │  Custom)    │ │ │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │ │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤ │
│  │ Admin UI       │  │ Admin UI       │  │ Admin UI       │ │
│  │ User App       │  │ User App       │  │ User App       │ │
│  │ Own Database   │  │ Own Database   │  │ Own Database   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                   │                   │             │
│           └───────────────────┼───────────────────┘             │
│                               ↓                                 │
│                    ┌─────────────────────┐                      │
│                    │  TEMPLATE LIBRARY   │                      │
│                    │  (Shared/Reusable)  │                      │
│                    │                     │                      │
│                    │  • Standard Widgets │                      │
│                    │  • Standard Skills  │                      │
│                    │  • Standard Agents  │                      │
│                    │  • Dashboard Templ. │                      │
│                    └─────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 0.2 Standard MCP Tools (27 Tools)

Jeder Client-MCP enthält die **Standard-Tools** (gleiche Struktur, eigene Daten):

```yaml
Standard MCP Tools (alle Clients):
  
  Search & Discovery:
    - search_products
    - search_similar_products
    - find_similar_products
    - search_by_etim_group
    - search_massive_products
    - search_catalogs_semantic
    - find_product_in_catalogs
  
  Product Details:
    - get_product
    - get_related_products
    - get_product_media
    - get_product_images
    - get_product_documents
    - get_massive_product
    - list_massive_products
    - get_factsheet_data
    - generate_factsheet_ultimate
  
  Classification & Taxonomy:
    - get_etim_groups
    - resolve_product_family
    - resolve_product_family_advanced
    - get_product_class_terminology
    - validate_product_terminology
  
  Analytics & Intelligence:
    - get_statistics
    - aggregate_product_specs
    - check_product_compatibility
    - get_product_lineage
    - analyze_product_ecosystem
  
  Data Access:
    - execute_sql
    - execute_cypher
  
  Catalogs:
    - list_catalogs
```

## 0.3 Client-Specific Tools

Zusätzlich zu den Standard-Tools kann jeder Client **eigene Tools** haben:

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT-SPECIFIC TOOL CONFIGURATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Beispiel Client "Bosch":                                       │
│                                                                 │
│  Standard Tools (27) ─────────────────────────── ✓ Automatisch │
│                                                                 │
│  Custom Tools:                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  + get_dealer_prices        (Händler-spezifische Preise)│   │
│  │  + check_warranty_status    (Garantie-Prüfung)          │   │
│  │  + get_training_materials   (Schulungsunterlagen)       │   │
│  │  + submit_service_request   (Service-Anfragen)          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  → Claude analysiert Standard + Custom Tools                   │
│  → Generiert kombinierte Widget/Skill/Agent-Vorschläge        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Custom Tool Configuration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. Admin öffnet Tool-Konfiguration                            │
│     ────────────────────────────────                            │
│     Sieht: 27 Standard-Tools (read-only)                       │
│     Option: "+ Custom Tool hinzufügen"                         │
│                                                                 │
│                          ↓                                      │
│                                                                 │
│  2. Custom Tool definieren                                      │
│     ──────────────────────                                      │
│     • Name, Description                                        │
│     • Input Schema (JSON Schema oder Claude-assisted)          │
│     • Endpoint/Implementation                                   │
│     • Kategorie zuweisen                                       │
│                                                                 │
│                          ↓                                      │
│                                                                 │
│  3. Claude Re-Analyse                                           │
│     ─────────────────────                                       │
│     Claude analysiert alle Tools (Standard + Custom)           │
│     Schlägt neue kombinierte Skills/Agents vor                 │
│     z.B. "Service Assistant" mit check_warranty + submit_service│
│                                                                 │
│                          ↓                                      │
│                                                                 │
│  4. Admin approved/modifiziert Vorschläge                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 0.4 Reusable Template Library

Da alle Clients die **gleichen Standard-Tools** haben, können **Templates** wiederverwendet werden:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEMPLATE LIBRARY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📦 STANDARD WIDGETS (wiederverwendbar)                        │
│  ─────────────────────────────────────                          │
│  Diese Widgets funktionieren bei JEDEM Client:                 │
│                                                                 │
│  ✓ Produktsuche           (search_products)                    │
│  ✓ Produkt-Detail-Karte   (get_product, get_factsheet_data)   │
│  ✓ Ähnliche Produkte      (search_similar_products)           │
│  ✓ Vergleichstabelle      (aggregate_product_specs)           │
│  ✓ ETIM Explorer          (get_etim_groups)                    │
│  ✓ Media Gallery          (get_product_media)                  │
│  ✓ Dokument-Center        (get_product_documents)              │
│  ✓ Ecosystem-Map          (analyze_product_ecosystem)          │
│  ✓ Kompatibilitäts-Check  (check_product_compatibility)       │
│  ✓ Produktfamilien-Baum   (resolve_product_family_advanced)   │
│  ✓ Katalog-Statistiken    (get_statistics)                     │
│  ✓ Query Builder          (execute_sql, execute_cypher)        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🛠️ STANDARD SKILLS (wiederverwendbar)                         │
│  ────────────────────────────────────                           │
│                                                                 │
│  ✓ Produktrecherche+      (search → detail → factsheet)       │
│  ✓ Technischer Vergleich  (get_product(n) → aggregate)        │
│  ✓ Alternativen-Finder    (similar + compare)                  │
│  ✓ ETIM Navigation        (groups → search → terminology)     │
│  ✓ 360° Produktanalyse    (lineage + ecosystem + family)      │
│  ✓ Asset-Paket            (media + images + documents)         │
│  ✓ Cross-Catalog-Suche    (list_catalogs → find_in_catalogs)  │
│  ✓ Custom Query           (sql/cypher)                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🤖 STANDARD AGENTS (wiederverwendbar)                         │
│  ───────────────────────────────────                            │
│                                                                 │
│  ✓ Product Discovery Assistant                                 │
│  ✓ Technical Advisor                                           │
│  ✓ Product Intelligence Analyst                                │
│  ✓ Catalog Monitor                                             │
│  ✓ Data Engineer                                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📊 STANDARD DASHBOARDS (wiederverwendbar)                     │
│  ─────────────────────────────────────────                      │
│                                                                 │
│  ✓ Inventory Command Center                                    │
│  ✓ Pricing Cockpit                                             │
│  ✓ Sales Assistant View                                        │
│  ✓ Product Intelligence Dashboard                              │
│  ✓ Technical Documentation Hub                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 0.5 Template-Import bei Client-Setup

```
┌─────────────────────────────────────────────────────────────────┐
│  NEUER CLIENT SETUP WIZARD                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Basis-Konfiguration                                   │
│  ───────────────────────────                                    │
│  • Client-Name: [Bosch_______________]                         │
│  • Logo hochladen                                              │
│  • Branding-Farben                                             │
│                                                                 │
│  Step 2: MCP verbinden                                          │
│  ─────────────────────                                          │
│  • MCP Endpoint: [mcp://bosch-catalog.0711.io]                 │
│  • [Test Connection] ✓ 27 Standard-Tools erkannt               │
│                                                                 │
│  Step 3: Standard-Templates importieren                        │
│  ──────────────────────────────────────                         │
│                                                                 │
│  ☑ Alle Standard-Widgets (12)                                  │
│  ☑ Alle Standard-Skills (8)                                    │
│  ☑ Alle Standard-Agents (5)                                    │
│  ☐ Standard-Dashboards auswählen:                              │
│     ☑ Sales Assistant View                                     │
│     ☑ Product Intelligence Dashboard                           │
│     ☐ Inventory Command Center                                 │
│     ☐ Pricing Cockpit                                          │
│                                                                 │
│  Step 4: Custom Tools (optional)                               │
│  ───────────────────────────────                                │
│  • [+ Custom Tool hinzufügen]                                  │
│  • Claude analysiert und schlägt erweiterte Features vor       │
│                                                                 │
│  Step 5: Review & Deploy                                        │
│  ───────────────────────                                        │
│  • Preview der fertigen Installation                           │
│  • [Deploy to Production]                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Teil 1: Standard MCP Tool-Analyse

## 1.1 Tool-Inventar (27 Tools)

### 🔍 SEARCH & DISCOVERY (7 Tools)
| Tool | Input | Output | Business Value |
|------|-------|--------|----------------|
| `search_products` | query, filters | product[] | Basis-Produktsuche |
| `search_similar_products` | productId | product[] | "Kunden kauften auch" |
| `find_similar_products` | specs/criteria | product[] | Technischer Vergleich |
| `search_by_etim_group` | etim_class | product[] | Kategorie-Navigation |
| `search_massive_products` | query | massive_product[] | Großmengen-Artikel |
| `search_catalogs_semantic` | natural_language | catalog_entries[] | AI-Suche in Katalogen |
| `find_product_in_catalogs` | productId | catalog_locations[] | Wo ist Produkt gelistet? |

### 📦 PRODUCT DETAILS (9 Tools)
| Tool | Input | Output | Business Value |
|------|-------|--------|----------------|
| `get_product` | productId | product_detail | Vollständige Produktdaten |
| `get_related_products` | productId | product[] | Cross-Selling |
| `get_product_media` | productId | media[] | Alle Medien |
| `get_product_images` | productId | image[] | Nur Bilder |
| `get_product_documents` | productId | document[] | PDFs, Datenblätter |
| `get_massive_product` | productId | massive_detail | Großmengen-Details |
| `list_massive_products` | filters | massive_product[] | Großmengen-Übersicht |
| `get_factsheet_data` | productId | factsheet | Strukturierte Fakten |
| `generate_factsheet_ultimate` | productId | rich_factsheet | AI-generiertes Datenblatt |

### 🏷️ CLASSIFICATION & TAXONOMY (5 Tools)
| Tool | Input | Output | Business Value |
|------|-------|--------|----------------|
| `get_etim_groups` | - | etim_tree | Klassifikations-Baum |
| `resolve_product_family` | productId | family_info | Produktfamilie finden |
| `resolve_product_family_advanced` | criteria | family_tree | Erweiterte Familien-Auflösung |
| `get_product_class_terminology` | class_id | terminology | Fachbegriffe pro Klasse |
| `validate_product_terminology` | terms | validation_result | Begriffe validieren |

### 📊 ANALYTICS & INTELLIGENCE (5 Tools)
| Tool | Input | Output | Business Value |
|------|-------|--------|----------------|
| `get_statistics` | scope | stats | Katalog-Statistiken |
| `aggregate_product_specs` | productIds | aggregated_specs | Specs zusammenfassen |
| `check_product_compatibility` | productA, productB | compatibility | Kompatibilitätsprüfung |
| `get_product_lineage` | productId | lineage | Produkthistorie/-versionen |
| `analyze_product_ecosystem` | productId | ecosystem | Zubehör, Ersatzteile, etc. |

### 🗄️ DATA ACCESS (2 Tools)
| Tool | Input | Output | Business Value |
|------|-------|--------|----------------|
| `execute_sql` | query | rows | Direkter DB-Zugriff |
| `execute_cypher` | query | graph_data | Neo4j Graph-Abfragen |

### 📚 CATALOGS (1 Tool)
| Tool | Input | Output | Business Value |
|------|-------|--------|----------------|
| `list_catalogs` | - | catalog[] | Verfügbare Kataloge |

---

## 1.2 Pattern-Analyse (Claude's Reasoning)

### Erkannte Tool-Cluster

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   CLUSTER 1: Product Discovery Journey                         │
│   ─────────────────────────────────────                         │
│                                                                 │
│   search_products ─→ get_product ─→ get_factsheet_data         │
│         │                │                                      │
│         ↓                ↓                                      │
│   search_similar    get_related_products                        │
│         │                │                                      │
│         └───────→ find_similar_products                         │
│                                                                 │
│   → SKILL: "Produktrecherche mit Alternativen"                 │
│   → WIDGET: "Produkt-Explorer"                                 │
│   → AGENT: "Product Discovery Assistant"                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CLUSTER 2: Technical Comparison                               │
│   ───────────────────────────────                               │
│                                                                 │
│   get_product (A) ──┐                                          │
│   get_product (B) ──┼─→ aggregate_product_specs                │
│   get_product (C) ──┘            │                             │
│                                  ↓                              │
│                     check_product_compatibility                 │
│                                                                 │
│   → SKILL: "Technischer Produktvergleich"                      │
│   → WIDGET: "Vergleichstabelle"                                │
│   → AGENT: "Technical Advisor"                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CLUSTER 3: Taxonomy Navigation                                │
│   ──────────────────────────────                                │
│                                                                 │
│   get_etim_groups ─→ search_by_etim_group ─→ get_product       │
│         │                                                       │
│         ↓                                                       │
│   get_product_class_terminology                                 │
│         │                                                       │
│         ↓                                                       │
│   validate_product_terminology                                  │
│                                                                 │
│   → SKILL: "Kategorie-basierte Navigation"                     │
│   → WIDGET: "ETIM Explorer"                                    │
│   → AGENT: "Classification Expert"                             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CLUSTER 4: Product Intelligence                               │
│   ───────────────────────────────                               │
│                                                                 │
│   get_product ─→ resolve_product_family_advanced               │
│        │                    │                                   │
│        ↓                    ↓                                   │
│   get_product_lineage  analyze_product_ecosystem                │
│        │                    │                                   │
│        └────────┬───────────┘                                   │
│                 ↓                                               │
│        generate_factsheet_ultimate                              │
│                                                                 │
│   → SKILL: "360° Produktanalyse"                               │
│   → WIDGET: "Product Intelligence Dashboard"                   │
│   → AGENT: "Product Intelligence Analyst"                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CLUSTER 5: Media & Documentation                              │
│   ────────────────────────────────                              │
│                                                                 │
│   get_product_media ──┬── get_product_images                   │
│                       │                                         │
│                       └── get_product_documents                 │
│                                  │                              │
│                                  ↓                              │
│                       generate_factsheet_ultimate               │
│                                                                 │
│   → SKILL: "Asset-Sammlung"                                    │
│   → WIDGET: "Media Gallery"                                    │
│   → AGENT: "Content Curator"                                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CLUSTER 6: Advanced Data Access                               │
│   ───────────────────────────────                               │
│                                                                 │
│   execute_sql ←──── Power User Queries                         │
│   execute_cypher ←─ Graph Traversals                           │
│                                                                 │
│   → SKILL: "Custom Data Extraction"                            │
│   → WIDGET: "Query Builder" (nur Admin)                        │
│   → AGENT: "Data Engineer" (nur für Admins)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1.3 Generierte Vorschläge

### WIDGETS (12 vorgeschlagen)

| # | Widget | Typ | Tools | Zielgruppe |
|---|--------|-----|-------|------------|
| 1 | **Produktsuche** | Interactive | search_products, search_catalogs_semantic | Alle |
| 2 | **Produkt-Detail-Karte** | Display | get_product, get_factsheet_data | Alle |
| 3 | **Vergleichstabelle** | Interactive | get_product (n), aggregate_product_specs | Vertrieb |
| 4 | **Ähnliche Produkte** | Carousel | search_similar_products, find_similar_products | Vertrieb |
| 5 | **ETIM Explorer** | Tree-Nav | get_etim_groups, search_by_etim_group | Produktmanager |
| 6 | **Media Gallery** | Gallery | get_product_media, get_product_images | Marketing |
| 7 | **Dokument-Center** | List | get_product_documents | Techniker |
| 8 | **Produktfamilien-Baum** | Graph | resolve_product_family_advanced | Produktmanager |
| 9 | **Kompatibilitäts-Check** | Interactive | check_product_compatibility | Vertrieb |
| 10 | **Ecosystem-Map** | Graph | analyze_product_ecosystem | Techniker |
| 11 | **Katalog-Statistiken** | KPI | get_statistics | Management |
| 12 | **Query Builder** | Advanced | execute_sql, execute_cypher | Admin |

### SKILLS (8 vorgeschlagen)

| # | Skill | Kombinierte Tools | Capability |
|---|-------|-------------------|------------|
| 1 | **Produktrecherche+** | search_products → get_product → get_factsheet_data | Suche mit vollständigen Details |
| 2 | **Technischer Vergleich** | get_product (n) → aggregate_product_specs → check_compatibility | N Produkte vergleichen |
| 3 | **Alternativen-Finder** | get_product → search_similar + find_similar → aggregate | Ähnliche mit Vergleich |
| 4 | **ETIM Navigation** | get_etim_groups → search_by_etim_group → get_terminology | Kategorie-basierte Suche |
| 5 | **360° Produktanalyse** | get_product → lineage + ecosystem + family → factsheet_ultimate | Komplette Produktintelligenz |
| 6 | **Asset-Paket** | get_product → get_media + images + documents | Alle Assets auf einmal |
| 7 | **Cross-Catalog-Suche** | list_catalogs → find_product_in_catalogs → search_catalogs_semantic | Produkt in allen Katalogen |
| 8 | **Custom Query** | execute_sql / execute_cypher | Freie Datenabfragen |

### AGENTS (5 vorgeschlagen)

| # | Agent | Persona | Skills | Trigger |
|---|-------|---------|--------|---------|
| 1 | **Product Discovery Assistant** | Hilft Kunden/Vertrieb bei Produktfindung | Produktrecherche+, Alternativen-Finder | On-Demand (Chat) |
| 2 | **Technical Advisor** | Berät bei technischen Entscheidungen | Technischer Vergleich, ETIM Navigation | On-Demand (Chat) |
| 3 | **Product Intelligence Analyst** | Erstellt tiefe Produktanalysen | 360° Produktanalyse, Asset-Paket | On-Demand + Weekly Reports |
| 4 | **Catalog Monitor** | Überwacht Katalogqualität | Cross-Catalog-Suche, Statistiken | Täglich (Cron) |
| 5 | **Data Engineer** | Unterstützt komplexe Abfragen | Custom Query | On-Demand (Admin only) |

---

# Teil 2: Event-Schema für Widget-Kommunikation

## 2.1 Event-Bus Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         EVENT BUS                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Event Queue                           │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │   │
│  │  │ E001 │ │ E002 │ │ E003 │ │ E004 │ │ ...  │          │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│              ┌───────────────┼───────────────┐                  │
│              ↓               ↓               ↓                  │
│       ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│       │ Widget A │    │ Widget B │    │ Widget C │             │
│       │          │    │          │    │          │             │
│       │ Subscribed:   │ Subscribed:   │ Subscribed:            │
│       │ product.*│    │ product.* │   │ compare.* │            │
│       │ search.* │    │ filter.*  │   │ product.* │            │
│       └──────────┘    └──────────┘    └──────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 Event-Schema Definition

### Base Event Structure

```typescript
interface WidgetEvent {
  // Metadata
  id: string;                    // UUID
  timestamp: number;             // Unix ms
  source: {
    widgetId: string;            // Absender-Widget
    widgetType: string;          // z.B. "product-search"
    dashboardId: string;         // Welches Dashboard
  };
  
  // Event Type (hierarchisch)
  type: string;                  // z.B. "product.selected"
  
  // Payload (typ-spezifisch)
  payload: Record<string, any>;
  
  // Optional: Targeting
  target?: {
    widgetId?: string;           // Spezifisches Widget
    widgetType?: string;         // Alle Widgets dieses Typs
    broadcast?: boolean;         // An alle
  };
}
```

### Event-Typen Katalog

```yaml
# ═══════════════════════════════════════════════════════════════
# PRODUCT EVENTS
# ═══════════════════════════════════════════════════════════════

product.selected:
  description: "User hat ein Produkt ausgewählt"
  payload:
    productId: string
    productName: string
    source: "search" | "list" | "suggestion" | "comparison"
  triggers:
    - Detail-Widget zeigt Produkt
    - Media-Widget lädt Assets
    - Related-Widget lädt Ähnliche
    - Agent erhält Kontext

product.compared:
  description: "User hat Produkt zum Vergleich hinzugefügt"
  payload:
    productId: string
    productName: string
    compareList: string[]        # Alle IDs im Vergleich
  triggers:
    - Vergleichs-Widget aktualisiert
    - Counter-Badge aktualisiert

product.removed_from_compare:
  description: "Produkt aus Vergleich entfernt"
  payload:
    productId: string
    compareList: string[]

product.detail_requested:
  description: "Tiefere Details angefordert"
  payload:
    productId: string
    detailType: "specs" | "media" | "documents" | "ecosystem" | "family"
  triggers:
    - Entsprechendes Detail-Widget öffnet/fokussiert

# ═══════════════════════════════════════════════════════════════
# SEARCH EVENTS
# ═══════════════════════════════════════════════════════════════

search.executed:
  description: "Suche wurde ausgeführt"
  payload:
    query: string
    filters: Record<string, any>
    resultCount: number
    resultIds: string[]
  triggers:
    - Ergebnis-Widgets aktualisieren
    - Filter-Widget synct State

search.filter_changed:
  description: "Filter wurde geändert"
  payload:
    filterName: string
    filterValue: any
    allFilters: Record<string, any>
  triggers:
    - Suche wird neu ausgeführt
    - Andere Filter-Widgets syncen

search.cleared:
  description: "Suche wurde zurückgesetzt"
  payload: {}
  triggers:
    - Alle Such-Widgets resetten

# ═══════════════════════════════════════════════════════════════
# NAVIGATION EVENTS
# ═══════════════════════════════════════════════════════════════

navigation.category_selected:
  description: "ETIM-Kategorie ausgewählt"
  payload:
    categoryId: string
    categoryName: string
    categoryPath: string[]       # Breadcrumb
  triggers:
    - Produktliste filtert auf Kategorie
    - Breadcrumb-Widget aktualisiert

navigation.breadcrumb_clicked:
  description: "Breadcrumb-Navigation"
  payload:
    level: number
    categoryId: string
  triggers:
    - Tree navigiert zu Level
    - Liste aktualisiert

# ═══════════════════════════════════════════════════════════════
# COMPARISON EVENTS
# ═══════════════════════════════════════════════════════════════

compare.initiated:
  description: "Vergleich gestartet"
  payload:
    productIds: string[]
  triggers:
    - Vergleichs-Widget öffnet
    - Specs werden geladen

compare.spec_highlighted:
  description: "Unterschied in Specs hervorgehoben"
  payload:
    specName: string
    differences: Array<{productId: string, value: any}>
  triggers:
    - Highlight in allen Produkt-Karten

compare.completed:
  description: "Vergleich abgeschlossen/geschlossen"
  payload:
    productIds: string[]
    selectedProductId?: string   # Falls User sich entschieden hat
  triggers:
    - Cleanup Compare-State

# ═══════════════════════════════════════════════════════════════
# AGENT EVENTS
# ═══════════════════════════════════════════════════════════════

agent.context_updated:
  description: "Agent-Kontext wurde aktualisiert"
  payload:
    contextType: "product" | "comparison" | "search" | "category"
    contextData: Record<string, any>
  triggers:
    - Agent nutzt Kontext für nächste Antwort

agent.action_requested:
  description: "Agent will Widget-Aktion auslösen"
  payload:
    action: string              # z.B. "show_product", "add_to_compare"
    params: Record<string, any>
  triggers:
    - Entsprechendes Widget führt Aktion aus

agent.insight_generated:
  description: "Agent hat Insight generiert"
  payload:
    insightType: string
    insightData: any
    displayWidget?: string      # Wo anzeigen
  triggers:
    - Insight-Widget zeigt an
    - Notification wenn wichtig

# ═══════════════════════════════════════════════════════════════
# SYSTEM EVENTS
# ═══════════════════════════════════════════════════════════════

system.widget_loaded:
  description: "Widget wurde geladen"
  payload:
    widgetId: string
    widgetType: string
  triggers:
    - Andere Widgets können initiale Daten senden

system.error:
  description: "Fehler aufgetreten"
  payload:
    errorCode: string
    errorMessage: string
    widgetId: string
  triggers:
    - Error-Boundary zeigt Fehler
    - Logging

system.loading_started:
  description: "Ladevorgang gestartet"
  payload:
    widgetId: string
    operation: string
  triggers:
    - Loading-Indicator

system.loading_finished:
  description: "Ladevorgang beendet"
  payload:
    widgetId: string
    operation: string
    success: boolean
```

## 2.3 Widget Subscription Matrix

```
┌───────────────────────────┬─────────────────────────────────────────────────┐
│ Widget                    │ Subscribed Events                               │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Produktsuche              │ search.filter_changed, navigation.category_*    │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Produkt-Detail-Karte      │ product.selected, compare.spec_highlighted      │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Vergleichstabelle         │ product.compared, product.removed_from_compare  │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Ähnliche Produkte         │ product.selected                                │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ ETIM Explorer             │ navigation.breadcrumb_clicked, search.cleared   │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Media Gallery             │ product.selected, product.detail_requested      │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Dokument-Center           │ product.selected, product.detail_requested      │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Produktfamilien-Baum      │ product.selected                                │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Kompatibilitäts-Check     │ product.compared, compare.initiated             │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Ecosystem-Map             │ product.selected                                │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Agent Widget              │ product.*, search.*, compare.*, navigation.*    │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ Alle Widgets              │ system.*                                        │
└───────────────────────────┴─────────────────────────────────────────────────┘
```

## 2.4 Event Flow Beispiel

```
┌─────────────────────────────────────────────────────────────────┐
│  User-Aktion: Klickt auf Produkt "GSR 18V-90" in Suchergebnis  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  1. Produktsuche-Widget EMITTIERT:                              │
│                                                                 │
│  {                                                              │
│    type: "product.selected",                                    │
│    payload: {                                                   │
│      productId: "bosch-gsr-18v-90",                            │
│      productName: "GSR 18V-90 Professional",                   │
│      source: "search"                                          │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ↓                   ↓                   ↓
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 2a. Detail-Karte│ │ 2b. Ähnliche    │ │ 2c. Agent       │
│                 │ │     Produkte    │ │                 │
│ → Lädt Produkt  │ │ → Lädt Similar  │ │ → Speichert     │
│   Details       │ │   Products      │ │   Kontext       │
│                 │ │                 │ │                 │
│ API Call:       │ │ API Call:       │ │ Memory Update:  │
│ get_product()   │ │ search_similar_ │ │ "User schaut    │
│ get_factsheet() │ │ products()      │ │  GSR 18V-90 an" │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          ↓                   ↓                   ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Widgets EMITTIEREN jeweils system.loading_finished         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  User sieht: Detail-Karte + Ähnliche Produkte aktualisiert     │
│  Agent kann: Kontextbezogen antworten wenn gefragt             │
└─────────────────────────────────────────────────────────────────┘
```

---

# Teil 3: Agent Memory-Architektur

## 3.1 Memory-Schichten

```
┌─────────────────────────────────────────────────────────────────┐
│                     AGENT MEMORY ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: WORKING MEMORY (Kurzzeit)                     │   │
│  │  ═══════════════════════════════════                     │   │
│  │                                                          │   │
│  │  Scope: Aktuelle Session / Konversation                 │   │
│  │  TTL: Bis Session endet                                 │   │
│  │  Storage: In-Memory (Redis)                             │   │
│  │                                                          │   │
│  │  Inhalt:                                                 │   │
│  │  • Aktuell betrachtetes Produkt                         │   │
│  │  • Aktive Suchanfrage + Filter                          │   │
│  │  • Vergleichsliste                                      │   │
│  │  • Letzte 10 Nachrichten                                │   │
│  │  • Widget-Events der letzten 5 Minuten                  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: SESSION MEMORY (Mittelfristig)                │   │
│  │  ═══════════════════════════════════════                 │   │
│  │                                                          │   │
│  │  Scope: User-Session (auch nach Page Reload)            │   │
│  │  TTL: 24 Stunden                                        │   │
│  │  Storage: Redis mit Persistenz                          │   │
│  │                                                          │   │
│  │  Inhalt:                                                 │   │
│  │  • Session-Zusammenfassung                              │   │
│  │  • Gesuchte Produktkategorien                           │   │
│  │  • Verglichene Produkte                                 │   │
│  │  • Gestellte Fragen (dedupliziert)                      │   │
│  │  • Erkannte Präferenzen (z.B. "bevorzugt 18V")          │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: USER MEMORY (Langfristig)                     │   │
│  │  ══════════════════════════════════                      │   │
│  │                                                          │   │
│  │  Scope: Persistiert über Sessions                       │   │
│  │  TTL: Unbegrenzt (mit Decay)                            │   │
│  │  Storage: PostgreSQL + Vector DB                        │   │
│  │                                                          │   │
│  │  Inhalt:                                                 │   │
│  │  • User-Profil (Rolle, Branche, Expertise)              │   │
│  │  • Häufig gesuchte Produkte/Kategorien                  │   │
│  │  • Kaufhistorie (falls verfügbar)                       │   │
│  │  • Gelernte Präferenzen                                 │   │
│  │  • Feedback auf Empfehlungen                            │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: DOMAIN MEMORY (Geteiltes Wissen)              │   │
│  │  ═════════════════════════════════════════              │   │
│  │                                                          │   │
│  │  Scope: Alle Agents, alle User                          │   │
│  │  TTL: Manuell gepflegt                                  │   │
│  │  Storage: PostgreSQL + Neo4j                            │   │
│  │                                                          │   │
│  │  Inhalt:                                                 │   │
│  │  • Produktwissen (aus MCP)                              │   │
│  │  • Häufige Fragen + beste Antworten                     │   │
│  │  • Erfolgreiche Empfehlungsmuster                       │   │
│  │  • Business Rules                                       │   │
│  │  • Terminology-Mappings                                 │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.2 Memory-Datenstrukturen

### Working Memory Schema

```typescript
interface WorkingMemory {
  sessionId: string;
  userId: string;
  agentId: string;
  
  // Aktueller Fokus
  currentProduct: {
    id: string;
    name: string;
    viewedAt: number;
    interactionCount: number;
  } | null;
  
  // Aktive Suche
  activeSearch: {
    query: string;
    filters: Record<string, any>;
    resultCount: number;
    executedAt: number;
  } | null;
  
  // Vergleich
  compareList: Array<{
    id: string;
    name: string;
    addedAt: number;
  }>;
  
  // Konversation
  recentMessages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    relatedProductIds: string[];
  }>;
  
  // Widget-Kontext
  recentEvents: Array<{
    type: string;
    payload: any;
    timestamp: number;
  }>;
  
  // Temporäre Notizen
  scratchpad: Record<string, any>;
}
```

### User Memory Schema

```typescript
interface UserMemory {
  userId: string;
  createdAt: number;
  lastActiveAt: number;
  
  // Profil
  profile: {
    role?: "techniker" | "vertrieb" | "einkauf" | "manager" | "unknown";
    industry?: string;
    expertiseLevel?: "beginner" | "intermediate" | "expert";
    preferredLanguage?: string;
  };
  
  // Präferenzen (gelernt)
  preferences: {
    preferredCategories: Array<{
      categoryId: string;
      weight: number;      // 0-1, decays over time
    }>;
    preferredBrands: Array<{
      brand: string;
      weight: number;
    }>;
    priceRange?: {
      min: number;
      max: number;
    };
    technicalPreferences: Record<string, string>;  // z.B. "voltage": "18V"
  };
  
  // Interaktionshistorie (aggregiert)
  history: {
    totalSessions: number;
    totalQueries: number;
    productViews: Array<{
      productId: string;
      viewCount: number;
      lastViewed: number;
    }>;
    searches: Array<{
      query: string;
      count: number;
      lastSearched: number;
    }>;
    comparisons: Array<{
      productIds: string[];
      selectedId?: string;
      timestamp: number;
    }>;
  };
  
  // Feedback
  feedback: Array<{
    recommendationId: string;
    rating: "helpful" | "not_helpful";
    timestamp: number;
  }>;
  
  // Embedding für Similarity-Suche
  embedding?: number[];
}
```

### Domain Memory Schema

```typescript
interface DomainMemory {
  // FAQ / Learned Responses
  learnedResponses: Array<{
    questionPattern: string;      // Regex oder Embedding
    questionEmbedding: number[];
    bestAnswer: string;
    sources: string[];
    useCount: number;
    avgRating: number;
  }>;
  
  // Erfolgreiche Empfehlungsmuster
  recommendationPatterns: Array<{
    context: {
      userRole?: string;
      category?: string;
      priceRange?: string;
    };
    recommendedProducts: string[];
    successRate: number;         // Wie oft wurde Empfehlung angenommen
  }>;
  
  // Business Rules
  businessRules: Array<{
    ruleId: string;
    condition: string;           // z.B. "product.category == 'power_tools'"
    action: string;              // z.B. "always_mention_safety_equipment"
    priority: number;
  }>;
  
  // Terminology
  terminology: Array<{
    term: string;
    aliases: string[];
    definition: string;
    category: string;
  }>;
}
```

## 3.3 Memory-Operationen

```yaml
# ═══════════════════════════════════════════════════════════════
# MEMORY OPERATIONS
# ═══════════════════════════════════════════════════════════════

# WORKING MEMORY
working_memory.set_focus:
  input: productId
  effect: Setzt currentProduct, triggert ähnliche Produkte laden

working_memory.update_search:
  input: query, filters, results
  effect: Speichert aktuelle Suche für Kontext

working_memory.add_to_compare:
  input: productId
  effect: Fügt zur compareList hinzu (max 5)

working_memory.add_message:
  input: role, content
  effect: Appended zu recentMessages (max 20, FIFO)

working_memory.process_event:
  input: widgetEvent
  effect: Extrahiert relevante Infos, aktualisiert Fokus

# SESSION MEMORY
session_memory.summarize:
  trigger: Alle 10 Minuten oder bei Inaktivität
  effect: Komprimiert Working Memory zu Session Summary

session_memory.extract_preferences:
  trigger: Nach jeder Suche/Vergleich
  effect: Erkennt Muster (z.B. "sucht immer 18V Geräte")

# USER MEMORY
user_memory.update_profile:
  trigger: Explizite Info oder Inferenz
  effect: Aktualisiert Profil-Felder

user_memory.record_interaction:
  trigger: Bei signifikanten Aktionen
  effect: Inkrementiert Counters, aktualisiert Timestamps

user_memory.decay_weights:
  trigger: Täglich (Cron)
  effect: Reduziert alte Präferenz-Weights (Decay-Faktor 0.95/Tag)

user_memory.learn_from_feedback:
  trigger: Bei explizitem Feedback
  effect: Adjustiert Präferenzen basierend auf Feedback

# DOMAIN MEMORY
domain_memory.record_successful_response:
  trigger: Positive Bewertung einer Antwort
  effect: Speichert Frage-Antwort-Paar mit Embedding

domain_memory.update_recommendation_pattern:
  trigger: User wählt empfohlenes Produkt
  effect: Erhöht successRate des Patterns
```

## 3.4 Memory-Kontext für Agent-Prompt

```
┌─────────────────────────────────────────────────────────────────┐
│  AGENT CONTEXT CONSTRUCTION                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Für jeden Agent-Turn wird Kontext gebaut aus:                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SYSTEM PROMPT                                           │   │
│  │  (Persona, Capabilities, Rules)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              +                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  USER CONTEXT                                            │   │
│  │                                                          │   │
│  │  "Der User ist ein {profile.role} mit {expertiseLevel}  │   │
│  │   Erfahrung. Er bevorzugt {preferences.summary}.         │   │
│  │   In dieser Session hat er {history.summary}."           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              +                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CURRENT CONTEXT                                         │   │
│  │                                                          │   │
│  │  "Aktuell betrachtet: {currentProduct.name}             │   │
│  │   Letzte Suche: '{activeSearch.query}'                  │   │
│  │   Im Vergleich: {compareList.names}"                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              +                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  RELEVANT DOMAIN KNOWLEDGE                               │   │
│  │                                                          │   │
│  │  (Semantic Search nach relevanten FAQ, Patterns)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              +                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CONVERSATION HISTORY                                    │   │
│  │                                                          │   │
│  │  (Letzte N Nachrichten)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              +                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  USER MESSAGE                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                              ↓                                  │
│                                                                 │
│                     AGENT RESPONSE                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Teil 4: Rollout-Strategie

## 4.1 Phasen-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROLLOUT ROADMAP                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1          PHASE 2          PHASE 3          PHASE 4    │
│  Foundation       Intelligence     Autonomy         Templates  │
│  ──────────       ────────────     ────────         ─────────  │
│  2-3 Wochen       3-4 Wochen       3-4 Wochen       Ongoing    │
│                                                                 │
│  • Widget         • Skill          • Agent          • Template │
│    Framework        Generator        Runtime          Library  │
│  • Event Bus      • Memory         • Proactive      • Client   │
│  • Basic            Layer 1+2        Features         Setup    │
│    Widgets        • Advanced       • Memory           Wizard   │
│  • MCP              Widgets          Layer 3+4      • Custom   │
│    Integration    • Dashboard      • Learning         Tools    │
│                     Builder                         • API      │
│                                                                 │
│  MVP ─────────────│                                             │
│  Beta ────────────────────────────│                             │
│  GA ──────────────────────────────────────────────│             │
│                                                                 │
│  ════════════════════════════════════════════════════════════  │
│  Nach GA: Jeder neue Client nutzt Templates + Custom Tools     │
│  ════════════════════════════════════════════════════════════  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4.2 Phase 1: Foundation (Wochen 1-3)

### Ziel
Funktionierendes Widget-System mit Event-Kommunikation und Bosch MCP Integration.

### Deliverables

```yaml
Week 1:
  - Widget Framework:
      - Widget Base Component
      - Widget Registry
      - Widget Renderer
      - Widget Config Schema
  - Event Bus:
      - Event Emitter/Subscriber
      - Event Queue (in-memory)
      - Event Types (product.*, search.*)
  - Basic Widgets (3):
      - Produktsuche (search_products, search_catalogs_semantic)
      - Produkt-Detail-Karte (get_product, get_factsheet_data)
      - Ähnliche Produkte (search_similar_products)

Week 2:
  - MCP Integration:
      - Tool Discovery (list all tools)
      - Tool Schema Parser
      - Tool Executor
  - More Widgets (3):
      - ETIM Explorer (get_etim_groups, search_by_etim_group)
      - Media Gallery (get_product_media, get_product_images)
      - Dokument-Center (get_product_documents)
  - Widget Wiring:
      - Event Subscriptions
      - Cross-Widget Communication

Week 3:
  - Dashboard Basics:
      - Dashboard Layout Engine
      - Widget Drag & Drop
      - Dashboard Save/Load
  - Widget Admin:
      - Manual Widget Creation
      - Widget Config Editor
      - JSON Argument Builder (current)
  - Testing & Polish:
      - E2E Tests für Event Flow
      - Error Handling
      - Loading States
```

### Success Criteria Phase 1
- [ ] 6 Widgets funktionieren standalone
- [ ] Widgets kommunizieren über Event Bus
- [ ] Dashboard kann gespeichert und geladen werden
- [ ] Admin kann manuell Widgets erstellen

---

## 4.3 Phase 2: Intelligence (Wochen 4-7)

### Ziel
Claude-gestützte Widget/Skill-Generierung, Memory Layer 1+2, Dashboard Wizard.

### Deliverables

```yaml
Week 4:
  - Claude Integration:
      - API Endpoint für Tool-Analyse
      - Schema-zu-Vorschlag Pipeline
      - Prompt Engineering für Widget-Vorschläge
  - Widget Wizard Step 1:
      - MCP Tool Discovery UI
      - Automatische Kategorisierung
      - Tool-Cluster Visualisierung

Week 5:
  - Widget Wizard Step 2-3:
      - Kategorie-Auswahl UI
      - Widget-Vorschläge UI
      - Widget-Konfiguration mit Claude
      - Live Preview
  - More Widgets (3):
      - Vergleichstabelle (aggregate_product_specs)
      - Kompatibilitäts-Check (check_product_compatibility)
      - Ecosystem-Map (analyze_product_ecosystem)

Week 6:
  - Skill Framework:
      - Skill Definition Schema
      - Skill Registry
      - Skill Executor (Tool-Chain)
  - Skill Generator:
      - Claude analysiert Tool-Kombinationen
      - Skill-Vorschläge UI
      - Skill-Editor
  - Memory Layer 1 (Working):
      - Redis Integration
      - Working Memory Schema
      - Auto-Update bei Events

Week 7:
  - Memory Layer 2 (Session):
      - Session Summary Generator
      - Preference Extraction
  - Dashboard Builder:
      - Template Gallery
      - Claude-generierte Templates
      - Widget-Verknüpfungen UI
  - Agent Widget (Basic):
      - Chat Interface
      - Context from Working Memory
      - Skill-Ausführung
```

### Success Criteria Phase 2
- [ ] Claude schlägt Widgets basierend auf Tools vor
- [ ] Claude schlägt Skills vor
- [ ] Wizard erstellt Widgets ohne JSON-Editing
- [ ] Dashboard Templates funktionieren
- [ ] Agent hat Working Memory Kontext
- [ ] 9 Widgets verfügbar

---

## 4.4 Phase 3: Autonomy (Wochen 8-11)

### Ziel
Volle Agent-Fähigkeit mit Promotion, proaktiven Features, und lernender Memory.

### Deliverables

```yaml
Week 8:
  - Agent Framework:
      - Agent Definition Schema
      - Agent Registry
      - Agent Runtime
  - Skill-to-Agent Promotion:
      - Promotion UI
      - Persona Configuration
      - Trigger Configuration (Cron, Event)

Week 9:
  - Memory Layer 3 (User):
      - PostgreSQL Schema
      - User Profile Learning
      - Preference Decay
  - Agent Intelligence:
      - Multi-Skill Agents
      - Context Construction
      - Tool Selection Logic

Week 10:
  - Proactive Features:
      - Scheduled Agent Runs
      - Event-triggered Actions
      - Notification System
  - Memory Layer 4 (Domain):
      - FAQ Learning
      - Recommendation Patterns
      - Feedback Loop

Week 11:
  - Gap Detection:
      - Missing Skill Detection
      - Usage Pattern Analysis
      - Proactive Suggestions
  - Advanced Dashboards:
      - Adaptive Layouts
      - Role-based Views
      - Agent-embedded Widgets
```

### Success Criteria Phase 3
- [ ] Skills können zu Agents promoted werden
- [ ] Agents laufen proaktiv (Cron)
- [ ] Memory lernt User-Präferenzen
- [ ] System schlägt fehlende Skills vor
- [ ] 5 Agent-Templates verfügbar

---

## 4.5 Phase 4: Scale & Template Library (Ongoing)

### Ziel
Template Library für Client-Rollouts, API Access, Enterprise-Features.

### Deliverables

```yaml
Ongoing:
  - Template Library:
      - Widget Template Export/Import
      - Skill Template Export/Import
      - Agent Template Export/Import
      - Dashboard Template Export/Import
      - Template Versioning
      - Template Documentation
  
  - Client Deployment:
      - Client Setup Wizard
      - Standard Template Import
      - Custom Tool Configuration UI
      - Claude Re-Analysis nach Custom Tools
      - Branding/White-Label Options
  
  - API Access:
      - REST API für Widgets
      - WebSocket für Events
      - SDK für Custom Widgets
      - MCP Tool Registration API
  
  - Enterprise:
      - SSO Integration
      - Audit Logging
      - Role-based Access Control
      - Backup & Restore
```

---

# Teil 5: Detaillierte Task-Liste

## 5.1 Phase 1 Tasks

### Week 1: Widget Framework & Event Bus

```markdown
## SPRINT 1.1 - Widget Framework ✅ COMPLETE

### WF-001: Widget Base Component ✅
- [x] Create `Widget` base class/component (`WidgetBase.ts`)
- [x] Define widget lifecycle hooks (mount, update, destroy)
- [x] Implement widget state management
- [x] Add widget error boundary
- [x] Write unit tests (`widgets.test.ts`)
**Estimate:** 4h | **Priority:** P0 | **Status:** ✅ Complete

### WF-002: Widget Registry ✅
- [x] Create widget type registry (`WidgetRegistry.ts`)
- [x] Implement widget factory pattern
- [x] Add widget type validation
- [x] Support lazy loading of widget code
**Estimate:** 3h | **Priority:** P0 | **Status:** ✅ Complete

### WF-003: Widget Config Schema ✅
- [x] Define JSON Schema for widget configuration
- [x] Create TypeScript types from schema (`WidgetConfig.ts`)
- [x] Add validation utility
- [x] Support default values
**Estimate:** 2h | **Priority:** P0 | **Status:** ✅ Complete

### WF-004: Widget Renderer ✅
- [x] Create WidgetRenderer component (`WidgetRenderer.tsx`)
- [x] Handle loading states
- [x] Handle error states
- [x] Support widget resize
**Estimate:** 3h | **Priority:** P0 | **Status:** ✅ Complete

---

## SPRINT 1.2 - Event Bus ✅ COMPLETE

### EB-001: Event Emitter/Subscriber ✅
- [x] Create EventBus singleton (`EventBus.ts`)
- [x] Implement emit() method
- [x] Implement subscribe() method
- [x] Implement unsubscribe() method
- [x] Add wildcard subscription support (e.g., "product.*")
**Estimate:** 3h | **Priority:** P0 | **Status:** ✅ Complete

### EB-002: Event Queue ✅
- [x] Create in-memory event queue (`EventQueue.ts`)
- [x] Implement FIFO processing
- [x] Add event deduplication (optional)
- [x] Add event history (last N events)
**Estimate:** 2h | **Priority:** P1 | **Status:** ✅ Complete

### EB-003: Event Types Definition ✅
- [x] Define TypeScript interfaces for all event types (`EventTypes.ts`)
- [x] Create event factory functions
- [x] Add event validation
- [x] Document all event types
**Estimate:** 2h | **Priority:** P0 | **Status:** ✅ Complete

### EB-004: Widget-EventBus Integration ✅
- [x] Add useWidgetEvents() hook (`useWidgetEvents.ts`)
- [x] Auto-subscribe based on widget type
- [x] Auto-unsubscribe on unmount
- [x] Add event debugging tools
**Estimate:** 3h | **Priority:** P0 | **Status:** ✅ Complete

---

## SPRINT 1.3 - Basic Widgets (3)

### BW-001: Produktsuche Widget
- [ ] Create search input component
- [ ] Integrate search_products MCP tool
- [ ] Integrate search_catalogs_semantic tool
- [ ] Display search results as list/grid
- [ ] Emit product.selected on click
- [ ] Emit search.executed on search
- [ ] Add filter support
- [ ] Add pagination
**Estimate:** 8h | **Priority:** P0

### BW-002: Produkt-Detail-Karte Widget
- [ ] Create product detail layout
- [ ] Integrate get_product MCP tool
- [ ] Integrate get_factsheet_data tool
- [ ] Subscribe to product.selected
- [ ] Display product info, specs, price
- [ ] Add "Add to Compare" button
- [ ] Emit product.compared on add
**Estimate:** 6h | **Priority:** P0

### BW-003: Ähnliche Produkte Widget
- [ ] Create horizontal carousel component
- [ ] Integrate search_similar_products tool
- [ ] Subscribe to product.selected
- [ ] Display similar products
- [ ] Emit product.selected on click
**Estimate:** 4h | **Priority:** P0
```

### Week 2: MCP Integration & More Widgets

```markdown
## SPRINT 2.1 - MCP Integration

### MCP-001: Tool Discovery
- [ ] Create MCP client wrapper
- [ ] Implement listTools() method
- [ ] Cache tool definitions
- [ ] Parse tool schemas
**Estimate:** 3h | **Priority:** P0

### MCP-002: Tool Schema Parser
- [ ] Parse inputSchema to form fields
- [ ] Parse outputSchema to display config
- [ ] Handle complex types (arrays, nested objects)
- [ ] Extract enum values for dropdowns
**Estimate:** 4h | **Priority:** P0

### MCP-003: Tool Executor
- [ ] Create executeTool() abstraction
- [ ] Handle tool errors gracefully
- [ ] Add timeout handling
- [ ] Add retry logic
- [ ] Add execution logging
**Estimate:** 3h | **Priority:** P0

---

## SPRINT 2.2 - More Widgets (3)

### MW-001: ETIM Explorer Widget
- [ ] Create tree view component
- [ ] Integrate get_etim_groups tool
- [ ] Integrate search_by_etim_group tool
- [ ] Handle category navigation
- [ ] Emit navigation.category_selected
- [ ] Subscribe to navigation.breadcrumb_clicked
**Estimate:** 6h | **Priority:** P1

### MW-002: Media Gallery Widget
- [ ] Create gallery/lightbox component
- [ ] Integrate get_product_media tool
- [ ] Integrate get_product_images tool
- [ ] Subscribe to product.selected
- [ ] Support image zoom
- [ ] Support video playback (if applicable)
**Estimate:** 5h | **Priority:** P1

### MW-003: Dokument-Center Widget
- [ ] Create document list component
- [ ] Integrate get_product_documents tool
- [ ] Subscribe to product.selected
- [ ] Display document type icons
- [ ] Support document download
- [ ] Support PDF preview
**Estimate:** 4h | **Priority:** P1

---

## SPRINT 2.3 - Widget Wiring

### WW-001: Event Subscription Config
- [ ] Define subscription config per widget type
- [ ] Create subscription matrix (widget → events)
- [ ] Add dynamic subscription based on config
**Estimate:** 2h | **Priority:** P0

### WW-002: Cross-Widget Communication
- [ ] Test all widget combinations
- [ ] Fix event timing issues
- [ ] Add event buffering for slow widgets
- [ ] Document event flows
**Estimate:** 3h | **Priority:** P0
```

### Week 3: Dashboard & Admin

```markdown
## SPRINT 3.1 - Dashboard Basics

### DB-001: Dashboard Layout Engine
- [ ] Choose grid library (react-grid-layout)
- [ ] Create DashboardLayout component
- [ ] Support widget placement
- [ ] Support widget resize
- [ ] Handle responsive breakpoints
**Estimate:** 4h | **Priority:** P0

### DB-002: Widget Drag & Drop
- [ ] Implement drag from widget palette
- [ ] Implement drop into dashboard
- [ ] Implement reorder via drag
- [ ] Add visual feedback during drag
**Estimate:** 3h | **Priority:** P0

### DB-003: Dashboard Persistence
- [ ] Define dashboard schema
- [ ] Implement save to backend
- [ ] Implement load from backend
- [ ] Add auto-save (debounced)
- [ ] Add version history (optional)
**Estimate:** 4h | **Priority:** P0

---

## SPRINT 3.2 - Widget Admin

### WA-001: Widget Creation UI
- [ ] Create "New Widget" dialog
- [ ] Add widget type selector
- [ ] Add basic config form
- [ ] Preview widget in dialog
**Estimate:** 4h | **Priority:** P0

### WA-002: Widget Config Editor
- [ ] Create JSON editor component
- [ ] Add schema validation
- [ ] Add syntax highlighting
- [ ] Show validation errors
**Estimate:** 3h | **Priority:** P0

### WA-003: Tool Argument Builder
- [ ] Parse tool inputSchema
- [ ] Generate form from schema
- [ ] Support all JSON Schema types
- [ ] Support conditional fields
**Estimate:** 4h | **Priority:** P1

---

## SPRINT 3.3 - Testing & Polish

### TP-001: E2E Tests
- [ ] Test: Search → Detail → Similar flow
- [ ] Test: Category Navigation flow
- [ ] Test: Add to Compare flow
- [ ] Test: Dashboard save/load
**Estimate:** 4h | **Priority:** P1

### TP-002: Error Handling
- [ ] Add global error boundary
- [ ] Add widget-level error handling
- [ ] Show user-friendly error messages
- [ ] Add error reporting (optional)
**Estimate:** 2h | **Priority:** P1

### TP-003: Loading States
- [ ] Add skeleton loaders for widgets
- [ ] Add loading indicator for tool calls
- [ ] Add progress feedback for long operations
**Estimate:** 2h | **Priority:** P1
```

---

## 5.2 Phase 2 Tasks

### Week 4: Claude Integration

```markdown
## SPRINT 4.1 - Claude Integration

### CI-001: Tool Analysis API
- [ ] Create POST /api/wizard/analyze-tools endpoint
- [ ] Send tool schemas to Claude
- [ ] Parse Claude's categorization
- [ ] Cache results
**Estimate:** 4h | **Priority:** P0

### CI-002: Claude Prompt Engineering
- [ ] Write system prompt for tool analysis
- [ ] Write prompt for widget suggestions
- [ ] Write prompt for skill suggestions
- [ ] Test and iterate on prompts
- [ ] Add few-shot examples
**Estimate:** 6h | **Priority:** P0

### CI-003: Tool Discovery UI
- [ ] Create MCP connection status display
- [ ] Create tool list with categories
- [ ] Visualize tool clusters (optional graph)
- [ ] Show Claude's analysis results
**Estimate:** 4h | **Priority:** P0
```

### Week 5: Widget Wizard

```markdown
## SPRINT 5.1 - Widget Wizard

### WIZ-001: Wizard Step 1 - Category Selection
- [ ] Create wizard stepper component
- [ ] Show Claude-suggested categories
- [ ] Allow multi-select
- [ ] Store selection in wizard state
**Estimate:** 3h | **Priority:** P0

### WIZ-002: Wizard Step 2 - Widget Suggestions
- [ ] Create POST /api/wizard/suggest-widgets
- [ ] Display widget cards with previews
- [ ] Allow select/deselect widgets
- [ ] Show tool combinations per widget
**Estimate:** 4h | **Priority:** P0

### WIZ-003: Wizard Step 3 - Widget Configuration
- [ ] Create POST /api/wizard/configure
- [ ] Display Claude's input suggestions
- [ ] Radio/checkbox for input options
- [ ] Display type selector
- [ ] No JSON editing required
**Estimate:** 5h | **Priority:** P0

### WIZ-004: Wizard Step 4 - Live Preview
- [ ] Render actual widget with config
- [ ] Load real data from MCP
- [ ] Allow config adjustments
- [ ] "Create" button finalizes widget
**Estimate:** 4h | **Priority:** P0

---

## SPRINT 5.2 - More Widgets (3)

### MW-004: Vergleichstabelle Widget
- [ ] Create comparison table component
- [ ] Integrate aggregate_product_specs tool
- [ ] Subscribe to product.compared
- [ ] Highlight differences
- [ ] Emit compare.spec_highlighted
**Estimate:** 6h | **Priority:** P1

### MW-005: Kompatibilitäts-Check Widget
- [ ] Create compatibility checker UI
- [ ] Integrate check_product_compatibility tool
- [ ] Two-product selector
- [ ] Display compatibility result
**Estimate:** 4h | **Priority:** P1

### MW-006: Ecosystem-Map Widget
- [ ] Create graph visualization (D3 or similar)
- [ ] Integrate analyze_product_ecosystem tool
- [ ] Show product + related items
- [ ] Click navigation in graph
**Estimate:** 6h | **Priority:** P1
```

### Week 6: Skills & Memory L1

```markdown
## SPRINT 6.1 - Skill Framework

### SK-001: Skill Definition Schema
- [ ] Define skill YAML/JSON schema
- [ ] Define step types (tool_call, transform, condition)
- [ ] Define input/output schema
- [ ] Validate skill definitions
**Estimate:** 4h | **Priority:** P0

### SK-002: Skill Registry
- [ ] Create skill registry
- [ ] Load skills from config
- [ ] Support runtime skill registration
- [ ] List skills with metadata
**Estimate:** 2h | **Priority:** P0

### SK-003: Skill Executor
- [ ] Create skill execution engine
- [ ] Execute steps sequentially
- [ ] Handle step outputs as next inputs
- [ ] Support parallel steps (optional)
- [ ] Add execution logging
**Estimate:** 5h | **Priority:** P0

### SK-004: Skill Generator (Claude)
- [ ] Create POST /api/wizard/suggest-skills
- [ ] Analyze tool combinations
- [ ] Generate skill definitions
- [ ] Skill editor UI
**Estimate:** 5h | **Priority:** P0

---

## SPRINT 6.2 - Memory Layer 1

### MEM-001: Redis Integration
- [ ] Add Redis client to backend
- [ ] Create memory service abstraction
- [ ] Add connection pooling
**Estimate:** 2h | **Priority:** P0

### MEM-002: Working Memory Schema
- [ ] Implement WorkingMemory interface
- [ ] Create getter/setter methods
- [ ] Add TTL management
**Estimate:** 3h | **Priority:** P0

### MEM-003: Event-to-Memory Pipeline
- [ ] Subscribe to relevant events
- [ ] Update working memory on events
- [ ] Add memory middleware to event bus
**Estimate:** 3h | **Priority:** P0
```

### Week 7: Dashboard Builder & Agent Widget

```markdown
## SPRINT 7.1 - Dashboard Builder

### DASH-001: Template Gallery
- [ ] Create template card component
- [ ] Show 3-5 template options
- [ ] Preview template layout
- [ ] "Use Template" action
**Estimate:** 3h | **Priority:** P0

### DASH-002: Claude Dashboard Templates
- [ ] Create POST /api/wizard/suggest-dashboards
- [ ] Generate templates based on widgets
- [ ] Include widget wiring suggestions
**Estimate:** 4h | **Priority:** P0

### DASH-003: Widget Wiring UI
- [ ] Show event connections visually
- [ ] Allow custom event wiring
- [ ] Validate wiring compatibility
**Estimate:** 4h | **Priority:** P1

---

## SPRINT 7.2 - Agent Widget (Basic)

### AGT-001: Chat Interface
- [ ] Create chat UI component
- [ ] Message list with bubbles
- [ ] Input field with send button
- [ ] Typing indicator
**Estimate:** 4h | **Priority:** P0

### AGT-002: Agent Backend
- [ ] Create POST /api/agent/chat endpoint
- [ ] Integrate with Claude API
- [ ] Pass working memory as context
- [ ] Return streamed response
**Estimate:** 4h | **Priority:** P0

### AGT-003: Skill Execution from Chat
- [ ] Detect skill invocation in response
- [ ] Execute skill
- [ ] Display skill result in chat
**Estimate:** 3h | **Priority:** P0

### AGT-004: Memory Layer 2
- [ ] Implement session summarization
- [ ] Run on interval/inactivity
- [ ] Extract preferences from behavior
**Estimate:** 4h | **Priority:** P1
```

---

## 5.3 Phase 3 Tasks (Summary)

```markdown
## Phase 3 - Autonomy (Weeks 8-11)

### Week 8: Agent Framework
- [ ] AGT-005: Agent Definition Schema
- [ ] AGT-006: Agent Registry
- [ ] AGT-007: Agent Runtime
- [ ] AGT-008: Skill-to-Agent Promotion UI
- [ ] AGT-009: Persona Configuration UI
- [ ] AGT-010: Trigger Configuration UI

### Week 9: Memory Layer 3 + Agent Intelligence
- [ ] MEM-004: PostgreSQL User Memory Schema
- [ ] MEM-005: User Profile Learning
- [ ] MEM-006: Preference Decay Cron Job
- [ ] AGT-011: Multi-Skill Agent Support
- [ ] AGT-012: Context Construction Pipeline
- [ ] AGT-013: Tool Selection Logic

### Week 10: Proactive Features + Memory Layer 4
- [ ] PRO-001: Cron-triggered Agent Runs
- [ ] PRO-002: Event-triggered Agent Actions
- [ ] PRO-003: Notification System
- [ ] MEM-007: FAQ Learning Pipeline
- [ ] MEM-008: Recommendation Pattern Storage
- [ ] MEM-009: Feedback Loop Integration

### Week 11: Gap Detection + Advanced Dashboards
- [ ] GAP-001: Missing Skill Detection
- [ ] GAP-002: Usage Pattern Analyzer
- [ ] GAP-003: Proactive Suggestion UI
- [ ] DASH-004: Adaptive Layouts
- [ ] DASH-005: Role-based Views
- [ ] DASH-006: Agent-embedded Widget Support
```

---

## 5.4 Phase 4 Tasks (Summary)

```markdown
## Phase 4 - Template Library & Client Deployment (Ongoing)

### Template Library
- [ ] TPL-001: Widget Template Export Format
- [ ] TPL-002: Widget Template Import Function
- [ ] TPL-003: Skill Template Export/Import
- [ ] TPL-004: Agent Template Export/Import
- [ ] TPL-005: Dashboard Template Export/Import
- [ ] TPL-006: Template Versioning System
- [ ] TPL-007: Template Documentation Generator
- [ ] TPL-008: Template Validation (gegen Standard-Tools)

### Client Deployment
- [ ] CLI-001: Client Setup Wizard UI
- [ ] CLI-002: MCP Connection Test & Tool Discovery
- [ ] CLI-003: Standard Template Bulk Import
- [ ] CLI-004: Custom Tool Registration UI
- [ ] CLI-005: Claude Re-Analysis Trigger
- [ ] CLI-006: Combined Widget/Skill/Agent Suggestions
- [ ] CLI-007: Branding Configuration (Logo, Colors)
- [ ] CLI-008: Client Instance Provisioning

### API Access
- [ ] API-001: REST API for Widget CRUD
- [ ] API-002: REST API for Skill CRUD
- [ ] API-003: REST API for Agent CRUD
- [ ] API-004: WebSocket Event Subscription API
- [ ] API-005: MCP Tool Registration API
- [ ] API-006: API Documentation (OpenAPI)

### Enterprise Features
- [ ] ENT-001: SSO Integration (SAML/OIDC)
- [ ] ENT-002: Audit Logging
- [ ] ENT-003: Role-based Access Control
- [ ] ENT-004: Backup & Restore Functionality
```

---

# Teil 6: Approval Checklist

## Konzept-Approval

Bitte bestätige folgende Punkte:

### Deployment-Architektur
- [ ] **Single-Instance per Client** - Jeder Client eigene Instanz (kein Multi-Tenant)
- [ ] **Standard MCP Tools (27)** - Gleiche Tools für alle Clients
- [ ] **Custom Tools** - Client-spezifische Tools zusätzlich konfigurierbar
- [ ] **Template Library** - Wiederverwendbare Widgets/Skills/Agents/Dashboards

### Vision & Scope
- [ ] **Widget Wizard Konzept** - Claude-gestützte Widget-Erstellung ohne JSON
- [ ] **Skill Framework** - Wiederverwendbare Tool-Kombinationen
- [ ] **Agent System** - Autonome Akteure mit Memory und Triggern
- [ ] **Event-Bus Architektur** - Widget-Kommunikation über Events
- [ ] **Memory-Architektur** - 4-Layer Memory System

### Standard MCP Integration
- [ ] **27 Standard-Tools definiert** - Cluster und Patterns erkannt
- [ ] **12 Standard-Widgets** - Wiederverwendbar für alle Clients
- [ ] **8 Standard-Skills** - Wiederverwendbar für alle Clients
- [ ] **5 Standard-Agents** - Wiederverwendbar für alle Clients
- [ ] **5 Standard-Dashboards** - Template-Katalog

### Rollout-Strategie
- [ ] **Phase 1 (Weeks 1-3)** - Foundation: Widget Framework, Event Bus, 6 Widgets
- [ ] **Phase 2 (Weeks 4-7)** - Intelligence: Claude Wizard, Skills, Memory L1+L2, 9 Widgets
- [ ] **Phase 3 (Weeks 8-11)** - Autonomy: Agents, Proactive, Memory L3+L4
- [ ] **Phase 4 (Ongoing)** - Template Library, Client Setup Wizard, API, Enterprise

### Task-Priorisierung
- [ ] **Week 1-3 Tasks detailliert** - Ready for Sprint Planning
- [ ] **Week 4-7 Tasks detailliert** - Ready for Sprint Planning
- [ ] **Week 8-11 Tasks summarisiert** - To be detailed before Phase 3
- [ ] **Phase 4 Tasks summarisiert** - To be detailed before Phase 4

---

## Nächste Schritte nach Approval

1. **Sprint Planning** für Phase 1, Week 1
2. **Tech Stack Entscheidungen** (React-Grid-Layout? D3 für Graphs?)
3. **Design Review** für Widget UI/UX
4. **MCP Tool Schema Review** (sind alle 27 Standard-Tools korrekt?)
5. **Template Format Definition** (JSON? YAML? Export-Schema)

---

**Erstellt:** 2026-02-08  
**Version:** 1.1  
**Status:** 🟡 AWAITING APPROVAL

---

## Änderungshistorie

| Version | Datum | Änderungen |
|---------|-------|------------|
| 1.0 | 2026-02-08 | Initial Draft |
| 1.1 | 2026-02-08 | Single-Instance per Client statt Multi-Tenant; Template Library Konzept; Client Setup Wizard; Custom Tools Konfiguration |

---

*Dieses Dokument wurde von Claude (Bombas) erstellt basierend auf der Analyse der 27 Standard MCP Tools und den konzeptionellen Anforderungen von Christoph.*
