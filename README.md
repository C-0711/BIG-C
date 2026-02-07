# 🚀 0711-C-Intelligence

**The Mother of All Agentic Enterprise Systems**

OpenClaw + Enterprise Workflows + Data Connectors = Unlimited AI Power

```
┌─────────────────────────────────────────────────────────────────┐
│                    0711-C-Intelligence                          │
│                                                                 │
│  📊 Dashboard  │  🤖 Assistant  │  ⚡ Skills  │  📈 Analytics   │
│  🔌 Integrations │ 📢 Marketing │ ⚙️ Settings │ 📦 Product     │
├─────────────────────────────────────────────────────────────────┤
│                       OPENCLAW CORE                             │
│  Gateway │ Agents │ Channels │ Browser │ Canvas │ Cron │ MCP   │
├─────────────────────────────────────────────────────────────────┤
│                      DATA CONNECTORS                            │
│  CSV │ Excel │ BMEcat │ REST API │ MCP (postgres, github...)   │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ Features

### 🤖 AI-Powered Intelligence
- **Chat with your data** using Claude or GPT
- **Pre-built skills** for content generation, enrichment, publishing
- **Workflows** to automate complex data pipelines

### 🔌 Universal Data Connectors
- **File**: CSV, Excel (.xlsx)
- **Feed**: BMEcat, ETIM (B2B product catalogs)
- **API**: REST, GraphQL, Webhooks
- **MCP**: Any MCP server (PostgreSQL, GitHub, Slack, etc.)

### ⚡ Enterprise Skills (7 included)
| Skill | Category | Description |
|-------|----------|-------------|
| Product Description | Content | SEO-optimized descriptions |
| SEO Optimizer | Content | Search engine optimization |
| Translator | Content | Multi-language translation |
| Auto-Categorize | Enrichment | AI product categorization |
| Quality Score | Enrichment | Data quality scoring |
| Feed Export | Publishing | CSV/XML/JSON/BMEcat export |
| Amazon Listing | Publishing | A+ Content generation |

### 📱 Multi-Channel Alerts (via OpenClaw)
WhatsApp • Telegram • Slack • Discord • Signal • Teams • Email

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/0711/0711-c-intelligence
cd 0711-c-intelligence

# Configure
cp .env.example .env
# Edit .env with your API keys

# Run with Docker (recommended)
docker-compose up -d

# Access the platform
open http://localhost:7073
```

## 🔧 Manual Setup

```bash
# Install dependencies
pnpm install

# Start OpenClaw Gateway
cd packages/core && pnpm gateway:watch

# Start API server (new terminal)
cd packages/api && pnpm dev

# Start UI (new terminal)
cd packages/ui && pnpm dev

# Access
open http://localhost:5173
```

## 📦 Architecture

```
0711-c-intelligence/
├── packages/
│   ├── core/           # OpenClaw (agent runtime, channels, tools)
│   ├── ui/             # Enterprise React UI
│   ├── api/            # Express REST API + WebSocket proxy
│   ├── config-ui/      # 0711-C agent configuration UI
│   ├── integration/    # Pre-built agents & workflows
│   ├── connectors/     # Data source connectors
│   └── workflows/      # Enterprise skills
├── configs/            # Client-specific configurations
├── docker-compose.yml  # Full stack deployment
└── README.md
```

## 🔌 Data Connectors

### CSV Connector
```typescript
import { CSVConnector } from '@0711/connectors';

const connector = new CSVConnector('my-csv', 'Product Import');
await connector.connect({ filePath: './products.csv' });
const schema = await connector.getSchema();
const preview = await connector.preview(10);
```

### MCP Connector
```typescript
import { MCPConnector, MCP_TEMPLATES } from '@0711/connectors';

const connector = new MCPConnector('my-db', 'PostgreSQL');
await connector.connect({
  ...MCP_TEMPLATES.postgres,
  env: { POSTGRES_URL: 'postgresql://...' }
});
```

### REST API Connector
```typescript
import { RESTConnector } from '@0711/connectors';

const connector = new RESTConnector('shopify', 'Shopify Products');
await connector.connect({
  baseUrl: 'https://mystore.myshopify.com/admin/api/2024-01',
  auth: { type: 'bearer', bearerToken: 'shpat_...' },
  endpoints: { list: '/products.json' },
  responseMapping: { dataPath: 'products' }
});
```

## ⚙️ Configuration

### Instance Branding
```javascript
// packages/ui/src/config/instance.js
const instanceConfig = {
  branding: {
    name: "My Intelligence",
    primaryColor: "#3B82F6",
    logo: "/assets/logo.png",
  },
  modules: {
    marketing: true,
    analytics: true,
    // Enable/disable as needed
  }
};
```

### Environment Variables
```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://localhost:5432/intelligence
OPENCLAW_GATEWAY=ws://localhost:18789
```

## 🛠️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/config` | GET | Instance configuration |
| `/api/data-sources` | GET/POST | Manage data sources |
| `/api/data-sources/:id/sync` | POST | Trigger sync |
| `/api/agents` | GET/POST | Agent management |
| `/api/agents/:id/execute` | POST | Execute agent |
| `/api/workflows` | GET/POST | Workflow management |
| `/api/workflows/:id/run` | POST | Run workflow |
| `/api/entities` | GET/POST | Entity CRUD |
| `/api/skills` | GET | List skills |
| `/api/skills/:id/run` | POST | Execute skill |
| `/ws` | WebSocket | Real-time OpenClaw proxy |

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| ui | 7073 | React Enterprise UI |
| api | 7074 | Express API Server |
| openclaw | 18789 | OpenClaw Gateway |
| postgres | 5432 | PostgreSQL Database |
| redis | 6379 | Redis Cache/Queue |
| neo4j | 7474/7687 | Neo4j Graph Database |

## 📚 Documentation

- [Installation Guide](docs/INSTALL.md)
- [Configuration](docs/CONFIG.md)
- [Data Sources](docs/DATA-SOURCES.md)
- [Skills Guide](docs/SKILLS.md)
- [API Reference](docs/API.md)

## 🏗️ Built With

- [OpenClaw](https://github.com/openclaw/openclaw) — AI agent runtime
- [React](https://react.dev) — UI framework
- [Express](https://expressjs.com) — API server
- [PostgreSQL](https://postgresql.org) — Database
- [Neo4j](https://neo4j.com) — Graph database
- [Redis](https://redis.io) — Cache & queues

## 📄 License

MIT

---

**Built by [0711 Intelligence](https://0711.io)** 🇩🇪

The Mother of All Agentic Enterprise Systems 🚀
