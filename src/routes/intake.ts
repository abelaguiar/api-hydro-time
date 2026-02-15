import { Router } from 'express';
import { intakeController } from '../controllers/intake.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../validation/index.js';
import { intakeLogSchema } from '../validation/schemas.js';

const router = Router();

/**
 * @swagger
 * /intake:
 *   post:
 *     summary: Registrar consumo de água
 *     description: Cria um novo registro de consumo de água para o usuário autenticado
 *     tags:
 *       - Registros de Hidratação
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amountMl:
 *                 type: number
 *                 example: 250
 *               timestamp:
 *                 type: number
 *                 example: 1707931200000
 *               durationSeconds:
 *                 type: number
 *                 example: 30
 *             required:
 *               - amountMl
 *               - timestamp
 *           example:
 *             amountMl: 250
 *             timestamp: 1707931200000
 *             durationSeconds: 30
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IntakeLog'
 *             example:
 *               id: clh2a2b3c4d5e6f7g8h9i0j1
 *               userId: clh1a2b3c4d5e6f7g8h9i0j1
 *               amountMl: 250
 *               timestamp: 1707931200000
 *               durationSeconds: 30
 *               createdAt: "2026-02-14T10:35:00Z"
 *       400:
 *         description: 'Dados inválidos (amountMl ou timestamp ausentes)'
 *       401:
 *         description: Token ausente ou inválido
 */
router.post('/intake', authMiddleware, async (req, res) => {
  try {
    const data = await validate(intakeLogSchema, req.body);
    req.body = data;
    intakeController.createIntakeLog(req, res);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Dados inválidos' });
  }
});

/**
 * @swagger
 * /intake:
 *   get:
 *     summary: Listar registros de consumo de água
 *     description: Retorna os registros de consumo do usuário com opções de filtro e paginação. Use query parameters para filtrar por data ou limitar resultados.
 *     tags:
 *       - Registros de Hidratação
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: number
 *         description: 'Timestamp de início em ms (ex: 1707931200000)'
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: number
 *         description: 'Timestamp de fim em ms (ex: 1708017600000)'
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: 'Número máximo de registros (padrão 20)'
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           default: 0
 *         description: 'Número de registros a pular (padrão 0)'
 *     responses:
 *       200:
 *         description: Lista de registros paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IntakeLog'
 *             example:
 *               - id: clh2a2b3c4d5e6f7g8h9i0j1
 *                 userId: clh1a2b3c4d5e6f7g8h9i0j1
 *                 amountMl: 250
 *                 timestamp: 1707931200000
 *                 durationSeconds: 30
 *                 createdAt: "2026-02-14T10:35:00Z"
 *               - id: clh3a2b3c4d5e6f7g8h9i0j1
 *                 userId: clh1a2b3c4d5e6f7g8h9i0j1
 *                 amountMl: 300
 *                 timestamp: 1707934800000
 *                 durationSeconds: 45
 *                 createdAt: "2026-02-14T11:35:00Z"
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/intake', authMiddleware, (req, res) => {
  intakeController.getIntakeLogs(req, res);
});

/**
 * @swagger
 * /intake/{id}:
 *   delete:
 *     summary: Deletar um registro de consumo
 *     description: Remove um registro de consumo de água específico do usuário. Apenas o proprietário do registro pode deletá-lo.
 *     tags:
 *       - Registros de Hidratação
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID único do registro (ex: clh2a2b3c4d5e6f7g8h9i0j1)'
 *     responses:
 *       200:
 *         description: Registro deletado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Registro deletado com sucesso
 *       403:
 *         description: Você não tem permissão para deletar este registro
 *         content:
 *           application/json:
 *             example:
 *               error: Você não tem permissão para deletar este registro
 *       404:
 *         description: Registro não encontrado
 *         content:
 *           application/json:
 *             example:
 *               error: Registro não encontrado
 *       401:
 *         description: Token ausente ou inválido
 */
router.delete('/intake/:id', authMiddleware, (req, res) => {
  intakeController.deleteIntakeLog(req, res);
});

export default router;
