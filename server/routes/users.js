const express = require('express');
const router = express.Router();
const { User, Empresa, sequelize } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken: auth } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { isLocalDev, LOCAL_DEV_USERS, getLocalDevUser } = require('../config/localDev');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }
});

const supportedUserTypes = new Set(['empresa', 'funcionario', 'cliente']);

const formatCpf = (digits) =>
  digits.length === 11
    ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : null;

const formatCnpj = (digits) =>
  digits.length === 14
    ? digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    : null;

const buildIdentifierConditions = (identifier) => {
  const value = String(identifier || '').trim();
  const digits = value.replace(/\D/g, '');
  const variants = [...new Set([value, digits, formatCpf(digits), formatCnpj(digits)].filter(Boolean))];

  return variants.flatMap((variant) => [
    { email: variant.toLowerCase() },
    { telefone: variant },
    { cpf: variant },
    { cnpj: variant }
  ]);
};

const inferLocalUserType = (identifier, requestedType) => {
  if (requestedType && supportedUserTypes.has(requestedType)) return requestedType;

  const value = String(identifier || '').trim().toLowerCase();
  const match = Object.entries(LOCAL_DEV_USERS).find(([, profile]) =>
    [profile.email, profile.telefone, profile.cpf, profile.cnpj]
      .filter(Boolean)
      .some((candidate) => String(candidate).toLowerCase() === value)
  );

  return match?.[0] || 'empresa';
};

const isLocalDevIdentifier = (identifier) => {
  const value = String(identifier || '').trim().toLowerCase();
  return Object.values(LOCAL_DEV_USERS).some((profile) =>
    [profile.email, profile.telefone, profile.cpf, profile.cnpj]
      .filter(Boolean)
      .some((candidate) => String(candidate).toLowerCase() === value)
  );
};

const companyMatchesIdentifier = async (empresaId, companyIdentifier) => {
  if (!companyIdentifier) return true;

  const value = String(companyIdentifier).trim();
  const companyConditions = [
    { cnpj: value },
    { telefone: value },
    { identificador_empresa: value }
  ];

  if (/^\d+$/.test(value)) companyConditions.push({ id: Number(value) });

  const owner = value.includes('@')
    ? await User.findOne({ where: { email: value.toLowerCase(), tipo: 'empresa' } })
    : null;
  if (owner) companyConditions.push({ user_id: owner.id });

  const company = await Empresa.findOne({ where: { [Op.or]: companyConditions } });
  return Boolean(company && String(company.id) === String(empresaId));
};

// POST /api/users/login - Login do usuário
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { identifier, senha, tipo, companyIdentifier } = req.body;

    if (!identifier || !senha || (tipo && !supportedUserTypes.has(tipo))) {
      return res.status(400).json({ error: 'Dados de acesso inválidos' });
    }

    if (isLocalDev && isLocalDevIdentifier(identifier)) {
      const devUser = getLocalDevUser(inferLocalUserType(identifier, tipo));
      const { getJwtSecret } = require('../middleware/auth');
      const token = jwt.sign(
        { userId: devUser.id, tipo: devUser.tipo, email: devUser.email, empresa_id: devUser.empresa_id },
        getJwtSecret(),
        { expiresIn: '24h' }
      );
      return res.json({ user: devUser, token });
    }

    const whereCondition = { [Op.or]: buildIdentifierConditions(identifier) };
    if (tipo) whereCondition.tipo = tipo;

    const candidates = await User.findAll({ where: whereCondition });
    const passwordMatches = (await Promise.all(candidates.map(async (candidate) =>
      await bcrypt.compare(senha, candidate.senha) ? candidate : null
    ))).filter(Boolean);
    // Nunca escolha arbitrariamente entre contas que compartilham telefone ou documento.
    const user = passwordMatches.length === 1 ? passwordMatches[0] : null;

    if (!user || user.ativo === false) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (user.tipo === 'funcionario' && !(await companyMatchesIdentifier(user.empresa_id, companyIdentifier))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Buscar dados da empresa se for funcionário
    let empresaData = null;
    if (user.tipo === 'funcionario' && user.empresa_id) {
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
        foto_url: user.foto_url,
        plano: user.plano
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
    const {
      nome,
      email,
      senha,
      telefone,
      razaoSocial,
      cnpj,
      endereco,
      cidade,
      estado,
      cep,
      especializacao,
      descricao_servico,
      whatsapp_contato,
      horario_inicio,
      horario_fim,
      dias_funcionamento
    } = req.body;
    const isCompanyRegistration = Boolean(razaoSocial || cnpj);
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedCnpj = String(cnpj || '').replace(/\D/g, '');

    if (!normalizedEmail || !senha || senha.length < 8) {
      return res.status(400).json({ error: 'E-mail e uma senha de pelo menos 8 caracteres são obrigatórios' });
    }
    if (isCompanyRegistration && (!String(razaoSocial || '').trim() || normalizedCnpj.length !== 14)) {
      return res.status(400).json({ error: 'Razão social e um CNPJ com 14 dígitos são obrigatórios para cadastrar uma empresa' });
    }
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    if (isCompanyRegistration) {
      const existingCompany = await Empresa.findOne({ where: { cnpj: normalizedCnpj } });
      if (existingCompany) {
        return res.status(409).json({ error: 'CNPJ já cadastrado' });
      }
    }
    
    const result = await sequelize.transaction(async (transaction) => {
      const user = await User.create({
        nome: isCompanyRegistration ? String(razaoSocial).trim() : nome,
        email: normalizedEmail,
        senha,
        tipo: isCompanyRegistration ? 'empresa' : 'cliente',
        plano: 'free',
        telefone,
        cnpj: isCompanyRegistration ? normalizedCnpj : null,
        razao_social: isCompanyRegistration ? String(razaoSocial).trim() : null
      }, { transaction });

      let empresa = null;
      if (isCompanyRegistration) {
        empresa = await Empresa.create({
          user_id: user.id,
          nome: String(razaoSocial).trim(),
          cnpj: normalizedCnpj,
          telefone,
          endereco,
          cidade,
          estado,
          cep,
          descricao: descricao_servico,
          categoria: String(especializacao || '').trim() || null,
          horario_funcionamento: {
            horario_inicio: horario_inicio || null,
            horario_fim: horario_fim || null,
            dias_trabalho: Array.isArray(dias_funcionamento) ? dias_funcionamento : []
          },
          logo_url: null,
          whatsapp: whatsapp_contato
        }, { transaction });
      }
      return { user, empresa };
    });
    const { user, empresa } = result;
    const { getJwtSecret } = require('../middleware/auth');
    const token = jwt.sign(
      {
        userId: user.id,
        tipo: user.tipo,
        email: user.email,
        empresa_id: empresa?.id || null
      },
      getJwtSecret(),
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        plano: user.plano,
        empresa_id: empresa?.id || null
      },
      empresa,
      token
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
    
    const allowedFields = ['nome', 'telefone', 'cpf', 'cargo', 'foto_url', 'url_foto_perfil', 'disponibilidade', 'pausas'];
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
