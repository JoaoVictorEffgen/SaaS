const express = require('express');
const router = express.Router();
const { User, Empresa } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken: auth } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/users/login - Login do usuário
router.post('/login', async (req, res) => {
  try {
    console.log('🔍 Tentativa de login:', req.body);
    const { identifier, senha, tipo } = req.body;
    
    // Buscar usuário por email, telefone, CNPJ ou CPF (para funcionários)
    console.log('🔍 Buscando usuário...');
    
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
    }
    
    const user = await User.findOne({
      where: whereCondition
    });
    console.log('👤 Usuário encontrado:', user ? user.id : 'Nenhum');
    console.log('🔍 Senha recebida:', senha);
    console.log('🔍 Senha no banco:', user ? user.senha : 'N/A');

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Verificar senha (simplificado - em produção usar bcrypt)
    if (user.senha !== senha) {
      console.log('❌ Senha não confere:', { recebida: senha, banco: user.senha });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    console.log('✅ Senha confere!');
    
    // Gerar JWT token
    const jwtSecret = process.env.JWT_SECRET || 'seu_jwt_secret_muito_seguro_aqui_2024';
    const token = jwt.sign(
      { 
        userId: user.id,
        tipo: user.tipo,
        email: user.email
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log('🎫 Token JWT gerado:', token.substring(0, 20) + '...');
    
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
    console.log('🔍 Buscando funcionários da empresa:', empresaId);
    
    const funcionarios = await User.findAll({
      where: {
        tipo: 'funcionario',
        empresa_id: empresaId
      },
      attributes: ['id', 'nome', 'email', 'telefone', 'cpf', 'cargo', 'foto_url', 'ativo', 'created_at']
    });
    
    console.log('👥 Funcionários encontrados:', funcionarios.length);
    res.json(funcionarios);
  } catch (error) {
    console.error('❌ Erro ao buscar funcionários:', error);
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
  }
});

// PUT /api/users/profile - Atualizar perfil do usuário
router.put('/profile', auth, async (req, res) => {
  try {
    const { logo_url, foto_url } = req.body;
    const userId = req.user.id;
    const userType = req.user.tipo;
    
    console.log('🔍 Atualizando perfil do usuário:', userId, { logo_url, foto_url, userType });
    
    // Atualizar foto_url na tabela users (para funcionários)
    if (foto_url !== undefined) {
      await User.update({ foto_url }, {
        where: { id: userId }
      });
    }
    
    // Atualizar logo_url na tabela empresas (para empresas)
    if (logo_url !== undefined && userType === 'empresa') {
      const { Empresa } = require('../models');
      await Empresa.update({ logo_url }, {
        where: { user_id: userId }
      });
    }
    
    // Buscar usuário atualizado
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nome', 'email', 'telefone', 'tipo', 'cpf', 'cnpj', 'empresa_id', 'cargo', 'foto_url', 'ativo']
    });
    
    // Se for empresa, buscar dados da empresa também
    if (userType === 'empresa') {
      const { Empresa } = require('../models');
      const empresa = await Empresa.findOne({
        where: { user_id: userId },
        attributes: ['logo_url']
      });
      
      if (empresa) {
        user.dataValues.logo_url = empresa.logo_url;
      }
    }
    
    console.log('✅ Perfil atualizado com sucesso:', user.id);
    res.json(user);
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
  }
});

// POST /api/users/register - Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, tipo, telefone } = req.body;
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    // Criar usuário
    const user = await User.create({
      nome,
      email,
      senha, // Em produção, hash da senha
      tipo: tipo || 'cliente',
      telefone
    });
    
    res.status(201).json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        plano: user.plano
      }
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
    
    await user.update(req.body);
    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
