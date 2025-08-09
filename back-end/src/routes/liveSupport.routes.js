import { Router } from 'express';
const router = Router();

router.get('/health', (_req, res) => res.json({ service: 'live-support', status: 'ok' }));
router.post('/tickets', (_req, res) => res.status(201).json({ id: 'tick_123' }));

export default router;
