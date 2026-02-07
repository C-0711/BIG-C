import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { WebSocket, WebSocketServer } from 'ws';
import { config as dotenvConfig } from 'dotenv';
import configService from './services/ConfigService';

dotenvConfig();

const app = express();
const PORT = process.env.PORT || 7074;
const OPENCLAW_WS = process.env.OPENCLAW_GATEWAY || 'ws://localhost:18789';

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────
app.use(helmet());
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

// ─── START SERVER ──────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀 0711-C-Intelligence API`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Config: ~/.0711/config.json`);
  console.log(`   OpenClaw: ${OPENCLAW_WS}`);
  console.log(`   Endpoints:`);
  console.log(`     GET  /api/config          Full config`);
  console.log(`     GET  /api/config/schema   JSON Schema`);
  console.log(`     PATCH /api/config         Partial update`);
  console.log(`     POST /api/config/reload   Force reload`);
  console.log(`\n`);
});

// ─── WEBSOCKET ─────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws' });
const clients: Set<WebSocket> = new Set();

wss.on('connection', (clientWs) => {
  console.log('[WS] Client connected');
  clients.add(clientWs);
  
  // Send current config on connect
  clientWs.send(JSON.stringify({ 
    type: 'config.init', 
    config: configService.getConfig() 
  }));
  
  // Connect to OpenClaw Gateway for proxying
  let openclawWs: WebSocket | null = null;
  try {
    openclawWs = new WebSocket(OPENCLAW_WS);
    
    openclawWs.on('open', () => {
      console.log('[WS] Connected to OpenClaw Gateway');
      clientWs.send(JSON.stringify({ type: 'openclaw.connected' }));
    });
    
    openclawWs.on('message', (data) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data.toString());
      }
    });
    
    openclawWs.on('error', () => {
      clientWs.send(JSON.stringify({ type: 'openclaw.error', message: 'Gateway not available' }));
    });
    
    openclawWs.on('close', () => {
      clientWs.send(JSON.stringify({ type: 'openclaw.disconnected' }));
    });
  } catch (e) {
    clientWs.send(JSON.stringify({ type: 'openclaw.error', message: 'Failed to connect to Gateway' }));
  }
  
  clientWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      // Handle config requests directly
      if (msg.type === 'config.get') {
        clientWs.send(JSON.stringify({ type: 'config.data', config: configService.getConfig() }));
      } else if (msg.type === 'config.patch') {
        const updated = configService.patchConfig(msg.patch);
        clientWs.send(JSON.stringify({ type: 'config.updated', config: updated }));
      } else if (openclawWs?.readyState === WebSocket.OPEN) {
        // Forward to OpenClaw
        openclawWs.send(data.toString());
      }
    } catch (e) {
      // Forward raw message to OpenClaw
      if (openclawWs?.readyState === WebSocket.OPEN) {
        openclawWs.send(data.toString());
      }
    }
  });
  
  clientWs.on('close', () => {
    console.log('[WS] Client disconnected');
    clients.delete(clientWs);
    openclawWs?.close();
  });
});

// ─── BROADCAST CONFIG CHANGES ──────────────────────────────────────────────
configService.on('changed', (newConfig) => {
  console.log('[Config] Broadcasting change to', clients.size, 'clients');
  const message = JSON.stringify({ type: 'config.changed', config: newConfig });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

// ─── GRACEFUL SHUTDOWN ─────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  configService.stopWatching();
  wss.close();
  server.close();
});

export default app;
