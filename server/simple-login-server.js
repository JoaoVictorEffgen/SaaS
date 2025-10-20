// 🚀 Servidor Simples para Login
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./config/database');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '🚀 Servidor funcionando perfeitamente!', 
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Rota de login
app.post('/api/login', async (req, res) => {
  try {
    console.log('🔐 Tentativa de login:', req.body.email);
    
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário no banco
    const [users] = await sequelize.query(`
      SELECT id, nome, email, senha, tipo, ativo, empresa_id 
      FROM users 
      WHERE email = :email AND ativo = 1
    `, {
      replacements: { email }
    });

    if (users.length === 0) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }

    const user = users[0];
    console.log('👤 Usuário encontrado:', user.nome);

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      console.log('❌ Senha incorreta para:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        tipo: user.tipo 
      },
      'sua-chave-secreta-super-segura',
      { expiresIn: '24h' }
    );

    console.log('✅ Login realizado com sucesso para:', user.nome);

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        empresa_id: user.empresa_id
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado com sucesso!');
  console.log(`🔗 Porta: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🧪 Teste: http://localhost:${PORT}/api/test`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/login`);
  console.log('📋 Contas disponíveis:');
  console.log('   Cliente: cliente2@teste.com / 123456');
  console.log('   Empresa: business@teste.com / 123456');
  console.log('✅ Sistema pronto para uso!');
});

module.exports = app;
