const express = require('express');
const router = express.Router();
const { User, Empresa, sequelize } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken: auth } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/users/login - Login do usuário
router.post('/login', async (req, res) => {
  try {
    const { identifier, senha, tipo, companyIdentifier } = req.body;
    
    // Buscar usuário por email, telefone, CNPJ ou CPF (para funcionários)
    
    let whereCondition = {
      [Op.or]: [
        { email: identifier },
        { telefone: identifier },
        { cnpj: identifier }
      ],
      tipo: tipo || 'cliente'
    };
    
    // Para funcionários, também buscar por CPF (com e sem formatação)
    if (tipo === 'funcionario') {
      whereCondition[Op.or].push({ cpf: identifier });
      // Também buscar CPF com formatação (ex: 123.456.789-00)
      const cpfFormatado = identifier.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      whereCondition[Op.or].push({ cpf: cpfFormatado });
      
      // FUNCIONÁRIO PRECISA ESTAR LIGADO À EMPRESA
      if (companyIdentifier) {
        const empresa = await Empresa.findOne({
          where: {
            [Op.or]: [
              { email: companyIdentifier },
              { telefone: companyIdentifier },
              { cnpj: companyIdentifier },
              { id: companyIdentifier }
            ]
          }
        });
        
        if (!empresa) {
          return res.status(401).json({ error: 'Empresa não encontrada' });
        }
        
        whereCondition.empresa_id = empresa.id;
      } else {
        return res.status(400).json({ error: 'Funcionário precisa informar a empresa' });
      }
    }
    
    const user = await User.findOne({
      where: whereCondition
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Verificar senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    
    // Buscar dados da empresa se for funcionário
    let empresaData = null;
    if (user.tipo === 'funcionario' && user.empresa_id) {
      const { Empresa } = require('../models');
      empresaData = await Empresa.findByPk(user.empresa_id);
    }

    // Gerar JWT token
    const { getJwtSecret } = require('../middleware/auth');
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { 
        userId: user.id,
        tipo: user.tipo,
        email: user.email,
        empresa_id: user.empresa_id,
        empresa_nome: empresaData?.nome || null
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    // Retornar dados do usuário
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
        empresa_nome: empresaData?.nome || null,
        cargo: user.cargo,
        foto_url: user.foto_url
      },
      token: token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/users/funcionarios/:empresaId - Buscar funcionários de uma empresa
router.get('/funcionarios/:empresaId', auth, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const empresa = await Empresa.findOne({ where: { id: empresaId, user_id: req.user.id } });
    if (!empresa || req.user.tipo !== 'empresa') {
      return res.status(403).json({ error: 'Você não tem permissão para ver estes funcionários' });
    }
    
    const funcionarios = await User.findAll({
      where: {
        tipo: 'funcionario',
        empresa_id: empresaId
      },
      attributes: ['id', 'nome', 'email', 'telefone', 'cpf', 'cargo', 'foto_url', 'ativo', 'created_at']
    });
    
    res.json(funcionarios);
  } catch (error) {
    console.error('❌ Erro ao buscar funcionários:', error);
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
  }
});


// POST /api/users/register - Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, telefone, razaoSocial, cnpj, endereco, cidade, estado, cep, descricao_servico, logo_url, whatsapp_contato } = req.body;
    const isCompanyRegistration = Boolean(razaoSocial || cnpj);

    if (!email || !senha || senha.length < 8) {
      return res.status(400).json({ error: 'E-mail e uma senha de pelo menos 8 caracteres são obrigatórios' });
    }
    if (isCompanyRegistration && (!razaoSocial || !cnpj)) {
      return res.status(400).json({ error: 'Razão social e CNPJ são obrigatórios para cadastrar uma empresa' });
    }
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    const result = await sequelize.transaction(async (transaction) => {
      const user = await User.create({
        nome: isCompanyRegistration ? razaoSocial : nome,
        email,
        senha,
        tipo: isCompanyRegistration ? 'empresa' : 'cliente',
        telefone
      }, { transaction });

      let empresa = null;
      if (isCompanyRegistration) {
        empresa = await Empresa.create({
          user_id: user.id,
          nome: razaoSocial,
          cnpj,
          telefone,
          endereco,
          cidade,
          estado,
          cep,
          descricao: descricao_servico,
          logo_url,
          whatsapp: whatsapp_contato
        }, { transaction });
      }
      return { user, empresa };
    });
    const { user, empresa } = result;
    
    res.status(201).json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        plano: user.plano
      },
      empresa
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/users/profile - Buscar perfil do usuário logado
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['senha'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/users/profile - Atualizar perfil do usuário
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const allowedFields = ['nome', 'telefone', 'cpf', 'cargo', 'foto_url', 'url_foto_perfil'];
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );
    await user.update(updateData);
    const safeUser = user.toJSON();
    delete safeUser.senha;
    res.json(safeUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
