// =============================================
// CONFIGURAÇÕES DE AMBIENTE - SaaS AgendaPro
// =============================================

require('dotenv').config();

const config = {
  // Ambiente de execução
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || 'localhost',

  // Configurações do banco de dados MySQL
  database: {
    name: process.env.DB_NAME || 'SaaS_Novo',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Cecilia@2020',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306
  },

  // Configurações de segurança
  security: {
    jwtSecret: process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui_2024_agendapro_saas',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5001,http://192.168.0.7:3000'
  },

  // Configurações de upload
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 31457280, // 30MB
    baseUrl: process.env.UPLOAD_BASE_URL || 'http://localhost:5000/api/uploads',
    publicUrl: process.env.PUBLIC_UPLOAD_URL || 'http://localhost:5000/api/public/uploads'
  },

  // Configurações de email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@agendapro.com'
    }
  },

  // Configurações de rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000
  },

  // Configurações de pagamento
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    }
  },

  // Configurações de notificação
  notification: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
    }
  },

  // Configurações de aplicação
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:5000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    mobileApiUrl: process.env.MOBILE_API_URL || 'http://192.168.0.7:5000',
    mobileFrontendUrl: process.env.MOBILE_FRONTEND_URL || 'http://192.168.0.7:3000'
  },

  // Configurações de desenvolvimento
  development: {
    debug: process.env.DEBUG === 'true' || true,
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Configurações de produção
  production: {
    domain: process.env.PRODUCTION_DOMAIN || '',
    apiDomain: process.env.PRODUCTION_API_DOMAIN || '',
    ssl: {
      certPath: process.env.SSL_CERT_PATH || '',
      keyPath: process.env.SSL_KEY_PATH || ''
    }
  }
};

// Função para obter URL base baseada no ambiente
config.getBaseUrl = function() {
  if (config.NODE_ENV === 'production') {
    return config.production.apiDomain || config.app.apiUrl;
  }
  return config.app.apiUrl;
};

// Função para obter URL de upload baseada no ambiente
config.getUploadUrl = function() {
  if (config.NODE_ENV === 'production') {
    return config.production.apiDomain ? 
      `${config.production.apiDomain}/api/uploads` : 
      config.upload.baseUrl;
  }
  return config.upload.baseUrl;
};

// Função para obter URL de upload público baseada no ambiente
config.getPublicUploadUrl = function() {
  if (config.NODE_ENV === 'production') {
    return config.production.apiDomain ? 
      `${config.production.apiDomain}/api/public/uploads` : 
      config.upload.publicUrl;
  }
  return config.upload.publicUrl;
};

module.exports = config;
