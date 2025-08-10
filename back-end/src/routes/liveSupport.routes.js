import { Router } from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const router = Router();

// Google Calendar API setup
const calendar = google.calendar('v3');

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Helper to detect placeholder values left in .env
const isPlaceholder = (v) => !v || /^your[_\-\s]/i.test(String(v).trim());

// Token file path (store at back-end/google_tokens.json)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN_PATH = path.resolve(__dirname, '../../google_tokens.json');

function readTokensFromDisk() {
    try {
        if (fs.existsSync(TOKEN_PATH)) {
            const raw = fs.readFileSync(TOKEN_PATH, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.warn('[Google OAuth] Failed to read token file:', e?.message || e);
    }
    return null;
}

function writeTokensToDisk(tokens) {
    try {
        // Merge with existing file to preserve refresh_token if Google omits it
        const existing = readTokensFromDisk() || {};
        const merged = { ...existing, ...tokens };
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2), 'utf-8');
        return merged;
    } catch (e) {
        console.warn('[Google OAuth] Failed to write token file:', e?.message || e);
        return tokens;
    }
}

// Set credentials if available: prefer token file, then env vars
(() => {
    const fileTokens = readTokensFromDisk();
    if (fileTokens && (fileTokens.refresh_token || fileTokens.access_token)) {
        oauth2Client.setCredentials(fileTokens);
        console.log('[Google OAuth] Loaded tokens from disk');
        return;
    }
    const creds = {};
    if (!isPlaceholder(process.env.GOOGLE_ACCESS_TOKEN)) {
        creds.access_token = process.env.GOOGLE_ACCESS_TOKEN;
    }
    if (!isPlaceholder(process.env.GOOGLE_REFRESH_TOKEN)) {
        creds.refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
    }
    if (Object.keys(creds).length > 0) {
        oauth2Client.setCredentials(creds);
        console.log('[Google OAuth] Loaded tokens from env');
    }
})();

// Helper: ensure OAuth is configured; if not, provide an auth URL
function ensureAuth(req, res, next) {
    // Validate client configuration first
    const missing = [];
    if (isPlaceholder(process.env.GOOGLE_CLIENT_ID)) missing.push('GOOGLE_CLIENT_ID');
    if (isPlaceholder(process.env.GOOGLE_CLIENT_SECRET)) missing.push('GOOGLE_CLIENT_SECRET');
    if (isPlaceholder(process.env.GOOGLE_REDIRECT_URI)) missing.push('GOOGLE_REDIRECT_URI');
    if (missing.length) {
        return res.status(500).json({
            error: 'Google OAuth not configured',
            details: `Missing or placeholder env: ${missing.join(', ')}`
        });
    }

    // If we already have a refresh token or access token set, proceed
    const creds = oauth2Client.credentials || {};
    if (creds.refresh_token || creds.access_token) {
        return next();
    }

    // If env has a refresh token but not set on client yet, set it
    if (!isPlaceholder(process.env.GOOGLE_REFRESH_TOKEN)) {
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        return next();
    }

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
        prompt: 'consent'
    });
    return res.status(401).json({
        error: 'Google Calendar not connected',
        message: 'Connect your Google account to enable meetings',
        authUrl
    });
}

router.get('/health', (_req, res) => res.json({ service: 'live-support', status: 'ok' }));
router.post('/tickets', (_req, res) => res.status(201).json({ id: 'tick_123' }));

// Create a Google Meet event
router.post('/create-meeting', ensureAuth, async (req, res) => {
    try {
        const { title, description, startTime, endTime, attendees = [] } = req.body;

        if (!title || !startTime || !endTime) {
            return res.status(400).json({ 
                error: 'Missing required fields: title, startTime, endTime' 
            });
        }

        const event = {
            summary: title,
            description: description || 'Live support session created via HackOps',
            start: {
                dateTime: new Date(startTime).toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: new Date(endTime).toISOString(),
                timeZone: 'UTC',
            },
            attendees: attendees.map(email => ({ email })),
            conferenceData: {
                createRequest: {
                    requestId: `hackops-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                }
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
        };

    const response = await calendar.events.insert({
            auth: oauth2Client,
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
        });

        const meetLink = response.data.conferenceData?.entryPoints?.find(
            entry => entry.entryPointType === 'video'
        )?.uri;

        res.json({
            success: true,
            eventId: response.data.id,
            meetLink,
            htmlLink: response.data.htmlLink,
            event: {
                title: response.data.summary,
                start: response.data.start.dateTime,
                end: response.data.end.dateTime,
                description: response.data.description,
            }
        });
    } catch (error) {
        console.error('Error creating Google Meet:', error?.response?.data || error?.message || error);
        res.status(500).json({ 
            error: 'Failed to create meeting',
            details: error?.response?.data || error?.message 
        });
    }
});

// Get upcoming meetings
router.get('/meetings', ensureAuth, async (req, res) => {
    try {
        const response = await calendar.events.list({
            auth: oauth2Client,
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
            // Do not filter by summary to ensure all upcoming meetings are shown
        });

        const meetings = response.data.items?.map(event => ({
            id: event.id,
            title: event.summary,
            description: event.description,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            meetLink: event.conferenceData?.entryPoints?.find(
                entry => entry.entryPointType === 'video'
            )?.uri,
            htmlLink: event.htmlLink,
            attendees: event.attendees?.map(a => a.email) || []
        })) || [];

        res.json({ meetings });
    } catch (error) {
        console.error('Error fetching meetings:', error?.response?.data || error?.message || error);
        res.status(500).json({ 
            error: 'Failed to fetch meetings',
            details: error?.response?.data || error?.message 
        });
    }
});

// Delete a meeting
router.delete('/meetings/:eventId', ensureAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        
        await calendar.events.delete({
            auth: oauth2Client,
            calendarId: 'primary',
            eventId,
        });

        res.json({ success: true, message: 'Meeting deleted successfully' });
    } catch (error) {
        console.error('Error deleting meeting:', error?.response?.data || error?.message || error);
        res.status(500).json({ 
            error: 'Failed to delete meeting',
            details: error?.response?.data || error?.message 
        });
    }
});

// OAuth authorization URL
router.get('/auth-url', (_req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
        prompt: 'consent'
    });
    res.json({ authUrl });
});

// Handle OAuth callback
router.post('/auth-callback', async (req, res) => {
    try {
        const { code } = req.body;
        const { tokens } = await oauth2Client.getToken(code);
        const merged = writeTokensToDisk(tokens);
        oauth2Client.setCredentials(merged);
        
        res.json({ 
            success: true, 
            message: 'Google Calendar connected successfully',
            tokens: merged 
        });
    } catch (error) {
        console.error('Error handling auth callback:', error?.response?.data || error?.message || error);
        res.status(500).json({ 
            error: 'Failed to authenticate with Google Calendar',
            details: error?.response?.data || error?.message 
        });
    }
});

// Optional: OAuth redirect handler (GET) to simplify local development
// Set GOOGLE_REDIRECT_URI to http://localhost:5000/live-support/oauth2callback
router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('<h3>Missing code</h3>');
    }
    try {
        const { tokens } = await oauth2Client.getToken(String(code));
        const merged = writeTokensToDisk(tokens);
        oauth2Client.setCredentials(merged);
        const masked = {
            ...merged,
            access_token: merged?.access_token ? `${merged.access_token.slice(0,6)}...${merged.access_token.slice(-4)}` : undefined
        };
        console.log('[Google OAuth] Tokens received (masking access_token):', masked);
        const okHtml = `<!doctype html><html><body style="font-family: system-ui;">
            <h2>Google Calendar connected ✅</h2>
            <p>You can close this tab and return to HackOps.</p>
            <script>window.close();</script>
        </body></html>`;
        return res.status(200).send(okHtml);
    } catch (error) {
        console.error('OAuth callback (GET) error:', error?.response?.data || error?.message || error);
        const errHtml = `<!doctype html><html><body style="font-family: system-ui; color: #b91c1c;">
            <h2>Failed to connect Google Calendar ❌</h2>
            <pre>${(error?.response?.data && JSON.stringify(error.response.data)) || error?.message || 'Unknown error'}</pre>
            <p>Check the backend console for more details.</p>
        </body></html>`;
        return res.status(500).send(errHtml);
    }
});

export default router;
