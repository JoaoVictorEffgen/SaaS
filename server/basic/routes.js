const express = require('express');
const {
  state,
  nowIso,
  nextId,
  normalizePhone,
  publicUser,
  findUserByIdentifier,
  createSession,
  resolveSession,
  activeServices,
  activeStaff,
  hasConflict,
  listUpcomingSlots,
  createAppointment
} = require('./store');
const {
  handleInbound,
  notifyAppointment,
  processReminders,
  startScheduler,
  readInbound
} = require('./whatsapp');

const router = express.Router();

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim();
};

const requireAuth = (req, res, next) => {
  const user = resolveSession(getTokenFromHeader(req));
  if (!user) return res.status(401).json({ error: 'Nao autenticado' });
  req.user = user;
  return next();
};

const requireType = (types) => (req, res, next) => {
  if (!req.user || !types.includes(req.user.tipo)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  return next();
};

const publicEstablishment = () => ({
  ...state.establishment,
  servicos: activeServices(),
  equipe: activeStaff().map((person) => ({
    id: person.id,
    nome: person.nome,
    cargo: person.cargo || 'Profissional'
  }))
});

const canTransition = (from, to) => {
  const allowed = {
    aguardando_confirmacao: ['confirmado', 'cancelado'],
    confirmado: ['realizado', 'cancelado', 'no_show'],
    realizado: [],
    cancelado: [],
    no_show: []
  };
  return (allowed[from] || []).includes(to);
};

const book = async ({ nome, telefone, servicoId, funcionarioId, data, hora, origem }) => {
  const servico = activeServices().find((item) => Number(item.id) === Number(servicoId));
  const funcionario = activeStaff().find((item) => Number(item.id) === Number(funcionarioId));
  if (!nome || !normalizePhone(telefone) || !servico || !funcionario || !data || !hora) {
    return { status: 400, body: { error: 'Dados do agendamento incompletos' } };
  }
  if (hasConflict({
    funcionarioId: funcionario.id,
    data,
    hora,
    duracao: servico.duracao_minutos
  })) {
    return { status: 409, body: { error: 'Horario indisponivel para este profissional' } };
  }
  const appointment = createAppointment({
    nome,
    telefone,
    servico,
    funcionario,
    data,
    hora,
    origem
  });
  const mensagem = await notifyAppointment(appointment, 'confirmacao');
  return { status: 201, body: { agendamento: appointment, mensagem } };
};

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    mode: 'estabelecimento',
    estabelecimento: state.establishment.nome,
    timestamp: nowIso(),
    uptime: process.uptime()
  });
});

router.get('/estabelecimento', (req, res) => {
  res.json(publicEstablishment());
});

router.put('/estabelecimento', requireAuth, requireType(['dono']), (req, res) => {
  const allowed = ['nome', 'descricao', 'cidade', 'endereco', 'whatsapp', 'horario_inicio', 'horario_fim', 'dias_trabalho', 'lembrete_horas', 'confirmacao_automatica'];
  for (const key of allowed) {
    if (req.body?.[key] !== undefined) state.establishment[key] = req.body[key];
  }
  if (state.establishment.whatsapp) {
    state.establishment.whatsapp = normalizePhone(state.establishment.whatsapp);
  }
  state.establishment.lembrete_horas = Math.max(1, Number(state.establishment.lembrete_horas) || 24);
  res.json(publicEstablishment());
});

router.get('/disponibilidade', (req, res) => {
  const servico = activeServices().find((item) => Number(item.id) === Number(req.query.servico_id));
  const funcionario = activeStaff().find((item) => Number(item.id) === Number(req.query.funcionario_id));
  if (!servico || !funcionario) {
    return res.status(400).json({ error: 'Servico e profissional sao obrigatorios' });
  }
  return res.json({
    data: listUpcomingSlots(funcionario.id, Number(servico.duracao_minutos || 30), 8)
  });
});

router.post('/users/login', (req, res) => {
  const { identifier, senha } = req.body || {};
  const user = findUserByIdentifier(identifier);
  if (!user || String(user.senha) !== String(senha || '')) {
    return res.status(401).json({ error: 'Credenciais invalidas' });
  }
  return res.json({ user: publicUser(user), token: createSession(user.id) });
});

router.post('/users/register', (req, res) => {
  return res.status(409).json({
    error: 'Este sistema atende um unico estabelecimento. Para vender a outro negocio, gere uma licenca e use uma instalacao nova.'
  });
});

router.get('/users/profile', requireAuth, (req, res) => {
  res.json(publicUser(req.user));
});

router.get('/agendamentos', requireAuth, requireType(['dono', 'funcionario']), (req, res) => {
  const data = state.appointments.filter((item) => (
    req.user.tipo === 'dono' || Number(item.funcionario_id) === Number(req.user.id)
  ));
  res.json(data);
});

router.post('/agendamentos', async (req, res) => {
  const { nome, telefone, servico_id, funcionario_id, data, hora } = req.body || {};
  const result = await book({
    nome,
    telefone,
    servicoId: servico_id,
    funcionarioId: funcionario_id,
    data,
    hora,
    origem: 'site'
  });
  return res.status(result.status).json(result.body);
});

router.put('/agendamentos/:id/status', requireAuth, requireType(['dono', 'funcionario']), async (req, res) => {
  const appointment = state.appointments.find((item) => Number(item.id) === Number(req.params.id));
  if (!appointment) return res.status(404).json({ error: 'Agendamento nao encontrado' });
  if (req.user.tipo === 'funcionario' && Number(appointment.funcionario_id) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const status = String(req.body?.status || '');
  if (!canTransition(appointment.status, status)) {
    return res.status(400).json({ error: 'Transicao de status invalida para este agendamento' });
  }
  appointment.status = status;
  appointment.updated_at = nowIso();

  let mensagem = null;
  if (status === 'cancelado') {
    mensagem = await notifyAppointment(appointment, 'cancelamento');
  }
  if (status === 'realizado') {
    mensagem = await notifyAppointment(appointment, 'avaliacao');
  }

  return res.json({ ...appointment, mensagem });
});

router.get('/servicos', requireAuth, requireType(['dono']), (req, res) => {
  res.json(state.services);
});

router.post('/servicos', requireAuth, requireType(['dono']), (req, res) => {
  const nome = String(req.body?.nome || '').trim();
  if (!nome) return res.status(400).json({ error: 'Nome do servico e obrigatorio' });
  const exists = activeServices().some((item) => item.nome.trim().toLowerCase() === nome.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Ja existe um servico ativo com este nome' });
  const created = {
    id: nextId(),
    nome,
    descricao: String(req.body?.descricao || '').trim(),
    duracao_minutos: Math.max(15, Number(req.body?.duracao_minutos) || 30),
    preco: Math.max(0, Number(req.body?.preco) || 0),
    ativo: true
  };
  state.services.push(created);
  return res.status(201).json(created);
});

router.put('/servicos/:id', requireAuth, requireType(['dono']), (req, res) => {
  const service = state.services.find((item) => Number(item.id) === Number(req.params.id));
  if (!service) return res.status(404).json({ error: 'Servico nao encontrado' });
  if (req.body?.nome) service.nome = String(req.body.nome).trim();
  if (req.body?.descricao !== undefined) service.descricao = String(req.body.descricao || '').trim();
  if (req.body?.duracao_minutos !== undefined) service.duracao_minutos = Math.max(15, Number(req.body.duracao_minutos) || 30);
  if (req.body?.preco !== undefined) service.preco = Math.max(0, Number(req.body.preco) || 0);
  if (req.body?.ativo !== undefined) service.ativo = Boolean(req.body.ativo);
  return res.json(service);
});

router.get('/equipe', requireAuth, requireType(['dono']), (req, res) => {
  res.json(activeStaff().map(publicUser));
});

router.post('/equipe', requireAuth, requireType(['dono']), (req, res) => {
  const nome = String(req.body?.nome || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const telefone = normalizePhone(req.body?.telefone);
  const senha = String(req.body?.senha || '');
  if (!nome || !email || !telefone || senha.length < 8) {
    return res.status(400).json({ error: 'Nome, e-mail, WhatsApp e senha de 8 caracteres sao obrigatorios' });
  }
  if (state.users.some((item) => String(item.email).toLowerCase() === email)) {
    return res.status(409).json({ error: 'E-mail ja cadastrado' });
  }
  const created = {
    id: nextId(),
    tipo: 'funcionario',
    nome,
    email,
    telefone,
    senha,
    cargo: String(req.body?.cargo || 'Profissional').trim(),
    ativo: true
  };
  state.users.push(created);
  return res.status(201).json(publicUser(created));
});

router.get('/whatsapp/mensagens', requireAuth, requireType(['dono', 'funcionario']), (req, res) => {
  res.json(state.messages);
});

router.get('/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expected = process.env.WHATSAPP_VERIFY_TOKEN || 'timeflow_verify_token';
  if (mode === 'subscribe' && token === expected) {
    return res.status(200).send(String(challenge || ''));
  }
  return res.status(403).json({ error: 'Token de verificacao invalido' });
});

router.post('/whatsapp/webhook', async (req, res) => {
  const inbound = readInbound(req.body || {});
  const result = await handleInbound(inbound);
  res.json({ success: true, ...result });
});

router.post('/whatsapp/processar', requireAuth, requireType(['dono']), async (req, res) => {
  const enviados = await processReminders();
  res.json({ enviados: enviados.length, mensagens: enviados });
});

router.get('/vendas', requireAuth, requireType(['vendedor']), (req, res) => {
  res.json(state.licenses);
});

router.post('/vendas', requireAuth, requireType(['vendedor']), (req, res) => {
  const clienteNome = String(req.body?.cliente_nome || '').trim();
  if (!clienteNome) return res.status(400).json({ error: 'Informe o nome do estabelecimento comprador' });
  const created = {
    codigo: `TF-${nextId().toString(16).toUpperCase()}${Date.now().toString(16).slice(-4).toUpperCase()}`,
    cliente_nome: clienteNome,
    status: 'disponivel',
    criada_em: nowIso(),
    ativada_em: null,
    observacao: 'Use este codigo em uma instalacao nova. Esta copia continua atendendo somente o estabelecimento atual.'
  };
  state.licenses.push(created);
  return res.status(201).json(created);
});

router.post('/licenca/ativar', (req, res) => {
  if (state.establishment.licenca_codigo) {
    return res.status(409).json({
      error: 'Esta instalacao ja pertence a um estabelecimento. Cada copia atende somente um negocio. Use o codigo em uma instalacao nova.'
    });
  }

  const codigo = String(req.body?.codigo || '').trim().toUpperCase();
  const nome = String(req.body?.nome_estabelecimento || '').trim();
  if (!codigo || !nome) {
    return res.status(400).json({ error: 'Informe o codigo da licenca e o nome do estabelecimento' });
  }

  const license = state.licenses.find((item) => String(item.codigo).toUpperCase() === codigo);
  if (!license) return res.status(404).json({ error: 'Licenca nao encontrada' });
  if (license.status !== 'disponivel') {
    return res.status(409).json({ error: 'Licenca indisponivel para ativacao' });
  }

  license.status = 'ativada';
  license.ativada_em = nowIso();
  license.cliente_nome = nome;
  state.establishment.licenca_codigo = license.codigo;
  state.establishment.nome = nome;
  state.establishment.ativo = true;

  return res.json({
    success: true,
    estabelecimento: publicEstablishment(),
    licenca: license
  });
});

startScheduler();

module.exports = router;
