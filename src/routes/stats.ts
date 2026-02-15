import { Router } from 'express';
import { statsController } from '../controllers/stats.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /stats/overview:
 *   get:
 *     summary: Obter estatísticas gerais de hidratação
 *     description: Retorna um resumo das estatísticas de hidratação do usuário (hoje, semana, mês) com metas e progresso
 *     tags:
 *       - Estatísticas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todayTotal:
 *                   type: number
 *                   example: 1500
 *                 weeklyTotal:
 *                   type: number
 *                   example: 10500
 *                 monthlyTotal:
 *                   type: number
 *                   example: 45000
 *                 dailyGoalMet:
 *                   type: boolean
 *                   example: false
 *                 dailyGoal:
 *                   type: number
 *                   example: 2500
 *                 monthlyStatus:
 *                   type: string
 *                   example: "Em progresso"
 *             example:
 *               todayTotal: 1500
 *               weeklyTotal: 10500
 *               monthlyTotal: 45000
 *               dailyGoalMet: false
 *               dailyGoal: 2500
 *               monthlyStatus: "Em progresso"
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/stats/overview', authMiddleware, (req, res) => {
  statsController.getOverview(req, res);
});

export default router;
