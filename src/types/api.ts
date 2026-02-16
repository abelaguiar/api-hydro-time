/**
 * Tipos e Interfaces da API para uso no Frontend
 */

// Autenticação
export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// Configurações
export interface UserSettings {
  id: string;
  userId: string;
  dailyGoalMl: number;
  reminderIntervalMinutes: number;
  notificationsEnabled: boolean;
  language: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsUpdate {
  dailyGoalMl?: number;
  reminderIntervalMinutes?: number;
  notificationsEnabled?: boolean;
  language?: string;
  theme?: string;
}

// Intake Logs
export interface IntakeLog {
  id: string;
  userId: string;
  amountMl: number;
  timestamp: number;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeLogPayload {
  amountMl: number;
  timestamp: number;
}

export interface IntakeLogsResponse {
  intakeLogs: IntakeLog[];
  total: number;
  limit: number;
  offset: number;
}

// Estatísticas
export interface StatsOverview {
  todayTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  dailyGoal: number;
  dailyGoalMet: boolean;
  monthlyStatus: 'completed' | 'on_track';
}

// Erro da API
export interface ApiError {
  error: string;
}
