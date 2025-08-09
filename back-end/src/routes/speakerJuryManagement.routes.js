import { Router } from 'express';
const router = Router();

router.get('/health', (_req, res) => res.json({ service: 'speaker-jury-management', status: 'ok' }));
router.post('/speakers', (_req, res) => res.status(201).json({ id: 'spk_123' }));
router.post('/jury', (_req, res) => res.status(201).json({ id: 'jury_123' }));

export default router;
