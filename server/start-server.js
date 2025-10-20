// 🚀 Servidor Simples para Teste
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

// Servir arquivos estáticos
app.use('/api/uploads', express.static('uploads'));

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: '🚀 Servidor funcionando perfeitamente!', timestamp: new Date() });
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
      message: 'Erro interno do servidor' 
    });
  }
});

// Rota para buscar dados da empresa
app.get('/api/empresas/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [empresas] = await sequelize.query(`
      SELECT * FROM empresas WHERE user_id = :userId
    `, {
      replacements: { userId }
    });

    if (empresas.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }

    res.json({
      success: true,
      data: empresas[0]
    });

  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Rota para atualizar empresa
app.put('/api/empresas/:empresaId', async (req, res) => {
  try {
    const { empresaId } = req.params;
    const dadosEmpresa = req.body;
    
    await sequelize.query(`
      UPDATE empresas 
      SET nome = :nome, endereco = :endereco, cidade = :cidade, estado = :estado, cep = :cep, whatsapp = :whatsapp, updated_at = NOW()
      WHERE id = :empresaId
    `, {
      replacements: { 
        empresaId,
        nome: dadosEmpresa.nome,
        endereco: dadosEmpresa.endereco,
        cidade: dadosEmpresa.cidade,
        estado: dadosEmpresa.estado,
        cep: dadosEmpresa.cep,
        whatsapp: dadosEmpresa.whatsapp
      }
    });

    res.json({
      success: true,
      message: 'Empresa atualizada com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar empresa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
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
  console.log('📋 Conta Business criada:');
  console.log('   Email: business@teste.com');
  console.log('   Senha: 123456');
  console.log('✅ Sistema pronto para uso!');
});

module.exports = app;
