import { Router } from 'express';
import configService from '../services/ConfigService';

const router = Router();

// Get full config (for frontend)
router.get('/', (req, res) => {
  const config = configService.loadConfig();
  res.json(config);
});

// Get schema
router.get('/schema', (req, res) => {
  const schema = configService.getSchema();
  res.json(schema);
});

// Update instance settings
router.patch('/instance', (req, res) => {
  const config = configService.updateSection('instance', req.body);
  res.json(config);
});

// Update modules
router.patch('/modules', (req, res) => {
  const config = configService.updateSection('modules', req.body);
  res.json(config);
});

// ─────────────────────────────────────────
// DATA SOURCES
// ─────────────────────────────────────────
router.get('/data-sources', (req, res) => {
  const config = configService.loadConfig();
  res.json(config.dataSources);
});

router.post('/data-sources', (req, res) => {
  const config = configService.addItem('dataSources', {
    ...req.body,
    id: req.body.id || `ds_${Date.now()}`,
    enabled: req.body.enabled ?? true,
  });
  res.status(201).json(config.dataSources);
});

router.patch('/data-sources/:id', (req, res) => {
  const config = configService.updateItem('dataSources', req.params.id, req.body);
  res.json(config.dataSources);
});

router.delete('/data-sources/:id', (req, res) => {
  const config = configService.deleteItem('dataSources', req.params.id);
  res.json(config.dataSources);
});

// ─────────────────────────────────────────
// OUTPUTS
// ─────────────────────────────────────────
router.get('/outputs', (req, res) => {
  const config = configService.loadConfig();
  res.json(config.outputs);
});

router.post('/outputs', (req, res) => {
  const config = configService.addItem('outputs', {
    ...req.body,
    id: req.body.id || `out_${Date.now()}`,
    enabled: req.body.enabled ?? true,
  });
  res.status(201).json(config.outputs);
});

router.patch('/outputs/:id', (req, res) => {
  const config = configService.updateItem('outputs', req.params.id, req.body);
  res.json(config.outputs);
});

router.delete('/outputs/:id', (req, res) => {
  const config = configService.deleteItem('outputs', req.params.id);
  res.json(config.outputs);
});

// ─────────────────────────────────────────
// AGENTS
// ─────────────────────────────────────────
router.get('/agents', (req, res) => {
  const config = configService.loadConfig();
  res.json(config.agents);
});

router.post('/agents', (req, res) => {
  const config = configService.addItem('agents', {
    ...req.body,
    id: req.body.id || `agent_${Date.now()}`,
    enabled: req.body.enabled ?? true,
    skills: req.body.skills || [],
    dataSources: req.body.dataSources || [],
    outputs: req.body.outputs || [],
  });
  res.status(201).json(config.agents);
});

router.patch('/agents/:id', (req, res) => {
  const config = configService.updateItem('agents', req.params.id, req.body);
  res.json(config.agents);
});

router.delete('/agents/:id', (req, res) => {
  const config = configService.deleteItem('agents', req.params.id);
  res.json(config.agents);
});

// ─────────────────────────────────────────
// WORKFLOWS
// ─────────────────────────────────────────
router.get('/workflows', (req, res) => {
  const config = configService.loadConfig();
  res.json(config.workflows);
});

router.post('/workflows', (req, res) => {
  const config = configService.addItem('workflows', {
    ...req.body,
    id: req.body.id || `wf_${Date.now()}`,
    enabled: req.body.enabled ?? true,
  });
  res.status(201).json(config.workflows);
});

router.patch('/workflows/:id', (req, res) => {
  const config = configService.updateItem('workflows', req.params.id, req.body);
  res.json(config.workflows);
});

router.delete('/workflows/:id', (req, res) => {
  const config = configService.deleteItem('workflows', req.params.id);
  res.json(config.workflows);
});

// Save full config (for YAML editor)
router.put('/', (req, res) => {
  try {
    configService.saveConfig(req.body);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
