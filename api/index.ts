import app from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

// Verificar conexão com banco de dados
(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Banco de dados conectado');
  } catch (error) {
    console.error('✗ Erro ao conectar ao banco de dados:', error);
  }
})();

// Exportar a app como handler do Vercel
export default app;
