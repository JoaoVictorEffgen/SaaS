// 🛡️ Pacote de Segurança - Middleware
const { User } = require('../../models');
const AuthSecurity = require('./auth');

class SecurityMiddleware {
  constructor() {
    this.authSecurity = new AuthSecurity();
  }

  /**
   * Middleware de autenticação JWT
   */
  authenticateToken = async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        console.log('❌ [SECURITY] Token não fornecido');
        return res.status(401).json({
          success: false,
          message: 'Token de acesso requerido'
        });
      }

      // Verificar token
      const decoded = this.authSecurity.verifyToken(token);
      if (!decoded) {
        console.log('❌ [SECURITY] Token inválido ou expirado');
        return res.status(403).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }

      // Buscar usuário no banco
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.ativo) {
        console.log('❌ [SECURITY] Usuário não encontrado ou inativo');
        return res.status(403).json({
          success: false,
          message: 'Usuário não encontrado ou inativo'
        });
      }

      // Adicionar usuário ao request
      req.user = user;
      req.tokenData = decoded;
      
      console.log('✅ [SECURITY] Usuário autenticado:', user.id, user.tipo);
      next();
    } catch (error) {
      console.error('❌ [SECURITY] Erro na autenticação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno de segurança'
      });
    }
  };

  /**
   * Middleware de rate limiting simples
   */
  rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    const requests = new Map();

    return (req, res, next) => {
      const clientId = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Limpar requisições antigas
      if (requests.has(clientId)) {
        const clientRequests = requests.get(clientId);
        const validRequests = clientRequests.filter(time => time > windowStart);
        requests.set(clientId, validRequests);
      } else {
        requests.set(clientId, []);
      }

      const clientRequests = requests.get(clientId);

      if (clientRequests.length >= maxRequests) {
        console.log('❌ [SECURITY] Rate limit excedido para:', clientId);
        return res.status(429).json({
          success: false,
          message: 'Muitas requisições. Tente novamente em alguns minutos.'
        });
      }

      clientRequests.push(now);
      next();
    };
  };

  /**
   * Middleware de validação de entrada
   */
  validateInput = (schema) => {
    return (req, res, next) => {
      try {
        const { error } = schema.validate(req.body);
        if (error) {
          console.log('❌ [SECURITY] Validação falhou:', error.details[0].message);
          return res.status(400).json({
            success: false,
            message: error.details[0].message
          });
        }
        next();
      } catch (err) {
        console.error('❌ [SECURITY] Erro na validação:', err);
        res.status(500).json({
          success: false,
          message: 'Erro interno de validação'
        });
      }
    };
  };

  /**
   * Middleware de sanitização de dados
   */
  sanitizeData = (req, res, next) => {
    try {
      // Sanitizar body
      if (req.body) {
        req.body = this.sanitizeObject(req.body);
      }

      // Sanitizar query
      if (req.query) {
        req.query = this.sanitizeObject(req.query);
      }

      // Sanitizar params
      if (req.params) {
        req.params = this.sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      console.error('❌ [SECURITY] Erro na sanitização:', error);
      next();
    }
  };

  /**
   * Sanitiza objeto recursivamente
   */
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? this.authSecurity.sanitizeInput(obj) : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = this.sanitizeObject(value);
    }

    return sanitized;
  }

  /**
   * Middleware de verificação de permissões por tipo
   */
  requireUserType = (allowedTypes) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      if (!allowedTypes.includes(req.user.tipo)) {
        console.log('❌ [SECURITY] Tipo de usuário não permitido:', req.user.tipo);
        return res.status(403).json({
          success: false,
          message: 'Acesso negado para este tipo de usuário'
        });
      }

      next();
    };
  };

  /**
   * Middleware de verificação de propriedade de empresa
   */
  requireEmpresaOwnership = async (req, res, next) => {
    try {
      const user = req.user;
      
      if (user.tipo !== 'empresa') {
        return res.status(403).json({
          success: false,
          message: 'Apenas empresas podem acessar este recurso'
        });
      }

      // Buscar empresa do usuário
      const { Empresa } = require('../../models');
      const empresa = await Empresa.findOne({
        where: { user_id: user.id }
      });

      if (!empresa) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada para este usuário'
        });
      }

      req.empresa = empresa;
      next();
    } catch (error) {
      console.error('❌ [SECURITY] Erro na verificação de propriedade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno de segurança'
      });
    }
  };

  /**
   * Middleware de verificação de funcionário vinculado
   */
  requireFuncionarioEmpresa = async (req, res, next) => {
    try {
      const user = req.user;
      
      if (user.tipo !== 'funcionario') {
        return res.status(403).json({
          success: false,
          message: 'Apenas funcionários podem acessar este recurso'
        });
      }

      if (!user.empresa_id) {
        return res.status(400).json({
          success: false,
          message: 'Funcionário não está vinculado a nenhuma empresa'
        });
      }

      // Buscar empresa do funcionário
      const { Empresa } = require('../../models');
      const empresa = await Empresa.findByPk(user.empresa_id);

      if (!empresa || !empresa.ativo) {
        return res.status(404).json({
          success: false,
          message: 'Empresa do funcionário não encontrada ou inativa'
        });
      }

      req.empresa = empresa;
      next();
    } catch (error) {
      console.error('❌ [SECURITY] Erro na verificação de funcionário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno de segurança'
      });
    }
  };

  /**
   * Middleware de log de segurança
   */
  securityLogger = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log de tentativas de acesso
      if (res.statusCode >= 400) {
        console.log(`🚨 [SECURITY LOG] ${req.method} ${req.path} - ${res.statusCode} - IP: ${req.ip} - User: ${req.user?.id || 'anonymous'}`);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
}

module.exports = SecurityMiddleware;
