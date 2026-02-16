import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { IntakeLogInput } from '../validation/schemas.js';

export const intakeController = {
  async createIntakeLog(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const { amountMl, timestamp, durationSeconds } = req.body as IntakeLogInput;

      const intakeLog = await prisma.intakeLog.create({
        data: {
          userId: req.user.userId,
          amountMl,
          timestamp: BigInt(timestamp),
          durationSeconds: durationSeconds || 0,
        },
      });

      res.status(201).json({
        message: 'Registro de ingestão criado com sucesso',
        intakeLog: {
          ...intakeLog,
          timestamp: intakeLog.timestamp.toString(),
        },
      });
    } catch (error) {
      console.error('Erro ao criar registro de ingestão:', error);
      res.status(500).json({ error: 'Erro ao criar registro de ingestão' });
    }
  },

  async getIntakeLogs(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const { startDate, endDate, limit = '100', offset = '0' } = req.query;

      const limitNum = Math.min(parseInt(limit as string) || 100, 1000);
      const offsetNum = parseInt(offset as string) || 0;

      const where: any = { userId: req.user.userId };

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) {
          where.timestamp.gte = BigInt(startDate as string);
        }
        if (endDate) {
          where.timestamp.lte = BigInt(endDate as string);
        }
      }

      const [intakeLogs, total] = await Promise.all([
        prisma.intakeLog.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: limitNum,
          skip: offsetNum,
        }),
        prisma.intakeLog.count({ where }),
      ]);

      // Converter BigInt para string para serialização JSON
      const intakeLogsFormatted = intakeLogs.map(log => ({
        ...log,
        timestamp: log.timestamp.toString(),
      }));

      res.json({
        intakeLogs: intakeLogsFormatted,
        total,
        limit: limitNum,
        offset: offsetNum,
      });
    } catch (error) {
      console.error('Erro ao buscar registros de ingestão:', error);
      res.status(500).json({ error: 'Erro ao buscar registros de ingestão' });
    }
  },

  async deleteIntakeLog(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const { id } = req.params;

      // Verificar se o registro pertence ao usuário
      const intakeLog = await prisma.intakeLog.findUnique({
        where: { id },
      });

      if (!intakeLog) {
        res.status(404).json({ error: 'Registro não encontrado' });
        return;
      }

      if (intakeLog.userId !== req.user.userId) {
        res.status(403).json({ error: 'Você não tem permissão para deletar este registro' });
        return;
      }

      await prisma.intakeLog.delete({
        where: { id },
      });

      res.json({ message: 'Registro deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar registro de ingestão:', error);
      res.status(500).json({ error: 'Erro ao deletar registro de ingestão' });
    }
  },
};
