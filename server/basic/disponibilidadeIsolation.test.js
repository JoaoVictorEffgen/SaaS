const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const express = require('express');
const router = require('./routes');
const { state, createSession, getOccupiedSlotsForCompany } = require('./store');

const snapshotAppointments = [...state.appointments];
const snapshotUsers = [...state.users];
const snapshotCompanies = [...state.companies];

const restoreState = () => {
  state.appointments.splice(0, state.appointments.length, ...snapshotAppointments);
  state.users.splice(0, state.users.length, ...snapshotUsers);
  state.companies.splice(0, state.companies.length, ...snapshotCompanies);
};

afterEach(restoreState);

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
  state.appointments.push({
    id: 9100,
    empresa_id: otherCompany.id,
    funcionario_id: otherEmployee.id,
    cliente_id: 3,
    data_agendamento: '2026-11-26',
    hora_inicio: '15:00',
    status: 'confirmado',
    duracao_minutos: 45
  });

  return { otherCompany, otherEmployee };
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

test('recusa profissional que não pertence à empresa consultada', () => {
  const { otherEmployee } = seedForeignTenant();
  const result = getOccupiedSlotsForCompany({
    empresaId: 1,
    funcionarioId: otherEmployee.id,
    data: '2026-11-26'
  });

  assert.equal(result.status, 404);
  assert.equal(result.data, undefined);
});

test('não devolve horários de outro tenant mesmo com o id do profissional', () => {
  const { otherCompany, otherEmployee } = seedForeignTenant();
  const leaked = getOccupiedSlotsForCompany({
    empresaId: 1,
    funcionarioId: otherEmployee.id,
    data: '2026-11-26'
  });
  assert.equal(leaked.status, 404);

  const ownTenant = getOccupiedSlotsForCompany({
    empresaId: otherCompany.id,
    funcionarioId: otherEmployee.id,
    data: '2026-11-26'
  });
  assert.equal(ownTenant.status, 200);
  assert.deepEqual(ownTenant.data, [{ hora: '15:00', duracao_minutos: 45 }]);
});

test('GET /clientes/empresa/:id/disponibilidade não sonda agenda cruzada', async () => {
  const { otherEmployee } = seedForeignTenant();
  const { server, base } = await listen();

  try {
    const customerToken = createSession(3);
    const crossTenant = await api(
      base,
      `/clientes/empresa/1/disponibilidade?funcionario_id=${otherEmployee.id}&data=2026-11-26`,
      customerToken
    );
    assert.equal(crossTenant.status, 404);
    assert.equal(Array.isArray(crossTenant.body.data), false);

    state.appointments.push({
      id: 9101,
      empresa_id: 1,
      funcionario_id: 2,
      cliente_id: 3,
      data_agendamento: '2026-11-26',
      hora_inicio: '10:00',
      status: 'agendado',
      duracao_minutos: 60
    });

    const sameTenant = await api(
      base,
      '/clientes/empresa/1/disponibilidade?funcionario_id=2&data=2026-11-26',
      customerToken
    );
    assert.equal(sameTenant.status, 200);
    assert.equal(
      sameTenant.body.data.some((slot) => slot.hora === '10:00'),
      true
    );
    assert.equal(
      sameTenant.body.data.some((slot) => slot.hora === '15:00'),
      false
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
