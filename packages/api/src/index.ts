import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { WebSocket, WebSocketServer } from 'ws';
import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import configService from './services/ConfigService';

dotenvConfig();

const app = express();
const PORT = process.env.PORT || 7074;
const OPENCLAW_WS = process.env.OPENCLAW_GATEWAY || 'ws://localhost:18789';

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,  // Allow inline scripts for dev
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));

// ─── LOAD CONFIG ON STARTUP ────────────────────────────────────────────────
const initialConfig = configService.loadConfig();
configService.loadSchema();
configService.startWatching();

console.log(`📊 Instance: ${initialConfig.instance.name}`);
console.log(`🤖 Agents: ${initialConfig.agents.list.length} (${configService.getEnabledAgents().length} enabled)`);
console.log(`⚡ Workflows: ${initialConfig.workflows.list.length} (${configService.getEnabledWorkflows().length} enabled)`);

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const config = configService.getConfig();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    instance: config.instance.name,
    agents: configService.getEnabledAgents().length,
    workflows: configService.getEnabledWorkflows().length,
  });
});

// ─── API ROUTES ────────────────────────────────────────────────────────────
import configRouter from './routes/config';
import dataSourcesRouter from './routes/data-sources';
import agentsRouter from './routes/agents';
import workflowsRouter from './routes/workflows';
import entitiesRouter from './routes/entities';
import skillsRouter from './routes/skills';

// Config API (primary)
app.use('/api/config', configRouter);

// Legacy routes (for backward compatibility)
app.use('/api/data-sources', dataSourcesRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/entities', entitiesRouter);
app.use('/api/skills', skillsRouter);

// ─── STATIC FILES: ADMIN UI (/admin) ───────────────────────────────────────
const adminDistPath = path.join(__dirname, '../../admin/dist');
app.use('/admin', express.static(adminDistPath));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminDistPath, 'index.html'));
});

// ─── STATIC FILES: USER UI (/app) ──────────────────────────────────────────
const appDistPath = path.join(__dirname, '../../ui/dist');
app.use('/app', express.static(appDistPath));
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(appDistPath, 'index.html'));
});

// ─── ROOT REDIRECT ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/app');
});

// ─── START SERVER ──────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀 0711-C-Intelligence Gateway`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Config: ~/.0711/config.json`);
  console.log(`   OpenClaw: ${OPENCLAW_WS}`);
  console.log(`\n   Routes:`);
  console.log(`     /admin     → Admin UI (Gateway Dashboard)`);
  console.log(`     /app       → User UI (Config-Driven)`);
  console.log(`     /api/*     → REST API`);
  console.log(`     /ws        → WebSocket`);
  console.log(`\n`);
});

// ─── WEBSOCKET ─────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws' });
const clients: Set<WebSocket> = new Set();

function broadcast(message: any) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (clientWs) => {
  console.log('[WS] Client connected');
  clients.add(clientWs);
  
  // Send initial config
  const config = configService.getConfig();
  clientWs.send(JSON.stringify({ 
    type: 'config.init', 
    config,
    timestamp: new Date().toISOString(),
  }));
  
  clientWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      if (msg.type === 'config.patch') {
        // Apply patch and broadcast
        const updated = configService.patchConfig(msg.patch);
        broadcast({ 
          type: 'config.changed', 
          config: updated,
          source: 'websocket',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('[WS] Message error:', e);
    }
  });
  
  clientWs.on('close', () => {
    console.log('[WS] Client disconnected');
    clients.delete(clientWs);
  });
});

// Broadcast config changes from file watcher
configService.on('change', (config) => {
  console.log('[Config] File changed, broadcasting...');
  broadcast({ 
    type: 'config.changed', 
    config,
    source: 'file',
    timestamp: new Date().toISOString(),
  });
});

// ─── PROXY TO OPENCLAW ─────────────────────────────────────────────────────
let openClawWs: WebSocket | null = null;

function connectToOpenClaw() {
  try {
    openClawWs = new WebSocket(OPENCLAW_WS);
    
    openClawWs.on('open', () => {
      console.log('[OpenClaw] Connected to Gateway');
    });
    
    openClawWs.on('message', (data) => {
      // Forward OpenClaw messages to clients
      broadcast({ 
        type: 'openclaw.message', 
        data: JSON.parse(data.toString()),
      });
    });
    
    openClawWs.on('close', () => {
      console.log('[OpenClaw] Disconnected, reconnecting in 5s...');
      setTimeout(connectToOpenClaw, 5000);
    });
    
    openClawWs.on('error', () => {
      // Silently handle errors, will reconnect
    });
  } catch (e) {
    setTimeout(connectToOpenClaw, 5000);
  }
}

// connectToOpenClaw();  // Uncomment when OpenClaw is available

export { app, server, wss, broadcast };
