'use strict';

const http = require('http');
const express = require('express');
const routes = require('./routes');
const { state, nextId } = require('./store');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const listen = (app) => new Promise((resolve) => {
  const server = http.createServer(app);
  server.listen(0, '127.0.0.1', () => resolve(server));
});

const request = (server, path, body) => new Promise((resolve, reject) => {
  const payload = JSON.stringify(body);
  const { port } = server.address();
  const req = http.request({
    hostname: '127.0.0.1',
    port,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let raw = '';
    res.on('data', (chunk) => { raw += chunk; });
    res.on('end', () => {
      let parsed = {};
      try { parsed = raw ? JSON.parse(raw) : {}; } catch (error) {
        reject(new Error(`JSON inválido: ${raw}`));
        return;
      }
      resolve({ status: res.statusCode, body: parsed });
    });
  });
  req.on('error', reject);
  req.write(payload);
  req.end();
});

const close = (server) => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
});

const insertUser = (overrides) => {
  const created = {
    id: nextId(),
    tipo: 'cliente',
    nome: 'Usuario teste',
    email: `user-${Date.now()}-${Math.random()}@timeflow.test`,
    senha: 'senhaPadrao1',
    telefone: '11970000000',
    plano: 'free',
    ativo: true,
    ...overrides
  };
  state.users.push(created);
  return created;
};

const removeUsers = (...users) => {
  const ids = new Set(users.map((user) => user.id));
  for (let index = state.users.length - 1; index >= 0; index -= 1) {
    if (ids.has(state.users[index].id)) state.users.splice(index, 1);
  }
};

const main = async () => {
  const app = express();
  app.use(express.json());
  app.use(routes);
  const server = await listen(app);
  const sharedPhone = '11981112222';
  const sharedCpf = '39011122233';
  const clientA = insertUser({
    nome: 'Maria Cliente',
    email: 'maria.cliente@timeflow.test',
    telefone: sharedPhone,
    senha: 'SenhaCliente9',
    tipo: 'cliente'
  });
  const companyB = insertUser({
    nome: 'Maria Empresa',
    email: 'maria.empresa@timeflow.test',
    telefone: sharedPhone,
    cnpj: '11222333000181',
    senha: 'SenhaEmpresa9',
    tipo: 'empresa'
  });
  const twinOne = insertUser({
    nome: 'Conta Gemea 1',
    email: 'gemea1@timeflow.test',
    cpf: sharedCpf,
    telefone: '11983334444',
    senha: 'MesmaSenha12',
    tipo: 'cliente'
  });
  const twinTwo = insertUser({
    nome: 'Conta Gemea 2',
    email: 'gemea2@timeflow.test',
    cpf: sharedCpf,
    telefone: '11985556666',
    senha: 'MesmaSenha12',
    tipo: 'cliente'
  });

  try {
    const asClient = await request(server, '/users/login', {
      identifier: sharedPhone,
      senha: 'SenhaCliente9'
    });
    assert(asClient.status === 200, `Login da cliente pelo telefone deveria ser 200, veio ${asClient.status}`);
    assert(asClient.body.user?.id === clientA.id, 'Telefone + senha da cliente autenticou a conta errada');
    assert(asClient.body.user?.tipo === 'cliente', 'Perfil autenticado deveria ser cliente');

    const asCompany = await request(server, '/users/login', {
      identifier: sharedPhone,
      senha: 'SenhaEmpresa9'
    });
    assert(asCompany.status === 200, `Login da empresa pelo telefone deveria ser 200, veio ${asCompany.status}`);
    assert(asCompany.body.user?.id === companyB.id, 'Telefone + senha da empresa autenticou a conta errada');
    assert(asCompany.body.user?.tipo === 'empresa', 'Perfil autenticado deveria ser empresa');

    const wrongPassword = await request(server, '/users/login', {
      identifier: sharedPhone,
      senha: 'senha_errada'
    });
    assert(wrongPassword.status === 401, 'Senha inexistente entre as contas do telefone deveria ser 401');

    const ambiguous = await request(server, '/users/login', {
      identifier: sharedCpf,
      senha: 'MesmaSenha12'
    });
    assert(ambiguous.status === 401, 'CPF compartilhado com a mesma senha não pode autenticar a primeira conta');

    const uniqueEmail = await request(server, '/users/login', {
      identifier: 'maria.empresa@timeflow.test',
      senha: 'SenhaEmpresa9'
    });
    assert(uniqueEmail.status === 200, 'E-mail único deveria continuar autenticando');
    assert(uniqueEmail.body.user?.id === companyB.id, 'Login por e-mail deveria manter a conta da empresa');

    const demoEmail = await request(server, '/users/login', {
      identifier: 'cliente@timeflow.local',
      senha: '12345678',
      tipo: 'cliente'
    });
    assert(demoEmail.status === 200, 'Login demo com tipo explícito deveria continuar funcionando');
    assert(demoEmail.body.user?.tipo === 'cliente', 'Login demo deveria retornar o cliente');
  } finally {
    removeUsers(clientA, companyB, twinOne, twinTwo);
    await close(server);
  }
};

main()
  .then(() => {
    console.log('loginIdentifier.test.js: 6/6 passou');
  })
  .catch((error) => {
    console.error('loginIdentifier.test.js falhou:', error.message);
    process.exit(1);
  });
