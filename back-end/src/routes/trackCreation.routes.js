import { Router } from 'express';
const router = Router();

router.get('/health', (_req, res) => res.json({ service: 'track-creation', status: 'ok' }));
router.post('/tracks', (_req, res) => res.status(201).json({ id: 'trk_123' }));

export default router;
