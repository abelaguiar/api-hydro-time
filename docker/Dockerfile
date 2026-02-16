# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json package-lock.json ./
RUN npm ci && apk add --no-cache openssl ca-certificates

# Copiar código-fonte e prisma
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json .

# Gerar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Instalar apenas dependências de produção
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force && apk add --no-cache openssl ca-certificates

# Copiar Prisma schema e migrations
COPY prisma ./prisma

# Copiar código compilado do builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiar entrypoint script
COPY docker/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Criar diretório de logs
RUN mkdir -p /app/logs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Usar entrypoint para rodar migrations
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
