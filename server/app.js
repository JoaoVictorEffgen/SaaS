// =============================================
// SERVIDOR PRINCIPAL - SaaS AgendaPro
// =============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar configurações
const { ENV_CONFIG } = require('./packages/shared/constants');

const app = express();

// =============================================
// MIDDLEWARES DE SEGURANÇA
// =============================================

// Helmet para segurança HTTP
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitado para desenvolvimento
  crossOriginEmbedderPolicy: false
}));

// CORS configurado
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limite de requisições
  message: {
    error: 'Muitas requisições deste IP, tente novamente mais tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

app.use('/api/', limiter);

// =============================================
// MIDDLEWARES DE PARSING
// =============================================

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// =============================================
// ARQUIVOS ESTÁTICOS
// =============================================

// Criar diretório de uploads se não existir
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.mkdirSync(path.join(uploadDir, 'fotos-perfil'), { recursive: true });
  fs.mkdirSync(path.join(uploadDir, 'logos-empresa'), { recursive: true });
}

// Servir arquivos estáticos
app.use('/api/uploads', express.static(uploadDir));

// =============================================
// ROTAS DA API
// =============================================

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({
    message: '🚀 Servidor SaaS AgendaPro funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    database: process.env.DB_NAME,
    port: process.env.PORT
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});

// Importar rotas principais
try {
  // Rotas de autenticação
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);

  // Rotas de upload de fotos
  const uploadFotosRoutes = require('./routes/upload-fotos');
  app.use('/api/upload-fotos', uploadFotosRoutes);

  // Rotas de redes empresariais
  const redesRoutes = require('./routes/redes');
  app.use('/api/redes', redesRoutes);

  // Rotas de empresa funcionários
  const empresaFuncionariosRoutes = require('./routes/empresa-funcionarios');
  app.use('/api/empresas', empresaFuncionariosRoutes);

  console.log('✅ Rotas carregadas com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar rotas:', error.message);
}

// =============================================
// ROTA DE FALLBACK
// =============================================

app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: 'Esta rota não existe no servidor SaaS AgendaPro',
    availableRoutes: [
      'GET /api/test - Teste do servidor',
      'GET /api/health - Status de saúde',
      'POST /api/auth/login - Login de usuário',
      'POST /api/upload-fotos/perfil - Upload de foto de perfil',
      'POST /api/upload-fotos/logo-empresa/:empresaId - Upload de logo da empresa'
    ]
  });
});

// =============================================
// MIDDLEWARE DE ERRO GLOBAL
// =============================================

app.use((error, req, res, next) => {
  console.error('❌ Erro no servidor:', error);
  
  res.status(error.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});

// =============================================
// INICIALIZAÇÃO DO SERVIDOR
// =============================================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, HOST, () => {
  console.log('🚀 =============================================');
  console.log('🚀 SERVIDOR SAAS AGENDAPRO INICIADO');
  console.log('🚀 =============================================');
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://${HOST}:${PORT}`);
  console.log(`📊 Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`🧪 Teste: http://${HOST}:${PORT}/api/test`);
  console.log(`📁 Uploads: http://${HOST}:${PORT}/api/uploads`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'SaaS_Novo'}`);
  console.log(`📱 Mobile Access: http://192.168.0.7:${PORT}/api/test`);
  console.log('🚀 =============================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

module.exports = app;
