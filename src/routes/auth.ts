import { Router } from 'express';
import { authController } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../validation/index.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário com email e senha
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: senha123
 *               name:
 *                 type: string
 *                 example: João Silva
 *             required:
 *               - email
 *               - password
 *               - name
 *           example:
 *             email: joao@example.com
 *             password: senha123
 *             name: João Silva
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 id: clh1a2b3c4d5e6f7g8h9i0j1
 *                 email: joao@example.com
 *                 name: João Silva
 *                 createdAt: "2026-02-14T10:30:00Z"
 *                 updatedAt: "2026-02-14T10:30:00Z"
 *       400:
 *         description: Dados inválidos ou email já registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Email já registrado
 */
router.post('/register', async (req, res) => {
  try {
    const data = await validate(registerSchema, req.body);
    req.body = data;
    authController.register(req, res);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Dados inválidos' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login do usuário
 *     description: Autentica um usuário e retorna um token JWT válido por 30 dias
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: senha123
 *             required:
 *               - email
 *               - password
 *           example:
 *             email: joao@example.com
 *             password: senha123
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbGgxYTJiM2M0ZDVlNmY3Zzho...
 *               user:
 *                 id: clh1a2b3c4d5e6f7g8h9i0j1
 *                 email: joao@example.com
 *                 name: João Silva
 *       401:
 *         description: Email ou senha inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Email ou senha inválidos
 */
router.post('/login', async (req, res) => {
  try {
    const data = await validate(loginSchema, req.body);
    req.body = data;
    authController.login(req, res);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || 'Dados inválidos' });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obter dados do usuário autenticado
 *     description: 'Retorna as informações completas do usuário atualmente autenticado (válido com token JWT)'
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: clh1a2b3c4d5e6f7g8h9i0j1
 *               email: joao@example.com
 *               name: João Silva
 *               createdAt: "2026-02-14T10:30:00Z"
 *               updatedAt: "2026-02-14T10:30:00Z"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Token inválido ou expirado
 */
router.get('/me', authMiddleware, (req, res) => {
  authController.me(req, res);
});

export default router;
