import { Router } from 'express';
import { exportController } from '../controllers/export.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /user/export:
 *   get:
 *     summary: Exportar dados do usuário em JSON
 *     description: 'Retorna todos os dados do usuário em formato JSON compactado (usuário, configurações, registros de água, resumo)'
 *     tags:
 *       - Exportação de Dados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados exportados em JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 settings:
 *                   $ref: '#/components/schemas/UserSettings'
 *                 intakeLogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IntakeLog'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalWaterIntake:
 *                       type: number
 *                     logCount:
 *                       type: number
 *             example:
 *               user:
 *                 id: clh1a2b3c4d5e6f7g8h9i0j1
 *                 email: joao@example.com
 *                 name: João Silva
 *                 createdAt: "2026-02-14T10:30:00Z"
 *               settings:
 *                 id: clh1b2c3d4e5f6g7h8i9j0k1
 *                 dailyGoalMl: 2500
 *                 reminderIntervalMinutes: 60
 *                 notificationsEnabled: true
 *                 language: pt-BR
 *                 theme: light
 *               intakeLogs:
 *                 - id: clh2a2b3c4d5e6f7g8h9i0j1
 *                   amountMl: 250
 *                   timestamp: 1707931200000
 *               summary:
 *                 totalWaterIntake: 5000
 *                 logCount: 20
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/user/export', authMiddleware, (req, res) => {
  exportController.exportUserData(req, res);
});

/**
 * @swagger
 * /user/export/csv:
 *   get:
 *     summary: Exportar dados em CSV
 *     description: 'Retorna os registros de água do usuário em formato CSV (separado por vírgulas) para importação em planilhas Excel/Google Sheets com colunas ID, Data, Quantidade, Duração'
 *     tags:
 *       - Exportação de Dados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arquivo CSV gerado com sucesso
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *             example: "ID,Data/Hora,Quantidade (ml),Duração (s)\nclh1a2b3c,2026-02-14T10:30:00Z,250,30\nclh2a3b4c,2026-02-14T11:30:00Z,300,45"
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/user/export/csv', authMiddleware, (req, res) => {
  exportController.exportCSV(req, res);
});

export default router;
