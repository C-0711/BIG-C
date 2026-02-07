# 🚀 0711-C-Intelligence

**The Mother of All Agentic Enterprise Systems**

OpenClaw + Enterprise Workflows + Data Connectors = Unlimited Possibilities

```
┌─────────────────────────────────────────────────────────────────┐
│                    0711-C-Intelligence                          │
├─────────────────────────────────────────────────────────────────┤
│  📊 Dashboard  │  🤖 Assistant  │  ⚡ Skills  │  📈 Analytics   │
├─────────────────────────────────────────────────────────────────┤
│                       OPENCLAW CORE                             │
│  Gateway │ Agents │ Channels │ Browser │ Canvas │ Cron │ MCP   │
├─────────────────────────────────────────────────────────────────┤
│                      DATA CONNECTORS                            │
│  CSV │ Excel │ BMEcat │ REST API │ PostgreSQL │ MongoDB        │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ Features

- **🤖 AI-Powered Assistant** — Chat with your data using Claude/GPT
- **⚡ Enterprise Skills** — Pre-built content generators, analyzers, publishers
- **🔌 Data Connectors** — Import from CSV, APIs, databases, industry feeds
- **📊 Analytics Dashboard** — KPIs, metrics, insights
- **🔄 Automation** — Scheduled workflows via OpenClaw cron
- **📱 Multi-Channel** — Alerts via WhatsApp, Telegram, Slack, Discord
- **🎨 White-Label** — Fully customizable branding

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/0711/0711-c-intelligence
cd 0711-c-intelligence

# Configure
cp config.example.yaml config.yaml
# Edit config.yaml with your settings

# Run with Docker
docker-compose up -d

# Or run manually
pnpm install
pnpm dev

# Access
open http://localhost:7073
```

## 📦 Architecture

```
0711-c-intelligence/
├── packages/
│   ├── core/           # OpenClaw (agent runtime)
│   ├── ui/             # Enterprise React UI
│   ├── connectors/     # Data source connectors
│   └── workflows/      # Pre-built skills & workflows
├── docker/
├── docs/
├── config.example.yaml
└── docker-compose.yml
```

## 🔌 Data Connectors

| Type | Connectors |
|------|------------|
| **File** | CSV, Excel, JSON |
| **Feed** | BMEcat, ETIM, ICECAT |
| **API** | REST, GraphQL, Webhooks |
| **Database** | PostgreSQL, MySQL, MongoDB |

## ⚡ Pre-Built Skills

| Category | Skills |
|----------|--------|
| **Content** | Product descriptions, SEO, Marketing copy |
| **Enrichment** | Auto-categorize, Feature extraction, Quality scoring |
| **Publishing** | Amazon, Social media, Feed export |
| **Analytics** | Reports, Trends, Competitor analysis |

## 🔧 Configuration

```yaml
# config.yaml
branding:
  name: "My Intelligence"
  logo: "/assets/logo.png"
  primaryColor: "#3B82F6"

modules:
  assistant: true
  dashboard: true
  skills: true
  marketing: true
  analytics: true

openclaw:
  gateway: "ws://localhost:18789"

database:
  postgres: "postgresql://localhost:5432/intelligence"
```

## 📚 Documentation

- [Installation Guide](docs/INSTALL.md)
- [Configuration](docs/CONFIG.md)
- [Data Sources](docs/DATA-SOURCES.md)
- [Building Skills](docs/SKILLS.md)
- [API Reference](docs/API.md)

## 🤝 Built With

- [OpenClaw](https://github.com/openclaw/openclaw) — Agent runtime & channels
- [React](https://react.dev/) — UI framework
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [PostgreSQL](https://postgresql.org/) — Database
- [Neo4j](https://neo4j.com/) — Graph relationships

## 📄 License

MIT

---

**Built by [0711 Intelligence](https://0711.io)**
