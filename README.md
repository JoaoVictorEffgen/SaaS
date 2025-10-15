# 🏢 Sistema SaaS de Agendamentos

Sistema completo de agendamentos para empresas, com interface moderna e funcionalidades avançadas.

## 📋 Índice

- [🚀 Instalação Rápida](#-instalação-rápida)
- [🏗️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [👥 Tipos de Usuário](#-tipos-de-usuário)
- [🔧 Configuração](#-configuração)
- [📱 Funcionalidades](#-funcionalidades)
- [🛠️ API Endpoints](#️-api-endpoints)
- [🎨 Interface](#-interface)
- [🔒 Segurança](#-segurança)
- [📊 Banco de Dados](#-banco-de-dados)
- [🧪 Testes](#-testes)
- [🚀 Deploy](#-deploy)

---

## 🚀 Instalação Rápida

### Pré-requisitos
- Node.js 16+
- MySQL 8.0+
- Git

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd projeto-saas
```

### 2. Instale as dependências
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure o banco de dados
```bash
# Copie o arquivo de exemplo
cd ../server
cp env.example .env

# Configure suas credenciais MySQL no .env
DB_NAME=agendamentos_saas
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
```

### 4. Inicie o sistema
```bash
# No Windows
start-system.bat

# Ou manualmente
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd client
npm start
```

### 5. Acesse o sistema
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

---

## 🏗️ Estrutura do Projeto

```
projeto-saas/
├── 📁 client/                 # Frontend React
│   ├── 📁 public/            # Arquivos públicos
│   ├── 📁 src/
│   │   ├── 📁 components/    # Componentes React
│   │   ├── 📁 modules/       # Módulos organizados
│   │   ├── 📁 services/      # Serviços de API
│   │   └── 📁 contexts/      # Contextos React
│   └── 📄 package.json
├── 📁 server/                 # Backend Node.js
│   ├── 📁 config/            # Configurações
│   ├── 📁 middleware/        # Middlewares
│   ├── 📁 models/            # Modelos do banco
│   ├── 📁 routes/            # Rotas da API
│   └── 📄 package.json
├── 📁 imagens/               # Imagens do projeto
└── 📄 README.md
```

---

## 👥 Tipos de Usuário

### 🏢 **Empresa**
- **Função:** Administra serviços, funcionários e agendamentos
- **Acesso:** Dashboard completo, configurações, relatórios
- **Funcionalidades:**
  - Gerenciar serviços e preços
  - Cadastrar funcionários
  - Visualizar agendamentos
  - Configurar horários de funcionamento
  - Upload de logo e imagem de fundo
  - Criar pacotes personalizados
  - Gerenciar promoções

### 👨‍💼 **Funcionário**
- **Função:** Atende clientes e gerencia sua agenda
- **Acesso:** Agenda pessoal, perfil do funcionário
- **Funcionalidades:**
  - Visualizar agendamentos do dia
  - Confirmar/cancelar agendamentos
  - Ver dados da empresa onde trabalha
  - Gerenciar status dos atendimentos

### 👤 **Cliente**
- **Função:** Agenda serviços com empresas
- **Acesso:** Seleção de empresas, agendamentos
- **Funcionalidades:**
  - Visualizar empresas disponíveis
  - Ver promoções ativas
  - Fazer agendamentos
  - Acompanhar status dos agendamentos

---

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# Banco de Dados
DB_NAME=agendamentos_saas
DB_USER=root
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=3306

# JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui_2024

# Servidor
PORT=5000
NODE_ENV=development
```

### Configuração do MySQL
```sql
CREATE DATABASE agendamentos_saas;
CREATE USER 'agendamentos_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON agendamentos_saas.* TO 'agendamentos_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📱 Funcionalidades

### 🎯 **Principais Recursos**

#### **Para Empresas:**
- ✅ Dashboard com KPIs e métricas
- ✅ Gerenciamento de serviços e preços
- ✅ Cadastro e gestão de funcionários
- ✅ Configuração de horários de funcionamento
- ✅ Upload de logo e imagem de fundo
- ✅ Sistema de pacotes personalizados
- ✅ Criação e gestão de promoções
- ✅ Relatórios e exportação de dados
- ✅ Interface responsiva e moderna

#### **Para Funcionários:**
- ✅ Agenda pessoal com agendamentos do dia
- ✅ Confirmação/cancelamento de agendamentos
- ✅ Visualização de dados da empresa
- ✅ Interface mobile-friendly

#### **Para Clientes:**
- ✅ Visualização de empresas disponíveis
- ✅ Cards com imagem de fundo personalizada
- ✅ Visualização de promoções ativas
- ✅ Sistema de agendamentos intuitivo
- ✅ Acompanhamento de status

### 🎨 **Interface e UX**
- **Design Moderno:** Interface limpa e profissional
- **Responsivo:** Funciona em desktop, tablet e mobile
- **PWA:** Aplicativo web progressivo instalável
- **Tema Consistente:** Cores e tipografia padronizadas
- **Feedback Visual:** Loading states e mensagens claras

### 🔒 **Segurança**
- **Autenticação JWT:** Tokens seguros para autenticação
- **Permissões Granulares:** Cada tipo de usuário tem acesso específico
- **Validação de Dados:** Validação completa no frontend e backend
- **Rate Limiting:** Proteção contra ataques de força bruta
- **CORS Configurado:** Políticas de segurança adequadas

---

## 🛠️ API Endpoints

### 🔐 **Autenticação**
```
POST /api/users/login          # Login de usuários
POST /api/users/register       # Registro de usuários
GET  /api/users/profile        # Perfil do usuário
```

### 🏢 **Empresas**
```
GET    /api/empresas           # Listar empresas
GET    /api/empresas/:id       # Buscar empresa específica
PUT    /api/empresas/:id       # Atualizar empresa
GET    /api/empresas/:id/promocoes # Promoções da empresa
```

### 👨‍💼 **Funcionários**
```
GET /api/funcionarios/empresa           # Dados da empresa do funcionário
GET /api/funcionarios/agendamentos      # Agendamentos do funcionário
PUT /api/funcionarios/agendamento/:id/status # Atualizar status do agendamento
```

### 👤 **Clientes**
```
GET /api/clientes/empresas     # Empresas disponíveis para clientes
GET /api/clientes/empresa/:id  # Detalhes de uma empresa específica
```

### 📦 **Pacotes e Promoções**
```
GET    /api/pacotes            # Listar pacotes
POST   /api/pacotes            # Criar pacote
PUT    /api/pacotes/:id        # Atualizar pacote
DELETE /api/pacotes/:id        # Deletar pacote

GET    /api/promocoes          # Listar promoções
POST   /api/promocoes          # Criar promoção
PUT    /api/promocoes/:id      # Atualizar promoção
DELETE /api/promocoes/:id      # Deletar promoção
```

### 📁 **Upload de Arquivos**
```
POST /api/upload/imagem-fundo  # Upload de imagem de fundo
GET  /api/uploads/imagens/:filename # Servir arquivos estáticos
```

---

## 🎨 Interface

### 🖥️ **Telas Principais**

#### **Página Inicial**
- Seleção de tipo de usuário
- Formulários de login/cadastro
- Interface moderna e intuitiva

#### **Dashboard Empresa**
- KPIs e métricas importantes
- Resumo de agendamentos
- Acesso rápido às funcionalidades
- Logo da empresa personalizada

#### **Configurações da Empresa**
- Dados básicos da empresa
- Upload de logo e imagem de fundo
- Configuração de horários
- Redes sociais e descrição

#### **Gerenciamento de Serviços**
- Lista de serviços oferecidos
- Preços e duração
- Status ativo/inativo
- Interface de edição inline

#### **Gerenciamento de Funcionários**
- Lista de funcionários
- Dados pessoais e cargo
- Status ativo/inativo
- Vinculação com empresa

#### **Área do Cliente**
- Cards das empresas disponíveis
- Imagem de fundo personalizada
- Promoções em destaque
- Filtros e busca

### 🎯 **Componentes Reutilizáveis**
- **Modais:** Confirmação, edição, criação
- **Formulários:** Validação e feedback
- **Cards:** Empresas, serviços, agendamentos
- **Navegação:** Breadcrumbs e menu lateral
- **Loading:** Estados de carregamento
- **Notificações:** Feedback de ações

---

## 🔒 Segurança

### 🛡️ **Medidas Implementadas**

#### **Autenticação e Autorização**
- **JWT Tokens:** Autenticação segura com expiração
- **Middleware de Permissões:** Verificação de tipo de usuário
- **Rotas Protegidas:** Acesso baseado em permissões
- **Validação de Sessão:** Verificação contínua de autenticação

#### **Validação de Dados**
- **Frontend:** Validação em tempo real nos formulários
- **Backend:** Validação completa de todos os inputs
- **Sanitização:** Limpeza de dados maliciosos
- **Tipos de Dados:** Verificação de tipos e formatos

#### **Proteção de Rotas**
- **Empresas:** Acesso apenas aos próprios dados
- **Funcionários:** Dados apenas da empresa vinculada
- **Clientes:** Acesso apenas a dados públicos
- **Upload:** Verificação de tipo e tamanho de arquivos

### 🔐 **Middleware de Segurança**
```javascript
// Verificação de propriedade da empresa
checkEmpresaOwnership

// Verificação de funcionário vinculado
checkFuncionarioEmpresa

// Verificação de tipo de cliente
checkIsCliente

// Verificação de tipo de empresa
checkIsEmpresa
```

---

## 📊 Banco de Dados

### 🗄️ **Estrutura das Tabelas**

#### **users**
```sql
- id (PK)
- tipo (empresa, funcionario, cliente)
- nome, email, telefone
- cpf, cnpj
- empresa_id (FK para funcionários)
- senha (hash bcrypt)
- ativo (boolean)
- timestamps
```

#### **empresas**
```sql
- id (PK)
- user_id (FK para users)
- nome, cnpj, telefone
- endereco, cidade, estado, cep
- descricao, horario_funcionamento (JSON)
- logo_url, imagem_fundo_url
- website, instagram, whatsapp
- ativo (boolean)
- timestamps
```

#### **agendamentos**
```sql
- id (PK)
- cliente_id (FK)
- funcionario_id (FK)
- empresa_id (FK)
- data, hora
- status (enum)
- observacoes, valor_total
- timestamps de confirmação/realização
```

#### **pacotes_personalizados**
```sql
- id (PK)
- empresa_id (FK)
- nome, descricao
- limite_agendamentos, limite_funcionarios
- preco_mensal
- funcionalidades (JSON)
- ativo (boolean)
- timestamps
```

#### **promocoes**
```sql
- id (PK)
- empresa_id (FK)
- nome, descricao
- tipo_desconto (enum)
- valor_desconto, meses_gratis
- codigo_promocional
- data_inicio, data_fim
- limite_uso, uso_atual
- destaque, ativo (boolean)
- timestamps
```

### 🔗 **Relacionamentos**
- **User → Empresa:** Um usuário empresa tem uma empresa
- **User → Empresa (funcionário):** Funcionário pertence a uma empresa
- **Empresa → Agendamentos:** Empresa tem muitos agendamentos
- **Empresa → Pacotes:** Empresa cria pacotes personalizados
- **Empresa → Promoções:** Empresa cria promoções

---

## 🧪 Testes

### 👤 **Usuários de Teste**

#### **Empresa**
```
Email: rede@teste.com
Senha: 123456
Tipo: empresa
```

#### **Cliente**
```
Email: cliente@teste.com
Senha: 123456
Tipo: cliente
```

#### **Funcionário**
```
Email: funcionario@teste.com
Senha: 123456
Tipo: funcionario
Empresa: Vinculado à empresa do teste
```

### 🔍 **Como Testar**

#### **1. Upload de Plano de Fundo**
1. Login como empresa (rede@teste.com / 123456)
2. Vá em Configurações da Empresa
3. Seção "Plano de Fundo da Empresa"
4. Faça upload de uma imagem
5. Veja o preview e confirme
6. Acesse /cliente para ver no card

#### **2. Testar Permissões**
- **Empresa:** Pode fazer upload e alterar configurações ✅
- **Funcionário:** Vê apenas dados da sua empresa ✅
- **Cliente:** Vê apenas empresas ativas ✅

#### **3. Testar Funcionalidades**
- Criar serviços e funcionários
- Fazer agendamentos
- Criar pacotes e promoções
- Upload de imagens
- Configurações de horários

### 🧪 **Modo de Teste**
O sistema possui um modo de teste que desabilita redirecionamentos automáticos:
```javascript
// Em RedirectHandler.js e TypedProtectedRoute.js
const TEST_MODE = true; // Altere para false em produção
```

---

## 🚀 Deploy

### 🌐 **Deploy em Produção**

#### **Backend (Node.js)**
```bash
# Instalar PM2 para gerenciamento de processos
npm install -g pm2

# Iniciar aplicação
pm2 start server/index.js --name "agendamentos-api"

# Configurar para iniciar com o sistema
pm2 startup
pm2 save
```

#### **Frontend (React)**
```bash
# Build de produção
cd client
npm run build

# Servir com nginx ou Apache
# Copiar arquivos da pasta build/ para servidor web
```

#### **Banco de Dados**
```bash
# Backup do banco
mysqldump -u root -p agendamentos_saas > backup.sql

# Restaurar em produção
mysql -u root -p agendamentos_saas < backup.sql
```

### 🔧 **Configuração de Produção**
```env
# .env de produção
NODE_ENV=production
DB_HOST=seu-host-producao
DB_NAME=agendamentos_saas_prod
JWT_SECRET=jwt_secret_muito_seguro_producao
```

### 📊 **Monitoramento**
- **PM2:** Monitoramento de processos Node.js
- **MySQL:** Logs de consultas e performance
- **Nginx:** Logs de acesso e erros
- **Health Check:** `/api/health` para verificar status

---

## 📞 Suporte

### 🐛 **Problemas Comuns**

#### **Erro de Conexão com Banco**
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar credenciais no .env
# Testar conexão manual
mysql -u usuario -p -h localhost agendamentos_saas
```

#### **Erro de Upload de Imagens**
```bash
# Verificar permissões da pasta uploads
chmod 755 server/uploads/

# Verificar espaço em disco
df -h
```

#### **Erro de CORS**
```bash
# Verificar configuração CORS no server/index.js
# Adicionar domínio de produção se necessário
```

### 📝 **Logs Importantes**
- **Backend:** Console do Node.js com logs detalhados
- **Frontend:** Console do navegador (F12)
- **Banco:** Logs do MySQL
- **Upload:** Logs de erro em server/uploads/

---

## 🎉 Conclusão

Este sistema SaaS de agendamentos oferece:

✅ **Interface moderna e responsiva**  
✅ **Sistema de permissões robusto**  
✅ **Funcionalidades completas para todos os tipos de usuário**  
✅ **Upload de imagens personalizadas**  
✅ **Sistema de pacotes e promoções**  
✅ **API bem estruturada e documentada**  
✅ **Segurança implementada em todas as camadas**  
✅ **Fácil instalação e configuração**  
✅ **Pronto para produção**

**🚀 O sistema está completo e pronto para uso!**