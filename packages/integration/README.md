# Bosch + 0711-C Integration

Integration layer connecting Bosch Intelligence with 0711-C Intelligence Engine.

## Architecture

```
Bosch UI (7073) → Bosch Integration (7712) → 0711-C API (7711)
```

## Quick Start

```bash
# 1. Start 0711-C API
cd /home/christoph.bertsch/0711/0711-C/packages/api
ANTHROPIC_API_KEY=<key> node dist/server.js

# 2. Start Integration Service
cd /home/christoph.bertsch/0711/bosch-0711c-integration
node dist/index.js
```

## Bosch Endpoints

| Endpoint | Description |
|----------|-------------|
| POST /api/bosch/generate-content | Generate SEO content for product |
| POST /api/bosch/batch-generate | Batch content generation |
| POST /api/bosch/quality-report | Run quality report |
| POST /api/bosch/enrich-product | Enrich product data |
| POST /api/bosch/ask-expert | Chat with product expert |
| POST /api/bosch/translate | Translate DE↔EN |

## Registered Agents

- Bosch Product Expert
- SEO Content Writer
- Quality Checker
- Product Translator

## Registered Workflows

- Product Content Generation
- Batch Content Generation
- Daily Quality Report
- Product Enrichment

## Environment Variables

```
PORT=7712                    # Integration service port
ZERO711_API=http://localhost:7711  # 0711-C API URL
ANTHROPIC_API_KEY=<key>      # Set in 0711-C
```
