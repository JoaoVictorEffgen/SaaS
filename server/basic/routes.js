const express = require('express');
const {
  state,
  publicUser,
  toPublicEmployee,
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
} = require('./store');

const router = express.Router();

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim();
};

const requireAuth = (req, res, next) => {
  const token = getTokenFromHeader(req);
  const user = resolveSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Nao autenticado' });
  }
  req.user = user;
  return next();
};

const requireType = (types) => (req, res, next) => {
  if (!req.user || !types.includes(req.user.tipo)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  return next();
};

const toAppointmentView = (appointment) => {
  const employee = state.users.find((user) => Number(user.id) === Number(appointment.funcionario_id));
  const customer = state.users.find((user) => Number(user.id) === Number(appointment.cliente_id));
  const company = state.companies.find((item) => Number(item.id) === Number(appointment.empresa_id));
  const selectedServices = state.services.filter((service) =>
    Array.isArray(appointment.servicos) && appointment.servicos.includes(Number(service.id))
  );

  return {
    ...appointment,
    cliente: customer ? { id: customer.id, nome: customer.nome } : null,
    funcionario: employee ? { id: employee.id, nome: employee.nome } : null,
    empresa: company ? { id: company.id, nome: company.nome } : null,
    servicos: selectedServices,
    hora: appointment.hora_inicio,
    data: appointment.data_agendamento
  };
};

const isFinalStatus = (status) => ['realizado', 'cancelado'].includes(String(status || ''));

const canTransitionStatus = (currentStatus, nextStatus) => {
  const from = String(currentStatus || '');
  const to = String(nextStatus || '');
  const allowed = {
    em_aprovacao: ['agendado', 'confirmado', 'cancelado'],
    pendente: ['agendado', 'confirmado', 'cancelado'],
    agendado: ['confirmado', 'realizado', 'cancelado'],
    confirmado: ['realizado', 'cancelado'],
    realizado: [],
    cancelado: []
  };
  return (allowed[from] || []).includes(to);
};

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    mode: 'basic',
    timestamp: nowIso(),
    uptime: process.uptime()
  });
});

router.post('/users/login', (req, res) => {
  const { identifier, senha, tipo, companyIdentifier } = req.body || {};
  if (!identifier || !senha) {
    return res.status(400).json({ error: 'Dados de acesso invalidos' });
  }

  const user = findUserByIdentifier(identifier, tipo);
  if (!user || String(user.senha) !== String(senha)) {
    return res.status(401).json({ error: 'Credenciais invalidas' });
  }

  if (user.tipo === 'funcionario' && companyIdentifier) {
    const company = getCompanyById(user.empresa_id);
    const normalized = String(companyIdentifier).trim().toLowerCase();
    const companyMatches = [
      String(company?.id || ''),
      String(company?.cnpj || '').toLowerCase(),
      String(company?.identificador_empresa || '').toLowerCase(),
      String(getCompanyByUserId(company?.user_id)?.nome || '').toLowerCase()
    ].includes(normalized);
    if (!companyMatches) {
      return res.status(401).json({ error: 'Empresa invalida para este funcionario' });
    }
  }

  const token = createSession(user.id);
  return res.json({ user: publicUser(user), token });
});

router.post('/users/register', (req, res) => {
  const {
    nome,
    email,
    senha,
    telefone,
    razaoSocial,
    cnpj
  } = req.body || {};

  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !senha || String(senha).length < 8) {
    return res.status(400).json({ error: 'Email e senha de no minimo 8 caracteres sao obrigatorios' });
  }

  if (state.users.some((user) => String(user.email).toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: 'Email ja cadastrado' });
  }

  const isCompany = Boolean(String(razaoSocial || '').trim() || String(cnpj || '').trim());
  const normalizedCnpj = String(cnpj || '').replace(/\D/g, '');
  if (
    isCompany &&
    normalizedCnpj &&
    state.companies.some((item) => String(item.cnpj || '').replace(/\D/g, '') === normalizedCnpj)
  ) {
    return res.status(409).json({ error: 'CNPJ ja cadastrado' });
  }

  const createdUser = {
    id: nextId(),
    tipo: isCompany ? 'empresa' : 'cliente',
    nome: isCompany ? String(razaoSocial || '').trim() : String(nome || '').trim(),
    email: normalizedEmail,
    senha: String(senha),
    telefone: String(telefone || '').trim(),
    cnpj: isCompany ? normalizedCnpj : null,
    plano: 'free',
    ativo: true
  };

  state.users.push(createdUser);
  let empresa = null;

  if (isCompany) {
    empresa = {
      id: nextId(),
      user_id: createdUser.id,
      nome: createdUser.nome,
      cnpj: createdUser.cnpj,
      telefone: createdUser.telefone,
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      descricao: '',
      categoria: '',
      horario_funcionamento: {
        horario_inicio: '08:00',
        horario_fim: '18:00',
        dias_trabalho: [1, 2, 3, 4, 5]
      },
      horario_inicio: '08:00',
      horario_fim: '18:00',
      whatsapp: createdUser.telefone,
      ativo: true,
      identificador_empresa: `EMP-${createdUser.id}`,
      logo_url: null,
      imagem_fundo_url: null
    };
    state.companies.push(empresa);
  }

  const token = createSession(createdUser.id);
  return res.status(201).json({
    user: publicUser(createdUser),
    empresa,
    token
  });
});

router.get('/users/profile', requireAuth, (req, res) => {
  res.json(publicUser(req.user));
});

router.put('/users/profile', requireAuth, (req, res) => {
  const allowedFields = ['nome', 'telefone', 'cpf', 'cargo', 'foto_url', 'url_foto_perfil', 'disponibilidade', 'pausas'];
  const updates = Object.fromEntries(
    Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key))
  );
  Object.assign(req.user, updates);
  res.json(publicUser(req.user));
});

router.get('/clientes/empresas', requireAuth, (req, res) => {
  const data = listCompaniesForClients();
  res.json({ success: true, data });
});

router.get('/clientes/empresa/:empresaId', requireAuth, (req, res) => {
  const company = getCompanyById(req.params.empresaId);
  if (!company || company.ativo === false) {
    return res.status(404).json({ error: 'Empresa nao encontrada' });
  }
  const data = {
    ...company,
    funcionarios: listCompanyEmployees(company.id).map(toPublicEmployee),
    servicos: listCompanyServices(company.id)
  };
  return res.json({ success: true, data });
});

router.get('/clientes/empresa/:empresaId/disponibilidade', requireAuth, (req, res) => {
  const { funcionario_id, data } = req.query;
  const appointments = state.appointments.filter((appointment) =>
    String(appointment.funcionario_id) === String(funcionario_id) &&
    String(appointment.data_agendamento) === String(data) &&
    appointment.status !== 'cancelado'
  );
  const occupied = appointments.map((appointment) => ({
    hora: appointment.hora_inicio,
    duracao_minutos: appointment.duracao_minutos || 60
  }));
  res.json({ success: true, data: occupied });
});

router.get('/empresas', (req, res) => {
  res.json(state.companies);
});

router.get('/empresas/me', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyByUserId(req.user.id);
  if (!company) return res.status(404).json({ error: 'Empresa nao encontrada' });
  return res.json(company);
});

router.get('/empresas/:id', (req, res) => {
  const company = getCompanyById(req.params.id);
  if (!company) return res.status(404).json({ error: 'Empresa nao encontrada' });
  return res.json(company);
});

router.put('/empresas/:id', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyById(req.params.id);
  if (!company || Number(company.user_id) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Sem permissao para atualizar a empresa' });
  }

  const allowed = ['nome', 'telefone', 'endereco', 'cidade', 'estado', 'cep', 'descricao', 'horario_funcionamento', 'whatsapp', 'logo_url', 'imagem_fundo_url', 'categoria', 'horario_inicio', 'horario_fim'];
  const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
  Object.assign(company, updates);
  return res.json(company);
});

router.get('/empresas/me/servicos', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyByUserId(req.user.id);
  if (!company) return res.status(404).json({ error: 'Empresa nao encontrada' });
  return res.json({ success: true, data: listCompanyServices(company.id) });
});

router.post('/empresas/me/servicos', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyByUserId(req.user.id);
  if (!company) return res.status(404).json({ error: 'Empresa nao encontrada' });
  const payload = sanitizeServicePayload(req.body);
  if (!payload.nome) return res.status(400).json({ error: 'Nome do servico e obrigatorio' });
  const normalizedServiceName = String(payload.nome).trim().toLowerCase();
  const alreadyExists = state.services.some((item) =>
    Number(item.empresa_id) === Number(company.id) &&
    item.ativo !== false &&
    String(item.nome || '').trim().toLowerCase() === normalizedServiceName
  );
  if (alreadyExists) {
    return res.status(409).json({ error: 'Ja existe um servico ativo com este nome' });
  }
  const created = { id: nextId(), empresa_id: company.id, ...payload };
  state.services.push(created);
  return res.status(201).json(created);
});

router.put('/empresas/me/servicos/:id', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyByUserId(req.user.id);
  const service = state.services.find((item) => Number(item.id) === Number(req.params.id) && Number(item.empresa_id) === Number(company?.id));
  if (!service) return res.status(404).json({ error: 'Servico nao encontrado' });
  Object.assign(service, sanitizeServicePayload({ ...service, ...req.body }));
  return res.json(service);
});

router.delete('/empresas/me/servicos/:id', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyByUserId(req.user.id);
  const service = state.services.find((item) => Number(item.id) === Number(req.params.id) && Number(item.empresa_id) === Number(company?.id));
  if (!service) return res.status(404).json({ error: 'Servico nao encontrado' });
  service.ativo = false;
  return res.json({ success: true });
});

router.get('/empresas/me/funcionarios', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyByUserId(req.user.id);
  if (!company) return res.status(404).json({ error: 'Empresa nao encontrada' });
  return res.json({ success: true, data: listCompanyEmployees(company.id).map(publicUser) });
});

router.post('/empresas/me/funcionarios', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyByUserId(req.user.id);
  if (!company) return res.status(404).json({ error: 'Empresa nao encontrada' });
  const payload = sanitizeEmployeePayload(req.body);
  if (!payload.nome || !payload.email || !payload.telefone || !payload.cpf || !payload.senha) {
    return res.status(400).json({ error: 'Dados do funcionario incompletos' });
  }
  if (state.users.some((item) => String(item.email).toLowerCase() === payload.email)) {
    return res.status(409).json({ error: 'Email ja cadastrado' });
  }
  if (state.users.some((item) => item.tipo === 'funcionario' && String(item.cpf || '') === String(payload.cpf || ''))) {
    return res.status(409).json({ error: 'CPF ja cadastrado para outro funcionario' });
  }
  const created = {
    id: nextId(),
    tipo: 'funcionario',
    nome: payload.nome,
    email: payload.email,
    telefone: payload.telefone,
    cpf: payload.cpf,
    cargo: payload.cargo || 'Funcionario',
    senha: payload.senha,
    empresa_id: company.id,
    ativo: true,
    plano: 'free',
    disponibilidade: null,
    pausas: []
  };
  state.users.push(created);
  return res.status(201).json(publicUser(created));
});

router.put('/empresas/me/funcionarios/:id', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyByUserId(req.user.id);
  const employee = state.users.find((item) =>
    Number(item.id) === Number(req.params.id) &&
    item.tipo === 'funcionario' &&
    Number(item.empresa_id) === Number(company?.id)
  );
  if (!employee) return res.status(404).json({ error: 'Funcionario nao encontrado' });

  const payload = sanitizeEmployeePayload({ ...employee, ...req.body });
  const duplicateEmail = state.users.some((item) =>
    Number(item.id) !== Number(employee.id) &&
    String(item.email || '').toLowerCase() === String(payload.email || '').toLowerCase()
  );
  if (duplicateEmail) {
    return res.status(409).json({ error: 'Email ja cadastrado' });
  }
  const duplicateCpf = state.users.some((item) =>
    Number(item.id) !== Number(employee.id) &&
    item.tipo === 'funcionario' &&
    String(item.cpf || '') === String(payload.cpf || '')
  );
  if (duplicateCpf) {
    return res.status(409).json({ error: 'CPF ja cadastrado para outro funcionario' });
  }
  const updates = {
    nome: payload.nome,
    email: payload.email,
    telefone: payload.telefone,
    cpf: payload.cpf,
    cargo: payload.cargo
  };
  if (payload.senha) updates.senha = payload.senha;
  Object.assign(employee, updates);
  return res.json(publicUser(employee));
});

router.delete('/empresas/me/funcionarios/:id', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyByUserId(req.user.id);
  const employee = state.users.find((item) =>
    Number(item.id) === Number(req.params.id) &&
    item.tipo === 'funcionario' &&
    Number(item.empresa_id) === Number(company?.id)
  );
  if (!employee) return res.status(404).json({ error: 'Funcionario nao encontrado' });
  employee.ativo = false;
  return res.json({ success: true });
});

router.get('/funcionarios/empresa', requireAuth, requireType(['funcionario']), (req, res) => {
  const company = getCompanyForEmployee(req.user.id);
  if (!company) return res.status(404).json({ error: 'Empresa nao encontrada' });
  return res.json(company);
});

router.get('/funcionarios/agendamentos', requireAuth, requireType(['funcionario']), (req, res) => {
  const data = state.appointments
    .filter((appointment) => Number(appointment.funcionario_id) === Number(req.user.id))
    .map(toAppointmentView);
  return res.json({ success: true, data });
});

router.put('/funcionarios/agendamento/:id/status', requireAuth, requireType(['funcionario']), (req, res) => {
  const appointment = state.appointments.find((item) =>
    Number(item.id) === Number(req.params.id) &&
    Number(item.funcionario_id) === Number(req.user.id)
  );
  if (!appointment) return res.status(404).json({ error: 'Agendamento nao encontrado' });
  const status = String(req.body?.status || '');
  if (!['em_aprovacao', 'agendado', 'confirmado', 'realizado', 'cancelado'].includes(status)) {
    return res.status(400).json({ error: 'Status invalido' });
  }
  if (!canTransitionStatus(appointment.status, status)) {
    return res.status(400).json({ error: 'Transicao de status invalida para este agendamento' });
  }
  appointment.status = status;
  appointment.updated_at = nowIso();
  return res.json(toAppointmentView(appointment));
});

router.get('/agendamentos', requireAuth, (req, res) => {
  let data = [];
  if (req.user.tipo === 'cliente') {
    data = state.appointments.filter((item) => Number(item.cliente_id) === Number(req.user.id));
  } else if (req.user.tipo === 'funcionario') {
    data = state.appointments.filter((item) => Number(item.funcionario_id) === Number(req.user.id));
  } else {
    const company = getCompanyByUserId(req.user.id);
    data = state.appointments.filter((item) => Number(item.empresa_id) === Number(company?.id));
  }
  return res.json(data.map(toAppointmentView));
});

router.get('/agendamentos/hoje', requireAuth, (req, res) => {
  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');
  const list = state.appointments
    .filter((item) => item.data_agendamento === todayKey)
    .map(toAppointmentView);
  return res.json(list);
});

router.post('/agendamentos', requireAuth, requireType(['cliente']), (req, res) => {
  const { empresa_id, funcionario_id, data_agendamento, hora_inicio, servicos } = req.body || {};

  if (!empresa_id || !funcionario_id || !data_agendamento || !hora_inicio || !Array.isArray(servicos) || servicos.length === 0) {
    return res.status(400).json({ error: 'Dados do agendamento incompletos' });
  }

  const company = getCompanyById(empresa_id);
  if (!company) return res.status(404).json({ error: 'Empresa nao encontrada' });

  const employee = state.users.find((item) => Number(item.id) === Number(funcionario_id) && item.tipo === 'funcionario' && item.ativo !== false);
  if (!employee) return res.status(404).json({ error: 'Funcionario nao encontrado' });

  const selectedServices = state.services.filter((service) => servicos.includes(Number(service.id)));
  if (selectedServices.length === 0) return res.status(400).json({ error: 'Selecione ao menos um servico valido' });

  const requestedStart = String(hora_inicio).slice(0, 5);
  const requestedDuration = selectedServices.reduce((sum, service) => sum + Number(service.duracao_minutos || 0), 0) || 30;
  const toMinutes = (hourText) => {
    const [hour, minute] = String(hourText || '00:00').split(':').map(Number);
    return (hour * 60) + (minute || 0);
  };
  const requestedStartMinutes = toMinutes(requestedStart);
  const requestedEndMinutes = requestedStartMinutes + requestedDuration;

  const conflict = state.appointments.find((item) => {
    if (Number(item.funcionario_id) !== Number(funcionario_id)) return false;
    if (String(item.data_agendamento) !== String(data_agendamento)) return false;
    if (isFinalStatus(item.status)) return false;
    const start = toMinutes(item.hora_inicio);
    const end = start + (Number(item.duracao_minutos) || 30);
    return requestedStartMinutes < end && requestedEndMinutes > start;
  });
  if (conflict) {
    return res.status(409).json({ error: 'Horario indisponivel para este profissional' });
  }

  const appointment = {
    id: nextId(),
    empresa_id: Number(empresa_id),
    funcionario_id: Number(funcionario_id),
    cliente_id: Number(req.user.id),
    data_agendamento: String(data_agendamento),
    hora_inicio: requestedStart,
    status: 'em_aprovacao',
    servicos: selectedServices.map((service) => Number(service.id)),
    valor_total: selectedServices.reduce((sum, service) => sum + Number(service.preco || 0), 0),
    duracao_minutos: selectedServices.reduce((sum, service) => sum + Number(service.duracao_minutos || 0), 0),
    justificativa_cancelamento: null,
    created_at: nowIso(),
    updated_at: nowIso()
  };

  state.appointments.push(appointment);
  return res.status(201).json(toAppointmentView(appointment));
});

router.put('/agendamentos/:id/cancelar', requireAuth, (req, res) => {
  const appointment = state.appointments.find((item) => Number(item.id) === Number(req.params.id));
  if (!appointment) return res.status(404).json({ error: 'Agendamento nao encontrado' });

  const isOwner =
    Number(appointment.cliente_id) === Number(req.user.id) ||
    Number(appointment.funcionario_id) === Number(req.user.id);
  if (!isOwner) return res.status(403).json({ error: 'Sem permissao para cancelar este agendamento' });
  if (isFinalStatus(appointment.status)) {
    return res.status(400).json({ error: 'Agendamento ja finalizado e nao pode ser cancelado' });
  }

  appointment.status = 'cancelado';
  appointment.justificativa_cancelamento = String(req.body?.justificativa || '').trim() || null;
  appointment.updated_at = nowIso();
  return res.json(toAppointmentView(appointment));
});

router.put('/agendamentos/:id/confirmar', requireAuth, (req, res) => {
  const appointment = state.appointments.find((item) => Number(item.id) === Number(req.params.id));
  if (!appointment) return res.status(404).json({ error: 'Agendamento nao encontrado' });

  const isEmployee = Number(appointment.funcionario_id) === Number(req.user.id);
  if (!isEmployee) return res.status(403).json({ error: 'Sem permissao para confirmar este agendamento' });

  appointment.status = 'confirmado';
  appointment.updated_at = nowIso();
  return res.json(toAppointmentView(appointment));
});

router.post('/upload-fotos/foto-perfil', requireAuth, (req, res) => {
  req.user.url_foto_perfil = req.user.url_foto_perfil || null;
  return res.json({ url: req.user.url_foto_perfil });
});

router.post('/upload-fotos/logo-empresa/:empresaId', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyById(req.params.empresaId);
  if (!company || Number(company.user_id) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Sem permissao para alterar o logo da empresa' });
  }
  company.logo_url = company.logo_url || null;
  return res.json({ logo_url: company.logo_url });
});

router.delete('/upload-fotos/logo-empresa/:empresaId', requireAuth, requireType(['empresa']), (req, res) => {
  const company = getCompanyById(req.params.empresaId);
  if (!company || Number(company.user_id) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Sem permissao para alterar o logo da empresa' });
  }
  company.logo_url = null;
  return res.json({ success: true });
});

router.post('/auth', (req, res) => {
  return res.json({ success: true, message: 'Modo basico: codigo enviado (simulado)' });
});

router.post('/auth/verificar-codigo', (req, res) => {
  return res.json({ success: true, message: 'Modo basico: codigo validado (simulado)' });
});

router.post('/auth/redefinir', (req, res) => {
  return res.json({ success: true, message: 'Modo basico: senha redefinida (simulado)' });
});

router.get('/pacotes', requireAuth, (req, res) => {
  return res.json([]);
});

router.get('/promocoes', requireAuth, (req, res) => {
  return res.json(state.promotions);
});

router.get('/empresas/:id/promocoes', (req, res) => {
  const data = state.promotions.filter((item) => Number(item.empresa_id) === Number(req.params.id));
  return res.json(data);
});

router.put('/promocoes/:id', requireAuth, requireType(['empresa']), (req, res) => {
  const promo = state.promotions.find((item) => Number(item.id) === Number(req.params.id));
  if (!promo) return res.status(404).json({ error: 'Promocao nao encontrada' });
  Object.assign(promo, req.body || {});
  return res.json(promo);
});

router.post('/notifications', requireAuth, (req, res) => {
  return res.json({ success: true, message: 'Notificacao registrada no modo basico.' });
});

router.get('/redes', requireAuth, requireType(['empresa']), (req, res) => {
  const ownCompany = getCompanyByUserId(req.user.id);
  const rede = state.redes.find((item) => Number(item.usuario_admin_id) === Number(req.user.id));
  if (!rede) return res.status(404).json({ error: 'Rede nao encontrada' });

  const companies = state.companies.filter((company) => company.ativo !== false);
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  return res.json({
    ...rede,
    empresas: companies,
    empresas_ativas: companies.length,
    trialStatus: {
      isTrial: rede.plano === 'trial',
      expirado: false,
      diasRestantes: Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000))
    },
    usuario_admin_id: ownCompany?.user_id || rede.usuario_admin_id
  });
});

router.post('/redes', requireAuth, requireType(['empresa']), (req, res) => {
  const payload = req.body || {};
  const existing = state.redes.find((item) => Number(item.usuario_admin_id) === Number(req.user.id));
  if (existing) return res.status(409).json({ error: 'Rede ja existente para esta conta' });

  const created = {
    id: nextId(),
    nome_rede: String(payload.nome_rede || '').trim() || 'Minha Rede',
    descricao: String(payload.descricao || '').trim() || '',
    plano: String(payload.plano || 'trial'),
    usuario_admin_id: req.user.id,
    limite_empresas: 3,
    empresas_ativas: state.companies.length,
    logo_rede_url: null,
    cpf_cnpj_usado: String(payload.cpf_cnpj || '').trim() || null
  };
  state.redes.push(created);
  return res.status(201).json({ ...created, empresas: state.companies });
});

router.post('/redes/:redeId/empresas', requireAuth, requireType(['empresa']), (req, res) => {
  const rede = state.redes.find((item) => Number(item.id) === Number(req.params.redeId));
  if (!rede || Number(rede.usuario_admin_id) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Sem permissao para adicionar filial' });
  }

  const payload = req.body || {};
  const created = {
    id: nextId(),
    user_id: req.user.id,
    nome: payload.nome_unidade || 'Filial',
    nome_unidade: payload.nome_unidade || 'Filial',
    cnpj: null,
    telefone: payload.whatsapp || '',
    endereco: payload.endereco || '',
    cidade: payload.cidade || '',
    estado: payload.estado || '',
    cep: payload.cep || '',
    descricao: '',
    categoria: '',
    horario_funcionamento: {
      horario_inicio: '08:00',
      horario_fim: '18:00',
      dias_trabalho: [1, 2, 3, 4, 5]
    },
    horario_inicio: '08:00',
    horario_fim: '18:00',
    whatsapp: payload.whatsapp || '',
    ativo: true,
    identificador_empresa: `EMP-${nextId()}`,
    logo_url: null,
    imagem_fundo_url: null
  };
  state.companies.push(created);
  return res.status(201).json(created);
});

router.delete('/redes/empresas/:empresaId', requireAuth, requireType(['empresa']), (req, res) => {
  const target = state.companies.find((company) => Number(company.id) === Number(req.params.empresaId));
  if (!target) return res.status(404).json({ success: false, message: 'Filial nao encontrada' });
  if (Number(target.user_id) !== Number(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Sem permissao para excluir esta filial' });
  }
  target.ativo = false;
  return res.json({ success: true, message: 'Filial desativada com sucesso' });
});

module.exports = router;
