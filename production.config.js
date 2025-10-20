// =============================================
// CONFIGURAÇÕES DE PRODUÇÃO - SaaS AgendaPro
// =============================================

module.exports = {
  // Ambiente de execução
  NODE_ENV: 'production',
  
  // Porta do servidor
  PORT: 5000,
  
  // Configurações do banco de dados MySQL
  database: {
    name: 'SaaS_Novo',
    user: 'saas_user',
    password: 'saas_password_secure_2024',
    host: 'mysql',
    port: 3306
  },
  
  // Configurações de segurança
  security: {
    jwtSecret: 'jwt_secret_super_secure_production_2024_agendapro_saas',
    corsOrigin: 'https://seudominio.com,https://www.seudominio.com'
  },
  
  // Configurações de upload
  upload: {
    dir: 'uploads',
    maxFileSize: 31457280 // 30MB
  },
  
  // Configurações de email
  email: {
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      user: 'seu_email@gmail.com',
      pass: 'sua_senha_app'
    }
  },
  
  // Configurações de rate limiting
  rateLimit: {
    windowMs: 900000, // 15 minutos
    maxRequests: 100
  },
  
  // Configurações de produção
  production: {
    debug: false,
    logLevel: 'error'
  }
};
