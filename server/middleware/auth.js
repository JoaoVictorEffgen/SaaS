const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isLocalDev, getLocalDevUser } = require('../config/localDev');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET deve ser configurado com pelo menos 32 caracteres');
  }
  return secret;
};

const attachLocalDevUser = async (req, res, next) => {
  const devUserType = req.headers['x-dev-user-type'] || 'empresa';

  try {
    const dbUser = await User.findOne({
      where: { tipo: devUserType },
      order: [['id', 'ASC']]
    });

    if (dbUser) {
      req.user = dbUser;
      return next();
    }
  } catch (error) {
    console.warn('⚠️ [LOCAL_DEV] Usando usuário mock em memória:', error.message);
  }

  req.user = getLocalDevUser(devUserType);
  next();
};

const authenticateToken = async (req, res, next) => {
  if (isLocalDev) {
    return attachLocalDevUser(req, res, next);
  }

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido',
        message: 'É necessário fazer login para acessar este recurso'
      });
    }

    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret);
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

const requirePlan = (planoMinimo) => {
  return (req, res, next) => {
    if (isLocalDev) {
      return next();
    }

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

const requirePro = requirePlan('pro');
const requireBusiness = requirePlan('business');

const checkAgendamentoLimit = async (req, res, next) => {
  if (isLocalDev) {
    return next();
  }

  try {
    if (req.user.plano === 'free') {
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

const checkResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    if (isLocalDev) {
      return next();
    }

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

      if (resource.usuario_id !== req.user.id) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para acessar este recurso'
        });
      }

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
  getJwtSecret,
  requirePlan,
  requirePro,
  requireBusiness,
  checkAgendamentoLimit,
  checkResourceAccess
};
