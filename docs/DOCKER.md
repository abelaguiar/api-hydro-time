# 🐳 Docker Setup - Hydro Time API com PostgreSQL

## 📋 Pré-requisitos

- Docker instalado (v20.10+)
- Docker Compose instalado (v2.0+)

## 🚀 Iniciar a Aplicação

### Opção 1: Produção (Recomendado)

```bash
# Build e inicia os containers
docker-compose up --build

# Ou (em background)
docker-compose up -d --build

# Ver logs
docker-compose logs -f api
```

A API estará disponível em: **http://localhost:3000**

### Opção 2: Desenvolvimento (Com Hot-Reload)

```bash
# Usa docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up --build

# Com live-reload e código-fonte montado como volume
```

## 📊 Banco de Dados PostgreSQL

### Conectar ao PostgreSQL

```bash
# Via Docker
docker-compose exec postgres psql -U hydro_user -d hydro_time

# Ou localmente (se instalado)
psql postgresql://hydro_user:hydro_password@localhost:5432/hydro_time

# Credentials
- Host: localhost (ou postgres no Docker)
- Port: 5432
- User: hydro_user
- Password: hydro_password
- Database: hydro_time
```

### Verificar Status

```bash
# Ver containers rodando
docker-compose ps

# Ver logs da API
docker-compose logs api

# Ver logs do PostgreSQL
docker-compose logs postgres

# Health check
curl http://localhost:3000/health
```

## 🔧 Operações Comuns

### Build do zero

```bash
docker-compose down --volumes  # Remove tudo inclusive dados
docker-compose up --build      # Reconstrói tudo
```

### Migrations

As migrations **rodam automaticamente** ao iniciar a API! ✅

Se precisar rodar manualmente:

```bash
# Rodar migrations
docker-compose exec api npx prisma migrate deploy

# Ver status das migrations
docker-compose exec api npx prisma migrate status

# Resetar banco (cuidado!)
docker-compose exec api npx prisma migrate reset
```

### Prisma Studio (GUI)

```bash
# Abrir Prisma Studio
docker-compose exec api npx prisma studio

# Acessa em http://localhost:5555
```

### Parar Containers

```bash
# Parar todos
docker-compose stop

# Remover containers
docker-compose down

# Remover tudo incluindo volumes
docker-compose down -v
```

## 📁 Volumes

### PostgreSQL
- **Nome:** `postgres_data`
- **Localização:** `/var/lib/postgresql/data`
- **Persiste:** dados entre restarts ✅

### API
- **Arquivo de logs:** `./logs` (local)
- **Código compilado:** `/app/dist`
- **Node modules:** `/app/node_modules`

## 🔍 Verificar Dados

### No PostgreSQL

```sql
-- Conectar
psql postgresql://hydro_user:hydro_password@localhost:5432/hydro_time

-- Ver tabelas
\dt

-- Ver dados
SELECT * FROM "User";
SELECT * FROM "UserSettings";
SELECT * FROM "IntakeLog";

-- Sair
\q
```

### Via Prisma Studio

```bash
docker-compose exec api npx prisma studio
```

Abre interface visual em `http://localhost:5555`

## 🧯 Troubleshooting

### "Connection refused" (Banco não conecta)

```bash
# Aguardar healthcheck passar
docker-compose logs postgres

# Ou re-iniciar
docker-compose restart postgres
```

### "ENOTFOUND postgres" (DNS não resolve)

```bash
# Garantir rede Docker
docker-compose down
docker-compose up --build
```

### Migrations falhando

```bash
# Ver logs detalhados
docker-compose logs api

# Resetar (cuidado com dados!)
docker-compose exec api npx prisma migrate reset

# Ou
docker-compose down -v
docker-compose up --build
```

### Porta 3000 já em uso

```bash
# Mudar porta no docker-compose.yml
ports:
  - "3001:3000"  # External:Internal

# Ou desligar o que está usando
lsof -i :3000
kill -9 <PID>
```

## 📊 Variáveis de Ambiente

### Arquivo `.env`
```env
DATABASE_URL="postgresql://hydro_user:hydro_password@postgres:5432/hydro_time?schema=public"
JWT_SECRET="hydro-time-secret-key-change-in-production"
PORT=3000
NODE_ENV="development"
```

### Para Produção
Alternar `NODE_ENV=production` e usar secrets seguros em `JWT_SECRET`

## 🔒 Notas de Segurança

⚠️ **Para Produção:**

1. **Mudar credenciais padrão**
   ```bash
   # Gerar senha forte
   openssl rand -base64 32
   ```

2. **Usar environment variables seguras**
   ```bash
   # Criar .env.prod
   DATABASE_URL=<sua-url-prod>
   JWT_SECRET=<chave-forte>
   ```

3. **Usar secrets do Docker**
   ```yaml
   # Para Docker Swarm
   secrets:
     db_password:
       file: ./secrets/db_password
   ```

4. **Networking seguro**
   - Não expor PostgreSQL porta 5432 em produção
   - Usar redes privadas

## 📈 Performance

### Otimizações aplicadas

✅ Multi-stage build (reduz tamanho da imagem)  
✅ Alpine Linux (imagem mini)  
✅ Only production dependencies  
✅ Health checks configurados  
✅ Auto-restart em caso de falha  

### Tamanho da imagem

```bash
docker images | grep hydro
```

### Monitorar recursos

```bash
docker stats hydro-api
docker stats hydro-postgres
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: username/hydro-api:latest
```

### Docker Hub

```bash
# Tag da imagem
docker build -t username/hydro-api:1.0.0 .

# Push
docker push username/hydro-api:1.0.0
```

## 📝 Logs

### Ver logs em tempo real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas API
docker-compose logs -f api

# Apenas Postgres
docker-compose logs -f postgres

# Últimas linhas
docker-compose logs --tail=50 api
```

### Persistir logs

Os logs da API são salvos em `./logs` (volume montado)

```bash
# Ver arquivo de logs
tail -f ./logs/app.log
```

## 🚀 Próximas Etapas

1. **Testar endpoints**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Ver dados no Studio**
   ```bash
   docker-compose exec api npx prisma studio
   ```

3. **Integrar com frontend**
   - Usar `REACT_APP_API_URL=http://localhost:3000`

4. **Deploy em produção**
   - Usar Docker Swarm ou Kubernetes
   - Configurar secrets seguros
   - Usar managed database (AWS RDS, Azure PostSQL, etc)

## ✨ Referência Rápida

```bash
# Build
docker-compose build

# Up
docker-compose up -d

# Down
docker-compose down

# Logs
docker-compose logs -f api

# Shell na API
docker-compose exec api sh

# Shell no Postgres
docker-compose exec postgres psql -U hydro_user -d hydro_time

# Status
docker-compose ps

# Limpar (Reset)
docker-compose down -v && docker-compose up --build
```

---

**Sua API está containerizada e pronta para produção!** 🎉
