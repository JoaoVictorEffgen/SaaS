const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido',
        message: 'É necessário fazer login para acessar este recurso'
      });
    }

    // Verificar token
    const jwtSecret = process.env.JWT_SECRET || 'seu_jwt_secret_muito_seguro_aqui_2024';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Buscar usuário no banco
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        message: 'Token inválido ou usuário não existe'
      });
    }

    if (!user.ativo) {
      return res.status(403).json({
        error: 'Usuário inativo',
        message: 'Sua conta está inativa. Entre em contato com o suporte.'
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token de acesso inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Sua sessão expirou. Faça login novamente.'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao verificar autenticação'
    });
  }
};

// Middleware para verificar se usuário tem plano específico
const requirePlan = (planoMinimo) => {
  return (req, res, next) => {
    const planos = ['free', 'pro', 'business'];
    const planoUsuario = req.user.plano;
    const planoIndex = planos.indexOf(planoUsuario);
    const planoMinimoIndex = planos.indexOf(planoMinimo);

    if (planoIndex < planoMinimoIndex) {
      return res.status(403).json({
        error: 'Plano insuficiente',
        message: `Esta funcionalidade requer o plano ${planoMinimo} ou superior`,
        plano_atual: planoUsuario,
        plano_necessario: planoMinimo
      });
    }

    next();
  };
};

// Middleware para verificar se usuário tem plano Pro ou superior
const requirePro = requirePlan('pro');

// Middleware para verificar se usuário tem plano Business
const requireBusiness = requirePlan('business');

// Middleware para verificar se usuário tem limite de agendamentos
const checkAgendamentoLimit = async (req, res, next) => {
  try {
    if (req.user.plano === 'free') {
      // Buscar assinatura ativa para verificar limite
      const { Subscription } = require('../models');
      const subscription = await Subscription.findAtiva(req.user.id);
      
      if (subscription && subscription.agendamentos_utilizados >= 10) {
        return res.status(403).json({
          error: 'Limite atingido',
          message: 'Você atingiu o limite de 10 agendamentos do plano Free. Faça upgrade para continuar.',
          limite_atual: 10,
          agendamentos_utilizados: subscription.agendamentos_utilizados
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Erro ao verificar limite de agendamentos:', error);
    next();
  }
};

// Middleware para verificar se usuário pode acessar recurso específico
const checkResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.agendaId || req.params.agendamentoId;
      
      if (!resourceId) {
        return next();
      }

      let resource;
      
      switch (resourceType) {
        case 'agenda':
          const { Agenda } = require('../models');
          resource = await Agenda.findByPk(resourceId);
          break;
        case 'agendamento':
          const { Agendamento } = require('../models');
          resource = await Agendamento.findByPk(resourceId);
          break;
        default:
          return next();
      }

      if (!resource) {
        return res.status(404).json({
          error: 'Recurso não encontrado',
          message: `${resourceType} não encontrado`
        });
      }

      // Verificar se o usuário é dono do recurso
      if (resource.usuario_id !== req.user.id) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para acessar este recurso'
        });
      }

      // Adicionar recurso ao request
      req.resource = resource;
      next();
    } catch (error) {
      console.error(`Erro ao verificar acesso ao ${resourceType}:`, error);
      return res.status(500).json({
        error: 'Erro interno',
        message: 'Erro ao verificar permissões'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requirePlan,
  requirePro,
  requireBusiness,
  checkAgendamentoLimit,
  checkResourceAccess
}; 