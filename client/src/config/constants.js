// Constantes do sistema
export const APP_CONFIG = {
  APP_NAME: 'AgendaPro',
  VERSION: '1.0.0',
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  CNPJ_LENGTH: 14,
  CPF_LENGTH: 11,
  DESCRIPTION_MAX_LENGTH: 1000,
  SERVICE_DURATION_MIN: 15,
  SERVICE_DURATION_MAX: 480,
};

export const PLANOS = {
  FREE: {
    nome: 'Free',
    preco: 0.00,
    limite_agendamentos: 10,
    recursos: {
      whatsapp: false,
      relatorios: false,
      multiusuario: false,
      personalizacao: false,
      integracoes: false,
      suporte_prioritario: false
    }
  },
  PRO: {
    nome: 'Pro',
    preco: 39.90,
    limite_agendamentos: null, // ilimitado
    recursos: {
      whatsapp: true,
      relatorios: true,
      multiusuario: false,
      personalizacao: true,
      integracoes: true,
      suporte_prioritario: false
    }
  },
  BUSINESS: {
    nome: 'Business',
    preco: 99.90,
    limite_agendamentos: null, // ilimitado
    recursos: {
      whatsapp: true,
      relatorios: true,
      multiusuario: true,
      personalizacao: true,
      integracoes: true,
      suporte_prioritario: true
    }
  }
};

export const STATUS_AGENDAMENTO = {
  PENDENTE: 'pendente',
  CONFIRMADO: 'confirmado',
  CANCELADO: 'cancelado',
  REAGENDADO: 'reagendado',
  CONCLUIDO: 'concluido',
  NAO_COMPARECEU: 'nao_compareceu'
};

export const STATUS_FUNCIONARIO = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  FERIAS: 'ferias'
};

export const DIAS_SEMANA = [
  { valor: 0, nome: 'Domingo', abreviacao: 'Dom' },
  { valor: 1, nome: 'Segunda-feira', abreviacao: 'Seg' },
  { valor: 2, nome: 'Terça-feira', abreviacao: 'Ter' },
  { valor: 3, nome: 'Quarta-feira', abreviacao: 'Qua' },
  { valor: 4, nome: 'Quinta-feira', abreviacao: 'Qui' },
  { valor: 5, nome: 'Sexta-feira', abreviacao: 'Sex' },
  { valor: 6, nome: 'Sábado', abreviacao: 'Sáb' }
];

export const TIPOS_AGENDAMENTO = {
  PRESENCIAL: 'presencial',
  ONLINE: 'online',
  TELEFONE: 'telefone'
};

export const STATUS_PAGAMENTO = {
  PENDENTE: 'pendente',
  PAGO: 'pago',
  CANCELADO: 'cancelado',
  REEMBOLSADO: 'reembolsado'
};

export const RECORRENCIA_TIPOS = {
  SEMANAL: 'semanal',
  MENSAL: 'mensal'
};
