import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import outreachRoutes from './routes/outreach.routes.js';
import teamManagementRoutes from './routes/teamManagement.routes.js';
import growthRoutes from './routes/growth.routes.js';
import trackCreationRoutes from './routes/trackCreation.routes.js';
import liveSupportRoutes from './routes/liveSupport.routes.js';
import partnershipsRoutes from './routes/partnerships.routes.js';
import growthImagesRoutes from './routes/growthImages.routes.js';
import challengeTracksRoutes from './routes/challengeTracks.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import todosAgendaRoutes from './routes/todosAgenda.routes.js';
import swaggerUi from 'swagger-ui-express';
import openapiSpec from './openapi.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the main project directory (two levels up from src)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
// Render is behind a proxy; this is required for secure cookies with SameSite=None
app.set('trust proxy', 1);

// Middleware
const corsOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3001',
    'https://hackops-nu.vercel.app',
];

const vercelPreview = /^https:\/\/hackops-nu-[a-z0-9-]+\.vercel\.app$/i;
const isAllowedOrigin = (origin) => {
    if (!origin) return true; // allow non-browser tools
    if (corsOrigins.includes(origin)) return true;
    if (vercelPreview.test(origin)) return true;
    return false;
};

app.use((req, res, next) => { res.header('Vary', 'Origin'); next(); });
// Lightweight preflight without wildcard routes (Express 5 friendly)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (isAllowedOrigin(origin)) {
        if (origin) res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Prefer, Range, apikey, x-client-info, x-requested-with');
    }
    if (req.method === 'OPTIONS') {
        return isAllowedOrigin(origin) ? res.sendStatus(204) : res.sendStatus(403);
    }
    next();
});

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error(`CORS: Origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Prefer', 'Range', 'apikey', 'x-client-info', 'x-requested-with'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve generated media files (images) as static assets
app.use('/media', express.static(path.join(__dirname, 'media')));

// Routes
app.use('/outreach', outreachRoutes);
app.use('/team-management', teamManagementRoutes);
app.use('/growth', growthRoutes);
app.use('/auth', authRoutes);
app.use('/track-creation', trackCreationRoutes);
app.use('/live-support', liveSupportRoutes);
app.use('/partnerships', partnershipsRoutes);
app.use('/growth-images', growthImagesRoutes);
app.use('/challenge-tracks', challengeTracksRoutes);
app.use('/tracking', trackingRoutes);
app.use('/todos-agenda', todosAgendaRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});