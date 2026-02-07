import { Router } from 'express';
import configService from '../services/ConfigService';

const router = Router();

// ─── GET FULL CONFIG ───────────────────────────────────────────────────────
// GET /api/config
// Returns the full configuration (for frontend initialization)
router.get('/', (req, res) => {
  try {
    const config = configService.getConfig();
    res.json(config);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── GET SCHEMA ────────────────────────────────────────────────────────────
// GET /api/config/schema
// Returns JSON Schema for validation and form generation
router.get('/schema', (req, res) => {
  const schema = configService.getSchema();
  res.json(schema || {});
});

// ─── PATCH CONFIG (OpenClaw-style partial update) ──────────────────────────
// PATCH /api/config
// Partially update config and trigger hot reload
router.patch('/', (req, res) => {
  try {
    const config = configService.patchConfig(req.body);
    res.json({ success: true, config });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ─── PUT FULL CONFIG ───────────────────────────────────────────────────────
// PUT /api/config
// Replace entire config (for Raw JSON editor)
router.put('/', (req, res) => {
  try {
    configService.saveConfig(req.body);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ─── RELOAD CONFIG ─────────────────────────────────────────────────────────
// POST /api/config/reload
// Force reload from disk
router.post('/reload', (req, res) => {
  try {
    const config = configService.loadConfig();
    res.json({ success: true, config });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE ENDPOINTS (for UI sections)
// ═══════════════════════════════════════════════════════════════════════════

// ─── INSTANCE ──────────────────────────────────────────────────────────────
router.get('/instance', (req, res) => {
  res.json(configService.getConfig().instance);
});

router.patch('/instance', (req, res) => {
  const config = configService.patchConfig({ instance: req.body });
  res.json(config.instance);
});

// ─── DATA SOURCES ──────────────────────────────────────────────────────────
router.get('/data-sources', (req, res) => {
  const config = configService.getConfig();
  res.json({
    providers: config.dataSources.providers,
    enabled: configService.getEnabledDataSources(),
  });
});

router.post('/data-sources/:id', (req, res) => {
  const config = configService.getConfig();
  config.dataSources.providers[req.params.id] = req.body;
  configService.saveConfig(config);
  res.status(201).json(config.dataSources.providers[req.params.id]);
});

router.patch('/data-sources/:id', (req, res) => {
  const config = configService.getConfig();
  if (!config.dataSources.providers[req.params.id]) {
    return res.status(404).json({ error: 'Data source not found' });
  }
  config.dataSources.providers[req.params.id] = {
    ...config.dataSources.providers[req.params.id],
    ...req.body,
  };
  configService.saveConfig(config);
  res.json(config.dataSources.providers[req.params.id]);
});

router.delete('/data-sources/:id', (req, res) => {
  const config = configService.getConfig();
  delete config.dataSources.providers[req.params.id];
  configService.saveConfig(config);
  res.status(204).send();
});

// ─── OUTPUTS ───────────────────────────────────────────────────────────────
router.get('/outputs', (req, res) => {
  const config = configService.getConfig();
  res.json({
    providers: config.outputs.providers,
    enabled: configService.getEnabledOutputs(),
  });
});

router.post('/outputs/:id', (req, res) => {
  const config = configService.getConfig();
  config.outputs.providers[req.params.id] = req.body;
  configService.saveConfig(config);
  res.status(201).json(config.outputs.providers[req.params.id]);
});

router.patch('/outputs/:id', (req, res) => {
  const config = configService.getConfig();
  if (!config.outputs.providers[req.params.id]) {
    return res.status(404).json({ error: 'Output not found' });
  }
  config.outputs.providers[req.params.id] = {
    ...config.outputs.providers[req.params.id],
    ...req.body,
  };
  configService.saveConfig(config);
  res.json(config.outputs.providers[req.params.id]);
});

router.delete('/outputs/:id', (req, res) => {
  const config = configService.getConfig();
  delete config.outputs.providers[req.params.id];
  configService.saveConfig(config);
  res.status(204).send();
});

// ─── AGENTS ────────────────────────────────────────────────────────────────
router.get('/agents', (req, res) => {
  const config = configService.getConfig();
  res.json({
    defaults: config.agents.defaults,
    list: config.agents.list,
    enabled: configService.getEnabledAgents(),
  });
});

router.post('/agents', (req, res) => {
  const config = configService.getConfig();
  const newAgent = {
    ...req.body,
    id: req.body.id || `agent_${Date.now()}`,
    enabled: req.body.enabled ?? true,
  };
  config.agents.list.push(newAgent);
  configService.saveConfig(config);
  res.status(201).json(newAgent);
});

router.patch('/agents/:id', (req, res) => {
  const config = configService.getConfig();
  const index = config.agents.list.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  config.agents.list[index] = { ...config.agents.list[index], ...req.body };
  configService.saveConfig(config);
  res.json(config.agents.list[index]);
});

router.delete('/agents/:id', (req, res) => {
  const config = configService.getConfig();
  config.agents.list = config.agents.list.filter(a => a.id !== req.params.id);
  configService.saveConfig(config);
  res.status(204).send();
});

// ─── WORKFLOWS ─────────────────────────────────────────────────────────────
router.get('/workflows', (req, res) => {
  const config = configService.getConfig();
  res.json({
    list: config.workflows.list,
    enabled: configService.getEnabledWorkflows(),
  });
});

router.post('/workflows', (req, res) => {
  const config = configService.getConfig();
  const newWorkflow = {
    ...req.body,
    id: req.body.id || `workflow_${Date.now()}`,
    enabled: req.body.enabled ?? true,
  };
  config.workflows.list.push(newWorkflow);
  configService.saveConfig(config);
  res.status(201).json(newWorkflow);
});

router.patch('/workflows/:id', (req, res) => {
  const config = configService.getConfig();
  const index = config.workflows.list.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  config.workflows.list[index] = { ...config.workflows.list[index], ...req.body };
  configService.saveConfig(config);
  res.json(config.workflows.list[index]);
});

router.delete('/workflows/:id', (req, res) => {
  const config = configService.getConfig();
  config.workflows.list = config.workflows.list.filter(w => w.id !== req.params.id);
  configService.saveConfig(config);
  res.status(204).send();
});

// ─── SKILLS ────────────────────────────────────────────────────────────────
router.get('/skills', (req, res) => {
  const config = configService.getConfig();
  res.json(config.skills);
});

// ─── UI ────────────────────────────────────────────────────────────────────
router.get('/ui', (req, res) => {
  res.json(configService.getConfig().ui);
});

router.patch('/ui', (req, res) => {
  const config = configService.patchConfig({ ui: req.body });
  res.json(config.ui);
});

// ─── AUTH ──────────────────────────────────────────────────────────────────
router.get('/auth', (req, res) => {
  res.json(configService.getConfig().auth);
});

router.patch('/auth', (req, res) => {
  const config = configService.patchConfig({ auth: req.body });
  res.json(config.auth);
});

export default router;
