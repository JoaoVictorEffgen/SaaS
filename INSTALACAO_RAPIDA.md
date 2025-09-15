# 🚀 Instalação Rápida - SaaS de Agendamento Online

## ⚡ Instalação em 5 minutos

### 1. Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL 14+ instalado e rodando
- Git instalado

### 2. Clone e instalação
```bash
# Clone o repositório
git clone <seu-repositorio>
cd saas-agendamento-online

# Instale todas as dependências
npm run install-all
```

### 3. Configure o banco de dados
```bash
# Crie o banco PostgreSQL
createdb saas_agendamento

# Configure as variáveis de ambiente
cp server/env.example server/.env
# Edite server/.env com suas credenciais

# Execute o setup do banco
npm run setup-db
```

### 4. Execute o projeto
```bash
# Em um terminal
npm run dev

# Ou separadamente:
# Terminal 1: npm run server
# Terminal 2: npm run client
```

### 5. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## 🔑 Usuários de Teste

Após executar `npm run setup-db`, você terá:

### Usuário Administrador
- **Email**: admin@agendapro.com
- **Senha**: admin123
- **Plano**: Business (acesso total)

### Usuário de Exemplo
- **Email**: joao@exemplo.com
- **Senha**: 123456
- **Plano**: Free (10 agendamentos/mês)

## 🐳 Usando Docker (Alternativa)

Se preferir usar Docker:

```bash
# Instale Docker e Docker Compose
# Execute:
docker-compose up -d

# Para parar:
docker-compose down
```

## 📱 Funcionalidades Principais

### ✅ Implementadas
- [x] Sistema de autenticação completo
- [x] Modelos de banco de dados
- [x] API REST com Express
- [x] Frontend React responsivo
- [x] Landing page profissional
- [x] Sistema de planos (Free/Pro/Business)
- [x] Middleware de autenticação
- [x] Validação de dados
- [x] Estrutura de rotas protegidas
- [x] Contexto de autenticação React
- [x] Serviços de API organizados
- [x] Estilização com Tailwind CSS
- [x] Script de setup do banco

### ✅ Funcionalidades Implementadas
- [x] Páginas de login/registro
- [x] Dashboard principal
- [x] Gerenciamento de agendas
- [x] Sistema de agendamentos
- [x] Sistema de funcionários com agenda
- [x] Interface de seleção de empresas
- [x] Sistema de autenticação local

### 🚧 Em Desenvolvimento
- [ ] Integração com Stripe
- [ ] Notificações por e-mail/WhatsApp
- [ ] Relatórios e analytics avançados

## 🛠️ Estrutura do Projeto

```
├── server/                 # Backend Node.js + Express
│   ├── config/            # Configurações (DB, etc.)
│   ├── controllers/       # Controladores das rotas
│   ├── middleware/        # Middlewares (auth, validação)
│   ├── models/            # Modelos Sequelize
│   ├── routes/            # Definição das rotas
│   ├── services/          # Serviços externos
│   └── scripts/           # Scripts de setup
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Contextos React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços de API
│   │   └── utils/         # Utilitários
│   └── public/            # Arquivos estáticos
└── docs/                  # Documentação
```

## 🔧 Configurações Importantes

### Variáveis de Ambiente (server/.env)
```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_agendamento
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro

# Serviços Externos
STRIPE_SECRET_KEY=sua_chave_stripe
SENDGRID_API_KEY=sua_chave_sendgrid
TWILIO_ACCOUNT_SID=sua_account_twilio
```

### Portas Padrão
- **Frontend**: 3000
- **Backend**: 5000
- **PostgreSQL**: 5432
- **Redis**: 6379 (opcional)

## 🚨 Solução de Problemas

### Erro de conexão com banco
```bash
# Verifique se PostgreSQL está rodando
sudo systemctl status postgresql

# Teste a conexão
psql -h localhost -U postgres -d saas_agendamento
```

### Erro de dependências
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro de porta em uso
```bash
# Encontre o processo usando a porta
lsof -i :3000
lsof -i :5000

# Mate o processo
kill -9 <PID>
```

## 📚 Próximos Passos

1. **Integrações externas**:
   - Stripe para pagamentos
   - SendGrid para e-mails
   - Twilio para WhatsApp

2. **Analytics avançados**:
   - Relatórios detalhados
   - Métricas de conversão
   - Dashboard de KPIs

3. **Deploy**:
   - Configure produção
   - Use PM2 ou similar
   - Configure SSL/HTTPS

4. **Melhorias futuras**:
   - Sistema de notificações push
   - Integração com calendários externos
   - App mobile

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**🎉 Parabéns!** Seu SaaS de Agendamento Online está rodando localmente.

**💡 Dica**: Use os usuários de teste para explorar a aplicação e entender o fluxo. 