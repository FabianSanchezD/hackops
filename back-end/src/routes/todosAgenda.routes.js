import { Router } from 'express';
import { supabase, supabaseAdmin } from '../utils/supabase.js';

const router = Router();
const COOKIE_NAME = 'sb-access-token';
const TABLE = 'tasks';

function getClient() {
  return supabaseAdmin || supabase;
}
router.get('/health', (_req, res) => res.json({ service: 'todos-agenda', status: 'ok' }));

// Helper: authenticate user from cookie or bearer header
async function getUserIdFromRequest(req) {
  try {
    const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return null;
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

// Seed defaults for a user if they have no todos yet
async function seedDefaultsForUser(userId) {
  const base = Date.now();
  const defaults = [
    { id: base + 1, title: 'Start using HackOps', status: 'doing' },
    { id: base + 2, title: 'Do your first social media post', status: 'doing' },
    { id: base + 3, title: 'Share the meeting link', status: 'doing' },
    { id: base + 4, title: 'Find the Jury', status: 'doing' },
  ];
  const rows = defaults.map(d => ({ ...d, created_by: userId }));
  const { error } = await getClient().from(TABLE).insert(rows).select('id');
  if (error) throw error;
}

// GET /todos-agenda -> list todos for current user; if none, seed defaults
router.get('/', async (req, res) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await getClient()
      .from(TABLE)
  .select('id, created_at, created_by, title, status')
      .eq('created_by', userId)
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message || String(error) });

    if (!data || data.length === 0) {
      try {
        await seedDefaultsForUser(userId);
        const { data: seeded } = await getClient()
          .from(TABLE)
          .select('id, created_at, created_by, title, status')
          .eq('created_by', userId)
          .order('created_at', { ascending: true });
        const normalizedSeeded = (seeded || []).map(t => ({
          ...t,
          status: t.status === 'todo' ? 'doing' : t.status,
        }));
        return res.json({ todos: normalizedSeeded });
      } catch (e) {
        // If seeding fails (e.g., table missing), just return an in-memory default list
        const fallback = [
          { id: 'tmp1', created_at: null, created_by: userId, title: 'Start using HackOps', status: 'doing' },
          { id: 'tmp2', created_at: null, created_by: userId, title: 'Do your first social media post', status: 'doing' },
          { id: 'tmp3', created_at: null, created_by: userId, title: 'Share the meeting link', status: 'doing' },
          { id: 'tmp4', created_at: null, created_by: userId, title: 'Find the Jury', status: 'doing' },
        ];
        return res.json({ todos: fallback, warning: 'Seeding failed; table may be missing' });
      }
    }

    const normalized = (data || []).map(t => ({
      ...t,
      status: t.status === 'todo' ? 'doing' : t.status,
    }));
    return res.json({ todos: normalized });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to fetch todos' });
  }
});

// POST /todos-agenda -> upsert one or many todos
// Body: { todo: {id?, title, status, agent_id?|agent_key?} } OR { todos: [ ... ] }
router.post('/', async (req, res) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const body = req.body || {};
    let items = [];
    if (Array.isArray(body.todos)) items = body.todos;
    else if (body.todo && typeof body.todo === 'object') items = [body.todo];
    else return res.status(400).json({ error: 'Missing todo(s) in request body' });

    const baseTs = Date.now();
    const sanitized = items.map((it, idx) => {
      const rawStatus = it.status || 'doing';
      const normalizedStatus = rawStatus === 'todo' ? 'doing' : rawStatus;
      const id = (it.id === 0 || it.id) ? Number(it.id) : (baseTs + idx);
      return {
        id,
        title: String(it.title || '').trim(),
        status: ['doing', 'done'].includes(normalizedStatus) ? normalizedStatus : 'doing',
        created_by: userId,
      };
    });
    if (sanitized.some(r => !r.title)) return res.status(400).json({ error: 'Title is required' });

    // Upsert on id (ideally with a unique constraint). If not present, treat as insert.
    const { data, error } = await getClient()
      .from(TABLE)
      .upsert(sanitized, { onConflict: 'id' })
      .select('id, created_at, created_by, title, status');
    if (error) return res.status(500).json({ error: error.message || String(error) });
    return res.status(201).json({ todos: data });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to save todos' });
  }
});

export default router;
