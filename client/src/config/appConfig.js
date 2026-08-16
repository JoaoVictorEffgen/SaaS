export const LOCAL_DEV =
  process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_LOCAL_DEV === 'true';

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
