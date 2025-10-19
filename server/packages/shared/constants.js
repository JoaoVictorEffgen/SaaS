// 📦 Pacote Compartilhado - Constantes e Configurações

/**
 * Constantes do sistema
 */
const SYSTEM_CONSTANTS = {
  // Tipos de usuário
  USER_TYPES: {
    EMPRESA: 'empresa',
    FUNCIONARIO: 'funcionario',
    CLIENTE: 'cliente'
  },

  // Status de agendamento
  AGENDAMENTO_STATUS: {
    EM_APROVACAO: 'em_aprovacao',
    AGENDADO: 'agendado',
    CONFIRMADO: 'confirmado',
    REALIZADO: 'realizado',
    CANCELADO: 'cancelado'
  },

  // Tipos de desconto
  DESCONTO_TYPES: {
    PERCENTUAL: 'percentual',
    VALOR_FIXO: 'valor_fixo',
    MESES_GRATIS: 'meses_gratis'
  },

  // Status de contrato
  CONTRATO_STATUS: {
    ATIVO: 'ativo',
    INATIVO: 'inativo',
    SUSPENSO: 'suspenso',
    CANCELADO: 'cancelado'
  },

  // Planos de assinatura
  PLANOS: {
    BASIC: 'basic',
    PREMIUM: 'premium',
    ENTERPRISE: 'enterprise'
  },

  // Limites de upload
  UPLOAD_LIMITS: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif']
  },

  // Configurações de paginação
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },

  // Configurações de cache
  CACHE_TTL: {
    SHORT: 5 * 60 * 1000,      // 5 minutos
    MEDIUM: 30 * 60 * 1000,    // 30 minutos
    LONG: 2 * 60 * 60 * 1000,  // 2 horas
    VERY_LONG: 24 * 60 * 60 * 1000 // 24 horas
  },

  // Códigos de erro
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    CONFLICT_ERROR: 'CONFLICT_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  },

  // Mensagens padrão
  MESSAGES: {
    SUCCESS: {
      CREATED: 'Recurso criado com sucesso',
      UPDATED: 'Recurso atualizado com sucesso',
      DELETED: 'Recurso removido com sucesso',
      SAVED: 'Dados salvos com sucesso'
    },
    ERROR: {
      INVALID_CREDENTIALS: 'Credenciais inválidas',
      UNAUTHORIZED: 'Acesso não autorizado',
      FORBIDDEN: 'Acesso negado',
      NOT_FOUND: 'Recurso não encontrado',
      VALIDATION_FAILED: 'Dados inválidos',
      INTERNAL_ERROR: 'Erro interno do servidor'
    }
  }
};

/**
 * Configurações de validação
 */
const VALIDATION_RULES = {
  USER: {
    nome: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZÀ-ÿ\s]+$/
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    senha: {
      required: true,
      minLength: 6,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
    },
    telefone: {
      pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/
    },
    cpf: {
      pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    },
    cnpj: {
      pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    }
  },
  EMPRESA: {
    nome: {
      required: true,
      minLength: 2,
      maxLength: 200
    },
    cnpj: {
      required: true,
      pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    },
    endereco: {
      minLength: 5,
      maxLength: 300
    },
    descricao: {
      maxLength: 1000
    }
  },
  SERVICO: {
    nome: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    descricao: {
      maxLength: 500
    },
    preco: {
      required: true,
      min: 0
    },
    duracao: {
      required: true,
      min: 15,
      max: 480 // 8 horas em minutos
    }
  }
};

/**
 * Configurações de segurança
 */
const SECURITY_CONFIG = {
  JWT: {
    SECRET: process.env.JWT_SECRET || 'seu_jwt_secret_muito_seguro_aqui_2024',
    EXPIRES_IN: '24h',
    ALGORITHM: 'HS256'
  },
  BCRYPT: {
    SALT_ROUNDS: 12
  },
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    MAX_REQUESTS: 1000, // máximo 1000 requisições por janela (aumentado para desenvolvimento)
    SKIP_SUCCESSFUL_REQUESTS: true
  },
  CORS: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
  }
};

/**
 * Configurações de ambiente
 */
const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_NAME: process.env.DB_NAME || 'agendamentos_saas',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

/**
 * Utilitários de validação
 */
const ValidationUtils = {
  /**
   * Valida se um valor está dentro de um enum
   */
  isValidEnum: (value, enumObject) => {
    return Object.values(enumObject).includes(value);
  },

  /**
   * Valida se um objeto tem todas as propriedades obrigatórias
   */
  hasRequiredFields: (obj, requiredFields) => {
    return requiredFields.every(field => obj.hasOwnProperty(field) && obj[field] != null);
  },

  /**
   * Valida tamanho de string
   */
  isValidStringLength: (str, min, max) => {
    return typeof str === 'string' && str.length >= min && str.length <= max;
  },

  /**
   * Valida se é um número positivo
   */
  isPositiveNumber: (num) => {
    return typeof num === 'number' && num > 0 && !isNaN(num);
  },

  /**
   * Valida se é uma data válida
   */
  isValidDate: (date) => {
    return date instanceof Date && !isNaN(date.getTime());
  }
};

/**
 * Utilitários de formatação
 */
const FormatUtils = {
  /**
   * Formata CPF
   */
  formatCPF: (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  /**
   * Formata CNPJ
   */
  formatCNPJ: (cnpj) => {
    cnpj = cnpj.replace(/[^\d]/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  },

  /**
   * Formata telefone
   */
  formatPhone: (phone) => {
    phone = phone.replace(/[^\d]/g, '');
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  },

  /**
   * Formata moeda
   */
  formatCurrency: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  /**
   * Formata data
   */
  formatDate: (date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }
};

module.exports = {
  SYSTEM_CONSTANTS,
  VALIDATION_RULES,
  SECURITY_CONFIG,
  ENV_CONFIG,
  ValidationUtils,
  FormatUtils
};
