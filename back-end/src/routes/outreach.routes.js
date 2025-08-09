import { Router } from 'express';

const router = Router();

// GET /outreach/health
router.get('/health', (req, res) => {
  res.json({ service: 'outreach', status: 'ok' });
});

// POST /outreach/campaigns
router.post('/campaigns', (req, res) => {
  // TODO: create outreach campaign
  res.status(201).json({ id: 'cmp_123', message: 'Campaign created' });
});

export default router;
