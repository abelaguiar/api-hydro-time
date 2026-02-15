#!/bin/bash

# Script de teste da API Hydro Time

BASE_URL="http://localhost:3000"
EMAIL="test@example.com"
PASSWORD="senha123"
NAME="Usuário Teste"

echo "=== Testando API Hydro Time ==="
echo ""

# 1. Health Check
echo "1️⃣  Health Check"
curl -s "$BASE_URL/health" | jq .
echo ""
echo "---"
echo ""

# 2. Registrar novo usuário
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
echo "Token obtido: $TOKEN"
echo ""
echo "---"
echo ""

# 3. Fazer login
echo "3️⃣  Fazer login"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" | jq .
echo ""
echo "---"
echo ""

# 4. Obter dados do usuário
echo "4️⃣  Obter dados do usuário autenticado"
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# 5. Obter configurações do usuário
echo "5️⃣  Obter configurações do usuário"
curl -s -X GET "$BASE_URL/user/settings" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# 6. Atualizar configurações
echo "6️⃣  Atualizar configurações do usuário"
curl -s -X PUT "$BASE_URL/user/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"dailyGoalMl\": 3000,
    \"reminderIntervalMinutes\": 45,
    \"theme\": \"dark\",
    \"language\": \"pt-BR\"
  }" | jq .
echo ""
echo "---"
echo ""

# 7. Registrar ingestão de água
echo "7️⃣  Registrar ingestão de água (300ml)"
RESPONSE=$(curl -s -X POST "$BASE_URL/intake" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"amountMl\": 300,
    \"timestamp\": $(date +%s)000,
    \"durationSeconds\": 0
  }")
echo "$RESPONSE" | jq .
echo ""
echo "---"
echo ""

# 8. Registrar mais algumas ingestões
echo "8️⃣  Registrar mais ingestões de água"
for i in 250 200 500; do
  echo "Registrando ${i}ml..."
  curl -s -X POST "$BASE_URL/intake" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"amountMl\": $i,
      \"timestamp\": $(date +%s)000,
      \"durationSeconds\": 0
    }" | jq '.intakeLog.amountMl'
done
echo ""
echo "---"
echo ""

# 9. Listar histórico de ingestões
echo "9️⃣  Listar histórico de ingestões"
curl -s -X GET "$BASE_URL/intake" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# 10. Obter estatísticas
echo "🔟 Obter estatísticas do usuário"
curl -s -X GET "$BASE_URL/stats/overview" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

echo "✅ Testes concluídos!"
