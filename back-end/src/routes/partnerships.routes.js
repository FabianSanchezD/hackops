import { Router } from 'express';
const router = Router();

router.get('/health', (_req, res) => res.json({ service: 'partnerships', status: 'ok' }));
router.post('/sponsors', (_req, res) => res.status(201).json({ id: 'spn_123' }));

export default router;
