#!/bin/bash

echo "🚀 Iniciando deploy do sistema SaaS..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

echo "📦 Instalando dependências do servidor..."
cd server && npm install

echo "📦 Instalando dependências do cliente..."
cd ../client && npm install

echo "🏗️ Buildando aplicação frontend..."
npm run build

echo "✅ Build concluído!"
echo ""
echo "🎯 Próximos passos:"
echo "1. Faça commit das alterações:"
echo "   git add ."
echo "   git commit -m 'Preparado para deploy'"
echo "   git push"
echo ""
echo "2. Acesse Railway.app ou Render.com"
echo "3. Conecte seu repositório GitHub"
echo "4. Configure as variáveis de ambiente"
echo "5. Aguarde o deploy automático"
echo ""
echo "📖 Consulte DEPLOY.md para instruções detalhadas"
