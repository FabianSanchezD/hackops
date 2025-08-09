import express from 'express';
import outreachRoutes from './routes/outreach.routes.js';
import teamManagementRoutes from './routes/teamManagement.routes.js';
import speakerJuryManagementRoutes from './routes/speakerJuryManagement.routes.js';
import growthRoutes from './routes/growth.routes.js';
import trackCreationRoutes from './routes/trackCreation.routes.js';
import liveSupportRoutes from './routes/liveSupport.routes.js';
import partnershipsRoutes from './routes/partnerships.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import todosAgendaRoutes from './routes/todosAgenda.routes.js';
import swaggerUi from 'swagger-ui-express';
import openapiSpec from './openapi.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/outreach', outreachRoutes);
app.use('/team-management', teamManagementRoutes);
app.use('/speaker-jury-management', speakerJuryManagementRoutes);
app.use('/growth', growthRoutes);
app.use('/track-creation', trackCreationRoutes);
app.use('/live-support', liveSupportRoutes);
app.use('/partnerships', partnershipsRoutes);
app.use('/tracking', trackingRoutes);
app.use('/todos-agenda', todosAgendaRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});