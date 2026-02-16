import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const userSettingsSchema = z.object({
  dailyGoalMl: z.number().int().positive().optional(),
  reminderIntervalMinutes: z.number().int().positive().optional(),
  notificationsEnabled: z.boolean().optional(),
  language: z.string().optional(),
  theme: z.string().optional(),
});

export const intakeLogSchema = z.object({
  amountMl: z.number().int().positive('Quantidade deve ser positiva'),
  timestamp: z.coerce.number().int('Timestamp deve ser um número inteiro válido'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type IntakeLogInput = z.infer<typeof intakeLogSchema>;
