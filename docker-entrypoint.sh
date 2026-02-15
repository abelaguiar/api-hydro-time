#!/bin/sh
set -e

echo "🔄 Aguardando banco de dados estar pronto..."
sleep 5

echo "📦 Gerando Prisma Client..."
npx prisma generate

echo "🗄️  Executando migrations..."
npx prisma migrate deploy

echo "✅ Migrations concluídas!"
echo "🚀 Iniciando aplicação..."

exec "$@"
