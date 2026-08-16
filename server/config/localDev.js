require('dotenv').config();

const isLocalDev = process.env.LOCAL_DEV === 'true' || process.env.NODE_ENV === 'local';

const LOCAL_DEV_USERS = {
  empresa: {
    id: 1,
    nome: 'Empresa Demo',
    email: 'empresa@local.dev',
    tipo: 'empresa',
    plano: 'business',
    ativo: true,
    empresa_id: null
  },
  cliente: {
    id: 2,
    nome: 'Cliente Demo',
    email: 'cliente@local.dev',
    tipo: 'cliente',
    plano: 'free',
    ativo: true,
    empresa_id: null
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

module.exports = {
  isLocalDev,
  LOCAL_DEV_USERS,
  getLocalDevUser(tipo = 'empresa') {
    return LOCAL_DEV_USERS[tipo] || LOCAL_DEV_USERS.empresa;
  }
};
