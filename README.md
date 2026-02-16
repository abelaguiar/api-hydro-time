# Hydro Time API

API Node.js para gerenciamento de hidratação com autenticação JWT, PostgreSQL e persistência de dados na nuvem.

## 🎯 Início Rápido

### Com Docker (⭐ Recomendado)

```bash
# Iniciar API + PostgreSQL
docker-compose up --build

# Ou com hot-reload (desenvolvimento)
docker-compose -f docker-compose.dev.yml up --build
```

API em: **http://localhost:3000**  
PostgreSQL em: **localhost:5432**

Veja [docs/DOCKER.md](./docs/DOCKER.md) para mais detalhes.

### Sem Docker

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar PostgreSQL:**
```bash
# Criar banco de dados
createdb hydro_time
```

3. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Editar .env com suas credenciais do PostgreSQL
```

4. **Executar migrations:**
```bash
npm run prisma:migrate
```

5. **Iniciar servidor:**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## Endpoints da API

### 🔐 Autenticação

#### POST /auth/register
Registrar novo usuário
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta (201):**
```json
{
  "message": "Usuário registrado com sucesso",
  "token": "eyJhbGc...",
  "user": {
    "id": "clv123...",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

#### POST /auth/login
Fazer login
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGc...",
  "user": {
    "id": "clv123...",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

#### GET /auth/me
Obter dados do usuário autenticado
**Headers:** `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "user": {
    "id": "clv123...",
    "name": "João Silva",
    "email": "joao@example.com",
    "createdAt": "2026-02-15T01:15:48.000Z"
  }
}
```

---

### ⚙️ Configurações do Usuário

#### GET /user/settings
Obter configurações do usuário
**Headers:** `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "settings": {
    "id": "clv456...",
    "userId": "clv123...",
    "dailyGoalMl": 2500,
    "reminderIntervalMinutes": 60,
    "notificationsEnabled": true,
    "language": "pt-BR",
    "theme": "light",
    "createdAt": "2026-02-15T01:15:48.000Z",
    "updatedAt": "2026-02-15T01:15:48.000Z"
  }
}
```

#### PUT /user/settings ou PATCH /user/settings
Atualizar configurações do usuário
**Headers:** `Authorization: Bearer {token}`

```json
{
  "dailyGoalMl": 3000,
  "reminderIntervalMinutes": 45,
  "notificationsEnabled": true,
  "language": "pt-BR",
  "theme": "dark"
}
```

**Resposta (200):**
```json
{
  "message": "Configurações atualizadas com sucesso",
  "settings": { ... }
}
```

---

### 💧 Registros de Hidratação

#### POST /intake
Registrar ingestão de água
**Headers:** `Authorization: Bearer {token}`

```json
{
  "amountMl": 300,
  "timestamp": 1715620000000,
  "durationSeconds": 0
}
```

**Resposta (201):**
```json
{
  "message": "Registro de ingestão criado com sucesso",
  "intakeLog": {
    "id": "clv789...",
    "userId": "clv123...",
    "amountMl": 300,
    "timestamp": 1715620000000,
    "durationSeconds": 0,
    "createdAt": "2026-02-15T01:15:48.000Z",
    "updatedAt": "2026-02-15T01:15:48.000Z"
  }
}
```

#### GET /intake
Listar registros de hidratação com filtros opcionais
**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `startDate` (number): timestamp de início (ms)
- `endDate` (number): timestamp de fim (ms)
- `limit` (number): limite de registros (padrão: 100, máximo: 1000)
- `offset` (number): deslocamento (padrão: 0)

**Exemplos:**
```
GET /intake?startDate=1715620000000&endDate=1715706400000
GET /intake?limit=50&offset=0
GET /intake  (todos os registros)
```

**Resposta (200):**
```json
{
  "intakeLogs": [
    {
      "id": "clv789...",
      "userId": "clv123...",
      "amountMl": 300,
      "timestamp": 1715620000000,
      "durationSeconds": 0,
      "createdAt": "2026-02-15T01:15:48.000Z",
      "updatedAt": "2026-02-15T01:15:48.000Z"
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

#### DELETE /intake/:id
Deletar um registro de hidratação
**Headers:** `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "message": "Registro deletado com sucesso"
}
```

---

### 📊 Estatísticas e Dashboard

#### GET /stats/overview
Obter resumo das estatísticas do usuário
**Headers:** `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "todayTotal": 1500,
  "weeklyTotal": 10500,
  "monthlyTotal": 45000,
  "dailyGoal": 2500,
  "dailyGoalMet": false,
  "monthlyStatus": "on_track"
}
```

---

### 📥 Exportação de Dados

#### GET /user/export
Exportar todos os dados do usuário em formato JSON
**Headers:** `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "exportDate": "2026-02-15T01:15:48.000Z",
  "user": {
    "id": "clv123...",
    "name": "João Silva",
    "email": "joao@example.com",
    "createdAt": "2026-02-15T01:15:48.000Z"
  },
  "settings": { ... },
  "intakeLogs": [ ... ],
  "summary": {
    "totalLogs": 42,
    "totalMlConsumed": 52500
  }
}
```

#### GET /user/export/csv
Exportar registros de hidratação em formato CSV
**Headers:** `Authorization: Bearer {token}`

**Resposta (200):** Arquivo CSV com as colunas: ID, Data/Hora, Quantidade (ml), Duração (s)

---

#### GET /health
Verificar status da API

**Resposta (200):**
```json
{
  "status": "ok"
}
```

---

## Autenticação

Todos os endpoints protegidos requerem:
```
Authorization: Bearer {token}
```

Os tokens JWT têm validade de 30 dias.

## Códigos de Status

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos
- **401**: Não autenticado ou token inválido
- **403**: Sem permissão
- **404**: Não encontrado
- **500**: Erro do servidor

## Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev              # Iniciar em modo desenvolvimento com recarregamento automático
npm run build           # Compilar TypeScript para JavaScript
npm start               # Iniciar servidor em produção
npm run prisma:migrate  # Executar migrations do banco de dados
npm run prisma:studio   # Abrir Prisma Studio (interface visual para o banco)
```

### Com Docker

Veja [docs/DOCKER.md](./docs/DOCKER.md) para guia completo de:
- Iniciar com Docker
- Gerenciar PostgreSQL
- Executar migrations
- Operações comuns
- Troubleshooting

---

```
src/
  ├── controllers/       # Lógica de negócios
  ├── middleware/        # Middleware customizado (autenticação)
  ├── routes/           # Definição de rotas
  ├── types/            # Tipos TypeScript
  ├── utils/            # Utilitários (env, prisma)
  ├── validation/       # Schemas de validação com Zod
  ├── app.ts            # Configuração do Express
  └── server.ts         # Inicialização do servidor
```

## Próximos Passos

- [ ] Implementar exportação de dados (CSV/JSON)
- [ ] Adicionar testes unitários
- [ ] Implementar rate limiting
- [ ] Adicionar logs estruturados
- [ ] Implementar refresh tokens
- [ ] Adicionar endpoints de recuperação de senha
- [ ] Implementar backup automático do banco de dados

## Variáveis de Ambiente

```
DATABASE_URL="file:./dev.db"          # URL do banco de dados SQLite
JWT_SECRET="seu-secret-key"           # Chave para assinar JWTs
PORT=3000                              # Porta do servidor
NODE_ENV="development"                # Ambiente (development/production)
```

## Licença

Este projeto é parte da aplicação Hydro Time.
