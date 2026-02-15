import { Router } from 'express';
import { exportController } from '../controllers/export.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/user/export', authMiddleware, (req, res) => {
  exportController.exportUserData(req, res);
});

router.get('/user/export/csv', authMiddleware, (req, res) => {
  exportController.exportCSV(req, res);
});

export default router;
