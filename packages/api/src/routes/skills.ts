import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

const SKILLS_PATH = path.join(__dirname, '../../../workflows/skills');

router.get('/', (req, res) => {
  try {
    const indexPath = path.join(SKILLS_PATH, 'index.json');
    if (fs.existsSync(indexPath)) {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      res.json(index);
    } else {
      res.json({ skills: [], categories: [] });
    }
  } catch (e) {
    res.json({ skills: [], categories: [] });
  }
});

router.get('/:id', (req, res) => {
  try {
    const skillPath = path.join(SKILLS_PATH, req.params.id, 'skill.json');
    if (fs.existsSync(skillPath)) {
      const skill = JSON.parse(fs.readFileSync(skillPath, 'utf-8'));
      res.json(skill);
    } else {
      res.status(404).json({ error: 'Skill not found' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to load skill' });
  }
});

router.post('/:id/run', async (req, res) => {
  const { inputs } = req.body;
  
  // Would execute skill via OpenClaw agent
  res.json({
    runId: `skill_run_${Date.now()}`,
    skillId: req.params.id,
    status: 'started',
    inputs
  });
});

export default router;
