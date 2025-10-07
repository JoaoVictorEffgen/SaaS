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
    id: 1,
    nome: 'Barbearia Moderna',
    email: 'contato@barbeariamoderna.com',
    senha: 'empresa123',
    tipo: 'empresa',
    telefone: '(11) 99999-9999',
    cnpj: '12.345.678/0001-90',
    razao_social: 'Barbearia Moderna Ltda'
  },
  {
    id: 2,
    nome: 'João Silva',
    email: 'joao@barbeariamoderna.com',
    senha: 'funcionario123',
    tipo: 'funcionario',
    cpf: '123.456.789-00',
    empresa_id: 1,
    cargo: 'Barbeiro'
  },
  {
    id: 3,
    nome: 'Maria Santos',
    email: 'maria@email.com',
    senha: 'cliente123',
    tipo: 'cliente',
    telefone: '(11) 99999-9999',
    cpf: '987.654.321-00'
  }
];

const empresas = [
  {
    id: 1,
    user_id: 1,
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    descricao: 'A melhor barbearia da cidade',
    latitude: -23.5505, // Coordenadas de São Paulo
    longitude: -46.6333,
    horario_funcionamento: JSON.stringify({
      segunda: { inicio: "08:00", fim: "18:00" },
      terca: { inicio: "08:00", fim: "18:00" },
      quarta: { inicio: "08:00", fim: "18:00" },
      quinta: { inicio: "08:00", fim: "18:00" },
      sexta: { inicio: "08:00", fim: "18:00" },
      sabado: { inicio: "08:00", fim: "16:00" },
      domingo: null
    }),
    logo_url: null
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

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'SaaS Agendamento API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      empresas: '/api/empresas',
      login: '/api/users/login',
      auth: '/api/auth/login'
    }
  });
});

// Rotas públicas
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando! 🚀',
    timestamp: new Date().toISOString()
  });
});

// Login - Rota compatível com o frontend
app.post('/api/users/login', async (req, res) => {
  try {
    const { identifier, senha, tipo } = req.body;
    
    console.log('🔍 Tentativa de login:', { identifier, tipo });
    
    // Buscar usuário por email, telefone, CNPJ ou CPF
    let user = users.find(u => 
      u.email === identifier || 
      u.telefone === identifier || 
      u.cnpj === identifier ||
      u.cpf === identifier
    );
    
    // Filtrar por tipo se especificado
    if (tipo && user && user.tipo !== tipo) {
      user = null;
    }
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha (simplificado para teste)
    if (user.senha !== senha) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id.toString());
    
    console.log('✅ Login bem-sucedido:', user.nome);
    
    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        tipo: user.tipo,
        cpf: user.cpf,
        cnpj: user.cnpj,
        empresa_id: user.empresa_id,
        cargo: user.cargo,
        foto_url: user.foto_url
      },
      token
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login - Rota original (mantida para compatibilidade)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (user.senha !== senha) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = generateToken(user.id.toString());
    
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

// Buscar todas as empresas
app.get('/api/empresas', (req, res) => {
  console.log('🔍 Buscando empresas...');
  
  // Transformar dados das empresas para o formato esperado pelo frontend
  const empresasFormatadas = empresas.map(empresa => {
    const user = users.find(u => u.id === empresa.user_id);
    return {
      id: empresa.id,
      user_id: empresa.user_id,
      endereco: empresa.endereco,
      cidade: empresa.cidade,
      estado: empresa.estado,
      cep: empresa.cep,
      descricao: empresa.descricao,
      latitude: empresa.latitude,
      longitude: empresa.longitude,
      horario_funcionamento: empresa.horario_funcionamento,
      logo_url: empresa.logo_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Dados do usuário (empresa)
      nome: user?.nome || 'Empresa',
      email: user?.email || '',
      telefone: user?.telefone || '',
      cnpj: user?.cnpj || ''
    };
  });
  
  console.log('📊 Empresas encontradas:', empresasFormatadas.length);
  res.json(empresasFormatadas);
});

// Buscar empresa por ID
app.get('/api/empresas/:id', (req, res) => {
  const empresa = empresas.find(e => e.id == req.params.id);
  
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa não encontrada' });
  }
  
  const user = users.find(u => u.id === empresa.user_id);
  const empresaCompleta = {
    ...empresa,
    nome: user?.nome || 'Empresa',
    email: user?.email || '',
    telefone: user?.telefone || '',
    cnpj: user?.cnpj || ''
  };
  
  res.json(empresaCompleta);
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
  console.log('   🏢 EMPRESA:');
  console.log('      Email: contato@barbeariamoderna.com');
  console.log('      CNPJ: 12.345.678/0001-90');
  console.log('      Senha: empresa123');
  console.log('   👨‍💼 FUNCIONÁRIO:');
  console.log('      CPF: 123.456.789-00');
  console.log('      Senha: funcionario123');
  console.log('   👤 CLIENTE:');
  console.log('      Email: maria@email.com');
  console.log('      Telefone: (11) 99999-9999');
  console.log('      Senha: cliente123');
}); 