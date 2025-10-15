// 📦 Pacote Principal - Integração de Todos os Módulos
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Importar pacotes
const databaseManager = require('./core/database');
const coreServices = require('./core/services');
const SecurityMiddleware = require('./security/middleware');
const PublicRoutes = require('./public/routes');
const PrivateRoutes = require('./private/routes');
const LegacyRoutes = require('./legacy/routes');
const { SECURITY_CONFIG, ENV_CONFIG } = require('./shared/constants');

class Application {
  constructor() {
    this.app = express();
    this.securityMiddleware = new SecurityMiddleware();
    this.publicRoutes = new PublicRoutes();
    this.privateRoutes = new PrivateRoutes();
    this.legacyRoutes = new LegacyRoutes();
    this.initialized = false;
  }

  /**
   * Configura middlewares de segurança
   */
  setupSecurityMiddlewares() {
    console.log('🛡️ [APP] Configurando middlewares de segurança...');

    // Helmet para headers de segurança
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS
    this.app.use(cors(SECURITY_CONFIG.CORS));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
      max: SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS,
      message: {
        success: false,
        message: 'Muitas requisições. Tente novamente em alguns minutos.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Sanitização de dados
    this.app.use(this.securityMiddleware.sanitizeData);

    // Log de segurança
    this.app.use(this.securityMiddleware.securityLogger);

    console.log('✅ [APP] Middlewares de segurança configurados');
  }

  /**
   * Configura middlewares básicos
   */
  setupBasicMiddlewares() {
    console.log('🔧 [APP] Configurando middlewares básicos...');

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging de requisições
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    console.log('✅ [APP] Middlewares básicos configurados');
  }

  /**
   * Configura rotas
   */
  setupRoutes() {
    console.log('🛣️ [APP] Configurando rotas...');

    // Rotas públicas
    this.app.use('/api/public', this.publicRoutes.getRoutes());

    // Rotas privadas
    this.app.use('/api', this.privateRoutes.getRoutes());

    // Rotas legadas (compatibilidade)
    this.app.use('/api', this.legacyRoutes.getRoutes());

    // Rota de health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: ENV_CONFIG.NODE_ENV,
        version: '1.0.0'
      });
    });

    // Rota de fallback
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        path: req.originalUrl
      });
    });

    console.log('✅ [APP] Rotas configuradas');
  }

  /**
   * Configura tratamento de erros
   */
  setupErrorHandling() {
    console.log('⚠️ [APP] Configurando tratamento de erros...');

    // Middleware de tratamento de erros
    this.app.use((error, req, res, next) => {
      console.error('❌ [APP] Erro capturado:', error);

      // Erro de validação
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details || error.message
        });
      }

      // Erro de autenticação
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }

      // Erro de autorização
      if (error.name === 'ForbiddenError') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      // Erro de banco de dados
      if (error.name === 'SequelizeError') {
        return res.status(500).json({
          success: false,
          message: 'Erro interno do banco de dados'
        });
      }

      // Erro genérico
      res.status(error.status || 500).json({
        success: false,
        message: ENV_CONFIG.NODE_ENV === 'development' 
          ? error.message 
          : 'Erro interno do servidor'
      });
    });

    console.log('✅ [APP] Tratamento de erros configurado');
  }

  /**
   * Inicializa a aplicação
   */
  async initialize() {
    if (this.initialized) {
      return this.app;
    }

    try {
      console.log('🚀 [APP] Inicializando aplicação...');

      // 1. Inicializar banco de dados
      await databaseManager.initialize();

      // 2. Inicializar serviços centrais
      await coreServices.initialize();

      // 3. Configurar middlewares
      this.setupBasicMiddlewares();
      this.setupSecurityMiddlewares();

      // 4. Configurar rotas
      this.setupRoutes();

      // 5. Configurar tratamento de erros
      this.setupErrorHandling();

      this.initialized = true;
      console.log('✅ [APP] Aplicação inicializada com sucesso');

      return this.app;
    } catch (error) {
      console.error('❌ [APP] Erro ao inicializar aplicação:', error);
      throw error;
    }
  }

  /**
   * Inicia o servidor
   */
  async start(port = ENV_CONFIG.PORT) {
    try {
      await this.initialize();
      
      this.server = this.app.listen(port, () => {
        console.log(`🌐 [APP] Servidor rodando na porta ${port}`);
        console.log(`🔗 [APP] URL: http://localhost:${port}`);
        console.log(`📊 [APP] Health Check: http://localhost:${port}/api/health`);
        console.log(`🌍 [APP] Ambiente: ${ENV_CONFIG.NODE_ENV}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));

      return this.server;
    } catch (error) {
      console.error('❌ [APP] Erro ao iniciar servidor:', error);
      throw error;
    }
  }

  /**
   * Para o servidor graciosamente
   */
  async gracefulShutdown() {
    console.log('🛑 [APP] Iniciando shutdown gracioso...');

    if (this.server) {
      this.server.close(() => {
        console.log('✅ [APP] Servidor HTTP fechado');
      });
    }

    try {
      await databaseManager.close();
      console.log('✅ [APP] Banco de dados desconectado');
    } catch (error) {
      console.error('❌ [APP] Erro ao fechar banco de dados:', error);
    }

    console.log('✅ [APP] Shutdown gracioso concluído');
    process.exit(0);
  }

  /**
   * Retorna informações da aplicação
   */
  getAppInfo() {
    return {
      initialized: this.initialized,
      environment: ENV_CONFIG.NODE_ENV,
      version: '1.0.0',
      database: {
        connected: databaseManager.isConnected()
      },
      services: coreServices.getStats()
    };
  }

  /**
   * Retorna instância da aplicação
   */
  getApp() {
    return this.app;
  }
}

// Instância singleton
const application = new Application();

module.exports = application;
