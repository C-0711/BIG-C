import { Router } from 'express';

const router = Router();

let entities: any[] = [];

router.get('/', (req, res) => {
  const { limit = 50, offset = 0, search } = req.query;
  let filtered = entities;
  
  if (search) {
    const s = String(search).toLowerCase();
    filtered = entities.filter(e => 
      JSON.stringify(e).toLowerCase().includes(s)
    );
  }
  
  res.json({
    entities: filtered.slice(Number(offset), Number(offset) + Number(limit)),
    total: filtered.length,
  });
});

router.post('/', (req, res) => {
  const entity = {
    id: `ent_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  entities.push(entity);
  res.status(201).json(entity);
});

router.post('/bulk', (req, res) => {
  const { items } = req.body;
  const created = items.map((item: any) => ({
    id: `ent_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    ...item,
    createdAt: new Date().toISOString(),
  }));
  entities.push(...created);
  res.status(201).json({ created: created.length });
});

export default router;
