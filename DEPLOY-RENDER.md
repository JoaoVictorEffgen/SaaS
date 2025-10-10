# 🚀 Deploy no Render - Sistema SaaS de Agendamentos

## ❌ **Problema Identificado:**
- **Erro:** `connect ECONNREFUSED 127.0.0.1:3306`
- **Causa:** Sistema tentando conectar no MySQL local, mas no Render precisa de banco externo

## ✅ **Solução Implementada:**

### **1️⃣ Sistema agora suporta PostgreSQL**
- ✅ Configuração dinâmica MySQL/PostgreSQL
- ✅ Dependências PostgreSQL adicionadas
- ✅ SSL automático para produção

### **2️⃣ Passo a Passo no Render:**

#### **Passo 1: Criar Banco PostgreSQL**
1. **No dashboard do Render:** "New" → "PostgreSQL"
2. **Configurar:**
   - **Name:** `saas-database`
   - **Database:** `saas_db`
   - **User:** `saas_user`
   - **Region:** `Oregon (US West)`
   - **Plan:** `Free`

#### **Passo 2: Deploy do Backend**
1. **No dashboard do Render:** "New" → "Web Service"
2. **Connect GitHub:** Selecione este repositório
3. **Configure:**
   - **Name:** `saas-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install --prefix server`
   - **Start Command:** `node server/mysql-server.js`
   - **Plan:** `Free`

#### **Passo 3: Configurar Variáveis de Ambiente**
No serviço do backend, vá em "Environment" e adicione:

```
NODE_ENV=production
DB_DIALECT=postgres
DB_NAME=saas_db
DB_USER=saas_user
DB_PASSWORD=[sua_senha_do_postgres]
DB_HOST=[host_do_postgres_render]
DB_PORT=5432
DB_SSL=true
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
```

**⚠️ Importante:** Substitua `[sua_senha_do_postgres]` e `[host_do_postgres_render]` pelos valores reais do seu banco PostgreSQL no Render.

#### **Passo 4: Deploy do Frontend**
1. **No dashboard do Render:** "New" → "Static Site"
2. **Configure:**
   - **Name:** `saas-frontend`
   - **Build Command:** `cd client && npm install && npm run build`
   - **Publish Directory:** `client/build`
   - **Environment Variables:**
     ```
     REACT_APP_API_URL=https://saas-backend.onrender.com/api
     ```

## 🔧 **Configuração Automática:**

### **Sistema detecta automaticamente:**
- ✅ **Produção:** Usa PostgreSQL
- ✅ **Desenvolvimento:** Usa MySQL local
- ✅ **SSL:** Ativado automaticamente em produção
- ✅ **Portas:** 5432 para PostgreSQL, 3306 para MySQL

### **Variáveis de Ambiente Suportadas:**
```
NODE_ENV=production          # Força PostgreSQL
DB_DIALECT=postgres         # Especifica PostgreSQL
DB_NAME=saas_db            # Nome do banco
DB_USER=saas_user          # Usuário do banco
DB_PASSWORD=sua_senha      # Senha do banco
DB_HOST=host_render        # Host do Render
DB_PORT=5432              # Porta PostgreSQL
DB_SSL=true               # SSL obrigatório
JWT_SECRET=seu_secret     # Secret do JWT
```

## 📱 **URLs Após Deploy:**

- **Frontend:** `https://saas-frontend.onrender.com`
- **Backend:** `https://saas-backend.onrender.com`
- **API:** `https://saas-backend.onrender.com/api`
- **Health Check:** `https://saas-backend.onrender.com/api/health`

## 👥 **Usuários de Teste:**

| Tipo | Login | Senha | ID Empresa |
|------|-------|-------|------------|
| 🏢 **Empresa** | `teste@empresa.com` | `empresa123` | - |
| 👨‍💼 **Funcionário** | `123.456.789-00` | `funcionario123` | `teste1234` |
| 👤 **Cliente** | `cliente@teste.com` | `cliente123` | - |

## 🔍 **Debug:**

### **Se ainda houver problemas:**

1. **Verifique os logs** no dashboard do Render
2. **Confirme variáveis de ambiente** estão corretas
3. **Teste conexão com banco** via logs
4. **Verifique se o banco PostgreSQL** está ativo

### **Logs importantes:**
```
✅ Conexão com PostgreSQL estabelecida com sucesso
🚀 Servidor MySQL rodando na porta 5000
🔗 API: https://saas-backend.onrender.com/api
```

## 🎉 **Deploy Funcionando!**

**Agora o sistema deve funcionar perfeitamente no Render!** ✨

### **Próximos Passos:**
1. **Criar banco PostgreSQL** no Render
2. **Deploy do backend** com variáveis corretas
3. **Deploy do frontend** apontando para o backend
4. **Testar sistema** com usuários fornecidos

**Sistema pronto para uso público no Render!** 🚀
