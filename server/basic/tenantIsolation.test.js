const assert = require('assert');
const express = require('express');
const http = require('http');
const basicRoutes = require('./routes');
const { state } = require('./store');

const snapshot = {
  users: [...state.users],
  companies: [...state.companies],
  promotions: state.promotions.map((item) => ({ ...item })),
  redes: [...state.redes]
};

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

const login = async (port, identifier, senha, tipo) => {
  const result = await api(port, '/users/login', {
    method: 'POST',
    body: { identifier, senha, tipo }
  });
  assert.strictEqual(result.status, 200, `login ${tipo} falhou`);
  return result.body.token;
};

const main = async () => {
  const app = express();
  app.use(express.json());
  app.use('/api', basicRoutes);
  const { server, port } = await listen(app);

  try {
    const registerOther = await api(port, '/users/register', {
      method: 'POST',
      body: {
        razaoSocial: 'Barbearia Vizinha',
        email: 'vizinha@timeflow.local',
        senha: '12345678',
        telefone: '11988880000',
        cnpj: '99888777000166'
      }
    });
    assert.strictEqual(registerOther.status, 201, 'cadastro da outra empresa deveria funcionar');
    const otherCompanyId = registerOther.body.empresa.id;
    const otherToken = registerOther.body.token;

    const demoToken = await login(port, 'empresa@timeflow.local', '12345678', 'empresa');
    const network = await api(port, '/redes', { token: demoToken });
    assert.strictEqual(network.status, 200, 'rede da empresa demo deveria existir');
    assert.ok(Array.isArray(network.body.empresas), 'rede deveria listar empresas');
    assert.ok(
      network.body.empresas.every((company) => Number(company.user_id) === 1),
      'GET /redes nao pode devolver empresas de outro tenant'
    );
    assert.ok(
      !network.body.empresas.some((company) => Number(company.id) === Number(otherCompanyId)),
      'a barbearia vizinha nao pode aparecer como filial da rede demo'
    );

    const leakedPromos = await api(port, '/promocoes', { token: otherToken });
    assert.strictEqual(leakedPromos.status, 200);
    assert.ok(
      !leakedPromos.body.some((item) => Number(item.empresa_id) === 1),
      'GET /promocoes nao pode devolver promocao de outra empresa'
    );

    const hijack = await api(port, '/promocoes/1', {
      method: 'PUT',
      token: otherToken,
      body: { nome: 'Desconto sequestrado', empresa_id: otherCompanyId, valor_desconto: 99 }
    });
    assert.strictEqual(hijack.status, 404, 'empresa B nao pode alterar a promocao da empresa A');

    const original = await api(port, '/promocoes', { token: demoToken });
    const demoPromo = original.body.find((item) => Number(item.id) === 1);
    assert.ok(demoPromo, 'empresa dona ainda deve ver a propria promocao');
    assert.strictEqual(demoPromo.nome, 'Primeiro agendamento');
    assert.strictEqual(Number(demoPromo.empresa_id), 1);

    const createNetwork = await api(port, '/redes', {
      method: 'POST',
      token: otherToken,
      body: { nome_rede: 'Rede Vizinha', plano: 'trial' }
    });
    assert.strictEqual(createNetwork.status, 201);
    assert.ok(
      createNetwork.body.empresas.every((company) => Number(company.user_id) === Number(registerOther.body.user.id)),
      'POST /redes nao pode devolver o catalogo inteiro de empresas'
    );
    assert.ok(
      !createNetwork.body.empresas.some((company) => Number(company.id) === 1),
      'a empresa demo nao pode ser entregue como filial da nova rede'
    );

    console.log('tenantIsolation.test.js: ok');
  } finally {
    state.users.splice(0, state.users.length, ...snapshot.users);
    state.companies.splice(0, state.companies.length, ...snapshot.companies);
    state.promotions.splice(0, state.promotions.length, ...snapshot.promotions);
    state.redes.splice(0, state.redes.length, ...snapshot.redes);
    await new Promise((resolve) => server.close(resolve));
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
