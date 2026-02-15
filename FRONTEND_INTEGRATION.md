# Integração Frontend com API Hydro Time

Este documento explica como integrar o frontend React com a API Node.js.

## Setup Inicial

### 1. Copiar o Cliente HTTP para o Frontend

O arquivo `/src/utils/api-client.ts` contém uma classe `HydroTimeApiClient` que deve ser copiado para o projeto Frontend:

```bash
cp api-hydro-time/src/utils/api-client.ts hydro-time/src/utils/api.ts
cp api-hydro-time/src/types/api.ts hydro-time/src/types/api.ts
```

### 2. Instalar fetch-like library (se necessário)

Se estiver usando um ambiente que não tem `fetch` nativo, instale:

```bash
npm install node-fetch  # para Node.js
npm install cross-fetch  # para Universal JavaScript
```

## Uso no Frontend

### Inicializar o Cliente

```typescript
import { HydroTimeApiClient } from './utils/api';

const apiClient = new HydroTimeApiClient({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000'
});
```

### Exemplo 1: Autenticação (Login)

```typescript
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await apiClient.login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id);
      navigate('/home');
    } catch (error) {
      alert('Erro ao fazer login: ' + error.message);
    }
  };

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

### Exemplo 2: Registrar Usuário

```typescript
export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await apiClient.register(form);
      localStorage.setItem('token', response.token);
      navigate('/home');
    } catch (error) {
      alert('Erro ao registrar: ' + error.message);
    }
  };

  return (
    <div>
      <input 
        value={form.name} 
        onChange={(e) => setForm({...form, name: e.target.value})} 
        placeholder="Nome" 
      />
      <input 
        value={form.email} 
        onChange={(e) => setForm({...form, email: e.target.value})} 
        placeholder="Email" 
      />
      <input 
        value={form.password} 
        onChange={(e) => setForm({...form, password: e.target.value})} 
        type="password"
        placeholder="Senha" 
      />
      <button onClick={handleRegister}>Registrar</button>
    </div>
  );
}
```

### Exemplo 3: Carregar Configurações na Inicialização

```typescript
export function App() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.setToken(token);
      loadSettings();
    }
  }, []);

  const loadSettings = async () => {
    try {
      const { settings } = await apiClient.getSettings();
      setSettings(settings);
      // Aplicar tema
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      // Aplicar idioma
      i18n.changeLanguage(settings.language);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  return <div>{/* seu app */}</div>;
}
```

### Exemplo 4: Atualizar Configurações

```typescript
export function SettingsPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { settings } = await apiClient.getSettings();
    setSettings(settings);
  };

  const handleSaveSettings = async (updatedSettings) => {
    try {
      const { settings } = await apiClient.updateSettings(updatedSettings);
      setSettings(settings);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações: ' + error.message);
    }
  };

  return (
    <div>
      <label>
        Meta Diária (ml):
        <input 
          type="number" 
          value={settings?.dailyGoalMl || 2500}
          onChange={(e) => handleSaveSettings({ dailyGoalMl: parseInt(e.target.value) })}
        />
      </label>
      {/* mais campos */}
    </div>
  );
}
```

### Exemplo 5: Registrar Ingestão de Água

```typescript
export function Timer() {
  const handleQuickAdd = async (amountMl: number) => {
    try {
      await apiClient.createIntakeLog({
        amountMl,
        timestamp: Date.now(),
        durationSeconds: 0
      });
      // Atualizar UI
      await loadStats();
    } catch (error) {
      alert('Erro ao registrar ingestão: ' + error.message);
    }
  };

  return (
    <div>
      <button onClick={() => handleQuickAdd(100)}>100ml</button>
      <button onClick={() => handleQuickAdd(200)}>200ml</button>
      <button onClick={() => handleQuickAdd(300)}>300ml</button>
      <button onClick={() => handleQuickAdd(500)}>500ml</button>
    </div>
  );
}
```

### Exemplo 6: Buscar Histórico com Filtro

```typescript
export function HistoryList() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadTodayLogs();
  }, []);

  const loadTodayLogs = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { intakeLogs } = await apiClient.getIntakeLogs({
      startDate: today.getTime(),
      endDate: tomorrow.getTime()
    });
    setLogs(intakeLogs);
  };

  const loadWeeklyLogs = async () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { intakeLogs } = await apiClient.getIntakeLogs({
      startDate: weekAgo.getTime(),
      endDate: today.getTime()
    });
    setLogs(intakeLogs);
  };

  return (
    <div>
      <button onClick={loadTodayLogs}>Hoje</button>
      <button onClick={loadWeeklyLogs}>Última Semana</button>
      <ul>
        {logs.map(log => (
          <li key={log.id}>
            {new Date(log.timestamp).toLocaleString()} - {log.amountMl}ml
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Exemplo 7: Barra de Progresso e Estatísticas

```typescript
export function ProgressBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const overview = await apiClient.getStatsOverview();
      setStats(overview);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  if (!stats) return <div>Carregando...</div>;

  const percentage = Math.min((stats.todayTotal / stats.dailyGoal) * 100, 100);

  return (
    <div>
      <div style={{width: '100%', backgroundColor: '#ddd', borderRadius: '8px'}}>
        <div 
          style={{
            width: `${percentage}%`,
            backgroundColor: '#4CAF50',
            height: '20px',
            borderRadius: '8px',
            transition: 'width 0.3s'
          }}
        />
      </div>
      <p>{stats.todayTotal}ml / {stats.dailyGoal}ml</p>
      <p>{stats.dailyGoalMet ? '✅ Meta atingida!' : '⏳ Continue hidratando'}</p>
    </div>
  );
}
```

### Exemplo 8: Gráfico Semanal

```typescript
export function WeeklyChart() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { intakeLogs } = await apiClient.getIntakeLogs({
      startDate: weekAgo.getTime(),
      endDate: today.getTime()
    });

    // Agrupar por dia
    const dailyData = Array(7).fill(0);
    intakeLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const dayIndex = date.getDay();
      dailyData[dayIndex] += log.amountMl;
    });

    setLogs(dailyData);
  };

  return (
    <div>
      {/* Use uma biblioteca de gráficos como Chart.js, Recharts, etc */}
      {/* Exemplo com Chart.js */}
      <canvas ref={chartRef} />
    </div>
  );
}
```

### Exemplo 9: Exportar Dados

```typescript
export function ExportData() {
  const handleExport = async () => {
    try {
      const data = await apiClient.exportUserData?.(); // Se implementado
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hydro-time-export.json';
      a.click();
    } catch (error) {
      alert('Erro ao exportar dados: ' + error.message);
    }
  };

  return <button onClick={handleExport}>Exportar Dados</button>;
}
```

### Exemplo 10: Context API para Autenticação Global

```typescript
// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      apiClient.setToken(savedToken);
      setToken(savedToken);
      setUserId(localStorage.getItem('userId'));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.user.id);
    setToken(response.token);
    setUserId(response.user.id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
    apiClient.setToken('');
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
```

## Variáveis de Ambiente

Crie um arquivo `.env.local` no Frontend (hydro-time/):

```
REACT_APP_API_URL=http://localhost:3000
```

Para produção, altere para:

```
REACT_APP_API_URL=https://api.hydro-time.com
```

## Error Handling Robusto

```typescript
async function safeApiCall<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'Erro ao executar ação'
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      console.error(errorMessage, error.message);
      if (error.message === 'Token inválido ou expirado') {
        // Redirecionar para login
      }
    }
    return null;
  }
}
```

## Próximas Integrações

- [ ] Integrar autenticação com Google/Apple
- [ ] Implementar refresh tokens
- [ ] Adicionar offline mode com Service Worker
- [ ] Implementar WebSocket para sincronização em tempo real
- [ ] Add Push Notifications
