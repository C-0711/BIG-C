# 0711-C-Intelligence

**Self-hosted, config-driven Enterprise Intelligence Platform**

by **e-ProCat GmbH**

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/0711/0711-c-intelligence.git
cd 0711-c-intelligence

# Install dependencies
npm install

# Start development
npm run dev
```

**Access:**
- 📊 **User UI:** http://localhost:7074/app
- ⚙️ **Admin UI:** http://localhost:7074/admin
- 🔌 **API:** http://localhost:7074/api

---

## 📁 Architecture

```
~/.0711/config.json (Single Source of Truth)
         │
         ▼
    Backend API (Port 7074)
         │
    ┌────┴────┐
    ▼         ▼
 /admin      /app
 Gateway     User
 Dashboard   Interface
```

**One repo. Two UIs. One config.**

---

## 🏗️ Project Structure

```
0711-c-intelligence/
├── packages/
│   ├── admin/          # Admin UI (Vite + Lit) → /admin
│   │   └── src/pages/  # 16 pages (OpenClaw style)
│   ├── ui/             # User UI (React) → /app
│   │   └── src/        # Config-driven components
│   ├── api/            # Backend API + WebSocket
│   ├── core/           # OpenClaw Gateway integration
│   ├── connectors/     # Data connectors (CSV, Excel, REST, MCP)
│   └── workflows/      # Enterprise skills (13 bundled)
├── ~/.0711/
│   ├── config.json     # Main configuration (JSON5)
│   └── workspace/      # Agent workspaces
└── docker-compose.yml
```

---

## ⚙️ Configuration

All configuration is in `~/.0711/config.json`:

```json5
{
  "instance": {
    "name": "My Intelligence",
    "locale": "de-DE"
  },
  "agents": {
    "list": [
      { "id": "product-expert", "enabled": true, "skills": ["product-search"] }
    ]
  },
  "workflows": {
    "list": [
      { "id": "daily-check", "trigger": { "schedule": "0 8 * * *" } }
    ]
  },
  "dataSources": {
    "providers": {
      "postgres": { "type": "postgres", "connectionString": "..." }
    }
  },
  "ui": {
    "theme": "dark",
    "branding": { "primaryColor": "#22c55e" }
  }
}
```

**Features:**
- ✅ Hot reload on config changes
- ✅ WebSocket broadcast to all clients
- ✅ JSON5 with comments support
- ✅ `$include` for modular configs
- ✅ Environment variable substitution

---

## 📊 Admin UI Pages (16)

| Group | Pages |
|-------|-------|
| Control | Overview, Chat, Channels, Instances, Sessions, Cron Jobs |
| Agent | Agents, Skills, Nodes |
| Data | Data Sources, Outputs, Template & UI |
| Settings | Config, Debug, Logs |
| Resources | Docs |

---

## 🤖 Pre-configured Agents

| Agent | Purpose |
|-------|---------|
| `product-expert` | Product information and search |
| `quality-checker` | Data quality validation |
| `content-writer` | Marketing content generation |
| `feed-manager` | Feed and export management |

---

## ⚡ Pre-configured Workflows

| Workflow | Trigger |
|----------|---------|
| `daily-quality-check` | Daily at 08:00 |
| `import-automation` | On new data upload |
| `report-generation` | Weekly on Monday |
| `new-product-enrichment` | On product creation |

---

## 🔌 Data Connectors

- **PostgreSQL** — Direct database connection
- **CSV** — File import/export
- **Excel** — XLSX processing
- **BMEcat** — Industry catalog format
- **REST API** — External API integration
- **MCP** — Model Context Protocol

---

## 📦 Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🛠️ Development

```bash
# Install all dependencies
npm install

# Start all packages in dev mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

## 📚 Links

- **Documentation:** https://docs.0711.io
- **GitHub:** https://github.com/0711/0711-c-intelligence
- **Discord:** https://discord.gg/0711

---

**Built with ❤️ by e-ProCat GmbH**

Based on [OpenClaw](https://github.com/openclaw/openclaw) architecture.
