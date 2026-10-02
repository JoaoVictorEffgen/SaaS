/* eslint-disable no-console */
process.env.JWT_SECRET = process.env.JWT_SECRET || 'rede-role-check-secret-key-32chars';
process.env.BASIC_MODE = 'false';
process.env.LOCAL_DEV = 'false';
process.env.NODE_ENV = process.env.NODE_ENV === 'production' ? 'test' : (process.env.NODE_ENV || 'test');
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = process.env.DB_STORAGE || `/tmp/timeflow-rede-role-${process.pid}.sqlite`;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const request = (server, { method, path, body, token }) => new Promise((resolve, reject) => {
  const http = require('http');
  const payload = body ? JSON.stringify(body) : null;
  const { port } = server.address();
  const req = http.request({
    hostname: '127.0.0.1',
    port,
    path,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }, (res) => {
    let raw = '';
    res.on('data', (chunk) => { raw += chunk; });
    res.on('end', () => {
      let parsed = {};
      try { parsed = raw ? JSON.parse(raw) : {}; } catch (error) {
        reject(new Error(`JSON inválido (${res.statusCode}): ${raw}`));
        return;
      }
      resolve({ status: res.statusCode, body: parsed });
    });
  });
  req.on('error', reject);
  if (payload) req.write(payload);
  req.end();
});

const main = async () => {
  const application = require('../packages');
  await application.initialize();
  const server = await new Promise((resolve) => {
    const instance = application.getApp().listen(0, '127.0.0.1', () => resolve(instance));
  });

  try {
    const suffix = Date.now();
    const customer = await request(server, {
      method: 'POST',
      path: '/api/users/register',
      body: {
        nome: 'Cliente Rede',
        email: `cliente.rede.${suffix}@timeflow.local`,
        senha: '12345678',
        telefone: '11988880001'
      }
    });
    assert(customer.status === 201 && customer.body.token, `Cadastro de cliente falhou: ${JSON.stringify(customer.body)}`);

    const employeeLoginSetup = await request(server, {
      method: 'POST',
      path: '/api/users/register',
      body: {
        razaoSocial: 'Empresa Para Funcionario',
        email: `empresa.func.${suffix}@timeflow.local`,
        senha: '12345678',
        telefone: '11988880002',
        cnpj: '11222333000191'
      }
    });
    assert(employeeLoginSetup.status === 201 && employeeLoginSetup.body.token, `Cadastro da empresa auxiliar falhou: ${JSON.stringify(employeeLoginSetup.body)}`);

    const employeeCreate = await request(server, {
      method: 'POST',
      path: '/api/empresas/me/funcionarios',
      token: employeeLoginSetup.body.token,
      body: {
        nome: 'Funcionario Rede',
        email: `func.rede.${suffix}@timeflow.local`,
        telefone: '11988880003',
        cpf: '52998224725',
        cargo: 'Barbeiro',
        senha: '12345678'
      }
    });
    assert(employeeCreate.status === 201, `Criação de funcionário falhou: ${JSON.stringify(employeeCreate.body)}`);

    const employeeLogin = await request(server, {
      method: 'POST',
      path: '/api/users/login',
      body: {
        identifier: `func.rede.${suffix}@timeflow.local`,
        senha: '12345678',
        tipo: 'funcionario'
      }
    });
    assert(employeeLogin.status === 200 && employeeLogin.body.token, `Login de funcionário falhou: ${JSON.stringify(employeeLogin.body)}`);

    const blockedCustomer = await request(server, {
      method: 'POST',
      path: '/api/redes',
      token: customer.body.token,
      body: {
        nome_rede: 'Rede indevida',
        cpf_cnpj: '39053344705',
        plano: 'trial'
      }
    });
    assert(blockedCustomer.status === 403, `Cliente deveria receber 403 ao criar rede, recebido ${blockedCustomer.status}: ${JSON.stringify(blockedCustomer.body)}`);

    const blockedEmployee = await request(server, {
      method: 'POST',
      path: '/api/redes',
      token: employeeLogin.body.token,
      body: {
        nome_rede: 'Rede indevida',
        cpf_cnpj: '39053344705',
        plano: 'trial'
      }
    });
    assert(blockedEmployee.status === 403, `Funcionário deveria receber 403 ao criar rede, recebido ${blockedEmployee.status}: ${JSON.stringify(blockedEmployee.body)}`);

    const company = await request(server, {
      method: 'POST',
      path: '/api/users/register',
      body: {
        razaoSocial: 'Empresa Rede Legitima',
        email: `empresa.rede.${suffix}@timeflow.local`,
        senha: '12345678',
        telefone: '11988880004',
        cnpj: '99888777000166'
      }
    });
    assert(company.status === 201 && company.body.token, `Cadastro de empresa falhou: ${JSON.stringify(company.body)}`);

    const allowedCompany = await request(server, {
      method: 'POST',
      path: '/api/redes',
      token: company.body.token,
      body: {
        nome_rede: 'Rede legitima',
        cpf_cnpj: '99888777000166',
        plano: 'trial'
      }
    });
    assert(allowedCompany.status === 201, `Empresa deveria criar rede em trial, recebido ${allowedCompany.status}: ${JSON.stringify(allowedCompany.body)}`);
    assert(allowedCompany.body.usuario_admin_id === company.body.user.id, 'Rede criada deveria pertencer à empresa autenticada');

    console.log(JSON.stringify({
      ok: true,
      blockedCustomer: blockedCustomer.status,
      blockedEmployee: blockedEmployee.status,
      allowedCompany: allowedCompany.status
    }));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    try {
      const fs = require('fs');
      fs.unlinkSync(process.env.DB_STORAGE);
    } catch (error) {
      // arquivo temporário ausente não falha o teste
    }
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
