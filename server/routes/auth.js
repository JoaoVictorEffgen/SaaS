const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User, Subscription } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

// Validações
const validateRegister = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('telefone')
    .optional()
    .matches(/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/)
    .withMessage('Telefone inválido. Use apenas números, parênteses, hífen e espaços'),
  body('empresa')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nome da empresa deve ter no máximo 100 caracteres'),
  body('especializacao')
    .trim()
    .notEmpty()
    .withMessage('Especialização é obrigatória')
    .isLength({ max: 100 })
    .withMessage('Especialização deve ter no máximo 100 caracteres'),
  body('descricao_servico')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição do serviço deve ter no máximo 1000 caracteres'),
  body('whatsapp_contato')
    .optional()
    .matches(/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/)
    .withMessage('WhatsApp inválido. Use apenas números, parênteses, hífen e espaços'),
  body('logo_url')
    .optional()
    .isURL()
    .withMessage('URL do logo inválida'),
  body('cnpj')
    .optional()
    .custom((value) => {
      if (!value) return true; // CNPJ é opcional
      
      // Remove caracteres não numéricos
      const cnpjClean = value.replace(/[^\d]/g, '');
      
      // Verifica se tem 14 dígitos
      if (cnpjClean.length !== 14) throw new Error('CNPJ deve ter 14 dígitos');
      
      // Verifica se não são todos iguais
      if (/^(\d)\1{13}$/.test(cnpjClean)) throw new Error('CNPJ inválido');
      
      // Validação do primeiro dígito verificador
      let sum = 0;
      let weight = 5;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cnpjClean.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
      }
      let digit = 11 - (sum % 11);
      if (digit > 9) digit = 0;
      if (parseInt(cnpjClean.charAt(12)) !== digit) throw new Error('CNPJ inválido');
      
      // Validação do segundo dígito verificador
      sum = 0;
      weight = 6;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(cnpjClean.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
      }
      digit = 11 - (sum % 11);
      if (digit > 9) digit = 0;
      if (parseInt(cnpjClean.charAt(13)) !== digit) throw new Error('CNPJ inválido');
      
      return true;
    })
    .withMessage('CNPJ inválido')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail inválido'),
  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register - Cadastro de usuário
router.post('/register', validateRegister, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, email, senha, telefone, empresa, especializacao, descricao_servico, cnpj, endereco, whatsapp_contato, logo_url } = req.body;

    // Verificar se e-mail já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'E-mail já cadastrado',
        message: 'Este e-mail já está sendo usado por outro usuário'
      });
    }

    // Criar usuário
    const user = await User.create({
      nome,
      email,
      senha,
      telefone,
      empresa,
      especializacao,
      descricao_servico,
      cnpj,
      endereco,
      whatsapp_contato,
      logo_url,
      plano: 'free'
    });

    // Criar assinatura gratuita
    await Subscription.create({
      usuario_id: user.id,
      plano: 'free',
      status: 'ativo',
      preco_mensal: 0.00,
      data_inicio: new Date(),
      data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      limite_agendamentos: 10,
      recursos_inclusos: Subscription.PLANOS.FREE.recursos
    });

    // Enviar e-mail de boas-vindas
    try {
      await sendWelcomeEmail(user.email, user.nome);
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de boas-vindas:', emailError);
    }

    // Gerar token
    const token = generateToken(user.id);

    // Atualizar último login
    await user.update({ ultimo_login: new Date() });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      user: user.toJSON(),
      token,
      plano: {
        nome: 'Free',
        limite_agendamentos: 10,
        recursos: Subscription.PLANOS.FREE.recursos
      }
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao cadastrar usuário'
    });
  }
});

// POST /api/auth/login - Login de usuário
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, senha } = req.body;

    // Buscar usuário
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'E-mail ou senha incorretos'
      });
    }

    // Verificar senha
    const senhaValida = await user.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'E-mail ou senha incorretos'
      });
    }

    // Verificar status do usuário
    if (user.status !== 'ativo') {
      return res.status(403).json({
        error: 'Conta inativa',
        message: 'Sua conta está inativa. Entre em contato com o suporte.'
      });
    }

    // Buscar assinatura ativa
    const subscription = await Subscription.findAtiva(user.id);

    // Gerar token
    const token = generateToken(user.id);

    // Atualizar último login
    await user.update({ ultimo_login: new Date() });

    res.json({
      message: 'Login realizado com sucesso',
      user: user.toJSON(),
      token,
      subscription: subscription ? {
        plano: subscription.plano,
        status: subscription.status,
        data_fim: subscription.data_fim,
        recursos: subscription.recursos_inclusos
      } : null
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao fazer login'
    });
  }
});

// POST /api/auth/logout - Logout (opcional, para invalidar token)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Em uma implementação mais robusta, você poderia adicionar o token
    // a uma blacklist ou usar refresh tokens
    
    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao fazer logout'
    });
  }
});

// GET /api/auth/me - Obter dados do usuário logado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Buscar assinatura ativa
    const subscription = await Subscription.findAtiva(req.user.id);

    res.json({
      user: req.user.toJSON(),
      subscription: subscription ? {
        plano: subscription.plano,
        status: subscription.status,
        data_fim: subscription.data_fim,
        recursos: subscription.recursos_inclusos,
        agendamentos_utilizados: subscription.agendamentos_utilizados,
        limite_agendamentos: subscription.limite_agendamentos
      } : null
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao buscar dados do usuário'
    });
  }
});

// POST /api/auth/refresh - Renovar token (opcional)
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Gerar novo token
    const newToken = generateToken(req.user.id);

    res.json({
      message: 'Token renovado com sucesso',
      token: newToken
    });

  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao renovar token'
    });
  }
});

// POST /api/auth/forgot-password - Esqueci minha senha
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'E-mail inválido',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Buscar usuário
    const user = await User.findByEmail(email);
    if (!user) {
      // Por segurança, não revelar se o e-mail existe ou não
      return res.json({
        message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha'
      });
    }

    // Gerar token de redefinição (implementar lógica completa)
    // Por enquanto, apenas retornar sucesso
    res.json({
      message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha'
    });

  } catch (error) {
    console.error('Erro ao processar esqueci minha senha:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao processar solicitação'
    });
  }
});

module.exports = router; 