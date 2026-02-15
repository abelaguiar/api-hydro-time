#!/bin/bash

# Script de teste completo da API em Docker
# Use este script para testar todos os endpoints após iniciar docker-compose

BASE_URL="http://localhost:3000"
EMAIL="docker-test-$(date +%s)@example.com"
PASSWORD="senha123"
NAME="Docker Test User"

echo "🚀 Testando API Hydro Time em Docker"
echo "===================================="
echo ""

# Aguardar API estar pronta
echo "⏳ Aguardando API estar pronta..."
for i in {1..30}; do
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo "✅ API está pronta!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ API não respondeu após 30 tentativas"
        exit 1
    fi
    echo "  Tentativa $i/30..."
    sleep 1
done

echo ""
echo "1️⃣  Health Check"
curl -s "$BASE_URL/health" | jq .
echo -e "\n"

echo "2️⃣  Registrar novo usuário"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$NAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")
echo "$RESPONSE" | jq .
TOKEN=$(echo "$RESPONSE" | jq -r '.token')
echo "Token obtido: ${TOKEN:0:20}..."
echo ""

echo "3️⃣  Fazer login"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" | jq .
echo ""

echo "4️⃣  Obter dados do usuário"
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "5️⃣  Carregar configurações"
curl -s -X GET "$BASE_URL/user/settings" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "6️⃣  Atualizar configurações"
curl -s -X PUT "$BASE_URL/user/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"dailyGoalMl\": 3000,
    \"theme\": \"dark\"
  }" | jq .
echo ""

echo "7️⃣  Registrar ingestão de água (300ml)"
INTAKE=$(curl -s -X POST "$BASE_URL/intake" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"amountMl\": 300,
    \"timestamp\": $(date +%s)000
  }")
echo "$INTAKE" | jq .
INTAKE_ID=$(echo "$INTAKE" | jq -r '.intakeLog.id')
echo ""

echo "8️⃣  Registrar mais ingestões"
for amount in 250 200 500; do
    echo "  Registrando ${amount}ml..."
    curl -s -X POST "$BASE_URL/intake" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"amountMl\": $amount,
        \"timestamp\": $(date +%s)000
      }" | jq '.intakeLog.amountMl'
done
echo ""

echo "9️⃣  Listar histórico"
curl -s -X GET "$BASE_URL/intake" \
  -H "Authorization: Bearer $TOKEN" | jq '.intakeLogs | length, .[0:2]'
echo ""

echo "🔟 Obter estatísticas"
curl -s -X GET "$BASE_URL/stats/overview" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "1️⃣1️⃣  Deletar um registro"
if [ ! -z "$INTAKE_ID" ] && [ "$INTAKE_ID" != "null" ]; then
    curl -s -X DELETE "$BASE_URL/intake/$INTAKE_ID" \
      -H "Authorization: Bearer $TOKEN" | jq .
else
    echo "Nenhum intake para deletar"
fi
echo ""

echo "1️⃣2️⃣  Exportar dados (JSON)"
curl -s -X GET "$BASE_URL/user/export" \
  -H "Authorization: Bearer $TOKEN" | jq '. | {user, summary}'
echo ""

echo "✅ Testes concluídos com sucesso!"
echo ""
echo "📊 Próximos passos:"
echo "  1. Acessar Prisma Studio: docker-compose exec api npx prisma studio"
echo "  2. Ver logs: docker-compose logs -f api"
echo "  3. Conectar ao PostgreSQL:"
echo "     docker-compose exec postgres psql -U hydro_user -d hydro_time"
