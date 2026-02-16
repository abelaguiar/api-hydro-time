#!/bin/bash

set -e

echo "🐳 Hydro Time API - Docker Setup"
echo "=================================="
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"
echo ""

# Menu de opções
echo "Selecione uma opção:"
echo "1. Iniciar API com PostgreSQL (Produção)"
echo "2. Iniciar API com PostgreSQL (Desenvolvimento - Hot Reload)"
echo "3. Parar containers"
echo "4. Resetar tudo (remover volumes e dados)"
echo "5. Ver logs"
echo "6. Acessar Prisma Studio"
echo "7. Sair"
echo ""

read -p "Digite sua opção (1-7): " option

case $option in
    1)
        echo "🚀 Iniciando API em modo PRODUÇÃO..."
        docker-compose up --build
        ;;
    2)
        echo "🔄 Iniciando API em modo DESENVOLVIMENTO (com hot-reload)..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    3)
        echo "🛑 Parando containers..."
        docker-compose down
        echo "✅ Containers parados"
        ;;
    4)
        echo "⚠️  Isso vai remover TODOS os dados! Tem certeza? (s/n)"
        read -p "Confirmar: " confirm
        if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
            echo "🗑️  Removendo volumes e containers..."
            docker-compose down -v
            echo "✅ Tudo removido. Você pode iniciar novamente."
        else
            echo "❌ Operação cancelada"
        fi
        ;;
    5)
        echo "📋 Logs em tempo real (Ctrl+C para sair):"
        echo ""
        docker-compose logs -f api
        ;;
    6)
        echo "🎨 Abrindo Prisma Studio..."
        docker-compose exec api npx prisma studio
        ;;
    7)
        echo "👋 Bye!"
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac
