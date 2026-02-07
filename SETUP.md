# 0711-C-Intelligence Setup Guide

> **Enterprise Intelligence Platform** by e-ProCat GmbH

---

## 📋 Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [Installation](#installation)
3. [Konfiguration](#konfiguration)
4. [Starten](#starten)
5. [Zugriff](#zugriff)
6. [Multi-Client Deployment](#multi-client-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 1. Voraussetzungen

### System
- **Node.js** 20+ (empfohlen: 22.x)
- **npm** 10+
- **Git**

### Optional
- **Docker** + Docker Compose (für Container-Deployment)
- **PostgreSQL** (für Datenquellen)

### Prüfen
```bash
node --version   # v20.x oder höher
npm --version    # 10.x oder höher
git --version
```

---

## 2. Installation

### Option A: Von GitHub klonen
```bash
# Repository klonen
git clone https://github.com/C-0711/0711-Intelligence.git
cd 0711-Intelligence

# Dependencies installieren
npm install

# UIs bauen
cd packages/admin && npm run build && cd ..
cd packages/ui && npm run build && cd ..
```

### Option B: Für Entwicklung
```bash
git clone https://github.com/C-0711/0711-Intelligence.git
cd 0711-Intelligence

# Alle Dependencies installieren
npm install

# Entwicklungsserver starten (Hot Reload)
npm run dev
```

---

## 3. Konfiguration

### 3.1 Config-Verzeichnis erstellen
```bash
mkdir -p ~/.0711
```

### 3.2 Basis-Konfiguration
Erstelle `~/.0711/config.json`:

```json
{
  "instance": {
    "name": "Meine Intelligence",
    "locale": "de-DE"
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-20250514"
      }
    },
    "list": [
      {
        "id": "product-expert",
        "enabled": true,
        "identity": {
          "name": "Produkt-Experte",
          "emoji": "🔍"
        },
        "skills": ["product-search", "data-validation"]
      },
      {
        "id": "quality-checker",
        "enabled": true,
        "identity": {
          "name": "Qualitätsprüfer",
          "emoji": "✅"
        },
        "skills": ["data-validation", "report-generation"]
      }
    ]
  },
  "workflows": {
    "list": [
      {
        "id": "daily-quality-check",
        "name": "Tägliche Qualitätsprüfung",
        "type": "automation",
        "enabled": true,
        "trigger": {
          "schedule": "0 8 * * *"
        }
      }
    ]
  },
  "skills": {
    "bundled": [
      "product-search",
      "data-validation",
      "content-generation",
      "report-generation"
    ]
  },
  "dataSources": {
    "providers": {}
  },
  "outputs": {
    "providers": {}
  },
  "ui": {
    "theme": "dark",
    "branding": {
      "primaryColor": "#22c55e",
      "accentColor": "#3b82f6"
    },
    "dashboard": {
      "showKPIs": true,
      "showQuickActions": true,
      "showRecentActivity": true
    }
  }
}
```

### 3.3 Datenquelle hinzufügen (optional)
```json
"dataSources": {
  "providers": {
    "main-db": {
      "type": "postgres",
      "connectionString": "postgresql://user:pass@localhost:5432/mydb"
    },
    "product-csv": {
      "type": "csv",
      "path": "/data/products.csv"
    }
  }
}
```

### 3.4 Output hinzufügen (optional)
```json
"outputs": {
  "providers": {
    "slack-alerts": {
      "type": "slack",
      "webhookUrl": "https://hooks.slack.com/services/..."
    },
    "team-telegram": {
      "type": "telegram",
      "botToken": "123456:ABC...",
      "chatId": "-100123456789"
    }
  }
}
```

---

## 4. Starten

### Produktions-Modus
```bash
cd 0711-c-intelligence

# Server starten
PORT=7074 node packages/api/dist/index.js
```

### Mit Custom Config
```bash
PORT=7074 CONFIG_PATH=~/.0711/config.json node packages/api/dist/index.js
```

### Als Hintergrund-Prozess
```bash
nohup PORT=7074 node packages/api/dist/index.js > server.log 2>&1 &
```

### Mit PM2 (empfohlen für Produktion)
```bash
# PM2 installieren
npm install -g pm2

# Starten
pm2 start packages/api/dist/index.js --name "0711-intelligence" -- --port 7074

# Auto-Start bei Reboot
pm2 startup
pm2 save
```

---

## 5. Zugriff

Nach dem Start sind folgende URLs verfügbar:

| Oberfläche | URL | Beschreibung |
|------------|-----|--------------|
| **Admin UI** | http://localhost:7074/admin | Gateway Dashboard |
| **User UI** | http://localhost:7074/app | Benutzeroberfläche |
| **API** | http://localhost:7074/api | REST API |
| **WebSocket** | ws://localhost:7074/ws | Live Updates |

### Admin UI Seiten
- `/admin/overview` — Dashboard
- `/admin/agents` — Agent Verwaltung
- `/admin/cron-jobs` — Scheduled Jobs
- `/admin/data-sources` — Datenquellen
- `/admin/outputs` — Ausgabekanäle
- `/admin/config` — Raw Config Editor

### User UI Seiten
- `/app/dashboard` — KPIs & Quick Actions
- `/app/agent/:id` — Agent Chat
- `/app/reports` — Berichte
- `/app/automation` — Workflows
- `/app/integrations` — Datenquellen Status
- `/app/publishing` — Ausgaben Status

---

## 6. Multi-Client Deployment

Für mehrere Kunden auf demselben Server:

### Client 1
```bash
mkdir -p ~/clients/client1
cp -r 0711-c-intelligence/* ~/clients/client1/
mkdir -p ~/.0711-client1
# Config anpassen in ~/.0711-client1/config.json

PORT=7075 CONFIG_PATH=~/.0711-client1/config.json node ~/clients/client1/packages/api/dist/index.js
```

### Client 2
```bash
mkdir -p ~/clients/client2
cp -r 0711-c-intelligence/* ~/clients/client2/
mkdir -p ~/.0711-client2
# Config anpassen in ~/.0711-client2/config.json

PORT=7076 CONFIG_PATH=~/.0711-client2/config.json node ~/clients/client2/packages/api/dist/index.js
```

### Mit PM2
```bash
pm2 start packages/api/dist/index.js --name "client1" -- --port 7075
pm2 start packages/api/dist/index.js --name "client2" -- --port 7076
```

---

## 7. Docker Deployment

### docker-compose.yml
```yaml
version: '3.8'

services:
  0711-c-intelligence:
    build: .
    container_name: 0711-c-intelligence
    restart: unless-stopped
    ports:
      - "7074:7074"
    volumes:
      - ~/.0711:/root/.0711
    environment:
      - NODE_ENV=production
      - PORT=7074
      - CONFIG_PATH=/root/.0711/config.json
```

### Starten
```bash
docker-compose up -d
```

### Logs
```bash
docker-compose logs -f
```

### Stoppen
```bash
docker-compose down
```

---

## 8. Troubleshooting

### Server startet nicht
```bash
# Prüfe ob Port belegt ist
lsof -i :7074

# Prüfe Node Version
node --version

# Prüfe Dependencies
cd packages/api && npm install
```

### Config wird nicht geladen
```bash
# Prüfe ob Config existiert
cat ~/.0711/config.json

# Prüfe JSON Syntax
cat ~/.0711/config.json | python3 -m json.tool
```

### UI lädt nicht
```bash
# Prüfe ob Builds existieren
ls packages/admin/dist/
ls packages/ui/dist/

# Neu bauen
cd packages/admin && npm run build
cd packages/ui && npm run build
```

### WebSocket verbindet nicht
```bash
# Prüfe Server Logs
tail -f server.log

# Teste WebSocket
wscat -c ws://localhost:7074/ws
```

### Prozess beenden
```bash
# Finde PID
pgrep -f "node packages/api"

# Beenden
pkill -f "node packages/api"

# Oder mit PM2
pm2 stop 0711-intelligence
```

---

## 📚 Weitere Ressourcen

- **Dokumentation:** https://docs.0711.io
- **GitHub:** https://github.com/C-0711/0711-Intelligence
- **Support:** support@e-procat.de

---

**Version:** 1.0.0  
**Datum:** 2026-02-07  
**Autor:** e-ProCat GmbH
