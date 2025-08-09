import { Router } from 'express';
const router = Router();

router.get('/health', (_req, res) => res.json({ service: 'growth', status: 'ok' }));
router.post('/announcements', (_req, res) => res.status(201).json({ id: 'ann_123' }));

export default router;
