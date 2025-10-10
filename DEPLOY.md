# 🚀 Deploy do Sistema SaaS de Agendamentos

## 📋 Opções de Deploy Gratuito

### 1️⃣ **Railway (Recomendado)**
- ✅ **Gratuito:** 500 horas/mês
- ✅ **Fácil:** Deploy automático via GitHub
- ✅ **MySQL:** Incluído
- ✅ **Domínio:** railway.app

**Como fazer:**
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project" → "Deploy from GitHub repo"
4. Selecione este repositório
5. Railway detectará automaticamente o `railway.json`
6. Configure as variáveis de ambiente:
   ```
   DB_HOST=containers-us-west-xxx.railway.app
   DB_USER=root
   DB_PASSWORD=seu_password
   DB_NAME=railway
   DB_PORT=3306
   NODE_ENV=production
   PORT=5000
   ```
7. Aguarde o deploy (2-3 minutos)

### 2️⃣ **Render**
- ✅ **Gratuito:** 750 horas/mês
- ✅ **PostgreSQL:** Incluído
- ✅ **Domínio:** onrender.com

**Como fazer:**
1. Acesse [render.com](https://render.com)
2. Conecte sua conta GitHub
3. Clique em "New +" → "Blueprint"
4. Selecione este repositório
5. Render detectará o `render.yaml`
6. Clique em "Apply" e aguarde

### 3️⃣ **Heroku (Alternativa)**
- ⚠️ **Pago:** Apenas planos pagos disponíveis
- ✅ **PostgreSQL:** Incluído
- ✅ **Domínio:** herokuapp.com

## 🔧 Configuração do Banco de Dados

### Para Railway (MySQL):
```bash
# Variáveis de ambiente
DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=seu_password_mysql
DB_NAME=railway
DB_PORT=3306
```

### Para Render (PostgreSQL):
```bash
# Variáveis de ambiente
DB_HOST=dpg-xxxxxxxxxxxxx-a.oregon-postgres.render.com
DB_USER=saas_user
DB_PASSWORD=seu_password_postgres
DB_NAME=saas_db
DB_PORT=5432
```

## 📱 URLs de Teste

Após o deploy, você terá:
- **Frontend:** `https://seu-projeto.railway.app` ou `https://seu-projeto.onrender.com`
- **API:** `https://seu-projeto.railway.app/api` ou `https://seu-projeto.onrender.com/api`

## 👥 Usuários de Teste

### 🏢 **Empresa:**
- **Email:** `teste@empresa.com`
- **Senha:** `empresa123`

### 👨‍💼 **Funcionário:**
- **CPF:** `123.456.789-00`
- **Senha:** `funcionario123`
- **ID da Empresa:** `teste1234`

### 👤 **Cliente:**
- **Email:** `cliente@teste.com`
- **Senha:** `cliente123`

## 🔐 Acesso ao Sistema

1. **Acesse a URL do deploy**
2. **Escolha seu tipo de usuário:**
   - **Empresa:** Para gerenciar agendamentos
   - **Cliente:** Para fazer agendamentos
   - **Funcionário:** Para confirmar agendamentos

## 📊 Funcionalidades Disponíveis

### ✅ **Empresas podem:**
- Cadastrar empresa com logo
- Gerenciar funcionários
- Configurar serviços
- Ver relatórios de agendamentos
- Confirmar/cancelar agendamentos

### ✅ **Clientes podem:**
- Buscar empresas por localização
- Fazer agendamentos
- Ver histórico de agendamentos
- Cancelar agendamentos

### ✅ **Funcionários podem:**
- Ver agenda do dia
- Confirmar agendamentos
- Marcar como realizado
- Ver histórico

## 🛠️ Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Railway/Render
2. Confirme se as variáveis de ambiente estão corretas
3. Teste a conexão com o banco de dados

## 📈 Monitoramento

- **Railway:** Dashboard com métricas em tempo real
- **Render:** Logs e métricas de performance
- **Uptime:** 99.9% de disponibilidade

---

**🎉 Sistema pronto para testes públicos!**
