const crypto = require('crypto');

const nowIso = () => new Date().toISOString();

const createIdGenerator = (startAt = 1000) => {
  let current = startAt;
  return () => {
    current += 1;
    return current;
  };
};

const nextId = createIdGenerator(10);

const createToken = () => crypto.randomBytes(24).toString('hex');

const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');

const defaultSchedule = {
  horario_inicio: '08:00',
  horario_fim: '18:00',
  dias_trabalho: [1, 2, 3, 4, 5]
};

const state = {
  users: [
    {
      id: 1,
      tipo: 'empresa',
      nome: 'Salao Beleza Demo',
      email: 'empresa@timeflow.local',
      senha: '12345678',
      telefone: '11999990001',
      cnpj: '12345678000190',
      plano: 'business',
      ativo: true
    },
    {
      id: 2,
      tipo: 'funcionario',
      nome: 'Ana Martins',
      email: 'funcionario@timeflow.local',
      senha: '12345678',
      telefone: '11999990002',
      cpf: '12345678900',
      empresa_id: 1,
      cargo: 'Especialista',
      plano: 'free',
      ativo: true
    },
    {
      id: 3,
      tipo: 'cliente',
      nome: 'Cliente Demo',
      email: 'cliente@timeflow.local',
      senha: '12345678',
      telefone: '11999990003',
      plano: 'free',
      ativo: true
    }
  ],
  companies: [
    {
      id: 1,
      user_id: 1,
      nome: 'Salao Beleza Demo',
      cnpj: '12345678000190',
      telefone: '11999990001',
      endereco: 'Rua Central, 123',
      cidade: 'Sao Paulo',
      estado: 'SP',
      cep: '01000000',
      descricao: 'Atendimento de beleza e estetica.',
      categoria: 'Beleza e estetica',
      horario_funcionamento: defaultSchedule,
      horario_inicio: '08:00',
      horario_fim: '18:00',
      whatsapp: '11999990001',
      ativo: true,
      identificador_empresa: 'SALAO-DEMO',
      logo_url: null,
      imagem_fundo_url: null
    }
  ],
  services: [
    {
      id: 1,
      empresa_id: 1,
      nome: 'Corte feminino',
      descricao: 'Corte e finalizacao.',
      duracao_minutos: 60,
      preco: 90,
      categoria: 'Cabelo',
      ativo: true
    },
    {
      id: 2,
      empresa_id: 1,
      nome: 'Escova',
      descricao: 'Escova modeladora.',
      duracao_minutos: 45,
      preco: 65,
      categoria: 'Cabelo',
      ativo: true
    }
  ],
  promotions: [
    {
      id: 1,
      empresa_id: 1,
      nome: 'Primeiro agendamento',
      tipo_desconto: 'percentual',
      valor_desconto: 10,
      meses_gratis: null,
      destaque: true,
      ativo: true
    }
  ],
  redes: [
    {
      id: 1,
      nome_rede: 'Rede Demo',
      descricao: 'Rede inicial para testes.',
      plano: 'trial',
      usuario_admin_id: 1,
      limite_empresas: 3,
      empresas_ativas: 1,
      logo_rede_url: null,
      cpf_cnpj_usado: '12345678000190'
    }
  ],
  appointments: [],
  sessions: new Map()
};

const publicUser = (user) => {
  if (!user) return null;
  const { senha, ...safe } = user;
  return safe;
};

const findUserByIdentifier = (identifier, tipo) => {
  const value = String(identifier || '').trim().toLowerCase();
  const digits = normalizeDigits(value);

  return state.users.find((user) => {
    if (!user.ativo) return false;
    if (tipo && user.tipo !== tipo) return false;
    const candidates = [
      user.email && String(user.email).toLowerCase(),
      user.telefone && String(user.telefone).toLowerCase(),
      user.cpf && normalizeDigits(user.cpf),
      user.cnpj && normalizeDigits(user.cnpj)
    ].filter(Boolean);
    return candidates.includes(value) || candidates.includes(digits);
  });
};

const getCompanyByUserId = (userId) =>
  state.companies.find((company) => Number(company.user_id) === Number(userId));

const getCompanyById = (companyId) =>
  state.companies.find((company) => Number(company.id) === Number(companyId));

const getCompanyForEmployee = (employeeId) => {
  const employee = state.users.find((user) => Number(user.id) === Number(employeeId));
  if (!employee?.empresa_id) return null;
  return getCompanyById(employee.empresa_id);
};

const createSession = (userId) => {
  const token = createToken();
  state.sessions.set(token, Number(userId));
  return token;
};

const resolveSession = (token) => {
  const userId = state.sessions.get(String(token || ''));
  if (!userId) return null;
  return state.users.find((user) => Number(user.id) === Number(userId) && user.ativo);
};

const listCompaniesForClients = () =>
  state.companies
    .filter((company) => company.ativo !== false)
    .map((company) => ({
      ...company,
      servicos: state.services.filter((service) => Number(service.empresa_id) === Number(company.id) && service.ativo !== false),
      promocoes: state.promotions.filter((promo) => Number(promo.empresa_id) === Number(company.id) && promo.ativo !== false),
      total_profissionais: state.users.filter((user) => user.tipo === 'funcionario' && Number(user.empresa_id) === Number(company.id) && user.ativo !== false).length,
      disponivel_para_agendamento: true
    }));

const listCompanyEmployees = (companyId) =>
  state.users.filter((user) => user.tipo === 'funcionario' && Number(user.empresa_id) === Number(companyId) && user.ativo !== false);

const listCompanyServices = (companyId) =>
  state.services.filter((service) => Number(service.empresa_id) === Number(companyId) && service.ativo !== false);

const sanitizeServicePayload = (payload) => ({
  nome: String(payload?.nome || '').trim(),
  descricao: String(payload?.descricao || '').trim(),
  duracao_minutos: Math.max(15, Number(payload?.duracao_minutos || 60)),
  preco: Math.max(0, Number(payload?.preco || 0)),
  categoria: String(payload?.categoria || '').trim() || null,
  ativo: payload?.ativo !== false
});

const sanitizeEmployeePayload = (payload) => ({
  nome: String(payload?.nome || '').trim(),
  email: String(payload?.email || '').trim().toLowerCase(),
  telefone: normalizeDigits(payload?.telefone || ''),
  cpf: normalizeDigits(payload?.cpf || ''),
  cargo: String(payload?.cargo || '').trim(),
  senha: String(payload?.senha || '')
});

module.exports = {
  state,
  publicUser,
  findUserByIdentifier,
  getCompanyByUserId,
  getCompanyById,
  getCompanyForEmployee,
  createSession,
  resolveSession,
  listCompaniesForClients,
  listCompanyEmployees,
  listCompanyServices,
  sanitizeServicePayload,
  sanitizeEmployeePayload,
  nextId,
  nowIso
};
