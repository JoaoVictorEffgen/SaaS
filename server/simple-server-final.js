const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middlewares
app.use(cors());
app.use(express.json());

console.log('🚀 Iniciando servidor simples...');

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '🚀 Servidor funcionando perfeitamente!', 
    timestamp: new Date(),
    status: 'OK'
  });
});

// Rota de login para usuários (rota que o frontend espera)
app.post('/api/users/login', async (req, res) => {
  try {
    const { identifier, senha, tipo } = req.body;
    console.log('🔍 Tentando login para:', identifier, 'tipo:', tipo);

    // Contas especiais com planos diferentes
    let userData = {
      id: 1,
      nome: 'Usuário Teste',
      email: identifier,
      tipo: tipo || 'cliente',
      ativo: true,
      plano: 'trial' // plano padrão
    };

    // Conta Business com todas as funcionalidades
    if (identifier === 'business@teste.com') {
      userData = {
        id: 2,
        nome: 'Empresa Business',
        email: 'business@teste.com',
        tipo: 'empresa',
        ativo: true,
        plano: 'business',
        empresa: {
          id: 1,
          nome: 'Empresa Business',
          logo_url: null,
          logo_sistema: null
        }
      };
    }

    // Conta Pro com funcionalidades intermediárias
    if (identifier === 'pro@teste.com') {
      userData = {
        id: 3,
        nome: 'Empresa Pro',
        email: 'pro@teste.com',
        tipo: 'empresa',
        ativo: true,
        plano: 'pro',
        empresa: {
          id: 2,
          nome: 'Empresa Pro',
          logo_url: null,
          logo_sistema: null
        }
      };
    }

    const token = jwt.sign(
      { 
        id: userData.id, 
        email: userData.email, 
        tipo: userData.tipo,
        plano: userData.plano
      },
      'seu_jwt_secret_super_seguro_aqui_2024',
      { expiresIn: '1h' }
    );

    console.log('✅ Login bem-sucedido para:', identifier, 'plano:', userData.plano);
    res.json({
      message: 'Login bem-sucedido!',
      token,
      user: userData
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota de login alternativa
app.post('/api/login', async (req, res) => {
  return handleLogin(req, res);
});

async function handleLogin(req, res) {
  try {
    const { email, senha } = req.body;
    console.log('🔍 Tentando login para:', email);

    // Simular login bem-sucedido
    const token = jwt.sign(
      { id: 1, email: email, tipo: 'cliente' },
      'seu_jwt_secret_super_seguro_aqui_2024',
      { expiresIn: '1h' }
    );

    console.log('✅ Login bem-sucedido para:', email);
    res.json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: 1,
        nome: 'Usuário Teste',
        email: email,
        tipo: 'cliente',
        ativo: true
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor iniciado na porta ${PORT}`);
  console.log(`✅ Teste: http://localhost:${PORT}/api/test`);
  console.log(`✅ Login: http://localhost:${PORT}/api/users/login`);
  console.log(`📱 Mobile: http://192.168.0.7:${PORT}/api/test`);
});
