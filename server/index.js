const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');

// Importar e configurar modelos
const User = require('./models/User');
const Empresa = require('./models/Empresa');
const Servico = require('./models/Servico');
const Agendamento = require('./models/Agendamento');

// Relacionamentos são configurados em models/index.js

const authRoutes = require('./routes/auth');
const empresasRoutes = require('./routes/empresas');
const usersRoutes = require('./routes/users');
const agendamentosRoutes = require('./routes/agendamentos');
const redesRoutes = require('./routes/redes');
const pacotesRoutes = require('./routes/pacotes');
const promocoesRoutes = require('./routes/promocoes');
const uploadRoutes = require('./routes/upload');
const funcionariosRoutes = require('./routes/funcionarios');
const clientesRoutes = require('./routes/clientes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api/', limiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logs de requisição
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'SaaS Agendamento API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      empresas: '/api/empresas',
      users: '/api/users',
      agendamentos: '/api/agendamentos',
      redes: '/api/redes',
      pacotes: '/api/pacotes',
      promocoes: '/api/promocoes',
      health: '/api/health'
    }
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/redes', redesRoutes);
app.use('/api/pacotes', pacotesRoutes);
app.use('/api/promocoes', promocoesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/clientes', clientesRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map(e => e.message)
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Conflito de dados',
      message: 'Este registro já existe'
    });
  }
  
  res.status(err.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicialização do servidor
async function startServer() {
  try {
    // Testar conexão com banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');
    
    // Sincronizar modelos (em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados com o banco');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Recebido SIGTERM, encerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Recebido SIGINT, encerrando servidor...');
  await sequelize.close();
  process.exit(0);
}); 