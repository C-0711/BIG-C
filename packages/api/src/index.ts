import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { WebSocket, WebSocketServer } from 'ws';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 7074;
const OPENCLAW_WS = process.env.OPENCLAW_GATEWAY || 'ws://localhost:18789';

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
import dataSourcesRouter from './routes/data-sources';
import agentsRouter from './routes/agents';
import workflowsRouter from './routes/workflows';
import entitiesRouter from './routes/entities';
import skillsRouter from './routes/skills';

app.use('/api/data-sources', dataSourcesRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/entities', entitiesRouter);
app.use('/api/skills', skillsRouter);

// Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    version: '1.0.0',
    name: process.env.INSTANCE_NAME || '0711-C Intelligence',
    openclawGateway: OPENCLAW_WS,
    features: {
      connectors: ['csv', 'excel', 'bmecat', 'rest', 'mcp'],
      skills: true,
      workflows: true,
    }
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(\`🚀 0711-C-Intelligence API running on port \${PORT}\`);
  console.log(\`📡 OpenClaw Gateway: \${OPENCLAW_WS}\`);
});

// WebSocket proxy to OpenClaw
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (clientWs) => {
  console.log('[WS] Client connected');
  
  // Connect to OpenClaw Gateway
  const openclawWs = new WebSocket(OPENCLAW_WS);
  
  openclawWs.on('open', () => {
    console.log('[WS] Connected to OpenClaw Gateway');
  });
  
  openclawWs.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data.toString());
    }
  });
  
  clientWs.on('message', (data) => {
    if (openclawWs.readyState === WebSocket.OPEN) {
      openclawWs.send(data.toString());
    }
  });
  
  clientWs.on('close', () => {
    console.log('[WS] Client disconnected');
    openclawWs.close();
  });
  
  openclawWs.on('close', () => {
    clientWs.close();
  });
});

export default app;
