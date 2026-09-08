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
    let customerToken;

    await run('login cliente demo', async () => {
      const customer = await api('/users/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: 'cliente@timeflow.local', senha: '12345678', tipo: 'cliente' })
      });
      assert(customer.response.status === 200, 'Login do cliente deveria retornar 200');
      customerToken = customer.body.token;
    });

    await run('reserva canonica no horario alvo', async () => {
      const { response, body } = await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          empresa_id: 1,
          funcionario_id: 2,
          data_agendamento: '2026-11-10',
          hora_inicio: '10:00',
          servicos: [1]
        })
      }, customerToken);
      assert(response.status === 201, 'Reserva legitima deveria retornar 201');
      assert(body.data_agendamento === '2026-11-10', 'Data deveria permanecer YYYY-MM-DD');
    });

    await run('rejeita ISO datetime que furaria o conflito por string', async () => {
      const before = state.appointments.filter((item) =>
        Number(item.funcionario_id) === 2 &&
        item.hora_inicio === '10:00' &&
        item.status !== 'cancelado'
      ).length;

      const { response, body } = await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          empresa_id: 1,
          funcionario_id: 2,
          data_agendamento: '2026-11-10T00:00:00.000Z',
          hora_inicio: '10:00',
          servicos: [1]
        })
      }, customerToken);

      assert(response.status === 400, `Esperado 400 para data ISO, recebido ${response.status}`, body.error);
      const after = state.appointments.filter((item) =>
        Number(item.funcionario_id) === 2 &&
        item.hora_inicio === '10:00' &&
        item.status !== 'cancelado'
      ).length;
      assert(after === before, 'Data ISO nao pode criar um segundo horario ativo no mesmo profissional');
    });

    await run('rejeita data inexistente no calendario', async () => {
      const before = state.appointments.length;
      const { response } = await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          empresa_id: 1,
          funcionario_id: 2,
          data_agendamento: '2026-02-31',
          hora_inicio: '11:00',
          servicos: [1]
        })
      }, customerToken);
      assert(response.status === 400, `Esperado 400 para 31/02, recebido ${response.status}`);
      assert(state.appointments.length === before, 'Data invalida nao deveria persistir agendamento');
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
