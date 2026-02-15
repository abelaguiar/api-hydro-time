/**
 * Cliente HTTP para consumir a API Hydro Time
 * Pode ser usado no frontend (React, Vue, etc.)
 */

import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UserSettings,
  UserSettingsUpdate,
  IntakeLog,
  IntakeLogPayload,
  IntakeLogsResponse,
  StatsOverview,
} from '../types/api.js';

interface ApiClientConfig {
  baseURL: string;
  token?: string;
}

export class HydroTimeApiClient {
  private baseURL: string;
  private token?: string;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.token = config.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(error.error || 'Erro na API');
    }

    return response.json() as Promise<T>;
  }

  // Autenticação
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      'POST',
      '/auth/register',
      payload
    );
    this.setToken(response.token);
    return response;
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      'POST',
      '/auth/login',
      payload
    );
    this.setToken(response.token);
    return response;
  }

  async getMe(): Promise<{ user: { id: string; name: string; email: string; createdAt: string } }> {
    return this.request('GET', '/auth/me');
  }

  // Configurações
  async getSettings(): Promise<{ settings: UserSettings }> {
    return this.request('GET', '/user/settings');
  }

  async updateSettings(payload: UserSettingsUpdate): Promise<{ message: string; settings: UserSettings }> {
    return this.request('PUT', '/user/settings', payload);
  }

  // Intake Logs
  async createIntakeLog(payload: IntakeLogPayload): Promise<{ message: string; intakeLog: IntakeLog }> {
    return this.request('POST', '/intake', payload);
  }

  async getIntakeLogs(params?: {
    startDate?: number;
    endDate?: number;
    limit?: number;
    offset?: number;
  }): Promise<IntakeLogsResponse> {
    const queryString = params
      ? '?' +
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')
      : '';
    return this.request('GET', `/intake${queryString}`);
  }

  async deleteIntakeLog(id: string): Promise<{ message: string }> {
    return this.request('DELETE', `/intake/${id}`);
  }

  // Estatísticas
  async getStatsOverview(): Promise<StatsOverview> {
    return this.request('GET', '/stats/overview');
  }

  // Exportação
  async exportUserData(): Promise<{
    exportDate: string;
    user: { id: string; name: string; email: string; createdAt: string };
    settings: UserSettings;
    intakeLogs: IntakeLog[];
    summary: { totalLogs: number; totalMlConsumed: number };
  }> {
    return this.request('GET', '/user/export');
  }

  async exportCSV(): Promise<string> {
    const response = await fetch(`${this.baseURL}/user/export/csv`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao exportar CSV');
    }

    return response.text();
  }
}

// Exemplo de uso no frontend:
/*
  const client = new HydroTimeApiClient({
    baseURL: 'http://localhost:3000'
  });

  // Registrar
  const auth = await client.register({
    name: 'João',
    email: 'joao@example.com',
    password: 'senha123'
  });

  // Login
  const login = await client.login({
    email: 'joao@example.com',
    password: 'senha123'
  });

  // Registrar ingestão
  await client.createIntakeLog({
    amountMl: 300,
    timestamp: Date.now(),
    durationSeconds: 0
  });

  // Buscar logs
  const logs = await client.getIntakeLogs();
  const todayLogs = await client.getIntakeLogs({
    startDate: new Date().setHours(0,0,0,0),
    endDate: new Date().setHours(23,59,59,999)
  });

  // Obter estatísticas
  const stats = await client.getStatsOverview();

  // Atualizar configurações
  await client.updateSettings({
    dailyGoalMl: 3000,
    theme: 'dark'
  });
*/
