import { Router } from 'express';
const router = Router();

router.get('/health', (_req, res) => res.json({ service: 'team-management', status: 'ok' }));
router.post('/teams', (_req, res) => res.status(201).json({ id: 'team_123' }));

export default router;
