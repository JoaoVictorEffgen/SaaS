const express = require('express');
const router = express.Router();
const { User, Empresa } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

// POST /api/users/login - Login do usuário
router.post('/login', async (req, res) => {
  try {
    const { identifier, senha, tipo } = req.body;
    
    let user;
    if (tipo === 'empresa') {
      // Buscar por email ou CNPJ
      const empresa = await Empresa.findOne({
        where: {
          [Op.or]: [
            { email_contato: identifier },
            { cnpj: identifier }
          ]
        },
        include: [{
          model: User,
          as: 'user'
        }]
      });
      
      if (empresa && empresa.user) {
        user = empresa.user;
      }
    } else {
      // Buscar usuário normal
      user = await User.findOne({
        where: {
          [Op.or]: [
            { email: identifier },
            { whatsapp: identifier }
          ],
          tipo: tipo || 'cliente'
        }
      });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Verificar senha (simplificado - em produção usar bcrypt)
    if (user.senha !== senha) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Atualizar último login
    await user.update({ ultimo_login: new Date() });
    
    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        plano: user.plano || 'free'
      },
      token: 'mock-jwt-token' // Em produção, gerar JWT real
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/users/register - Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, tipo, telefone, whatsapp } = req.body;
    
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
      telefone,
      whatsapp,
      plano: 'free'
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
