import { Router } from 'express';
import { intakeController } from '../controllers/intake.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../validation/index.js';
import { intakeLogSchema } from '../validation/schemas.js';

const router = Router();

router.post('/intake', authMiddleware, async (req, res) => {
  try {
    const data = await validate(intakeLogSchema, req.body);
    req.body = data;
    intakeController.createIntakeLog(req, res);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Dados inválidos' });
  }
});

router.get('/intake', authMiddleware, (req, res) => {
  intakeController.getIntakeLogs(req, res);
});

router.delete('/intake/:id', authMiddleware, (req, res) => {
  intakeController.deleteIntakeLog(req, res);
});

export default router;
