import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export const statsController = {
  async getOverview(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const today = todayStart.getTime();
      const weekStartTime = weekStart.getTime();
      const monthStartTime = monthStart.getTime();
      const monthEndTime = monthEnd.getTime();

      // Buscar logs de hoje
      const todayLogs = await prisma.intakeLog.findMany({
        where: {
          userId: req.user.userId,
          timestamp: {
            gte: today,
            lt: todayEnd.getTime(),
          },
        },
      });

      // Buscar logs da semana
      const weeklyLogs = await prisma.intakeLog.findMany({
        where: {
          userId: req.user.userId,
          timestamp: {
            gte: weekStartTime,
            lt: now.getTime(),
          },
        },
      });

      // Buscar logs do mês
      const monthlyLogs = await prisma.intakeLog.findMany({
        where: {
          userId: req.user.userId,
          timestamp: {
            gte: monthStartTime,
            lt: monthEndTime,
          },
        },
      });

      // Buscar configurações do usuário
      const settings = await prisma.userSettings.findUnique({
        where: { userId: req.user.userId },
      });

      const dailyGoal = settings?.dailyGoalMl || 2500;

      const todayTotal = todayLogs.reduce((sum, log) => sum + log.amountMl, 0);
      const weeklyTotal = weeklyLogs.reduce((sum, log) => sum + log.amountMl, 0);
      const monthlyTotal = monthlyLogs.reduce((sum, log) => sum + log.amountMl, 0);

      const dailyGoalMet = todayTotal >= dailyGoal;
      const monthlyStatus = monthlyTotal >= dailyGoal * 30 ? 'completed' : 'on_track';

      res.json({
        todayTotal,
        weeklyTotal,
        monthlyTotal,
        dailyGoal,
        dailyGoalMet,
        monthlyStatus,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  },
};
