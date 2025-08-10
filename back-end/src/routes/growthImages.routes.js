import { Router } from 'express';
import { supabase, supabaseAdmin } from '../utils/supabase.js';
import { createPost, createDescription } from '../utils/postcreation.js';

const router = Router();
const COOKIE_NAME = 'sb-access-token';

function getClient() {
  return supabaseAdmin || supabase;
}

router.get('/health', (_req, res) => res.json({ service: 'growth-images', status: 'ok' }));

// List growth images for the current user
router.get('/', async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = userData.user.id;

    const { data, error } = await getClient()
      .from('growth-images')
      .select('id, created_at, link, description, prompt, created_by')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message || String(error) });

    const bucket = 'hackops-hackathon';
    const images = (data || []).map((row) => {
      const val = row.link || '';
      if (!val) return row;
      // If stored as raw storage path, return public URL directly (bucket is public)
      if (!val.startsWith('http') && (val.startsWith('posts/') || val.startsWith('public/'))) {
        const { data: pub } = getClient().storage.from(bucket).getPublicUrl(val);
        if (pub?.publicUrl) return { ...row, link: pub.publicUrl };
      }
      // Already a URL, return as-is
      return row;
    });

    return res.json({ images });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to fetch images' });
  }
});

// Create and store a growth image
// Body: { prompt: string, enhance?: boolean, withDescription?: boolean }
router.post('/', async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = userData.user.id;

    const { prompt, enhance = true, withDescription = false } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    // Generate image via OpenAI
    const { imageUrl, imageB64, originalPrompt, enhancedPrompt } = await createPost(prompt);
    const finalPrompt = enhance ? enhancedPrompt : originalPrompt;

    // Always upload to Supabase Storage
  const bucket = 'hackops-hackathon';
  let storagePath = null;
    try {
      const filePath = `posts/${userId}/${Date.now()}.png`;
      let buf;
      if (imageB64) {
        buf = Buffer.from(imageB64, 'base64');
      } else if (imageUrl) {
        const resp = await fetch(imageUrl);
        buf = Buffer.from(await resp.arrayBuffer());
      } else {
        throw new Error('No image data to upload');
      }
      const { error: upErr } = await getClient().storage.from(bucket).upload(filePath, buf, { contentType: 'image/png', upsert: false });
      if (upErr) {
        console.error('[growth-images] upload error', upErr);
        throw upErr;
      }
      storagePath = filePath;
  // No need to sign if bucket is public
    } catch (e) {
      console.error('[growth-images] failed to upload to storage bucket', e);
      return res.status(500).json({ error: 'Failed to store image in Supabase Storage' });
    }

    // Optionally generate description
    let description = null;
    if (withDescription) {
      try {
        description = await createDescription(finalPrompt);
      } catch {}
    }

    // Insert DB record
    const { data, error } = await getClient()
      .from('growth-images')
      .insert([{
  link: storagePath || '',
        description,
        prompt: finalPrompt,
        created_by: userId,
      }])
      .select('id, created_at, link, description, prompt, created_by')
      .single();
    if (error) return res.status(500).json({ error: error.message || String(error) });
    // For response, return a usable URL in link instead of the raw storage path
    const responseImage = { ...data };
    if (storagePath) {
  const { data: pub } = getClient().storage.from(bucket).getPublicUrl(storagePath);
  responseImage.link = pub?.publicUrl || responseImage.link;
    }
    return res.status(201).json({ image: responseImage });
  } catch (e) {
    console.error('[growth-images] create error', e);
    return res.status(500).json({ error: e?.message || 'Failed to create growth image' });
  }
});

export default router;
