const crypto = require('crypto');

const nowIso = () => new Date().toISOString();

const createIdGenerator = (startAt = 10) => {
  let current = startAt;
  return () => {
    current += 1;
    return current;
  };
};

const nextId = createIdGenerator(10);
const createToken = () => crypto.randomBytes(24).toString('hex');

const normalizePhone = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
};

const toMinutes = (hourText) => {
  const [hour, minute] = String(hourText || '00:00').split(':').map(Number);
  return (hour * 60) + (minute || 0);
};

const state = {
  establishment: {
    id: 1,
    nome: 'Salao Beleza Demo',
    descricao: 'Atendimento de beleza e estetica.',
    cidade: 'Sao Paulo',
    endereco: 'Rua Central, 123',
    whatsapp: '5511999990001',
    horario_inicio: '08:00',
    horario_fim: '18:00',
    dias_trabalho: [1, 2, 3, 4, 5],
    lembrete_horas: 24,
    confirmacao_automatica: true,
    licenca_codigo: 'TF-DEMO-LOCAL',
    ativo: true
  },
  users: [
    {
      id: 1,
      tipo: 'dono',
      nome: 'Dono do Salao',
      email: 'empresa@timeflow.local',
      senha: '12345678',
      telefone: '5511999990001',
      ativo: true
    },
    {
      id: 2,
      tipo: 'funcionario',
      nome: 'Ana Martins',
      email: 'funcionario@timeflow.local',
      senha: '12345678',
      telefone: '5511999990002',
      cargo: 'Especialista',
      ativo: true
    },
    {
      id: 3,
      tipo: 'vendedor',
      nome: 'Comercial TimeFlow',
      email: 'vendas@timeflow.local',
      senha: '12345678',
      telefone: '5511999990009',
      ativo: true
    }
  ],
  services: [
    {
      id: 1,
      nome: 'Corte feminino',
      descricao: 'Corte e finalizacao.',
      duracao_minutos: 60,
      preco: 90,
      ativo: true
    },
    {
      id: 2,
      nome: 'Escova',
      descricao: 'Escova modeladora.',
      duracao_minutos: 45,
      preco: 65,
      ativo: true
    }
  ],
  appointments: [],
  messages: [],
  conversations: new Map(),
  licenses: [
    {
      codigo: 'TF-DEMO-LOCAL',
      cliente_nome: 'Salao Beleza Demo',
      status: 'ativada',
      criada_em: nowIso(),
      ativada_em: nowIso(),
      observacao: 'Licenca desta instalacao. Cada codigo libera um unico estabelecimento.'
    }
  ],
  sessions: new Map()
};

const publicUser = (user) => {
  if (!user) return null;
  const { senha, ...safe } = user;
  return safe;
};

const findUserByIdentifier = (identifier) => {
  const value = String(identifier || '').trim().toLowerCase();
  const digits = normalizePhone(value);
  return state.users.find((user) => {
    if (!user.ativo) return false;
    return String(user.email || '').toLowerCase() === value || normalizePhone(user.telefone) === digits;
  });
};

const createSession = (userId) => {
  const token = createToken();
  state.sessions.set(token, Number(userId));
  return token;
};

const resolveSession = (token) => {
  const userId = state.sessions.get(String(token || ''));
  if (!userId) return null;
  return state.users.find((user) => Number(user.id) === Number(userId) && user.ativo) || null;
};

const activeServices = () => state.services.filter((service) => service.ativo !== false);
const activeStaff = () => state.users.filter((user) => user.tipo === 'funcionario' && user.ativo !== false);

const hasConflict = ({ funcionarioId, data, hora, duracao, ignoreId = null }) => {
  const start = toMinutes(hora);
  const end = start + Number(duracao || 30);
  return state.appointments.some((item) => {
    if (ignoreId && Number(item.id) === Number(ignoreId)) return false;
    if (Number(item.funcionario_id) !== Number(funcionarioId)) return false;
    if (String(item.data) !== String(data)) return false;
    if (['cancelado', 'realizado'].includes(item.status)) return false;
    const itemStart = toMinutes(item.hora);
    const itemEnd = itemStart + Number(item.duracao_minutos || 30);
    return start < itemEnd && end > itemStart;
  });
};

const listUpcomingSlots = (funcionarioId, duracao, limit = 5) => {
  const establishment = state.establishment;
  const startMin = toMinutes(establishment.horario_inicio);
  const endMin = toMinutes(establishment.horario_fim);
  const slots = [];
  const now = new Date();

  for (let offset = 0; offset < 21 && slots.length < limit; offset += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    if (!establishment.dias_trabalho.includes(day.getDay())) continue;
    const data = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, '0'),
      String(day.getDate()).padStart(2, '0')
    ].join('-');

    for (let minute = startMin; minute + duracao <= endMin && slots.length < limit; minute += duracao) {
      const hora = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
      const slotDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(minute / 60), minute % 60);
      if (slotDate <= now) continue;
      if (hasConflict({ funcionarioId, data, hora, duracao })) continue;
      slots.push({
        indice: slots.length + 1,
        data,
        hora,
        label: `${data.slice(8, 10)}/${data.slice(5, 7)} as ${hora}`
      });
    }
  }

  return slots;
};

const createAppointment = ({ nome, telefone, servico, funcionario, data, hora, origem }) => {
  const appointment = {
    id: nextId(),
    cliente_nome: String(nome || 'Cliente').trim() || 'Cliente',
    cliente_telefone: normalizePhone(telefone),
    servico_id: servico.id,
    servico_nome: servico.nome,
    funcionario_id: funcionario.id,
    funcionario_nome: funcionario.nome,
    data: String(data),
    hora: String(hora).slice(0, 5),
    duracao_minutos: Number(servico.duracao_minutos || 30),
    valor: Number(servico.preco || 0),
    status: 'aguardando_confirmacao',
    origem,
    lembrete_enviado: false,
    created_at: nowIso(),
    updated_at: nowIso()
  };
  state.appointments.push(appointment);
  return appointment;
};

const findPendingByPhone = (telefone) => {
  const phone = normalizePhone(telefone);
  return [...state.appointments]
    .reverse()
    .find((item) => item.cliente_telefone === phone && item.status === 'aguardando_confirmacao');
};

module.exports = {
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
  createAppointment,
  findPendingByPhone
};
