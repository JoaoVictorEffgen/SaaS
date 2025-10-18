# 📦 Arquitetura de Pacotes - Sistema SaaS

## 🏗️ Estrutura Organizada

O sistema foi reorganizado em pacotes separados para melhor organização, segurança e manutenibilidade.

### 📁 Estrutura de Pacotes

```
server/packages/
├── 🔒 security/          # Segurança e autenticação
│   ├── auth.js          # Gerenciamento de JWT e senhas
│   └── middleware.js    # Middlewares de segurança
├── 🌐 public/            # Rotas públicas (sem autenticação)
│   └── routes.js        # Health check, info do sistema
├── 🔒 private/           # Rotas protegidas por tipo de usuário
│   └── routes.js        # Rotas específicas por tipo
├── 🏗️ core/              # Funcionalidades centrais
│   ├── database.js      # Gerenciamento do banco
│   └── services.js      # Serviços compartilhados
├── 📦 shared/            # Código compartilhado
│   └── constants.js     # Constantes e configurações
├── 🔄 legacy/            # Compatibilidade com rotas existentes
│   └── routes.js        # Rotas antigas mantidas
└── index.js             # Integração principal
```

## 🔒 Segurança Implementada

### 🛡️ **Pacote Security**
- **Autenticação JWT** com tokens seguros
- **Hash de senhas** com bcrypt (12 rounds)
- **Rate limiting** configurável
- **Sanitização de dados** automática
- **Validação de entrada** robusta
- **Middleware de permissões** por tipo de usuário

### 🔐 **Medidas de Segurança**
```javascript
// Exemplo de uso
const AuthSecurity = require('./packages/security/auth');
const SecurityMiddleware = require('./packages/security/middleware');

// Gerar hash seguro
const hash = await authSecurity.hashPassword('senha123');

// Verificar senha
const isValid = await authSecurity.verifyPassword('senha123', hash);

// Middleware de autenticação
app.use('/api/private', securityMiddleware.authenticateToken);
```

## 🌐 Separação Pública vs Privada

### 📢 **Rotas Públicas** (`/api/public`)
- ✅ Health check do sistema
- ✅ Informações públicas do sistema
- ✅ Lista de empresas (dados limitados)
- ✅ **Sem autenticação necessária**

### 🔒 **Rotas Privadas** (`/api`)
- ✅ **Requer autenticação JWT**
- ✅ Separadas por tipo de usuário:
  - `/api/empresa/*` - Apenas empresas
  - `/api/funcionario/*` - Apenas funcionários
  - `/api/cliente/*` - Apenas clientes
- ✅ Middleware de permissões específicas

## 🏗️ Funcionalidades Centrais

### 📊 **Gerenciamento de Banco**
```javascript
const databaseManager = require('./packages/core/database');

// Inicializar
await databaseManager.initialize();

// Executar transação
await databaseManager.transaction(async (t) => {
  // Operações atômicas
});

// Obter modelo
const User = databaseManager.getModel('User');
```

### 🔧 **Serviços Compartilhados**
```javascript
const coreServices = require('./packages/core/services');

// Validação
const validation = coreServices.getValidationService();
const isValidEmail = validation.validateEmail('user@example.com');

// Cache
const cache = coreServices.getCacheService();
cache.set('key', 'value', 300000); // 5 minutos
const value = cache.get('key');
```

## 📋 Constantes e Configurações

### ⚙️ **Configurações Centralizadas**
```javascript
const { SYSTEM_CONSTANTS, VALIDATION_RULES } = require('./packages/shared/constants');

// Tipos de usuário
const userType = SYSTEM_CONSTANTS.USER_TYPES.EMPRESA;

// Status de agendamento
const status = SYSTEM_CONSTANTS.AGENDAMENTO_STATUS.CONFIRMADO;

// Regras de validação
const nomeRule = VALIDATION_RULES.USER.nome;
```

## 🔄 Compatibilidade

### 📜 **Rotas Legadas**
- ✅ **Todas as rotas existentes mantidas**
- ✅ **Funcionamento idêntico ao anterior**
- ✅ **Migração gradual possível**
- ✅ **Sem breaking changes**

### 🛠️ **Como Usar**

#### **1. Iniciar Servidor**
```bash
cd server
node index.js
```

#### **2. Rotas Disponíveis**
```
# Públicas
GET  /api/public/health
GET  /api/public/info
GET  /api/public/empresas

# Privadas (requer autenticação)
GET  /api/empresa/dashboard
GET  /api/funcionario/agenda
GET  /api/cliente/empresas

# Legadas (mantidas para compatibilidade)
GET  /api/users/profile
GET  /api/empresas
POST /api/users/login
```

#### **3. Exemplo de Uso com Autenticação**
```javascript
// Frontend
const response = await fetch('/api/empresa/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🚀 Benefícios da Nova Arquitetura

### ✅ **Organização**
- Código separado por responsabilidade
- Fácil localização de funcionalidades
- Estrutura clara e previsível

### ✅ **Segurança**
- Middleware de segurança robusto
- Separação de rotas públicas/privadas
- Validação e sanitização automáticas

### ✅ **Manutenibilidade**
- Pacotes independentes
- Fácil adição de novas funcionalidades
- Testes isolados por pacote

### ✅ **Escalabilidade**
- Estrutura preparada para crescimento
- Cache e otimizações centralizadas
- Configurações flexíveis

### ✅ **Compatibilidade**
- Zero breaking changes
- Migração gradual
- Rotas existentes funcionando

## 🔧 Configuração

### 📝 **Variáveis de Ambiente**
```env
# Banco de Dados
DB_NAME=agendamentos_saas
DB_USER=root
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=3306

# Segurança
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui_2024

# Servidor
PORT=5000
NODE_ENV=development
```

### 🛠️ **Desenvolvimento**
```bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm start
```

## 📊 Monitoramento

### 📈 **Health Check**
```bash
curl http://localhost:5000/api/health
```

### 📋 **Informações do Sistema**
```bash
curl http://localhost:5000/api/public/info
```

### 🔍 **Logs de Segurança**
- Todas as tentativas de acesso são logadas
- Erros de autenticação registrados
- Rate limiting monitorado

## 🎯 Próximos Passos

1. **Migração Gradual**: Migrar rotas antigas para nova estrutura
2. **Testes**: Implementar testes para cada pacote
3. **Documentação**: Documentar APIs de cada pacote
4. **Monitoramento**: Adicionar métricas e alertas
5. **Cache**: Implementar cache distribuído
6. **Rate Limiting**: Configurar limites específicos por endpoint

---

**🎉 Sistema completamente reorganizado e seguro!**
