import { Router } from 'express';
const router = Router();

router.get('/health', (_req, res) => res.json({ service: 'tracking', status: 'ok' }));
router.post('/metrics', (_req, res) => res.status(201).json({ id: 'met_123' }));

export default router;
