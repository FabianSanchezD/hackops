import { Router } from 'express';
import { generateTrackIdeas, refineIdeas } from '../utils/challegebuilder.js';
const router = Router();

router.get('/health', (_req, res) => res.json({ service: 'track-creation', status: 'ok' }));

// POST /track-creation/ai-ideas
// Body: { theme?: string, audience?: string, durationDays?: number, tracksCount?: number, challengesPerTrack?: number }
router.post('/ai-ideas', async (req, res) => {
	try {
		const { theme, audience, durationDays, tracksCount, challengesPerTrack } = req.body || {};
		const ideas = await generateTrackIdeas({ theme, audience, durationDays, tracksCount, challengesPerTrack });
		return res.status(200).json({ success: true, ideas, meta: { theme, audience, durationDays, tracksCount, challengesPerTrack } });
	} catch (error) {
		console.error('[AI Ideas] Error:', error?.response?.data || error?.message || error);
		return res.status(500).json({ error: 'Failed to generate ideas' });
	}
});

// POST /track-creation/ai-ideas/refine
// Body: { ideas: { tracks: [...] }, instruction?: string }
router.post('/ai-ideas/refine', async (req, res) => {
	try {
		const { ideas, instruction } = req.body || {};
		if (!ideas) return res.status(400).json({ error: 'ideas is required' });
		const refined = await refineIdeas({ ideas, instruction });
		return res.status(200).json({ success: true, ideas: refined });
	} catch (error) {
		console.error('[AI Ideas Refine] Error:', error?.response?.data || error?.message || error);
		return res.status(500).json({ error: 'Failed to refine ideas' });
	}
});


export default router;
