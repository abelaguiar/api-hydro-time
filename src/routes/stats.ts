import { Router } from 'express';
import { statsController } from '../controllers/stats.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/stats/overview', authMiddleware, (req, res) => {
  statsController.getOverview(req, res);
});

export default router;
