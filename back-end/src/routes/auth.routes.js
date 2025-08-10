import express from 'express';
import { supabase } from '../utils/supabase.js';

const router = express.Router();

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_NAME = 'sb-access-token';

function setAuthCookies(res, session) {
  const access = session?.access_token;
  const refresh = session?.refresh_token;
  if (access) {
    res.cookie(COOKIE_NAME, access, {
      httpOnly: true,
      secure: true, // required for SameSite=None on modern browsers
      sameSite: 'none', // allow cross-site requests from Vercel to Render
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      domain: undefined,
    });
  }
  if (refresh) {
    res.cookie('sb-refresh-token', refresh, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      domain: undefined,
    });
  }
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Invalid credentials.' });
    setAuthCookies(res, data.session);
    return res.json({ user: data.user ? { id: data.user.id, email: data.user.email } : null });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to login.' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message || 'Failed to sign up.' });
    // Some Supabase projects require email confirmation; session may be null until confirmed
    if (data.session) setAuthCookies(res, data.session);
    return res.json({ user: data.user ? { id: data.user.id, email: data.user.email } : null, needsVerification: !data.session });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to sign up.' });
  }
});

router.post('/logout', async (_req, res) => {
  const baseOpts = { path: '/', sameSite: 'none', secure: true };
  res.clearCookie(COOKIE_NAME, baseOpts);
  res.clearCookie('sb-refresh-token', baseOpts);
  return res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({ user: { id: data.user.id, email: data.user.email } });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

export default router;
