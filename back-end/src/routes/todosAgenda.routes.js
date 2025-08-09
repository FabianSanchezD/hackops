import { Router } from 'express';
const router = Router();

router.get('/health', (_req, res) => res.json({ service: 'todos-agenda', status: 'ok' }));
router.post('/todos', (_req, res) => res.status(201).json({ id: 'todo_123' }));

export default router;
