import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { getTeamMembersByCreator, getByCreator, createEntry } from '../utils/teammanagement.js';
import { sendEmail } from '../utils/email.js';
import { openai } from '../utils/openaiClient.js';

const router = Router();

const COOKIE_NAME = 'sb-access-token';

router.get('/health', (_req, res) => res.json({ service: 'team-management', status: 'ok' }));
// Basic email config health
router.get('/email/health', (_req, res) => {
	const hasKey = Boolean(process.env.SENDGRID_API_KEY);
	const hasFrom = Boolean(process.env.SENDGRID_FROM_EMAIL);
	return res.json({ sendgrid: { apiKey: hasKey, fromConfigured: hasFrom } });
});

// Return team members for the currently authenticated user
router.get('/my-team', async (req, res) => {
	try {
		const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Unauthorized' });

		const { data: userData, error: userErr } = await supabase.auth.getUser(token);
		if (userErr || !userData?.user) return res.status(401).json({ error: 'Unauthorized' });

		const userId = userData.user.id;

				const { data, error } = await getTeamMembersByCreator(userId, token);
				if (error) {
					// Always log server-side for diagnostics
					console.error('[team-management] /my-team error:', error);
					const msg = typeof error === 'object' ? (error.message || JSON.stringify(error)) : String(error);
					return res.status(500).json({ error: msg || 'Failed to fetch team members' });
				}
			return res.json({ team: data });
	} catch (e) {
		return res.status(500).json({ error: 'Failed to fetch team members' });
	}
});

// Create a team member
router.post('/team-members', async (req, res) => {
	try {
		const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Unauthorized' });
		const { data: userData, error: userErr } = await supabase.auth.getUser(token);
		if (userErr || !userData?.user) return res.status(401).json({ error: 'Unauthorized' });
		const userId = userData.user.id;

		const { name, email, phone_number } = req.body || {};
		if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
		const { data, error } = await createEntry('team_members', { name, email, phone_number }, userId);
		if (error) return res.status(500).json({ error: error.message || String(error) });
		return res.status(201).json({ entry: data });
	} catch (e) {
		console.error('[team-management] /team-members POST error:', e);
		return res.status(500).json({ error: e?.message || 'Failed to create team member' });
	}
});

// Generic helper to extract logged-in user
async function getAuthUser(req) {
	const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
	if (!token) return { error: 'Unauthorized' };
	const { data: userData, error: userErr } = await supabase.auth.getUser(token);
	if (userErr || !userData?.user) return { error: 'Unauthorized' };
	return { user: userData.user };
}

// Jury endpoints
router.get('/jury', async (req, res) => {
	const { user, error } = await getAuthUser(req);
	if (error) return res.status(401).json({ error });
	const { data, error: err } = await getByCreator('jury', user.id);
	if (err) return res.status(500).json({ error: err.message || 'Failed to fetch jury' });
	return res.json({ jury: data });
});

router.post('/jury', async (req, res) => {
	const { user, error } = await getAuthUser(req);
	if (error) return res.status(401).json({ error });
	const { name, email, phone_number } = req.body || {};
	if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
	const { data, error: err } = await createEntry('jury', { name, email, phone_number }, user.id);
	if (err) return res.status(500).json({ error: err.message || String(err) });
	return res.status(201).json({ entry: data });
});

// Speakers endpoints
router.get('/speakers', async (req, res) => {
	const { user, error } = await getAuthUser(req);
	if (error) return res.status(401).json({ error });
	const { data, error: err } = await getByCreator('speakers', user.id);
	if (err) return res.status(500).json({ error: err.message || 'Failed to fetch speakers' });
	return res.json({ speakers: data });
});

router.post('/speakers', async (req, res) => {
	const { user, error } = await getAuthUser(req);
	if (error) return res.status(401).json({ error });
	const { name, email, phone_number } = req.body || {};
	if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
	const { data, error: err } = await createEntry('speakers', { name, email, phone_number }, user.id);
	if (err) return res.status(500).json({ error: err.message || String(err) });
	return res.status(201).json({ entry: data });
});

export default router;

// Send an email to a recipient. Body: { to, subject, text, html }
router.post('/send-email', async (req, res) => {
	try {
		const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Unauthorized' });

		// Use the logged-in user's email as the sender
		const { data: userData, error: userErr } = await supabase.auth.getUser(token);
		if (userErr || !userData?.user) return res.status(401).json({ error: 'Unauthorized' });
		const from = userData.user.email;
		if (!from) return res.status(400).json({ error: 'Your account has no email address to send from.' });

		const { to, subject, text, html } = req.body || {};
		if (!to || !subject || (!text && !html)) {
			return res.status(400).json({ error: 'Missing to, subject, and text or html.' });
		}

		const result = await sendEmail({ to, subject, text, html, from });
		return res.json({ ok: true, status: result.status });
	} catch (e) {
		const status = e?.status || 500;
		const body = { error: e?.message || 'Failed to send email' };
		if (e?.details) body.details = e.details;
		if (status === 403) body.hint = 'Verify the sender domain/address in SendGrid, ensure the API key has Mail Send scope, and use a verified from email.';
		console.error('[team-management] /send-email error:', { status, message: e?.message, details: e?.details });
		return res.status(status).json(body);
	}
});

// Mass email sender: Body { to: string[], subject: string, text?: string, html?: string }
router.post('/send-bulk', async (req, res) => {
	try {
		const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Unauthorized' });

		const { data: userData, error: userErr } = await supabase.auth.getUser(token);
		if (userErr || !userData?.user) return res.status(401).json({ error: 'Unauthorized' });
		const from = userData.user.email;
		if (!from) return res.status(400).json({ error: 'Your account has no email address to send from.' });

		const { to, subject, text, html } = req.body || {};
		if (!Array.isArray(to) || to.length === 0) {
			return res.status(400).json({ error: 'Provide an array of recipient emails in `to`.' });
		}
		if (!subject || (!text && !html)) {
			return res.status(400).json({ error: 'Missing subject and text or html.' });
		}

		// Deduplicate and basic sanitize
		const recipients = Array.from(new Set(to.filter(Boolean).map(String)));
		const MAX_RECIPIENTS = 200; // safety cap
		if (recipients.length > MAX_RECIPIENTS) {
			return res.status(400).json({ error: `Too many recipients (max ${MAX_RECIPIENTS}).` });
		}

		// Concurrency control
		const CONCURRENCY = 5;
		let index = 0;
		const successes = [];
		const failures = [];

		async function worker() {
			while (index < recipients.length) {
				const i = index++;
				const rcpt = recipients[i];
				try {
					const result = await sendEmail({ to: rcpt, subject, text, html, from });
					successes.push({ to: rcpt, status: result.status });
				} catch (err) {
					const status = err?.status || 500;
					failures.push({ to: rcpt, status, error: err?.message, details: err?.details });
				}
			}
		}

		const workers = Array.from({ length: Math.min(CONCURRENCY, recipients.length) }, () => worker());
		await Promise.all(workers);

		const summary = { ok: failures.length === 0, sent: successes.length, failed: failures.length, successes, failures };
		const status = failures.length ? (failures.some(f => f.status === 403) ? 207 : 207) : 200; // 207 Multi-Status for partials
		return res.status(status).json(summary);
	} catch (e) {
		const status = e?.status || 500;
		const body = { error: e?.message || 'Bulk send failed' };
		if (e?.details) body.details = e.details;
		console.error('[team-management] /send-bulk error:', { status, message: e?.message, details: e?.details });
		return res.status(status).json(body);
	}
});

// Generate an email subject from a short prompt using OpenAI
router.post('/ai-subject', async (req, res) => {
	try {
		const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Unauthorized' });

		const { prompt } = req.body || {};
		if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

		if (!openai?.apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });

		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			temperature: 0.7,
			messages: [
				{ role: 'system', content: 'You create concise, compelling email subject lines. Return only the subject line as plain text, under 12 words.' },
				{ role: 'user', content: `Write an email subject for: ${prompt}` },
			],
		});
		const subject = completion?.choices?.[0]?.message?.content?.trim();
		if (!subject) return res.status(500).json({ error: 'Failed to generate subject' });
		return res.json({ subject });
	} catch (e) {
		console.error('[team-management] /ai-subject error:', e);
		return res.status(500).json({ error: e?.message || 'Failed to generate subject' });
	}
});

// Generate an email subject and body from a short prompt using OpenAI
router.post('/ai-email', async (req, res) => {
	try {
		const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Unauthorized' });

		const { prompt } = req.body || {};
		if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

		if (!openai?.apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });

		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			temperature: 0.7,
			messages: [
				{ role: 'system', content: 'You craft concise, friendly email subjects and bodies. Output a short JSON object with keys subject and text. Subject under 12 words; body 80-160 words, plain text. Do NOT use names (recipient or sender).' },
				{ role: 'user', content: `Create an email subject and body for: ${prompt}` },
			],
			response_format: { type: 'json_object' },
		});

		const content = completion?.choices?.[0]?.message?.content?.trim();
		let subject = '';
		let text = '';
		try {
			const obj = JSON.parse(content || '{}');
			subject = String(obj.subject || '').trim();
			text = String(obj.text || '').trim();
		} catch {
			// Fallback: try to split the text
			const lines = (content || '').split('\n');
			subject = (lines[0] || '').trim();
			text = lines.slice(1).join('\n').trim();
		}
		if (!subject || !text) return res.status(500).json({ error: 'Failed to generate email' });
		return res.json({ subject, text });
	} catch (e) {
		console.error('[team-management] /ai-email error:', e);
		return res.status(500).json({ error: e?.message || 'Failed to generate email' });
	}
});
