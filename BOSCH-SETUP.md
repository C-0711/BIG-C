# Bosch Intelligence Setup Guide

> Schritt-für-Schritt Anleitung zur Einrichtung von 0711-C-Intelligence für Bosch

---

## Übersicht

Diese Anleitung zeigt, wie Sie eine dedizierte Bosch-Instanz von 0711-C-Intelligence einrichten.

**Ziel-Setup:**
- **Port:** 7076
- **Config:** `~/.0711-bosch/config.json`
- **Deployment:** `~/0711/Bosch/`

---

## Schritt 1: Deployment-Verzeichnis erstellen

```bash
# Verzeichnis erstellen
mkdir -p ~/0711/Bosch

# Projekt kopieren
cp -r ~/0711/0711-c-intelligence/* ~/0711/Bosch/

# In Verzeichnis wechseln
cd ~/0711/Bosch
```

---

## Schritt 2: Config-Verzeichnis erstellen

```bash
mkdir -p ~/.0711-bosch
```

---

## Schritt 3: Bosch-spezifische Konfiguration

Erstelle `~/.0711-bosch/config.json`:

```bash
cat > ~/.0711-bosch/config.json << 'CONFIG'
{
  "instance": {
    "name": "Bosch Intelligence",
    "logo": "🔧",
    "template": "enterprise",
    "locale": "de-DE"
  },
  
  "agents": {
    "defaults": {
      "workspace": "~/.0711-bosch/workspace",
      "model": {
        "primary": "anthropic/claude-sonnet-4-20250514",
        "fallbacks": ["openai/gpt-4o"]
      },
      "thinkingDefault": "low"
    },
    "list": [
      {
        "id": "product-expert",
        "enabled": true,
        "identity": {
          "name": "Bosch Produkt-Experte",
          "emoji": "🔧",
          "theme": "Beantwortet Fragen zu Bosch Produkten, Elektrowerkzeuge, Hausgeräte"
        },
        "skills": ["product-search", "product-compare", "spec-lookup"],
        "dataSources": ["bosch-catalog"]
      },
      {
        "id": "quality-checker",
        "enabled": true,
        "identity": {
          "name": "Qualitäts-Manager",
          "emoji": "✅",
          "theme": "Prüft Produktdaten auf Vollständigkeit und Korrektheit"
        },
        "skills": ["data-validation", "gap-analysis", "report-generation"],
        "dataSources": ["bosch-catalog"]
      },
      {
        "id": "content-writer",
        "enabled": true,
        "identity": {
          "name": "Content Creator",
          "emoji": "✍️",
          "theme": "Erstellt Produktbeschreibungen, SEO-Texte, Marketinginhalte"
        },
        "skills": ["product-description", "seo-optimization", "multilingual"],
        "dataSources": ["bosch-catalog"]
      },
      {
        "id": "feed-manager",
        "enabled": true,
        "identity": {
          "name": "Feed Manager",
          "emoji": "📤",
          "theme": "Verwaltet Ausgabekanäle: Amazon, eBay, BMEcat"
        },
        "skills": ["feed-generation", "channel-mapping", "etim-eclass"],
        "dataSources": ["bosch-catalog"],
        "outputs": ["amazon-feed", "ebay-feed"]
      },
      {
        "id": "technical-support",
        "enabled": true,
        "identity": {
          "name": "Technischer Support",
          "emoji": "🛠️",
          "theme": "Beantwortet technische Fragen zu Bosch Produkten"
        },
        "skills": ["spec-lookup", "compatibility-check", "troubleshooting"],
        "dataSources": ["bosch-catalog", "bosch-manuals"]
      }
    ]
  },

  "workflows": {
    "list": [
      {
        "id": "daily-quality-check",
        "name": "Täglicher Qualitäts-Check",
        "type": "automation",
        "enabled": true,
        "trigger": {
          "schedule": "0 7 * * *"
        },
        "steps": [
          {"agent": "quality-checker", "action": "run-audit"},
          {"output": "team-slack", "template": "quality-report"}
        ]
      },
      {
        "id": "weekly-report",
        "name": "Wöchentlicher Report",
        "type": "report",
        "enabled": true,
        "trigger": {
          "schedule": "0 8 * * 1"
        },
        "steps": [
          {"agent": "quality-checker", "action": "weekly-summary"},
          {"agent": "feed-manager", "action": "channel-performance"}
        ]
      },
      {
        "id": "new-product-enrichment",
        "name": "Neues Produkt anreichern",
        "type": "automation",
        "enabled": true,
        "trigger": {
          "event": "product-created"
        },
        "steps": [
          {"agent": "content-writer", "action": "generate-description"},
          {"agent": "quality-checker", "action": "validate-product"},
          {"agent": "feed-manager", "action": "publish-to-channels"}
        ]
      },
      {
        "id": "catalog-sync",
        "name": "Katalog-Synchronisation",
        "type": "automation",
        "enabled": true,
        "trigger": {
          "schedule": "0 */6 * * *"
        },
        "steps": [
          {"action": "sync-datasource", "source": "bosch-catalog"},
          {"agent": "quality-checker", "action": "validate-changes"}
        ]
      }
    ]
  },

  "skills": {
    "bundled": [
      "product-search",
      "product-compare",
      "spec-lookup",
      "data-validation",
      "gap-analysis",
      "report-generation",
      "product-description",
      "seo-optimization",
      "multilingual",
      "feed-generation",
      "channel-mapping",
      "etim-eclass",
      "compatibility-check",
      "troubleshooting"
    ],
    "workspace": "~/.0711-bosch/workspace/skills/"
  },

  "dataSources": {
    "providers": {
      "bosch-catalog": {
        "type": "postgres",
        "connectionString": "postgresql://bosch:password@localhost:5432/bosch_catalog",
        "sync": {
          "schedule": "0 */6 * * *"
        }
      },
      "bosch-manuals": {
        "type": "mcp",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/data/bosch/manuals"]
      }
    }
  },

  "outputs": {
    "providers": {
      "amazon-feed": {
        "type": "api",
        "endpoint": "https://api.amazon.de/feeds",
        "format": "amazon-sp"
      },
      "ebay-feed": {
        "type": "api",
        "endpoint": "https://api.ebay.de/feeds",
        "format": "ebay-mip"
      },
      "team-slack": {
        "type": "slack",
        "webhookUrl": "https://hooks.slack.com/services/..."
      }
    }
  },

  "ui": {
    "theme": "dark",
    "branding": {
      "primaryColor": "#E20015",
      "accentColor": "#00A8E1"
    },
    "dashboard": {
      "showKPIs": true,
      "showQuickActions": true,
      "showRecentActivity": true
    }
  },

  "auth": {
    "mode": "password"
  }
}
CONFIG

echo "✅ Bosch Config erstellt"
```

---

## Schritt 4: Workspace erstellen

```bash
mkdir -p ~/.0711-bosch/workspace/skills
```

---

## Schritt 5: Dependencies installieren

```bash
cd ~/0711/Bosch/packages/api
npm install express cors
```

---

## Schritt 6: Server starten

### Test-Start (Vordergrund)
```bash
cd ~/0711/Bosch
PORT=7076 CONFIG_PATH=~/.0711-bosch/config.json node packages/api/dist/index.js
```

### Produktions-Start (Hintergrund)
```bash
cd ~/0711/Bosch
nohup bash -c "PORT=7076 CONFIG_PATH=~/.0711-bosch/config.json node packages/api/dist/index.js" > server.log 2>&1 &
```

### Mit PM2 (empfohlen)
```bash
pm2 start packages/api/dist/index.js --name "bosch-intelligence" \
  --env PORT=7076 \
  --env CONFIG_PATH=~/.0711-bosch/config.json

pm2 save
```

---

## Schritt 7: Zugriff testen

### URLs
| Oberfläche | URL |
|------------|-----|
| **Admin UI** | http://localhost:7076/admin |
| **User UI** | http://localhost:7076/app |
| **API** | http://localhost:7076/api/config |

### Quick Tests
```bash
# Health Check
curl http://localhost:7076/api/health

# Config Check
curl http://localhost:7076/api/config | jq '.instance'

# Agents Check
curl http://localhost:7076/api/config | jq '.agents.list[].id'
```

---

## Schritt 8: SSH Tunnel (für Remote-Zugriff)

Falls der Server remote läuft:

```bash
ssh -L 7076:localhost:7076 user@server-ip
```

Dann lokal zugreifen:
- http://localhost:7076/admin
- http://localhost:7076/app

---

## Schritt 9: Server verwalten

### Logs anzeigen
```bash
tail -f ~/0711/Bosch/server.log
```

### Server stoppen
```bash
pkill -f "PORT=7076"
# oder mit PM2:
pm2 stop bosch-intelligence
```

### Server neustarten
```bash
pm2 restart bosch-intelligence
```

---

## Anpassungen

### Branding ändern
In `~/.0711-bosch/config.json`:
```json
"ui": {
  "branding": {
    "primaryColor": "#E20015",  // Bosch Rot
    "accentColor": "#00A8E1"    // Bosch Blau
  }
}
```

### Neuen Agent hinzufügen
```json
{
  "id": "translator",
  "enabled": true,
  "identity": {
    "name": "Übersetzer",
    "emoji": "🌍"
  },
  "skills": ["multilingual"]
}
```

### Datenquelle hinzufügen
```json
"new-source": {
  "type": "csv",
  "path": "/data/bosch/products.csv"
}
```

---

## Troubleshooting

### Port bereits belegt
```bash
lsof -i :7076
kill -9 <PID>
```

### Config-Fehler
```bash
cat ~/.0711-bosch/config.json | python3 -m json.tool
```

### Server startet nicht
```bash
cd ~/0711/Bosch/packages/api
npm install
node dist/index.js
```

---

## Quick Reference

| Command | Beschreibung |
|---------|--------------|
| `pm2 start bosch-intelligence` | Server starten |
| `pm2 stop bosch-intelligence` | Server stoppen |
| `pm2 logs bosch-intelligence` | Logs anzeigen |
| `pm2 restart bosch-intelligence` | Server neustarten |
| `curl localhost:7076/api/health` | Health Check |

---

**Setup abgeschlossen!** 🚀

Admin UI: http://localhost:7076/admin  
User UI: http://localhost:7076/app
