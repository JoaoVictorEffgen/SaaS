const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./config/database');
const { User, Empresa } = require('./models');
const { SECURITY_CONFIG } = require('./packages/shared/constants');
const cors = require('cors');

const app = express();
const PORT = 5001; // Porta diferente para evitar conflito

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: '🚀 Servidor funcionando perfeitamente!', timestamp: new Date() });
});

// Rota de login simplificada
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log('🔍 Tentando login para:', email);

    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'nome', 'email', 'senha', 'tipo', 'ativo', 'empresa_id']
    });

    if (!user) {
      console.log('❌ Usuário não encontrado para email:', email);
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    console.log('👤 Usuário encontrado:', {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      ativo: user.ativo
    });

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    console.log('🔐 Senha válida:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Senha incorreta para usuário:', email);
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    // Se for empresa, buscar dados da empresa
    let empresaData = null;
    if (user.tipo === 'empresa' && user.empresa_id) {
      empresaData = await Empresa.findOne({
        where: { id: user.empresa_id },
        attributes: ['id', 'nome', 'logo_url', 'logo_sistema']
      });
      console.log('🏢 Empresa associada:', empresaData ? {
        id: empresaData.id,
        nome: empresaData.nome,
        logo_url: empresaData.logo_url,
        logo_sistema: empresaData.logo_sistema
      } : 'Nenhuma');
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
});

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
