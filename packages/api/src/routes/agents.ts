import { Router } from 'express';

const router = Router();

// List agents
router.get('/', (req, res) => {
  // Would fetch from OpenClaw or database
  res.json({ agents: [] });
});

// Execute agent
router.post('/:id/execute', async (req, res) => {
  const { input } = req.body;
  
  // Would forward to OpenClaw Gateway
  res.json({ 
    output: 'Agent execution would happen here',
    agentId: req.params.id,
    input 
  });
});

export default router;
