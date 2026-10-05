const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

export const BASIC_MODE = parseBoolean(
  process.env.REACT_APP_BASIC_MODE,
  process.env.NODE_ENV !== 'production'
);
export const LOCAL_DEV =
  process.env.NODE_ENV === 'development' &&
  parseBoolean(process.env.REACT_APP_LOCAL_DEV, false);
export const API_BASE_URL =
  process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : '/api';

export const LOCAL_DEV_USERS = {
  empresa: {
    id: 1,
    nome: 'Empresa Demo',
    email: 'empresa@local.dev',
    tipo: 'empresa',
    plano: 'business',
    ativo: true
  },
  cliente: {
    id: 2,
    nome: 'Cliente Demo',
    email: 'cliente@local.dev',
    tipo: 'cliente',
    plano: 'free',
    ativo: true
  },
  funcionario: {
    id: 3,
    nome: 'Funcionario Demo',
    email: 'funcionario@local.dev',
    tipo: 'funcionario',
    plano: 'free',
    ativo: true,
    empresa_id: 1
  }
};

export const getLocalDevUser = (tipo = 'empresa') =>
  LOCAL_DEV_USERS[tipo] || LOCAL_DEV_USERS.empresa;
