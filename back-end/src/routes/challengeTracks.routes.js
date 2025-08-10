import { Router } from 'express';
import { supabase, supabaseAdmin } from '../utils/supabase.js';
import { generateTrackIdeas } from '../utils/challegebuilder.js';

const router = Router();
const COOKIE_NAME = 'sb-access-token';
const BUCKET = 'hackops-hackathon';

function getClient() {
  return supabaseAdmin || supabase;
}

async function getAuthUser(req) {
  const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

router.get('/health', (_req, res) => res.json({ service: 'challenge-tracks', status: 'ok' }));

// List user's challenge tracks
router.get('/', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = user.id;

    // Include two cases:
    // 1) Records created by this user (created_by == userId)
    // 2) Older records that may have null created_by but whose storage path contains this user's id
    const query = getClient()
      .from('challenge-tracks')
      .select('id, created_at, info, prompt, created_by')
      .or(`created_by.eq.${userId},info->storage->>path.like.tracks/${userId}/%`)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message || String(error) });

    // Ensure publicUrl is present for items with a storage path
    const items = (data || []).map((row) => {
      try {
        const path = row?.info?.storage?.path;
        const hasUrl = row?.info?.storage?.publicUrl;
        if (path && !hasUrl) {
          const { data: pub } = getClient().storage.from(BUCKET).getPublicUrl(path);
          if (pub?.publicUrl) {
            return { ...row, info: { ...row.info, storage: { ...row.info.storage, publicUrl: pub.publicUrl } } };
          }
        }
      } catch {}
      return row;
    });

    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to fetch challenge tracks' });
  }
});

// Generate and save challenge tracks
// Body: { theme?: string, audience?: string, durationDays?: number, tracksCount?: number, challengesPerTrack?: number }
router.post('/', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = user.id;

    const { theme, audience, durationDays, tracksCount, challengesPerTrack } = req.body || {};

    // Generate ideas via OpenAI
    const ideas = await generateTrackIdeas({ theme, audience, durationDays, tracksCount, challengesPerTrack });
    const meta = { theme, audience, durationDays, tracksCount, challengesPerTrack };

    // Persist JSON to Supabase Storage (public bucket)
    const filePath = `tracks/${userId}/${Date.now()}.json`;
    const jsonString = JSON.stringify({ meta, tracks: ideas.tracks }, null, 2);

    // Try Blob first, then Buffer for Node
    let uploaded = false;
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const { error: upErr } = await getClient().storage.from(BUCKET).upload(filePath, blob, { contentType: 'application/json', upsert: false });
      if (!upErr) uploaded = true; else console.warn('[challenge-tracks] blob upload fallback:', upErr?.message || upErr);
    } catch {}
    if (!uploaded) {
      const buf = Buffer.from(jsonString, 'utf8');
      const { error: upErr2 } = await getClient().storage.from(BUCKET).upload(filePath, buf, { contentType: 'application/json', upsert: false });
      if (upErr2) {
        console.error('[challenge-tracks] upload error', upErr2);
        return res.status(500).json({ error: 'Failed to store challenge tracks in Storage' });
      }
    }

    const { data: pub } = getClient().storage.from(BUCKET).getPublicUrl(filePath);
    const publicUrl = pub?.publicUrl || null;

    // Compose info JSON to store in DB
    const info = {
      tracks: ideas.tracks,
      meta,
      storage: { bucket: BUCKET, path: filePath, publicUrl }
    };

    // Insert DB record
    const { data, error } = await getClient()
      .from('challenge-tracks')
      .insert([{ info, prompt: theme || 'tracks', created_by: userId }])
      .select('id, created_at, info, prompt, created_by')
      .single();
    if (error) return res.status(500).json({ error: error.message || String(error) });
    return res.status(201).json({ item: data });
  } catch (e) {
    console.error('[challenge-tracks] create error', e);
    return res.status(500).json({ error: e?.message || 'Failed to create challenge tracks' });
  }
});

export default router;
