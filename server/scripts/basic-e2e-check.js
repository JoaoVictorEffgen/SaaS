/* eslint-disable no-console */
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000/api';
const results = [];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const api = async (path, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  return { response, body };
};

const run = async (name, fn) => {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error: error.message });
  }
};

const main = async () => {
  let ownerToken;
  let staffToken;
  let vendorToken;
  let appointmentId;
  let slot;

  await run('health do estabelecimento unico', async () => {
    const { response, body } = await api('/health');
    assert(response.status === 200, 'Health deveria responder 200');
    assert(body.mode === 'estabelecimento', 'Modo deveria ser estabelecimento');
  });

  await run('cadastro de outra empresa bloqueado', async () => {
    const { response } = await api('/users/register', {
      method: 'POST',
      body: JSON.stringify({ razaoSocial: 'Outra', email: 'outra@teste.local', senha: '12345678' })
    });
    assert(response.status === 409, 'Nova empresa na mesma instalacao deveria retornar 409');
  });

  await run('ativacao de segunda licenca bloqueada', async () => {
    const { response } = await api('/licenca/ativar', {
      method: 'POST',
      body: JSON.stringify({ codigo: 'TF-OUTRA' })
    });
    assert(response.status === 409, 'Segunda ativacao deveria retornar 409');
  });

  await run('login de dono, equipe e vendas', async () => {
    const owner = await api('/users/login', { method: 'POST', body: JSON.stringify({ identifier: 'empresa@timeflow.local', senha: '12345678' }) });
    const staff = await api('/users/login', { method: 'POST', body: JSON.stringify({ identifier: 'funcionario@timeflow.local', senha: '12345678' }) });
    const vendor = await api('/users/login', { method: 'POST', body: JSON.stringify({ identifier: 'vendas@timeflow.local', senha: '12345678' }) });
    assert(owner.response.status === 200 && owner.body.user.tipo === 'dono', 'Dono deveria entrar');
    assert(staff.response.status === 200 && staff.body.user.tipo === 'funcionario', 'Equipe deveria entrar');
    assert(vendor.response.status === 200 && vendor.body.user.tipo === 'vendedor', 'Vendas deveria entrar');
    ownerToken = owner.body.token;
    staffToken = staff.body.token;
    vendorToken = vendor.body.token;
  });

  await run('somente um estabelecimento publico', async () => {
    const { response, body } = await api('/estabelecimento');
    assert(response.status === 200, 'Estabelecimento deveria responder 200');
    assert(body.nome === 'Salao Beleza Demo', 'Nome do estabelecimento divergente');
    assert(Array.isArray(body.servicos) && body.servicos.length === 2, 'Servicos iniciais divergentes');
    assert(body.equipe.length === 1, 'Equipe inicial deveria ter uma profissional');
  });

  await run('venda gera licenca sem criar filial', async () => {
    const created = await api('/vendas', {
      method: 'POST',
      body: JSON.stringify({ cliente_nome: 'Barbearia Norte' })
    }, vendorToken);
    assert(created.response.status === 201, 'Licenca deveria ser criada');
    assert(created.body.status === 'disponivel', 'Licenca nova deveria estar disponivel');
    const list = await api('/estabelecimento');
    assert(list.body.nome === 'Salao Beleza Demo', 'A venda nao pode trocar o estabelecimento desta copia');
    const denied = await api('/vendas', {}, ownerToken);
    assert(denied.response.status === 403, 'Dono nao administra a carteira de vendas');
  });

  await run('agendamento no site envia confirmacao', async () => {
    const availability = await api('/disponibilidade?servico_id=1&funcionario_id=2');
    assert(availability.response.status === 200 && availability.body.data.length > 0, 'Deveria haver horario livre');
    slot = availability.body.data[0];
    const booked = await api('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Joana',
        telefone: '11977776666',
        servico_id: 1,
        funcionario_id: 2,
        data: slot.data,
        hora: slot.hora
      })
    });
    assert(booked.response.status === 201, 'Agendamento deveria ser criado');
    assert(booked.body.agendamento.status === 'aguardando_confirmacao', 'Status inicial incorreto');
    assert(booked.body.mensagem.tipo === 'confirmacao', 'Confirmacao de WhatsApp nao foi gerada');
    appointmentId = booked.body.agendamento.id;
    const duplicate = await api('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Outra',
        telefone: '11966665555',
        servico_id: 2,
        funcionario_id: 2,
        data: slot.data,
        hora: slot.hora
      })
    });
    assert(duplicate.response.status === 409, 'Horario ocupado deveria retornar 409');
  });

  await run('equipe ve o horario e dono conclui depois da confirmacao', async () => {
    const staffList = await api('/agendamentos', {}, staffToken);
    assert(staffList.body.some((item) => item.id === appointmentId), 'Equipe nao viu o horario');
    const confirm = await api('/whatsapp/webhook', {
      method: 'POST',
      body: JSON.stringify({ from: '11977776666', text: 'SIM' })
    });
    assert(confirm.body.respostas[0].includes('Confirmado'), 'SIM deveria confirmar');
    const done = await api(`/agendamentos/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'realizado' })
    }, ownerToken);
    assert(done.response.status === 200, 'Dono deveria concluir o horario confirmado');
    const cancel = await api(`/agendamentos/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelado' })
    }, ownerToken);
    assert(cancel.response.status === 400, 'Horario realizado nao pode ser cancelado');
  });

  await run('assistente guia o agendamento pelo WhatsApp', async () => {
    const hello = await api('/whatsapp/webhook', {
      method: 'POST',
      body: JSON.stringify({ from: '11955554444', text: 'OI' })
    });
    assert(hello.body.opcoes.some((item) => item.nome === 'Corte feminino'), 'Menu deveria listar os servicos');
    const chosen = await api('/whatsapp/webhook', {
      method: 'POST',
      body: JSON.stringify({ from: '11955554444', text: '1' })
    });
    assert(chosen.body.opcoes[0]?.data && chosen.body.opcoes[0]?.hora, 'Com uma profissional, o assistente deveria oferecer horarios');
    const booked = await api('/whatsapp/webhook', {
      method: 'POST',
      body: JSON.stringify({ from: '11955554444', text: '1' })
    });
    assert(booked.body.respostas[0].includes('Responda SIM'), 'Reserva pelo WhatsApp deveria pedir confirmacao');
    const confirmed = await api('/whatsapp/webhook', {
      method: 'POST',
      body: JSON.stringify({ from: '11955554444', text: 'SIM' })
    });
    assert(confirmed.body.respostas[0].includes('Confirmado'), 'SIM deveria confirmar a reserva do WhatsApp');
  });

  await run('lembrete automatico e servico duplicado', async () => {
    await api('/estabelecimento', {
      method: 'PUT',
      body: JSON.stringify({ lembrete_horas: 24 * 30 })
    }, ownerToken);
    const reminders = await api('/whatsapp/processar', { method: 'POST' }, ownerToken);
    const messages = await api('/whatsapp/mensagens', {}, ownerToken);
    assert(reminders.response.status === 200, 'Processamento de lembretes deveria responder 200');
    assert(
      reminders.body.enviados >= 1 || messages.body.some((item) => item.tipo === 'lembrete'),
      'Deveria existir ao menos um lembrete automatico'
    );
    const duplicate = await api('/servicos', {
      method: 'POST',
      body: JSON.stringify({ nome: 'Corte feminino', duracao_minutos: 30, preco: 10 })
    }, ownerToken);
    assert(duplicate.response.status === 409, 'Servico duplicado deveria retornar 409');
  });

  const failures = results.filter((item) => !item.ok);
  console.log(JSON.stringify({
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    failures
  }, null, 2));
  if (failures.length) process.exit(1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
