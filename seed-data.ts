import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedData() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: 'abel.prog@gmail.com' },
    });

    if (!user) {
      console.error('Usuário abel.prog@gmail.com não encontrado');
      process.exit(1);
    }

    console.log(`Gerando dados para usuário: ${user.name} (${user.email})`);

    // Generate data for last 3 months
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    const intakeLogs = [];
    let currentDate = new Date(threeMonthsAgo);

    while (currentDate <= now) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);

      // Generate 3-5 intake logs per day
      const logsPerDay = Math.floor(Math.random() * 3) + 3; // 3-5 logs

      for (let i = 0; i < logsPerDay; i++) {
        // Random time between 6 AM and 10 PM
        const hour = Math.floor(Math.random() * 16) + 6;
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);

        const logDate = new Date(dayStart);
        logDate.setHours(hour, minute, second);

        // Random amount between 150ml and 500ml
        const amountMl = Math.floor(Math.random() * 350) + 150;

        // Random duration between 5 and 120 seconds
        const durationSeconds = Math.floor(Math.random() * 115) + 5;

        intakeLogs.push({
          userId: user.id,
          amountMl,
          timestamp: BigInt(logDate.getTime()),
          durationSeconds,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`\nInserindo ${intakeLogs.length} registros de ingestão...`);

    // Insert in batches of 100
    for (let i = 0; i < intakeLogs.length; i += 100) {
      const batch = intakeLogs.slice(i, i + 100);
      await prisma.intakeLog.createMany({
        data: batch,
      });
      console.log(`✓ Inseridos ${Math.min(i + 100, intakeLogs.length)}/${intakeLogs.length}`);
    }

    console.log('\n✓ Dados inseridos com sucesso!');
    console.log(`Total de registros: ${intakeLogs.length}`);
    console.log(`Período: ${threeMonthsAgo.toLocaleDateString('pt-BR')} a ${now.toLocaleDateString('pt-BR')}`);

  } catch (error) {
    console.error('Erro ao gerar dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
