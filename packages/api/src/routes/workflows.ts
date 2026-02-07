import { Router } from 'express';

const router = Router();

let workflows: any[] = [];

router.get('/', (req, res) => {
  res.json({ workflows });
});

router.post('/', (req, res) => {
  const wf = {
    id: `wf_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  workflows.push(wf);
  res.status(201).json(wf);
});

router.post('/:id/run', async (req, res) => {
  const wf = workflows.find(w => w.id === req.params.id);
  if (!wf) return res.status(404).json({ error: 'Not found' });
  
  res.json({ 
    runId: `run_${Date.now()}`,
    workflowId: wf.id,
    status: 'started'
  });
});

export default router;
