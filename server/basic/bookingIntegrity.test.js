/* eslint-disable no-console */
const express = require('express');
const basicRoutes = require('./routes');
const { state } = require('./store');

const results = [];

const assert = (condition, message, details = null) => {
  if (!condition) {
    throw new Error(details ? `${message} | ${details}` : message);
  }
};

const toJson = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Resposta inválida (${response.status}): ${text}`);
  }
};

const run = async (name, fn) => {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error: error.message });
  }
};

const startServer = () => new Promise((resolve) => {
  const app = express();
  app.use(express.json());
  app.use(basicRoutes);
  const server = app.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
  });
});

const seedForeignTenant = () => {
  const otherCompany = {
    id: 9001,
    user_id: 9001,
    nome: 'Barbearia Invasora',
    ativo: true
  };
  const otherEmployee = {
    id: 9002,
    tipo: 'funcionario',
    nome: 'Profissional de outra empresa',
    email: 'outro.func@timeflow.local',
    senha: '12345678',
    empresa_id: otherCompany.id,
    ativo: true
  };
  const otherService = {
    id: 9003,
    empresa_id: otherCompany.id,
    nome: 'Servico alheio',
    duracao_minutos: 45,
    preco: 80,
    ativo: true
  };

  state.users.push({
    id: 9001,
    tipo: 'empresa',
    nome: otherCompany.nome,
    email: 'outra.empresa@timeflow.local',
    senha: '12345678',
    ativo: true
  });
  state.users.push(otherEmployee);
  state.companies.push(otherCompany);
  state.services.push(otherService);

  return { otherCompany, otherEmployee, otherService };
};

const main = async () => {
  const { server, baseUrl } = await startServer();
  const api = async (path, options = {}, token = null) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    const body = await toJson(response);
    return { response, body };
  };

  try {
    const { otherEmployee, otherService } = seedForeignTenant();
    let customerToken;
    let employeeToken;

    await run('login cliente e funcionario demo', async () => {
      const customer = await api('/users/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: 'cliente@timeflow.local', senha: '12345678', tipo: 'cliente' })
      });
      assert(customer.response.status === 200, 'Login do cliente deveria retornar 200');
      customerToken = customer.body.token;

      const employee = await api('/users/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: 'funcionario@timeflow.local', senha: '12345678', tipo: 'funcionario' })
      });
      assert(employee.response.status === 200, 'Login do funcionario deveria retornar 200');
      employeeToken = employee.body.token;
    });

    await run('bloqueia funcionario de outra empresa', async () => {
      const { response, body } = await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          empresa_id: 1,
          funcionario_id: otherEmployee.id,
          data_agendamento: '2026-10-01',
          hora_inicio: '10:00',
          servicos: [1]
        })
      }, customerToken);
      assert(response.status === 404, `Esperado 404, recebido ${response.status}`, body.error);
      assert(
        !state.appointments.some((item) => Number(item.funcionario_id) === Number(otherEmployee.id)),
        'Agendamento cruzado nao deveria ser persistido'
      );
    });

    await run('bloqueia servico de outra empresa sem truncar', async () => {
      const before = state.appointments.length;
      const { response } = await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          empresa_id: 1,
          funcionario_id: 2,
          data_agendamento: '2026-10-02',
          hora_inicio: '11:00',
          servicos: [1, otherService.id]
        })
      }, customerToken);
      assert(response.status === 400, `Esperado 400, recebido ${response.status}`);
      assert(state.appointments.length === before, 'Servico alheio nao deveria gerar reserva parcial');
    });

    await run('reserva valida ainda e aceita', async () => {
      const { response, body } = await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          empresa_id: 1,
          funcionario_id: 2,
          data_agendamento: '2026-10-03',
          hora_inicio: '09:00',
          servicos: [1]
        })
      }, customerToken);
      assert(response.status === 201, 'Reserva legitima deveria retornar 201');
      assert(Number(body.empresa_id) === 1, 'empresa_id deveria permanecer da empresa escolhida');
      assert(Number(body.funcionario_id) === 2, 'funcionario_id deveria permanecer do profissional da empresa');
    });

    await run('confirmar nao ressuscita agendamento cancelado', async () => {
      const created = await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          empresa_id: 1,
          funcionario_id: 2,
          data_agendamento: '2026-10-04',
          hora_inicio: '14:00',
          servicos: [1]
        })
      }, customerToken);
      assert(created.response.status === 201, 'Segundo agendamento deveria ser criado');
      const appointmentId = created.body.id;

      const canceled = await api(`/agendamentos/${appointmentId}/cancelar`, {
        method: 'PUT',
        body: JSON.stringify({ justificativa: 'Cliente desistiu' })
      }, customerToken);
      assert(canceled.response.status === 200, 'Cancelamento deveria retornar 200');

      const second = await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          empresa_id: 1,
          funcionario_id: 2,
          data_agendamento: '2026-10-04',
          hora_inicio: '14:00',
          servicos: [1]
        })
      }, customerToken);
      assert(second.response.status === 201, 'Horario liberado deveria aceitar nova reserva');

      const resurrect = await api(`/agendamentos/${appointmentId}/confirmar`, { method: 'PUT' }, employeeToken);
      assert(resurrect.response.status === 400, `Confirmar cancelado deveria falhar, recebido ${resurrect.response.status}`);

      const original = state.appointments.find((item) => Number(item.id) === Number(appointmentId));
      assert(original?.status === 'cancelado', 'Agendamento cancelado nao pode voltar para confirmado');
      assert(
        state.appointments.filter((item) =>
          Number(item.funcionario_id) === 2 &&
          item.data_agendamento === '2026-10-04' &&
          item.hora_inicio === '14:00' &&
          item.status !== 'cancelado'
        ).length === 1,
        'Nao pode haver dois horarios ativos apos tentativa de confirmar cancelado'
      );
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  const failures = results.filter((result) => !result.ok);
  const summary = {
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    failures
  };
  console.log(JSON.stringify(summary, null, 2));
  if (failures.length > 0) process.exit(1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
