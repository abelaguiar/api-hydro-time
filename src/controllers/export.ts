import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export const exportController = {
  async exportUserData(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          settings: true,
          intakeLogs: {
            orderBy: { timestamp: 'desc' },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      // Preparar dados para exportação
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        settings: user.settings,
        intakeLogs: user.intakeLogs,
        summary: {
          totalLogs: user.intakeLogs.length,
          totalMlConsumed: user.intakeLogs.reduce((sum, log) => sum + log.amountMl, 0),
        },
      };

      res.json(exportData);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      res.status(500).json({ error: 'Erro ao exportar dados' });
    }
  },

  async exportCSV(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      // Buscar logs do usuário
      const intakeLogs = await prisma.intakeLog.findMany({
        where: { userId: req.user.userId },
        orderBy: { timestamp: 'asc' },
      });

      // Gerar CSV
      const headers = ['ID', 'Data/Hora', 'Quantidade (ml)', 'Duração (s)'];
      const rows = intakeLogs.map(log => [
        log.id,
        new Date(Number(log.timestamp)).toISOString(),
        log.amountMl.toString(),
        log.durationSeconds.toString(),
      ]);

      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="hydro-time-export.csv"');
      res.send(csv);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      res.status(500).json({ error: 'Erro ao exportar CSV' });
    }
  },
};
