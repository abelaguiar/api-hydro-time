import app from './app.js';
import { env } from './utils/env.js';
import { prisma } from './utils/prisma.js';

const startServer = async () => {
  try {
    // Testar conexão com o banco de dados
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Banco de dados conectado');

    // Iniciar servidor
    app.listen(env.PORT, () => {
      console.log(`✓ Servidor rodando em http://localhost:${env.PORT}`);
      console.log(`✓ Ambiente: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('✗ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n✓ Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
