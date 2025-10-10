const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { sequelize, User, Empresa, Servico, Agendamento } = require('./models');
const { Op } = require('sequelize');
const { uploadLogo, serveImage, getImageUrl } = require('./upload-service');

// Função para gerar ID da empresa (nome + 4 dígitos aleatórios)
function generateCompanyId(companyName) {
  const cleanName = companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 15);
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  return `${cleanName}${randomNumber}`;
}

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentar limite para uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Para FormData
app.use(express.static(path.join(__dirname, 'uploads'))); // Servir arquivos estáticos

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
    message: 'SaaS Agendamento API - MySQL Version',
    version: '1.0.0',
    status: 'running',
    database: 'MySQL',
    endpoints: {
      health: '/api/health',
      empresas: '/api/empresas',
      login: '/api/users/login',
      register: '/api/users/register'
    }
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'OK', 
      message: 'Servidor funcionando! 🚀',
      database: 'MySQL conectado ✅',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erro de conexão com banco',
      error: error.message 
    });
  }
});

// Login - Rota compatível com o frontend
app.post('/api/users/login', async (req, res) => {
  try {
    const { identifier, senha, tipo, companyIdentifier } = req.body;
    
    console.log('🔍 Tentativa de login MySQL:', { identifier, tipo, companyIdentifier });
    
    let user;
    
    if (tipo === 'funcionario' && companyIdentifier) {
      // Para funcionários, primeiro encontrar a empresa pelo ID ou email
      const empresa = await Empresa.findOne({
        where: {
          [Op.or]: [
            { identificador_empresa: companyIdentifier },
            { '$owner.email$': companyIdentifier }
          ]
        },
        include: [{
          model: User,
          as: 'owner',
          attributes: ['email']
        }]
      });
      
      if (!empresa) {
        console.log('❌ Empresa não encontrada:', companyIdentifier);
        return res.status(401).json({ error: 'Empresa não encontrada' });
      }
      
      // Buscar funcionário dentro dessa empresa
      user = await User.findOne({
        where: {
          empresa_id: empresa.id,
          tipo: 'funcionario',
          [Op.or]: [
            { email: identifier },
            { cpf: identifier }
          ]
        }
      });
      
    } else {
      // Para outros tipos de usuário, busca normal
      user = await User.findOne({
        where: {
          [Op.or]: [
            { email: identifier },
            { telefone: identifier },
            { cnpj: identifier },
            { cpf: identifier }
          ]
        }
      });
      
      // Filtrar por tipo se especificado
      if (tipo && user && user.tipo !== tipo) {
        user = null;
      }
    }
    
    if (!user) {
      console.log('❌ Usuário não encontrado no MySQL');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha (simplificado para teste - em produção usar bcrypt)
    if (user.senha !== senha) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id.toString());
    
    console.log('✅ Login MySQL bem-sucedido:', user.nome);
    
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
        foto_url: user.foto_url,
        razao_social: user.razao_social
      },
      token
    });

  } catch (error) {
    console.error('❌ Erro no login MySQL:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload de logo
app.post('/api/upload/logo', uploadLogo, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const imageUrl = getImageUrl(req.file.filename);
    
    res.json({
      success: true,
      filename: req.file.filename,
      url: imageUrl,
      message: 'Logo enviado com sucesso'
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do logo' });
  }
});

// Servir imagens
app.get('/api/uploads/logos/:filename', serveImage);

// Cadastro de empresa
app.post('/api/users/register', async (req, res) => {
  try {
    const { razaoSocial, email, senha, telefone, cnpj, endereco, cep, cidade, estado, especializacao, horario_inicio, horario_fim, dias_funcionamento, logo_url } = req.body;
    
    console.log('🔍 Tentativa de cadastro MySQL:', { email, razaoSocial });
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    // Criar novo usuário empresa no MySQL
    const newUser = await User.create({
      tipo: 'empresa',
      nome: razaoSocial,
      email: email,
      senha: senha, // Em produção, usar bcrypt
      telefone: telefone,
      cnpj: cnpj,
      razao_social: razaoSocial,
      ativo: true
    });

    // Gerar ID único da empresa
    let identificador_empresa;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const potentialId = generateCompanyId(razaoSocial);
      
      const existingEmpresa = await Empresa.findOne({
        where: { identificador_empresa: potentialId }
      });
      
      if (!existingEmpresa) {
        identificador_empresa = potentialId;
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Não foi possível gerar um ID único para a empresa. Tente novamente.' });
    }

    // Criar dados da empresa no MySQL
    const newEmpresa = await Empresa.create({
      user_id: newUser.id,
      endereco: endereco,
      cidade: cidade || 'São Paulo',
      estado: estado || 'SP',
      cep: cep || '00000-000',
      descricao: especializacao,
      identificador_empresa: identificador_empresa,
      latitude: -23.5505, // TODO: Integrar com API de geolocalização por CEP
      longitude: -46.6333, // TODO: Integrar com API de geolocalização por CEP
      horario_funcionamento: JSON.stringify({
        segunda: dias_funcionamento.includes(1) ? { inicio: horario_inicio, fim: horario_fim } : null,
        terca: dias_funcionamento.includes(2) ? { inicio: horario_inicio, fim: horario_fim } : null,
        quarta: dias_funcionamento.includes(3) ? { inicio: horario_inicio, fim: horario_fim } : null,
        quinta: dias_funcionamento.includes(4) ? { inicio: horario_inicio, fim: horario_fim } : null,
        sexta: dias_funcionamento.includes(5) ? { inicio: horario_inicio, fim: horario_fim } : null,
        sabado: dias_funcionamento.includes(6) ? { inicio: horario_inicio, fim: horario_fim } : null,
        domingo: dias_funcionamento.includes(0) ? { inicio: horario_inicio, fim: horario_fim } : null
      }),
      logo_url: logo_url
    });

    const token = generateToken(newUser.id.toString());
    
    console.log('✅ Empresa cadastrada no MySQL:', newUser.nome);
    console.log('📊 Empresa ID:', newEmpresa.id);
    console.log('🆔 Identificador da Empresa:', identificador_empresa);
    console.log('🖼️ Logo URL:', logo_url);
    
    res.json({
      user: {
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        telefone: newUser.telefone,
        tipo: newUser.tipo,
        cnpj: newUser.cnpj,
        razao_social: newUser.razao_social
      },
      empresa: {
        id: newEmpresa.id,
        identificador_empresa: identificador_empresa,
        endereco: newEmpresa.endereco,
        cidade: newEmpresa.cidade,
        estado: newEmpresa.estado,
        cep: newEmpresa.cep,
        logo_url: logo_url
      },
      token,
      success: true
    });

  } catch (error) {
    console.error('❌ Erro no cadastro MySQL:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar todas as empresas
app.get('/api/empresas', async (req, res) => {
  try {
    console.log('🔍 Buscando empresas no MySQL...');
    
    const empresas = await Empresa.findAll({
      include: [{
        model: User,
        as: 'owner',
        where: { tipo: 'empresa' },
        attributes: ['id', 'nome', 'email', 'telefone', 'cnpj']
      }]
    });
    
    console.log('📊 Empresas encontradas:', empresas.length);
    res.json(empresas);
    
  } catch (error) {
    console.error('❌ Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar empresa por ID
app.get('/api/empresas/:id', async (req, res) => {
  try {
    const empresa = await Empresa.findOne({
      where: { user_id: req.params.id }
    });
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json(empresa);
    
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar empresa
app.put('/api/empresas/:id', async (req, res) => {
  try {
    const empresa = await Empresa.findOne({
      where: { user_id: req.params.id }
    });
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    // Atualizar campos permitidos
    const { logo_url, endereco, cidade, estado, cep, descricao } = req.body;
    
    if (logo_url !== undefined) empresa.logo_url = logo_url;
    if (endereco !== undefined) empresa.endereco = endereco;
    if (cidade !== undefined) empresa.cidade = cidade;
    if (estado !== undefined) empresa.estado = estado;
    if (cep !== undefined) empresa.cep = cep;
    if (descricao !== undefined) empresa.descricao = descricao;
    
    await empresa.save();
    
    console.log('✅ Empresa atualizada:', empresa.id);
    res.json(empresa);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar serviços de uma empresa
app.get('/api/empresas/:id/servicos', async (req, res) => {
  try {
    const servicos = await Servico.findAll({
      where: { empresa_id: req.params.id }
    });
    
    // Se não houver serviços, retornar dados mockados
    if (servicos.length === 0) {
      const servicosMock = [
        {
          id: 1,
          nome: 'Corte Masculino',
          preco: 35.00,
          duracao: 30,
          descricao: 'Corte masculino tradicional'
        },
        {
          id: 2,
          nome: 'Barba',
          preco: 25.00,
          duracao: 20,
          descricao: 'Barba completa com navalha'
        },
        {
          id: 3,
          nome: 'Corte + Barba',
          preco: 50.00,
          duracao: 50,
          descricao: 'Combo completo'
        }
      ];
      return res.json(servicosMock);
    }
    
    res.json(servicos);
    
  } catch (error) {
    console.error('❌ Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas protegidas
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

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
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com MySQL
    await sequelize.authenticate();
    console.log('✅ Conexão com MySQL estabelecida com sucesso');
    
    // Sincronizar modelos (criar tabelas se não existirem)
    await sequelize.sync({ alter: true });
    console.log('✅ Tabelas MySQL sincronizadas');
    
    // Configurar banco de dados em produção
    async function initializeDatabase() {
      if (process.env.NODE_ENV === 'production') {
        console.log('🔧 Configurando banco de dados para produção...');
        try {
          const setupDB = require('./setup-production-db');
          await setupDB();
        } catch (error) {
          console.log('ℹ️ Banco já configurado ou erro na configuração:', error.message);
        }
      }
    }

    // Iniciar servidor
    async function startServer() {
      await initializeDatabase();
      
      app.listen(PORT, () => {
        console.log(`🚀 Servidor MySQL rodando na porta ${PORT}`);
        console.log(`🔗 API: http://localhost:${PORT}/api`);
        console.log(`📱 Health Check: http://localhost:${PORT}/api/health`);
        
        if (process.env.NODE_ENV === 'production') {
          console.log('\n👥 Usuários de teste:');
          console.log('   🏢 EMPRESA: teste@empresa.com / empresa123');
          console.log('   👨‍💼 FUNCIONÁRIO: 123.456.789-00 / funcionario123');
          console.log('   👤 CLIENTE: cliente@teste.com / cliente123');
          console.log('\n🔗 ID da Empresa: teste1234');
        } else {
          console.log('\n👥 Usuários de teste (se existirem):');
          console.log('   🏢 EMPRESA: contato@barbeariamoderna.com / empresa123');
          console.log('   👨‍💼 FUNCIONÁRIO: 123.456.789-00 / funcionario123');
          console.log('   👤 CLIENTE: maria@email.com / cliente123');
          console.log('\n💡 Para criar dados de teste, execute: npm run setup-db');
        }
      });
    }

    startServer();
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor MySQL:', error);
    console.error('Verifique se o MySQL está rodando e as credenciais estão corretas');
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  startServer();
}

module.exports = app;
