/* eslint-disable no-console */
const express = require('express');
const { state } = require('../basic/store');
const basicRoutes = require('../basic/routes');
const { belongsToCurrentStaffCompany } = require('../utils/appointmentStatus');

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

const main = async () => {
  assert(
    belongsToCurrentStaffCompany(
      { id: 2, tipo: 'funcionario', empresa_id: 1 },
      { funcionario_id: 2, empresa_id: 1 }
    ),
    'Funcionário da empresa atual deveria gerenciar o agendamento'
  );
  assert(
    !belongsToCurrentStaffCompany(
      { id: 2, tipo: 'funcionario', empresa_id: 99 },
      { funcionario_id: 2, empresa_id: 1 }
    ),
    'Funcionário transferido não deveria gerenciar agendamento da empresa anterior'
  );
  assert(
    !belongsToCurrentStaffCompany(
      { id: 2, tipo: 'funcionario', empresa_id: null },
      { funcionario_id: 2, empresa_id: 1 }
    ),
    'Funcionário desvinculado não deveria gerenciar agendamento antigo'
  );

  const app = express();
  app.use(express.json());
  app.use('/api', basicRoutes);

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const { port } = server.address();
  const employee = state.users.find((user) => user.id === 2);
  const originalEmpresaId = employee.empresa_id;

  const api = async (path, options = {}, token = null) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`http://127.0.0.1:${port}/api${path}`, {
      ...options,
      headers
    });
    const body = await toJson(response);
    return { response, body };
  };

  try {
    const login = await api('/users/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'funcionario@timeflow.local',
        senha: '12345678',
        tipo: 'funcionario'
      })
    });
    assert(login.response.status === 200, 'Login do funcionário deveria retornar 200');
    const employeeToken = login.body.token;

    const customerLogin = await api('/users/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'cliente@timeflow.local',
        senha: '12345678',
        tipo: 'cliente'
      })
    });
    assert(customerLogin.response.status === 200, 'Login do cliente deveria retornar 200');

    const booking = await api('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({
        empresa_id: 1,
        funcionario_id: 2,
        data_agendamento: '2026-11-02',
        hora_inicio: '14:00',
        servicos: [1]
      })
    }, customerLogin.body.token);
    assert(booking.response.status === 201, 'Agendamento deveria ser criado', JSON.stringify(booking.body));
    const appointmentId = booking.body.id;

    employee.empresa_id = 99;

    const leakedList = await api('/funcionarios/agendamentos', {}, employeeToken);
    assert(leakedList.response.status === 200, 'Listagem do funcionário deveria retornar 200');
    assert(
      !leakedList.body.data.some((item) => Number(item.id) === Number(appointmentId)),
      'Agenda do funcionário transferido não pode incluir clientes da empresa anterior'
    );

    const leakedGenericList = await api('/agendamentos', {}, employeeToken);
    assert(
      !leakedGenericList.body.some((item) => Number(item.id) === Number(appointmentId)),
      'GET /agendamentos não pode vazar agenda da empresa anterior'
    );

    const cancel = await api(`/agendamentos/${appointmentId}/cancelar`, {
      method: 'PUT',
      body: JSON.stringify({ justificativa: 'Saí da empresa' })
    }, employeeToken);
    assert(cancel.response.status === 403, `Cancelamento por ex-equipe deveria retornar 403, recebido ${cancel.response.status}`);

    const confirm = await api(`/agendamentos/${appointmentId}/confirmar`, {
      method: 'PUT'
    }, employeeToken);
    assert(confirm.response.status === 403, `Confirmação por ex-equipe deveria retornar 403, recebido ${confirm.response.status}`);

    const statusUpdate = await api(`/funcionarios/agendamento/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelado' })
    }, employeeToken);
    assert(statusUpdate.response.status === 404, `Status por ex-equipe deveria retornar 404, recebido ${statusUpdate.response.status}`);

    employee.empresa_id = originalEmpresaId;

    const stillActive = await api('/funcionarios/agendamentos', {}, employeeToken);
    assert(
      stillActive.body.data.some((item) => Number(item.id) === Number(appointmentId)),
      'Funcionário ainda vinculado deveria voltar a ver o agendamento'
    );

    const confirmWhileLinked = await api(`/agendamentos/${appointmentId}/confirmar`, {
      method: 'PUT'
    }, employeeToken);
    assert(
      confirmWhileLinked.response.status === 200,
      `Funcionário vinculado deveria confirmar, recebido ${confirmWhileLinked.response.status}`
    );

    console.log(JSON.stringify({ ok: true, appointmentId }, null, 2));
  } finally {
    employee.empresa_id = originalEmpresaId;
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
