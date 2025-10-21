# 🔧 Configurações de Ambiente - SaaS AgendaPro

## 📋 Arquivos de Configuração

### **1. Arquivo .env**
Localização: `server/.env`

```env
# Ambiente de execução
NODE_ENV=development
PORT=5000
HOST=localhost

# Banco de dados MySQL
DB_NAME=SaaS_Novo
DB_USER=root
DB_PASSWORD=Cecilia@2020
DB_HOST=127.0.0.1
DB_PORT=3306

# Segurança
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_2024_agendapro_saas
CORS_ORIGIN=http://localhost:3000,http://localhost:5001,http://192.168.0.7:3000

# Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=31457280
UPLOAD_BASE_URL=http://localhost:5000/api/uploads
PUBLIC_UPLOAD_URL=http://localhost:5000/api/public/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### **2. Arquivo de Configuração JavaScript**
Localização: `server/config/environment.js`

Centraliza todas as configurações e fornece funções utilitárias para URLs.

## 🚀 Rotas de Upload

### **Uploads Autenticados**
- **Endpoint:** `/api/upload-fotos/perfil`
- **Endpoint:** `/api/upload-fotos/logo-empresa/:empresaId`
- **Endpoint:** `/api/upload-fotos/logo-sistema/:empresaId`
- **Autenticação:** Requerida (JWT)

### **Uploads Públicos (Durante Cadastro)**
- **Endpoint:** `/api/public/uploads/foto-perfil`
- **Endpoint:** `/api/public/uploads/logo-empresa`
- **Endpoint:** `/api/public/uploads/documento`
- **Autenticação:** Não requerida
- **Validação:** Apenas durante cadastro público

## 🔐 Segurança

### **Validação de Upload Público**
- Verifica se o upload é feito durante cadastro público
- Valida origem da requisição (Referer)
- Arquivos temporários expiram em 24 horas
- Tipos de arquivo permitidos por categoria

### **Tipos de Arquivo Permitidos**
- **Foto de Perfil:** JPEG, PNG, GIF, WebP
- **Logo da Empresa:** JPEG, PNG, GIF, WebP
- **Documentos:** PDF, JPEG, PNG

## 📁 Estrutura de Diretórios

```
server/uploads/
├── fotos-perfil/     # Fotos de perfil dos usuários
├── logos-empresa/    # Logos das empresas
├── documentos/       # Documentos (CNPJ, etc.)
└── temp/            # Arquivos temporários
```

## 🌐 URLs Baseadas em Ambiente

### **Desenvolvimento**
- Base URL: `http://localhost:5000`
- Uploads: `http://localhost:5000/api/uploads`
- Uploads Públicos: `http://localhost:5000/api/public/uploads`

### **Produção**
- Base URL: Configurável via `PRODUCTION_API_DOMAIN`
- Uploads: `${PRODUCTION_API_DOMAIN}/api/uploads`
- Uploads Públicos: `${PRODUCTION_API_DOMAIN}/api/public/uploads`

## 🔄 Como Usar

### **1. Configurar Ambiente**
```bash
# Copiar arquivo de exemplo
cp server/env.example server/.env

# Editar configurações
nano server/.env
```

### **2. Iniciar Servidor**
```bash
cd server
npm start
```

### **3. Testar Upload Público**
```bash
# Upload de foto de perfil
curl -X POST \
  http://localhost:5000/api/public/uploads/foto-perfil \
  -H "Referer: http://localhost:3000/cadastro" \
  -F "foto_perfil=@foto.jpg"
```

### **4. Testar Upload Autenticado**
```bash
# Upload de logo da empresa
curl -X POST \
  http://localhost:5000/api/upload-fotos/logo-empresa/1 \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -F "logo_empresa=@logo.png"
```

## 📊 Monitoramento

### **Logs de Upload**
- Todos os uploads são logados
- Erros são capturados e retornados
- Arquivos temporários são rastreados

### **Métricas**
- Tamanho dos arquivos
- Tipos de arquivo
- Origem das requisições
- Taxa de sucesso/erro

## 🔧 Configurações Avançadas

### **Rate Limiting**
- Janela de tempo: 15 minutos
- Limite de requisições: 1000 por IP
- Skip de requisições bem-sucedidas

### **CORS**
- Origins permitidos configuráveis
- Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS
- Headers permitidos: Content-Type, Authorization

### **Upload Limits**
- Tamanho máximo: 30MB
- Tipos de arquivo validados
- Validação de origem para uploads públicos

## 🚨 Troubleshooting

### **Erro de CORS**
- Verificar `CORS_ORIGIN` no arquivo .env
- Adicionar domínio do frontend

### **Erro de Upload**
- Verificar tamanho do arquivo (máximo 30MB)
- Verificar tipo de arquivo permitido
- Verificar permissões do diretório

### **Erro de Banco de Dados**
- Verificar credenciais no arquivo .env
- Verificar se o MySQL está rodando
- Verificar se o banco existe

## ✅ Status

- [x] Arquivo .env criado
- [x] Configurações centralizadas
- [x] Rotas públicas de upload
- [x] URLs baseadas em variáveis de ambiente
- [x] Validação de upload público
- [x] Documentação completa
