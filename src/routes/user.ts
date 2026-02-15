import { Router } from 'express';
import { settingsController } from '../controllers/settings.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../validation/index.js';
import { userSettingsSchema } from '../validation/schemas.js';

const router = Router();

/**
 * @swagger
 * /user/settings:
 *   get:
 *     summary: Obter configurações do usuário
 *     description: Retorna as configurações personalizadas do usuário autenticado (meta de hidratação, intervalo de lembrete, notificações, idioma, tema)
 *     tags:
 *       - Configurações do Usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configurações do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *             example:
 *               id: clh1b2c3d4e5f6g7h8i9j0k1
 *               userId: clh1a2b3c4d5e6f7g8h9i0j1
 *               dailyGoalMl: 2500
 *               reminderIntervalMinutes: 60
 *               notificationsEnabled: true
 *               language: pt-BR
 *               theme: light
 *               createdAt: "2026-02-14T10:30:00Z"
 *               updatedAt: "2026-02-14T10:30:00Z"
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/settings', authMiddleware, (req, res) => {
  settingsController.getSettings(req, res);
});

/**
 * @swagger
 * /user/settings:
 *   put:
 *     summary: Atualizar todas as configurações
 *     description: Substitui todas as configurações do usuário (PUT - requer todos os campos)
 *     tags:
 *       - Configurações do Usuário
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyGoalMl:
 *                 type: number
 *                 example: 3000
 *               reminderIntervalMinutes:
 *                 type: number
 *                 example: 45
 *               notificationsEnabled:
 *                 type: boolean
 *                 example: true
 *               language:
 *                 type: string
 *                 example: pt-BR
 *               theme:
 *                 type: string
 *                 example: dark
 *           example:
 *             dailyGoalMl: 3000
 *             reminderIntervalMinutes: 45
 *             notificationsEnabled: true
 *             language: pt-BR
 *             theme: dark
 *     responses:
 *       200:
 *         description: Configurações atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *             example:
 *               id: clh1b2c3d4e5f6g7h8i9j0k1
 *               dailyGoalMl: 3000
 *               reminderIntervalMinutes: 45
 *               notificationsEnabled: true
 *               language: pt-BR
 *               theme: dark
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 */
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const data = await validate(userSettingsSchema, req.body);
    req.body = data;
    settingsController.updateSettings(req, res);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Dados inválidos' });
  }
});

/**
 * @swagger
 * /user/settings:
 *   patch:
 *     summary: Atualizar parcialmente as configurações
 *     description: Atualiza apenas os campos fornecidos (PATCH - campos opcionais)
 *     tags:
 *       - Configurações do Usuário
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyGoalMl:
 *                 type: number
 *               reminderIntervalMinutes:
 *                 type: number
 *               notificationsEnabled:
 *                 type: boolean
 *               language:
 *                 type: string
 *               theme:
 *                 type: string
 *           example:
 *             dailyGoalMl: 3000
 *             theme: dark
 *     responses:
 *       200:
 *         description: Configurações parcialmente atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *             example:
 *               id: clh1b2c3d4e5f6g7h8i9j0k1
 *               dailyGoalMl: 3000
 *               reminderIntervalMinutes: 60
 *               notificationsEnabled: true
 *               language: pt-BR
 *               theme: dark
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 */
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
