const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Dados mockados para teste
const users = [
  {
    id: '1',
    nome: 'Admin',
    email: 'admin@agendapro.com',
    senha: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QqHh6e', // admin123
    plano: 'business',
    empresa: 'AgendaPro'
  },
  {
    id: '2',
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    senha: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QqHh6e', // 123456
    plano: 'free',
    empresa: 'Consultoria Silva'
  }
];

const agendas = [
  {
    id: '1',
    usuario_id: '2',
    titulo: 'Consulta de Psicologia',
    data: '2024-01-15',
    hora_inicio: '09:00',
    hora_fim: '17:00',
    duracao: 45,
    status: 'disponivel'
  }
];

const agendamentos = [
  {
    id: '1',
    agenda_id: '1',
    usuario_id: '2',
    cliente_nome: 'Maria Santos',
    cliente_email: 'maria@email.com',
    data: '2024-01-15',
    hora_inicio: '09:00',
    status: 'confirmado'
  }
];

// JWT Secret
const JWT_SECRET = 'seu_jwt_secret_super_seguro_aqui';

// Função para gerar token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Função para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Rotas públicas
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando! 🚀',
    timestamp: new Date().toISOString()
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = generateToken(user.id);
    
    res.json({
      message: 'Login realizado com sucesso!',
      user: { ...user, senha: undefined },
      token
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Cadastro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha, empresa } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const hashedSenha = await bcrypt.hash(senha, 12);
    const newUser = {
      id: (users.length + 1).toString(),
      nome,
      email,
      senha: hashedSenha,
      plano: 'free',
      empresa: empresa || ''
    };

    users.push(newUser);
    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: { ...newUser, senha: undefined },
      token
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Rotas protegidas
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  res.json({
    user: { ...user, senha: undefined },
    subscription: {
      plano: user.plano,
      status: 'ativo',
      recursos: {
        whatsapp: user.plano !== 'free',
        relatorios: user.plano !== 'free',
        multiusuario: user.plano === 'business'
      }
    }
  });
});

// Buscar agendas do usuário
app.get('/api/agendas', authenticateToken, (req, res) => {
  const userAgendas = agendas.filter(a => a.usuario_id === req.userId);
  res.json(userAgendas);
});

// Buscar agendamentos do usuário
app.get('/api/agendamentos', authenticateToken, (req, res) => {
  const userAgendamentos = agendamentos.filter(a => a.usuario_id === req.userId);
  res.json(userAgendamentos);
});

// Criar nova agenda
app.post('/api/agendas', authenticateToken, (req, res) => {
  try {
    const { titulo, data, hora_inicio, hora_fim, duracao } = req.body;
    
    const newAgenda = {
      id: (agendas.length + 1).toString(),
      usuario_id: req.userId,
      titulo,
      data,
      hora_inicio,
      hora_fim,
      duracao: duracao || 60,
      status: 'disponivel'
    };

    agendas.push(newAgenda);
    res.status(201).json(newAgenda);

  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Criar agendamento (cliente)
app.post('/api/agendamentos', (req, res) => {
  try {
    const { agenda_id, cliente_nome, cliente_email, data, hora_inicio } = req.body;
    
    const agenda = agendas.find(a => a.id === agenda_id);
    if (!agenda) {
      return res.status(404).json({ error: 'Agenda não encontrada' });
    }

    const newAgendamento = {
      id: (agendamentos.length + 1).toString(),
      agenda_id,
      usuario_id: agenda.usuario_id,
      cliente_nome,
      cliente_email,
      data,
      hora_inicio,
      status: 'pendente'
    };

    agendamentos.push(newAgendamento);
    res.status(201).json(newAgendamento);

  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Rota para agenda pública
app.get('/api/agendas/public/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const userAgendas = agendas.filter(a => a.usuario_id === userId);
  
  res.json({
    usuario: { nome: user.nome, empresa: user.empresa },
    agendas: userAgendas
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor simples rodando na porta ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📱 Health Check: http://localhost:${PORT}/api/health`);
  console.log('\n👥 Usuários de teste:');
  console.log('   • admin@agendapro.com / admin123');
  console.log('   • joao@exemplo.com / 123456');
}); 