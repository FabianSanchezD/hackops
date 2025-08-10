import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { getTeamMembersByCreator } from '../utils/teammanagement.js';

const router = Router();

const COOKIE_NAME = 'sb-access-token';

router.get('/health', (_req, res) => res.json({ service: 'team-management', status: 'ok' }));

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

export default router;
