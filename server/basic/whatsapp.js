const {
  state,
  nowIso,
  nextId,
  normalizePhone,
  activeServices,
  activeStaff,
  publicUser,
  listUpcomingSlots,
  createAppointment,
  findPendingByPhone
} = require('./store');

const money = (value) => Number(value || 0).toFixed(2).replace('.', ',');

const confirmationText = (appointment) => {
  const place = state.establishment.nome;
  return [
    `Ola, ${appointment.cliente_nome}!`,
    `Reservei ${appointment.servico_nome} com ${appointment.funcionario_nome} no ${place}.`,
    `Data: ${appointment.data.split('-').reverse().join('/')} as ${appointment.hora}.`,
    'Responda SIM para confirmar ou NAO para cancelar.'
  ].join(' ');
};

const reminderText = (appointment) => {
  const when = `${appointment.data.split('-').reverse().join('/')} as ${appointment.hora}`;
  if (appointment.status === 'aguardando_confirmacao') {
    return `Lembrete do ${state.establishment.nome}: ${appointment.servico_nome} em ${when} ainda aguarda confirmacao. Responda SIM para confirmar ou NAO para cancelar.`;
  }
  return `Lembrete do ${state.establishment.nome}: ${appointment.servico_nome} com ${appointment.funcionario_nome} em ${when}. Te esperamos.`;
};

const cancellationText = (appointment) => {
  const when = `${appointment.data.split('-').reverse().join('/')} as ${appointment.hora}`;
  return `Seu horario de ${appointment.servico_nome} em ${when} no ${state.establishment.nome} foi cancelado. Quando quiser, envie OI para remarcar.`;
};

const reviewText = (appointment) => (
  `Obrigado por vir ao ${state.establishment.nome}! Como foi o atendimento de ${appointment.servico_nome}? Responda com uma nota de 1 a 5.`
);

const pushMessage = ({ telefone, direcao, tipo, texto, agendamentoId = null, status = 'registrado' }) => {
  const message = {
    id: nextId(),
    telefone: normalizePhone(telefone),
    direcao,
    tipo,
    texto,
    status,
    agendamento_id: agendamentoId,
    created_at: nowIso()
  };
  state.messages.push(message);
  return message;
};

const deliver = async (message) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) {
    message.status = 'simulado';
    return message;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.telefone,
        type: 'text',
        text: { body: message.texto }
      })
    });
    message.status = response.ok ? 'enviado' : 'falhou';
  } catch (error) {
    message.status = 'falhou';
  }
  return message;
};

const reply = async (telefone, texto, tipo, agendamentoId = null) => {
  const message = pushMessage({
    telefone,
    direcao: 'saida',
    tipo,
    texto,
    agendamentoId
  });
  await deliver(message);
  return message;
};

const notifyAppointment = async (appointment, tipo = 'confirmacao') => {
  const texts = {
    confirmacao: confirmationText,
    lembrete: reminderText,
    cancelamento: cancellationText,
    avaliacao: reviewText
  };
  const build = texts[tipo] || confirmationText;
  return reply(appointment.cliente_telefone, build(appointment), tipo, appointment.id);
};

const serviceMenu = () => {
  const services = activeServices();
  const lines = services.map((service, index) => (
    `${index + 1}. ${service.nome} — ${service.duracao_minutos} min — R$ ${money(service.preco)}`
  ));
  return {
    services,
    texto: `Ola! Sou o assistente do ${state.establishment.nome}. Para agendar, responda com o numero do servico:\n${lines.join('\n')}`
  };
};

const getConversation = (telefone) => {
  const phone = normalizePhone(telefone);
  let conversation = state.conversations.get(phone);
  if (!conversation) {
    conversation = { step: 'idle', options: [] };
    state.conversations.set(phone, conversation);
  }
  return conversation;
};

const chooseNumber = (text, options) => {
  const value = Number(String(text || '').trim());
  if (!Number.isInteger(value) || value < 1 || value > options.length) return null;
  return options[value - 1];
};

const handleInbound = async ({ from, text }) => {
  const telefone = normalizePhone(from);
  const body = String(text || '').trim();
  const normalized = body.toLowerCase();
  if (!telefone || !body) {
    return { respostas: [], opcoes: [] };
  }

  pushMessage({ telefone, direcao: 'entrada', tipo: 'recebida', texto: body, status: 'recebido' });
  const conversation = getConversation(telefone);
  const respostas = [];

  const send = async (texto, tipo, agendamentoId = null, opcoes = []) => {
    const message = await reply(telefone, texto, tipo, agendamentoId);
    respostas.push(message.texto);
    return { respostas, opcoes };
  };

  if (/^(sim|confirmar|confirmo|ok)$/.test(normalized)) {
    const pending = findPendingByPhone(telefone);
    if (!pending) {
      return send('Nao encontrei um horario aguardando confirmacao neste numero.', 'resposta');
    }
    pending.status = 'confirmado';
    pending.updated_at = nowIso();
    conversation.step = 'idle';
    conversation.options = [];
    return send(`Confirmado: ${pending.servico_nome} em ${pending.data.split('-').reverse().join('/')} as ${pending.hora}.`, 'confirmacao', pending.id);
  }

  if (/^(nao|não|cancelar|cancela)$/.test(normalized)) {
    const pending = findPendingByPhone(telefone);
    if (!pending) {
      return send('Nao encontrei um horario aguardando confirmacao neste numero.', 'resposta');
    }
    pending.status = 'cancelado';
    pending.updated_at = nowIso();
    conversation.step = 'idle';
    conversation.options = [];
    return send('Horario cancelado. Quando quiser, envie OI para agendar de novo.', 'cancelamento', pending.id);
  }

  if (/^(oi|ola|olá|menu|agendar|inicio|início|bom dia|boa tarde|boa noite)\b/.test(normalized) || conversation.step === 'idle') {
    const menu = serviceMenu();
    conversation.step = 'servico';
    conversation.options = menu.services;
    if (menu.services.length === 0) {
      return send('No momento nao ha servicos disponiveis.', 'menu');
    }
    return send(menu.texto, 'menu', null, menu.services.map((service, index) => ({ indice: index + 1, id: service.id, nome: service.nome })));
  }

  if (conversation.step === 'servico') {
    const servico = chooseNumber(body, conversation.options);
    if (!servico) return send('Responda com o numero de um dos servicos da lista.', 'menu');
    const staff = activeStaff();
    conversation.servico = servico;
    conversation.step = 'profissional';
    conversation.options = staff;
    if (staff.length === 0) return send('Nao ha profissional disponivel para agendar.', 'menu');
    if (staff.length === 1) {
      return chooseProfessional(telefone, conversation, staff[0], send);
    }
    const lines = staff.map((person, index) => `${index + 1}. ${person.nome}`);
    return send(`Com quem voce prefere ${servico.nome}?\n${lines.join('\n')}`, 'menu', null, staff.map(publicUser));
  }

  if (conversation.step === 'profissional') {
    const professional = chooseNumber(body, conversation.options);
    if (!professional) return send('Responda com o numero de um dos profissionais.', 'menu');
    return chooseProfessional(telefone, conversation, professional, send);
  }

  if (conversation.step === 'horario') {
    const slot = chooseNumber(body, conversation.options);
    if (!slot) return send('Responda com o numero de um dos horarios.', 'menu');
    const appointment = createAppointment({
      nome: 'Cliente WhatsApp',
      telefone,
      servico: conversation.servico,
      funcionario: conversation.profissional,
      data: slot.data,
      hora: slot.hora,
      origem: 'whatsapp'
    });
    conversation.step = 'idle';
    conversation.options = [];
    const texto = confirmationText(appointment);
    return send(texto, 'confirmacao', appointment.id, [appointment]);
  }

  return send('Envie OI para ver os servicos e agendar.', 'menu');
};

const chooseProfessional = async (telefone, conversation, professional, send) => {
  const slots = listUpcomingSlots(professional.id, Number(conversation.servico.duracao_minutos || 30), 5);
  conversation.profissional = professional;
  conversation.step = 'horario';
  conversation.options = slots;
  if (slots.length === 0) {
    conversation.step = 'idle';
    return send('Nao ha horarios livres para este profissional nos proximos dias.', 'menu');
  }
  const lines = slots.map((slot) => `${slot.indice}. ${slot.label}`);
  return send(`Horarios com ${professional.nome}:\n${lines.join('\n')}`, 'menu', null, slots);
};

const processReminders = async (now = new Date()) => {
  const hours = Number(state.establishment.lembrete_horas || 24);
  const sent = [];
  for (const appointment of state.appointments) {
    if (appointment.lembrete_enviado) continue;
    if (['cancelado', 'realizado'].includes(appointment.status)) continue;
    const [year, month, day] = appointment.data.split('-').map(Number);
    const [hour, minute] = appointment.hora.split(':').map(Number);
    const when = new Date(year, month - 1, day, hour, minute);
    const diffHours = (when.getTime() - now.getTime()) / 36e5;
    if (diffHours <= 0 || diffHours > hours) continue;
    const message = await notifyAppointment(appointment, 'lembrete');
    appointment.lembrete_enviado = true;
    appointment.updated_at = nowIso();
    sent.push(message);
  }
  return sent;
};

let schedulerStarted = false;

const startScheduler = () => {
  if (schedulerStarted) return;
  schedulerStarted = true;
  const timer = setInterval(() => {
    processReminders().catch((error) => {
      console.error('Falha ao enviar lembretes:', error.message);
    });
  }, 30000);
  if (typeof timer.unref === 'function') timer.unref();
};

const readInbound = (body) => {
  const cloudMessage = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (cloudMessage) {
    return {
      from: cloudMessage.from,
      text: cloudMessage.text?.body || cloudMessage.button?.text || ''
    };
  }
  return {
    from: body?.from || body?.telefone,
    text: body?.text || body?.mensagem || ''
  };
};

module.exports = {
  handleInbound,
  notifyAppointment,
  processReminders,
  startScheduler,
  readInbound,
  confirmationText
};
