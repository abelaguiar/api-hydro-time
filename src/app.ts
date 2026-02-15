import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import intakeRoutes from './routes/intake.js';
import statsRoutes from './routes/stats.js';
import exportRoutes from './routes/export.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
