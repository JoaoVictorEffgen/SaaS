const assert = require('assert');
const express = require('express');
const http = require('http');
const basicRoutes = require('./routes');
const { state } = require('./store');

const snapshotUsers = [...state.users];

const listen = (app) => new Promise((resolve) => {
  const server = http.createServer(app).listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    resolve({ server, port });
  });
});

const api = async (port, path, { method = 'GET', token, body } = {}) => {
  const response = await fetch(`http://127.0.0.1:${port}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: response.status, body: await response.json() };
};

const main = async () => {
  const app = express();
  app.use(express.json());
  app.use('/api', basicRoutes);
  const { server, port } = await listen(app);

  try {
    const login = await api(port, '/users/login', {
      method: 'POST',
      body: { identifier: 'cliente@timeflow.local', senha: '12345678', tipo: 'cliente' }
    });
    assert.strictEqual(login.status, 200, 'login do cliente deveria funcionar');

    const company = await api(port, '/clientes/empresa/1', { token: login.body.token });
    assert.strictEqual(company.status, 200, 'detalhe da empresa deveria retornar 200');
    assert.ok(Array.isArray(company.body.data.funcionarios), 'deveria listar profissionais');
    assert.ok(company.body.data.funcionarios.length > 0, 'a empresa demo tem ao menos um profissional');

    for (const employee of company.body.data.funcionarios) {
      assert.ok(employee.id, 'profissional precisa do id para o agendamento');
      assert.ok(employee.nome, 'profissional precisa do nome para a vitrine');
      assert.strictEqual(employee.cpf, undefined, 'CPF do profissional nao pode vazar na vitrine');
      assert.strictEqual(employee.email, undefined, 'e-mail do profissional nao pode vazar na vitrine');
      assert.strictEqual(employee.telefone, undefined, 'telefone do profissional nao pode vazar na vitrine');
      assert.strictEqual(employee.senha, undefined, 'senha do profissional nao pode vazar na vitrine');
    }

    const ownerLogin = await api(port, '/users/login', {
      method: 'POST',
      body: { identifier: 'empresa@timeflow.local', senha: '12345678', tipo: 'empresa' }
    });
    const staff = await api(port, '/empresas/me/funcionarios', { token: ownerLogin.body.token });
    assert.strictEqual(staff.status, 200, 'a empresa ainda deve ver a propria equipe');
    assert.ok(
      staff.body.data.some((item) => item.email && item.cpf),
      'o painel da empresa continua recebendo contato e CPF da equipe'
    );

    console.log('employeePrivacy.test.js: ok');
  } finally {
    state.users.splice(0, state.users.length, ...snapshotUsers);
    await new Promise((resolve) => server.close(resolve));
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
