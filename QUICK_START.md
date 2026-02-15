# 🚀 Como Começar com a API no Frontend

## 1. Copiar o Cliente HTTP

Copie o arquivo do cliente API para o seu projeto frontend:

```bash
# De dentro do projeto frontend (hydro-time/)
cp ../api-hydro-time/src/utils/api-client.ts ./src/utils/api.ts
cp ../api-hydro-time/src/types/api.ts ./src/types/api.ts
```

## 2. Adicionar Variável de Ambiente

Crie/edite o arquivo `.env.local` na raiz do projeto `hydro-time/`:

```env
REACT_APP_API_URL=http://localhost:3000
```

Para produção:
```env
REACT_APP_API_URL=https://api.hydro-time.com
```

## 3. Atualizar storage.ts (Remover localStorage)

O arquivo `hydro-time/src/utils/storage.ts` **não é mais necessário** para `UserSettings` e `IntakeLogs`. 

**Mantenha apenas as funções que não são sincronizadas com API** (como temas locais do browser).

## 4. Exemplo Rápido: Substituir getLogs e saveLogs

**Antes (usando localStorage):**
```typescript
// utils/storage.ts (ANTIGO)
export const getLogs = () => JSON.parse(localStorage.getItem('logs') || '[]');
export const saveLogs = (logs) => localStorage.setItem('logs', JSON.stringify(logs));
```

**Depois (usando API):**
```typescript
// utils/api.ts (NOVO)
import { HydroTimeApiClient } from './api';

const apiClient = new HydroTimeApiClient({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000'
});

// Login
const { token } = await apiClient.login({ 
  email: user.email, 
  password: user.password 
});

// Salvar token
localStorage.setItem('token', token);

// Buscar logs
const { intakeLogs } = await apiClient.getIntakeLogs({
  startDate: today.getTime(),
  endDate: tomorrow.getTime()
});

// Registrar nova ingestão
await apiClient.createIntakeLog({
  amountMl: 300,
  timestamp: Date.now(),
  durationSeconds: 0
});
```

## 5. Integração Gradual

Se quiser usar API e localStorage simultaneamente:

```typescript
export async function saveLogs(logs: IntakeLog[]) {
  // Salvar localmente (offline)
  localStorage.setItem('logs', JSON.stringify(logs));
  
  // Sincronizar com API (se online)
  try {
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.setToken(token);
      // Enviar logs novos para API...
    }
  } catch (error) {
    console.warn('Offline - logs salvos localmente');
  }
}
```

## 6. Exemplo Completo: Timer.tsx

```typescript
// components/Timer.tsx
import { useState, useEffect } from 'react';
import { HydroTimeApiClient } from '../utils/api';

const apiClient = new HydroTimeApiClient({
  baseURL: process.env.REACT_APP_API_URL
});

export function Timer() {
  const [loading, setLoading] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    loadTodayTotal();
    // Recarregar a cada minuto
    const interval = setInterval(loadTodayTotal, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadTodayTotal = async () => {
    try {
      const token = localStorage.getItem('token');
      apiClient.setToken(token || '');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { intakeLogs } = await apiClient.getIntakeLogs({
        startDate: today.getTime(),
        endDate: new Date().getTime()
      });
      
      const total = intakeLogs.reduce((sum, log) => sum + log.amountMl, 0);
      setTodayTotal(total);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  const handleQuickAdd = async (amountMl: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      apiClient.setToken(token || '');
      
      await apiClient.createIntakeLog({
        amountMl,
        timestamp: Date.now(),
        durationSeconds: 0
      });
      
      await loadTodayTotal();
    } catch (error) {
      alert('Erro ao registrar ingestão: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{todayTotal}ml / 2500ml</h2>
      <div>
        <button 
          onClick={() => handleQuickAdd(100)}
          disabled={loading}
        >
          100ml
        </button>
        <button 
          onClick={() => handleQuickAdd(200)}
          disabled={loading}
        >
          200ml
        </button>
        <button 
          onClick={() => handleQuickAdd(300)}
          disabled={loading}
        >
          300ml
        </button>
        <button 
          onClick={() => handleQuickAdd(500)}
          disabled={loading}
        >
          500ml
        </button>
      </div>
    </div>
  );
}
```

## 7. Exemplo: App.tsx com Context de Autenticação

```typescript
// App.tsx
import { useEffect, useState } from 'react';
import { HydroTimeApiClient } from './utils/api';

const apiClient = new HydroTimeApiClient({
  baseURL: process.env.REACT_APP_API_URL
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Restaurar sessão
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.setToken(token);
      setIsLoggedIn(true);
      loadUserSettings();
    }
  }, []);

  const loadUserSettings = async () => {
    try {
      const { settings } = await apiClient.getSettings();
      setTheme(settings.theme);
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { token } = await apiClient.login({ email, password });
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      await loadUserSettings();
    } catch (error) {
      alert('Erro ao fazer login: ' + (error as Error).message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    apiClient.setToken('');
    setIsLoggedIn(false);
  };

  return (
    <div className={theme}>
      {isLoggedIn ? (
        <>
          <Timer />
          <HistoryList />
          <button onClick={handleLogout}>Sair</button>
        </>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
```

## 8. HistoryList.tsx com Filtros

```typescript
// components/HistoryList.tsx
import { useState, useEffect } from 'react';
import { HydroTimeApiClient } from '../utils/api';
import { IntakeLog } from '../types/api';

const apiClient = new HydroTimeApiClient({
  baseURL: process.env.REACT_APP_API_URL
});

export function HistoryList() {
  const [logs, setLogs] = useState<IntakeLog[]>([]);
  const [period, setPeriod] = useState<'today' | 'week' | 'all'>('today');

  useEffect(() => {
    loadLogs();
  }, [period]);

  const loadLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      apiClient.setToken(token || '');

      let params = {};
      const now = new Date();

      if (period === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        params = {
          startDate: today.getTime(),
          endDate: tomorrow.getTime()
        };
      } else if (period === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        params = {
          startDate: weekAgo.getTime(),
          endDate: now.getTime()
        };
      }

      const { intakeLogs } = await apiClient.getIntakeLogs(params);
      setLogs(intakeLogs);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que quer deletar?')) return;

    try {
      const token = localStorage.getItem('token');
      apiClient.setToken(token || '');
      
      await apiClient.deleteIntakeLog(id);
      await loadLogs();
    } catch (error) {
      alert('Erro ao deletar: ' + (error as Error).message);
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setPeriod('today')}>Hoje</button>
        <button onClick={() => setPeriod('week')}>Semana</button>
        <button onClick={() => setPeriod('all')}>Tudo</button>
      </div>

      <ul>
        {logs.map(log => (
          <li key={log.id}>
            <span>{new Date(log.timestamp).toLocaleString()}</span>
            <span>{log.amountMl}ml</span>
            <button onClick={() => handleDelete(log.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 9. Carregar Configurações na Inicialização

```typescript
// Adicionar em App.tsx
const loadAppSettings = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    apiClient.setToken(token);
    
    // Carregar configurações
    const { settings } = await apiClient.getSettings();
    
    // Aplicar tema
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    
    // Aplicar idioma
    // i18n.changeLanguage(settings.language);
    
    // Meta diária
    localStorage.setItem('dailyGoal', settings.dailyGoalMl.toString());
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
};
```

## 10. Testar a Integração

1. **Inicie a API:**
```bash
cd api-hydro-time
npm run dev
# Servidor em http://localhost:3000
```

2. **Inicie o Frontend:**
```bash
cd hydro-time
npm start
# App em http://localhost:3000 (ou outra porta)
```

3. **Teste o fluxo:**
   - Registre um novo usuário
   - Adicione ingestões de água
   - Verifique no histórico
   - Teste as configurações
   - Logout e login novamente

---

## ⚠️ Checklist de Integração

- [ ] Copiei `api-client.ts` para `src/utils/api.ts`
- [ ] Copiei `api.ts` types para `src/types/api.ts`
- [ ] Criei `.env.local` com `REACT_APP_API_URL`
- [ ] API está rodando em `http://localhost:3000`
- [ ] Testei registro (`/auth/register`)
- [ ] Testei login (`/auth/login`)
- [ ] Testei criar ingestão (`POST /intake`)
- [ ] Testei listar logs (`GET /intake`)
- [ ] Testei carregar configurações (`GET /user/settings`)
- [ ] Testei atualizar configurações (`PUT /user/settings`)
- [ ] Testei estatísticas (`GET /stats/overview`)

---

## 🆘 Troubleshooting

### "CORS error"
Certifique-se de que a API está rodando em `http://localhost:3000` e o frontend em outra porta (ex: 3001).

### "Token inválido"
- Verifique se o token está sendo salvo em localStorage
- Verifique se está sendo enviado corretamente no header `Authorization: Bearer {token}`
- Tokens expiram após 30 dias

### "Erro 404 em endpoints"
- Verifique se a API está rodando (`npm run dev` na pasta api-hydro-time)
- Verifique se o `REACT_APP_API_URL` está correto
- Verifique os logs da API para erros

---

Agora você está pronto para usar a API no frontend! 🎉
