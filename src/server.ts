import app from './app.js';
import { env } from './utils/env.js';
import { prisma } from './utils/prisma.js';

const startServer = async () => {
  try {
    // Executar migrations em produção
    if (env.NODE_ENV === 'production') {
      console.log('🔄 Executando migrations...');
      const { execSync } = await import('child_process');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✓ Migrations executadas');
      } catch (error) {
        console.warn('⚠ Erro ao executar migrations (pode não haver nuevas):', error);
      }
    }

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
