const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const express = require('express');
const router = require('./routes');
const { state, createSession } = require('./store');

const todayKey = () => {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');
};

const listen = () => new Promise((resolve) => {
  const app = express();
  app.use(express.json());
  app.use(router);
  const server = http.createServer(app);
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    resolve({ server, base: `http://127.0.0.1:${port}` });
  });
});

const api = async (base, path, token) => {
  const response = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return { status: response.status, body: await response.json() };
};

const originalAppointments = [];

afterEach(() => {
  state.appointments.splice(0, state.appointments.length, ...originalAppointments);
});

test('GET /agendamentos/hoje nao vaza agenda de outro cliente', async () => {
  const { server, base } = await listen();
  try {
    const date = todayKey();
    state.appointments.push({
      id: 9001,
      empresa_id: 1,
      funcionario_id: 2,
      cliente_id: 3,
      data_agendamento: date,
      hora_inicio: '10:00',
      status: 'agendado',
      servicos: [1],
      valor_total: 90,
      duracao_minutos: 60
    });

    const otherCustomer = state.users.find((user) => user.tipo === 'cliente' && Number(user.id) !== 3)
      || {
        id: 3333,
        tipo: 'cliente',
        nome: 'Outro Cliente',
        email: 'outro.cliente@timeflow.local',
        senha: '12345678',
        ativo: true
      };
    if (!state.users.some((user) => Number(user.id) === Number(otherCustomer.id))) {
      state.users.push(otherCustomer);
    }

    const ownerToken = createSession(3);
    const strangerToken = createSession(otherCustomer.id);
    const companyToken = createSession(1);
    const employeeToken = createSession(2);

    const ownerToday = await api(base, '/agendamentos/hoje', ownerToken);
    assert.equal(ownerToday.status, 200);
    assert.equal(ownerToday.body.some((item) => Number(item.id) === 9001), true);

    const strangerToday = await api(base, '/agendamentos/hoje', strangerToken);
    assert.equal(strangerToday.status, 200);
    assert.equal(strangerToday.body.some((item) => Number(item.id) === 9001), false);
    assert.equal(
      strangerToday.body.every((item) => Number(item.cliente_id) === Number(otherCustomer.id)),
      true
    );

    const companyToday = await api(base, '/agendamentos/hoje', companyToken);
    assert.equal(companyToday.status, 200);
    assert.equal(companyToday.body.some((item) => Number(item.id) === 9001), true);

    const employeeToday = await api(base, '/agendamentos/hoje', employeeToken);
    assert.equal(employeeToday.status, 200);
    assert.equal(employeeToday.body.some((item) => Number(item.id) === 9001), true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
