import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { UserSettingsInput } from '../validation/schemas.js';

export const settingsController = {
  async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const settings = await prisma.userSettings.findUnique({
        where: { userId: req.user.userId },
      });

      if (!settings) {
        res.status(404).json({ error: 'Configurações não encontradas' });
        return;
      }

      res.json({ settings });
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  },

  async updateSettings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const updates: UserSettingsInput = req.body;

      const settings = await prisma.userSettings.update({
        where: { userId: req.user.userId },
        data: {
          ...(updates.dailyGoalMl && { dailyGoalMl: updates.dailyGoalMl }),
          ...(updates.reminderIntervalMinutes && {
            reminderIntervalMinutes: updates.reminderIntervalMinutes,
          }),
          ...(updates.notificationsEnabled !== undefined && {
            notificationsEnabled: updates.notificationsEnabled,
          }),
          ...(updates.language && { language: updates.language }),
          ...(updates.theme && { theme: updates.theme }),
        },
      });

      res.json({
        message: 'Configurações atualizadas com sucesso',
        settings,
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
  },
};
