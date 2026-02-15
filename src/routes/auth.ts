import { Router } from 'express';
import { authController } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../validation/index.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const data = await validate(registerSchema, req.body);
    req.body = data;
    authController.register(req, res);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Dados inválidos' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = await validate(loginSchema, req.body);
    req.body = data;
    authController.login(req, res);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Dados inválidos' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  authController.me(req, res);
});

export default router;
