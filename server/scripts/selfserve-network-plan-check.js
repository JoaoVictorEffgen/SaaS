/* eslint-disable no-console */
const http = require('http');
const express = require('express');
const basicRoutes = require('../basic/routes');

const app = express();
app.use(express.json());
app.use('/api', basicRoutes);

const toJson = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Resposta inválida (${response.status}): ${text}`);
  }
};

const main = async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    const registerResponse = await fetch(`${baseUrl}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razaoSocial: 'Empresa Self Serve',
        email: 'empresa.selfserve@timeflow.local',
        senha: '12345678',
        telefone: '11988887777',
        cnpj: '55443322000111'
      })
    });
    const registerBody = await toJson(registerResponse);
    if (registerResponse.status !== 201 || !registerBody.token) {
      throw new Error(`Cadastro falhou (${registerResponse.status}): ${JSON.stringify(registerBody)}`);
    }

    const createResponse = await fetch(`${baseUrl}/redes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${registerBody.token}`
      },
      body: JSON.stringify({
        nome_rede: 'Rede Enterprise Fake',
        plano: 'enterprise',
        cpf_cnpj: '55443322000111'
      })
    });
    const createBody = await toJson(createResponse);
    if (createResponse.status !== 201) {
      throw new Error(`Criação de rede falhou (${createResponse.status}): ${JSON.stringify(createBody)}`);
    }
    if (createBody.plano !== 'trial') {
      throw new Error(`Plano deveria ser trial, recebido ${createBody.plano}`);
    }

    console.log(JSON.stringify({ ok: true, plano: createBody.plano }));
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
