# 🚀 Hydro Time API - Documentação Completa

## Visão Geral

API Node.js + TypeScript para gerenciar dados de hidratação com autenticação JWT, persistência em banco de dados SQLite e estatísticas agregadas.

## ✅ Épicos Implementados

### ✅ Épico 1: Autenticação e Usuários
- [x] Configuração do Banco de Dados (Prisma + SQLite)
  - [x] Schema de Users
  - [x] Schema de IntakeLogs
  - [x] Schema de UserSettings
- [x] POST /auth/register - Registrar novo usuário
- [x] POST /auth/login - Fazer login
- [x] GET /auth/me - Obter dados do usuário autenticado
- [x] Middleware de autenticação JWT
- [x] Geração de tokens JWT com validade de 30 dias

### ✅ Épico 2: Configurações do Usuário
- [x] GET /user/settings - Buscar configurações
- [x] PUT /user/settings - Atualizar configurações
- [x] PATCH /user/settings - Atualizar configurações (alternativa)
- [x] Criação automática de configurações padrão ao registrar
- [x] Suporte a: dailyGoalMl, reminderIntervalMinutes, notificationsEnabled, language, theme

### ✅ Épico 3: Registros de Hidratação
- [x] POST /intake - Registrar ingestão de água
- [x] GET /intake - Listar registros com filtros opcionais
  - [x] ?startDate=timestamp - Filtro de data inicial
  - [x] ?endDate=timestamp - Filtro de data final
  - [x] ?limit=100 - Limite de registros
  - [x] ?offset=0 - Deslocamento (paginação)
- [x] DELETE /intake/:id - Deletar registro (com validação de ownership)
- [x] Suporte completo para amountMl, timestamp, durationSeconds

### ✅ Épico 4: Dashboard & Estatísticas
- [x] GET /stats/overview - Resumo das estatísticas
- [x] Cálculo automático de:
  - [x] todayTotal - Total de água ingerida hoje
  - [x] weeklyTotal - Total da semana
  - [x] monthlyTotal - Total do mês
  - [x] dailyGoal - Meta diária do usuário
  - [x] dailyGoalMet - Se atingiu a meta de hoje
  - [x] monthlyStatus - Status do mês (completed / on_track)

### ✅ Épico 5: Exportação de Dados
- [x] GET /user/export - Exportar dados em JSON
- [x] GET /user/export/csv - Exportar registros em CSV

## 📁 Estrutura do Projeto

```
api-hydro-time/
├── src/
│   ├── controllers/          # Lógica de negócios
│   │   ├── auth.ts          # Autenticação (register, login, me)
│   │   ├── settings.ts      # Configurações do usuário
│   │   ├── intake.ts        # Registros de hidratação
│   │   ├── stats.ts         # Estatísticas
│   │   └── export.ts        # Exportação de dados
│   ├── middleware/           # Middleware customizado
│   │   └── auth.ts          # Middleware JWT
│   ├── routes/              # Definição de rotas
│   │   ├── auth.ts          # POST /auth/register, POST /auth/login, GET /auth/me
│   │   ├── user.ts          # GET/PUT/PATCH /user/settings
│   │   ├── intake.ts        # POST/GET/DELETE /intake
│   │   ├── stats.ts         # GET /stats/overview
│   │   └── export.ts        # GET /user/export, GET /user/export/csv
│   ├── types/
│   │   ├── index.ts         # Interfaces de autenticação
│   │   └── api.ts           # Tipos da API para frontend
│   ├── utils/
│   │   ├── env.ts           # Configuração de variáveis de ambiente
│   │   ├── prisma.ts        # Instância do Prisma Client
│   │   └── api-client.ts    # Cliente HTTP para Frontend
│   ├── validation/           # Schemas de validação
│   │   ├── index.ts         # Função validate()
│   │   └── schemas.ts       # Schemas Zod
│   ├── app.ts               # Configuração do Express
│   └── server.ts            # Inicialização do servidor
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   └── migrations/          # Histórico de migrations
├── dist/                    # Código compilado (JS)
├── node_modules/
├── package.json
├── tsconfig.json
├── .env                     # Variáveis de ambiente (não commitar)
├── .env.example             # Template de variáveis
├── .gitignore
├── Dockerfile               # Para containerizar a API
├── docker-compose.yml       # Compose para desenvolvimento
├── README.md               # Documentação principal
├── FRONTEND_INTEGRATION.md # Guia de integração com frontend
└── test-api.sh            # Script de teste com curl
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **TypeScript** - Runtime e linguagem
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados (arquivo)
- **JWT** - Autenticação stateless
- **bcrypt** - Hash seguro de senhas
- **Zod** - Validação de schemas
- **CORS** - Controle de origem

### Desenvolvimento
- **tsx** - Executar TypeScript diretamente
- **Docker** - Containerização

## 🚀 Como Usar

### Setup Inicial

```bash
# Instalar dependências
npm install

# Crear arquivo .env (copiar de .env.example)
cp .env.example .env

# Executar migrations
npm run prisma:migrate

# Iniciar em desenvolvimento
npm run dev
```

### Build para Produção

```bash
npm run build
npm start
```

### Com Docker

```bash
docker-compose up
```

## 📊 Endpoints Resumidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /auth/register | Registrar novo usuário |
| POST | /auth/login | Fazer login |
| GET | /auth/me | Dados do usuário |
| GET | /user/settings | Buscar configurações |
| PUT | /user/settings | Atualizar configurações |
| PATCH | /user/settings | Atualizar configurações |
| POST | /intake | Registrar ingestão |
| GET | /intake | Listar registros |
| DELETE | /intake/:id | Deletar registro |
| GET | /stats/overview | Resumo de estatísticas |
| GET | /user/export | Exportar dados (JSON) |
| GET | /user/export/csv | Exportar registros (CSV) |
| GET | /health | Health check |

## 🔒 Segurança

- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ JWT para autenticação stateless
- ✅ Validação de schema com Zod
- ✅ CORS configurado
- ✅ Verificação de ownership em DELETE
- ✅ Tokens com expiração de 30 dias

## 📝 Variáveis de Ambiente

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta"
PORT=3000
NODE_ENV="development"
```

## 🧪 Testando a API

### Com cURL

```bash
# Health check
curl http://localhost:3000/health

# Registrar
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@example.com","password":"senha123"}'
```

### Com script fornecido

```bash
chmod +x test-api.sh
./test-api.sh
```

## 🔧 Integração com Frontend

O frontend React pode usar o cliente HTTP fornecido em `src/utils/api-client.ts`:

```typescript
import { HydroTimeApiClient } from './utils/api';

const api = new HydroTimeApiClient({ baseURL: 'http://localhost:3000' });
await api.login({ email: 'user@example.com', password: 'senha123' });
await api.createIntakeLog({ amountMl: 300, timestamp: Date.now() });
```

Veja [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) para exemplos completos.

## 📚 Próximos Passos

- [ ] Implementar refresh tokens
- [ ] Adicionar testes automatizados (Jest)
- [ ] Rate limiting
- [ ] Logs estruturados (Winston/Bunyan)
- [ ] GraphQL (opcional)
- [ ] WebSockets para sincronização em tempo real
- [ ] Autenticação com Google/Apple
- [ ] Backup automático do banco de dados
- [ ] CI/CD pipeline
- [ ] Documentação automática com Swagger/OpenAPI

## 📞 Suporte

Para dúvidas sobre integração ou funcionalidades, consulte:
- [README.md](./README.md) - Documentação de endpoints
- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - Guia de integração
- [test-api.sh](./test-api.sh) - Exemplos de uso

## 📄 Licença

Parte do projeto Hydro Time
