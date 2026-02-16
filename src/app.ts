import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import intakeRoutes from './routes/intake.js';
import statsRoutes from './routes/stats.js';
import exportRoutes from './routes/export.js';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://0.0.0.0:3000', 'http://0.0.0.0:5173', 'http://hydrotime-app:3000', 'http://hydrotime-app:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rotas
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/', intakeRoutes);
app.use('/', statsRoutes);
app.use('/', exportRoutes);

// Error handling para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

export default app;
