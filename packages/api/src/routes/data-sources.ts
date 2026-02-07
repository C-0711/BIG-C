import { Router } from 'express';

const router = Router();

// In-memory store (would be database in production)
let dataSources: any[] = [];

// List data sources
router.get('/', (req, res) => {
  res.json({ dataSources });
});

// Get single data source
router.get('/:id', (req, res) => {
  const ds = dataSources.find(d => d.id === req.params.id);
  if (!ds) return res.status(404).json({ error: 'Not found' });
  res.json(ds);
});

// Create data source
router.post('/', (req, res) => {
  const ds = {
    id: `ds_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  dataSources.push(ds);
  res.status(201).json(ds);
});

// Update data source
router.put('/:id', (req, res) => {
  const index = dataSources.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  dataSources[index] = { ...dataSources[index], ...req.body };
  res.json(dataSources[index]);
});

// Delete data source
router.delete('/:id', (req, res) => {
  dataSources = dataSources.filter(d => d.id !== req.params.id);
  res.status(204).send();
});

// Trigger sync
router.post('/:id/sync', async (req, res) => {
  const ds = dataSources.find(d => d.id === req.params.id);
  if (!ds) return res.status(404).json({ error: 'Not found' });
  
  // Would trigger actual sync here
  ds.lastSync = new Date().toISOString();
  ds.status = 'syncing';
  
  res.json({ message: 'Sync started', dataSource: ds });
});

export default router;
