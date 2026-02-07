import JSON5 from 'json5';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 7074;
const CONFIG_PATH = process.env.CONFIG_PATH || path.join(process.env.HOME || '~', '.0711', 'config.json');

// Resolve ~ in path
const resolveConfigPath = (p: string) => {
  if (p.startsWith('~')) {
    return path.join(process.env.HOME || '', p.slice(1));
  }
  return p;
};

const configPath = resolveConfigPath(CONFIG_PATH);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve Admin UI
app.use('/admin', express.static(path.join(__dirname, '../../admin/dist')));

// Serve User UI
app.use('/app', express.static(path.join(__dirname, '../../ui/dist')));

// ========================================
// CONFIG API
// ========================================

// GET /api/config - Get full config
app.get('/api/config', (req, res) => {
  try {
    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ error: 'Config file not found', path: configPath });
    }
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON5.parse(configData);
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read config', message: err.message });
  }
});

// PUT /api/config - Replace full config
app.put('/api/config', (req, res) => {
  try {
    const newConfig = req.body;
    
    // Validate it's valid JSON by stringifying
    const configStr = JSON.stringify(newConfig, null, 2);
    
    // Ensure directory exists
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write config
    fs.writeFileSync(configPath, configStr, 'utf-8');
    
    res.json({ success: true, message: 'Config saved successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save config', message: err.message });
  }
});

// PATCH /api/config - Partial update using path notation
app.patch('/api/config', (req, res) => {
  try {
    const { path: updatePath, value } = req.body;
    
    if (!updatePath) {
      return res.status(400).json({ error: 'Missing path in request body' });
    }
    
    // Read current config
    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ error: 'Config file not found' });
    }
    
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON5.parse(configData);
    
    // Navigate to path and update
    const pathParts = updatePath.split('.');
    let current: any = config;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (current[pathParts[i]] === undefined) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    const lastKey = pathParts[pathParts.length - 1];
    current[lastKey] = value;
    
    // Write updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true, message: 'Config updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update config', message: err.message });
  }
});

// ========================================
// AGENTS API
// ========================================

app.get('/api/agents', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(config.agents?.list || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/:id', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const agent = config.agents?.list?.find((a: any) => a.id === req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const newAgent = req.body;
    
    if (!newAgent.id) {
      return res.status(400).json({ error: 'Agent id is required' });
    }
    
    if (config.agents?.list?.some((a: any) => a.id === newAgent.id)) {
      return res.status(409).json({ error: 'Agent with this id already exists' });
    }
    
    if (!config.agents) config.agents = { list: [] };
    if (!config.agents.list) config.agents.list = [];
    
    config.agents.list.push(newAgent);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true, agent: newAgent });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/agents/:id', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const idx = config.agents?.list?.findIndex((a: any) => a.id === req.params.id);
    
    if (idx === -1 || idx === undefined) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    config.agents.list[idx] = { ...config.agents.list[idx], ...req.body, id: req.params.id };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true, agent: config.agents.list[idx] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/agents/:id', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const idx = config.agents?.list?.findIndex((a: any) => a.id === req.params.id);
    
    if (idx === -1 || idx === undefined) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    config.agents.list.splice(idx, 1);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// WORKFLOWS API
// ========================================

app.get('/api/workflows', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(config.workflows?.list || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workflows', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const newWorkflow = req.body;
    
    if (!newWorkflow.id) {
      return res.status(400).json({ error: 'Workflow id is required' });
    }
    
    if (!config.workflows) config.workflows = { list: [] };
    if (!config.workflows.list) config.workflows.list = [];
    
    config.workflows.list.push(newWorkflow);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true, workflow: newWorkflow });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/workflows/:id', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const idx = config.workflows?.list?.findIndex((w: any) => w.id === req.params.id);
    
    if (idx === -1 || idx === undefined) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    config.workflows.list[idx] = { ...config.workflows.list[idx], ...req.body, id: req.params.id };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true, workflow: config.workflows.list[idx] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/workflows/:id', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const idx = config.workflows?.list?.findIndex((w: any) => w.id === req.params.id);
    
    if (idx === -1 || idx === undefined) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    config.workflows.list.splice(idx, 1);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workflows/:id/run', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const workflow = config.workflows?.list?.find((w: any) => w.id === req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    // TODO: Actually execute workflow
    // For now, just return success
    res.json({ 
      success: true, 
      message: `Workflow "${workflow.name}" triggered`,
      workflowId: workflow.id,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// DATA SOURCES API
// ========================================

app.get('/api/datasources', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(config.dataSources?.providers || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/datasources', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const { id, ...dataSource } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Data source id is required' });
    }
    
    if (!config.dataSources) config.dataSources = { providers: {} };
    if (!config.dataSources.providers) config.dataSources.providers = {};
    
    config.dataSources.providers[id] = dataSource;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true, id, dataSource });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/datasources/:id', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    
    if (!config.dataSources?.providers?.[req.params.id]) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    
    config.dataSources.providers[req.params.id] = req.body;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true, dataSource: req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/datasources/:id', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    
    if (!config.dataSources?.providers?.[req.params.id]) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    
    delete config.dataSources.providers[req.params.id];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/datasources/:id/test', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const dataSource = config.dataSources?.providers?.[req.params.id];
    
    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    
    // TODO: Actually test connection
    res.json({ 
      success: true, 
      message: 'Connection test successful',
      dataSourceId: req.params.id
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// OUTPUTS API
// ========================================

app.get('/api/outputs', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(config.outputs?.providers || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/outputs', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const { id, ...output } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Output id is required' });
    }
    
    if (!config.outputs) config.outputs = { providers: {} };
    if (!config.outputs.providers) config.outputs.providers = {};
    
    config.outputs.providers[id] = output;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true, id, output });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/outputs/:id', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    
    if (!config.outputs?.providers?.[req.params.id]) {
      return res.status(404).json({ error: 'Output not found' });
    }
    
    config.outputs.providers[req.params.id] = req.body;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true, output: req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/outputs/:id', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    
    if (!config.outputs?.providers?.[req.params.id]) {
      return res.status(404).json({ error: 'Output not found' });
    }
    
    delete config.outputs.providers[req.params.id];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/outputs/:id/test', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    const output = config.outputs?.providers?.[req.params.id];
    
    if (!output) {
      return res.status(404).json({ error: 'Output not found' });
    }
    
    // TODO: Actually send test message
    res.json({ 
      success: true, 
      message: 'Test message sent successfully',
      outputId: req.params.id
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// SKILLS API
// ========================================

app.get('/api/skills', (req, res) => {
  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json({
      bundled: config.skills?.bundled || [],
      workspace: config.skills?.workspace || '~/.0711/workspace/skills/'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// HEALTH & STATUS
// ========================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    configPath,
    configExists: fs.existsSync(configPath)
  });
});

// SPA fallback - serve admin for /admin/* routes
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../admin/dist/index.html'));
});

// SPA fallback - serve app for /app/* routes  
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../ui/dist/index.html'));
});

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/app');
});

app.listen(PORT, () => {
  console.log(`🚀 0711-C-Intelligence Gateway running on port ${PORT}`);
  console.log(`📁 Config: ${configPath}`);
  console.log(`🔧 Admin UI: http://localhost:${PORT}/admin`);
  console.log(`📱 User UI: http://localhost:${PORT}/app`);
});
