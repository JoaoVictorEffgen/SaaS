// Forçar uso do banco correto
process.env.DB_NAME = 'SaaS_Novo';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'Cecilia@2020';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3306';

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./config/database');
const { User, Empresa } = require('./models');
const { SECURITY_CONFIG } = require('./packages/shared/constants');
const cors = require('cors');

const app = express();
const PORT = 5001; // Porta diferente

// Middlewares
app.use(cors());
app.use(express.json());

console.log('🔍 FORÇANDO configuração MySQL:', {
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '🚀 Servidor funcionando perfeitamente!', 
    timestamp: new Date(),
    database: sequelize.options.database
  });
});

// Rota de login (compatibilidade com frontend)
app.post('/api/login', async (req, res) => {
  // Redirecionar para a lógica de login
  return handleLogin(req, res);
});

// Rota de login para usuários (rota que o frontend espera)
app.post('/api/users/login', async (req, res) => {
  return handleLogin(req, res);
});

// Função de login compartilhada
async function handleLogin(req, res) {
  try {
    const { email, senha } = req.body;
    console.log('🔍 Tentando login para:', email);

    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'nome', 'email', 'senha', 'tipo', 'ativo', 'empresa_id']
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    // Buscar dados da empresa se for empresa
    let empresaData = null;
    if (user.tipo === 'empresa' && user.empresa_id) {
      empresaData = await Empresa.findOne({
        where: { id: user.empresa_id },
        attributes: ['id', 'nome', 'logo_url', 'logo_sistema']
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo, empresaId: user.empresa_id },
      SECURITY_CONFIG.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Login bem-sucedido para:', email);
    res.json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        ativo: user.ativo,
        empresa: empresaData
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// Iniciar o servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor iniciado na porta ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com MySQL estabelecida com sucesso');
    console.log('📊 Banco de dados:', sequelize.options.database);
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error);
  }
});
