import { Router } from 'express';
import { settingsController } from '../controllers/settings.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../validation/index.js';
import { userSettingsSchema } from '../validation/schemas.js';

const router = Router();

router.get('/settings', authMiddleware, (req, res) => {
  settingsController.getSettings(req, res);
});

router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const data = await validate(userSettingsSchema, req.body);
    req.body = data;
    settingsController.updateSettings(req, res);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Dados inválidos' });
  }
});

router.patch('/settings', authMiddleware, async (req, res) => {
  try {
    const data = await validate(userSettingsSchema, req.body);
    req.body = data;
    settingsController.updateSettings(req, res);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Dados inválidos' });
  }
});

export default router;
