/* eslint-disable no-console */
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5003/api';

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

const api = async (path, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });
  const body = await toJson(response);
  return { response, body };
};

const run = async (name, fn) => {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error: error.message });
  }
};

const getTokenByLogin = async (identifier, senha, tipo) => {
  const { response, body } = await api('/users/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, senha, tipo })
  });
  assert(response.status === 200, `Login ${tipo} deveria retornar 200`, body.error || JSON.stringify(body));
  assert(body.token, `Login ${tipo} sem token`);
  return body.token;
};

const main = async () => {
  let companyToken;
  let customerToken;
  let employeeToken;
  let createdEmployeeId;
  let createdServiceId;
  let appointmentId;
  let companyId;

  await run('health check', async () => {
    const { response, body } = await api('/health');
    assert(response.status === 200, 'Health deveria retornar 200');
    assert(body.status === 'OK', 'Health deveria retornar status OK');
  });

  await run('login inválido bloqueado', async () => {
    const { response } = await api('/users/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'empresa@timeflow.local', senha: 'senha_errada', tipo: 'empresa' })
    });
    assert(response.status === 401, `Esperado 401 para login inválido, recebido ${response.status}`);
  });

  await run('login perfis principais', async () => {
    companyToken = await getTokenByLogin('empresa@timeflow.local', '12345678', 'empresa');
    customerToken = await getTokenByLogin('cliente@timeflow.local', '12345678', 'cliente');
    employeeToken = await getTokenByLogin('funcionario@timeflow.local', '12345678', 'funcionario');
  });

  await run('profile autenticado', async () => {
    const { response, body } = await api('/users/profile', {}, companyToken);
    assert(response.status === 200, 'Profile deveria retornar 200');
    assert(body.tipo === 'empresa', 'Profile deveria ser do tipo empresa');
  });

  await run('cadastro cliente e empresa com regras de unicidade', async () => {
    const registerCustomer = await api('/users/register', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Cliente Novo',
        email: 'cliente.novo@timeflow.local',
        senha: '12345678',
        telefone: '11911112222'
      })
    });
    assert(registerCustomer.response.status === 201, 'Cadastro de cliente deveria retornar 201');

    const registerCompany = await api('/users/register', {
      method: 'POST',
      body: JSON.stringify({
        razaoSocial: 'Empresa Nova Teste',
        email: 'empresa.nova@timeflow.local',
        senha: '12345678',
        telefone: '11911113333',
        cnpj: '12.345.678/0001-99'
      })
    });
    assert(registerCompany.response.status === 201, 'Cadastro de empresa deveria retornar 201');

    const duplicateCnpj = await api('/users/register', {
      method: 'POST',
      body: JSON.stringify({
        razaoSocial: 'Empresa Duplicada',
        email: 'empresa.duplicada@timeflow.local',
        senha: '12345678',
        telefone: '11911114444',
        cnpj: '12345678000199'
      })
    });
    assert(duplicateCnpj.response.status === 409, 'CNPJ duplicado deveria retornar 409');
  });

  await run('proibição de acesso por tipo', async () => {
    const { response } = await api('/empresas/me/servicos', {}, customerToken);
    assert(response.status === 403, `Cliente não deveria acessar serviços da empresa (status ${response.status})`);
  });

  await run('listar empresas para cliente', async () => {
    const { response, body } = await api('/clientes/empresas', {}, customerToken);
    assert(response.status === 200, 'Lista de empresas deveria retornar 200');
    assert(Array.isArray(body.data), 'Lista de empresas deveria retornar array');
    assert(body.data.length >= 1, 'Deveria haver pelo menos uma empresa');
  });

  await run('CRUD serviço (empresa)', async () => {
    const create = await api('/empresas/me/servicos', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Teste Servico',
        descricao: 'Servico criado pelo teste',
        duracao_minutos: 30,
        preco: 49.9,
        categoria: 'Teste',
        ativo: true
      })
    }, companyToken);
    assert(create.response.status === 201, 'Criação de serviço deveria retornar 201');
    createdServiceId = create.body.id;
    assert(createdServiceId, 'Serviço criado sem id');

    const duplicate = await api('/empresas/me/servicos', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Teste Servico',
        descricao: 'Servico duplicado',
        duracao_minutos: 20,
        preco: 19.9,
        categoria: 'Teste',
        ativo: true
      })
    }, companyToken);
    assert(duplicate.response.status === 409, 'Duplicidade de nome de serviço deveria retornar 409');

    const update = await api(`/empresas/me/servicos/${createdServiceId}`, {
      method: 'PUT',
      body: JSON.stringify({ preco: 59.9 })
    }, companyToken);
    assert(update.response.status === 200, 'Atualização de serviço deveria retornar 200');
    assert(Number(update.body.preco) === 59.9, 'Preço do serviço não foi atualizado');

    const remove = await api(`/empresas/me/servicos/${createdServiceId}`, { method: 'DELETE' }, companyToken);
    assert(remove.response.status === 200, 'Remoção de serviço deveria retornar 200');
  });

  await run('dados da empresa e atualização', async () => {
    const me = await api('/empresas/me', {}, companyToken);
    assert(me.response.status === 200, 'Empresa autenticada deveria buscar /empresas/me');
    companyId = me.body.id;
    assert(companyId, 'Empresa sem id em /empresas/me');

    const update = await api(`/empresas/${companyId}`, {
      method: 'PUT',
      body: JSON.stringify({
        telefone: '11900001111',
        cidade: 'Sao Paulo',
        horario_inicio: '09:00',
        horario_fim: '19:00'
      })
    }, companyToken);
    assert(update.response.status === 200, 'Atualização de empresa deveria retornar 200');
    assert(update.body.cidade === 'Sao Paulo', 'Cidade não foi atualizada');
  });

  await run('CRUD funcionário (empresa)', async () => {
    const create = await api('/empresas/me/funcionarios', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Funcionario Teste',
        email: 'func.teste@timeflow.local',
        telefone: '11999991111',
        cpf: '98765432100',
        cargo: 'Assistente',
        senha: '12345678'
      })
    }, companyToken);
    assert(create.response.status === 201, 'Criação de funcionário deveria retornar 201');
    createdEmployeeId = create.body.id;

    const duplicateCpf = await api('/empresas/me/funcionarios', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Funcionario Duplicado',
        email: 'func.outro@timeflow.local',
        telefone: '11988887777',
        cpf: '98765432100',
        cargo: 'Assistente',
        senha: '12345678'
      })
    }, companyToken);
    assert(duplicateCpf.response.status === 409, 'Duplicidade de CPF deveria retornar 409');

    const update = await api(`/empresas/me/funcionarios/${createdEmployeeId}`, {
      method: 'PUT',
      body: JSON.stringify({ cargo: 'Especialista' })
    }, companyToken);
    assert(update.response.status === 200, 'Atualização de funcionário deveria retornar 200');
    assert(update.body.cargo === 'Especialista', 'Cargo não foi atualizado');

    const remove = await api(`/empresas/me/funcionarios/${createdEmployeeId}`, { method: 'DELETE' }, companyToken);
    assert(remove.response.status === 200, 'Desativação de funcionário deveria retornar 200');
  });

  await run('agendamento cliente e visibilidade por perfis', async () => {
    const booking = await api('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({
        empresa_id: 1,
        funcionario_id: 2,
        data_agendamento: '2026-09-15',
        hora_inicio: '10:00',
        servicos: [1]
      })
    }, customerToken);
    assert(booking.response.status === 201, 'Criação de agendamento deveria retornar 201');
    assert(booking.body.status === 'em_aprovacao', 'Novo agendamento deveria iniciar em aprovação');
    appointmentId = booking.body.id;

    const employeeAppointments = await api('/funcionarios/agendamentos', {}, employeeToken);
    assert(employeeAppointments.response.status === 200, 'Funcionário deveria listar agendamentos');
    assert(
      employeeAppointments.body.data.some((item) => Number(item.id) === Number(appointmentId)),
      'Agendamento criado não apareceu para o funcionário'
    );

    const companyAppointments = await api('/agendamentos', {}, companyToken);
    assert(companyAppointments.response.status === 200, 'Empresa deveria listar agendamentos');
    assert(
      companyAppointments.body.some((item) => Number(item.id) === Number(appointmentId)),
      'Agendamento criado não apareceu para a empresa'
    );
  });

  await run('disponibilidade reflete horário ocupado', async () => {
    const availability = await api(`/clientes/empresa/1/disponibilidade?funcionario_id=2&data=2026-09-15`, {}, customerToken);
    assert(availability.response.status === 200, 'Disponibilidade deveria retornar 200');
    assert(
      Array.isArray(availability.body.data) &&
      availability.body.data.some((slot) => slot.hora === '10:00'),
      'Disponibilidade deveria conter o horário já agendado'
    );
  });

  await run('transição de status do agendamento', async () => {
    const schedule = await api(`/funcionarios/agendamento/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'agendado' })
    }, employeeToken);
    assert(schedule.response.status === 200, 'Funcionário deveria marcar agendamento como agendado');

    const invalidBackTransition = await api(`/funcionarios/agendamento/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'em_aprovacao' })
    }, employeeToken);
    assert(invalidBackTransition.response.status === 400, 'Retrocesso de status deveria ser bloqueado');

    const conclude = await api(`/funcionarios/agendamento/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'realizado' })
    }, employeeToken);
    assert(conclude.response.status === 200, 'Funcionário deveria concluir agendamento');

    const cancelByCustomer = await api(`/agendamentos/${appointmentId}/cancelar`, {
      method: 'PUT',
      body: JSON.stringify({ justificativa: 'Teste cancelamento após concluído' })
    }, customerToken);
    assert(cancelByCustomer.response.status === 400, 'Agendamento concluído não deveria ser cancelável');
  });

  await run('bloqueio de duplicidade de horário', async () => {
    const first = await api('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({
        empresa_id: 1,
        funcionario_id: 2,
        data_agendamento: '2026-09-20',
        hora_inicio: '11:00',
        servicos: [1]
      })
    }, customerToken);
    assert(first.response.status === 201, 'Primeiro agendamento deveria ser criado');

    const duplicate = await api('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({
        empresa_id: 1,
        funcionario_id: 2,
        data_agendamento: '2026-09-20',
        hora_inicio: '11:00',
        servicos: [2]
      })
    }, customerToken);
    assert(duplicate.response.status === 409, 'Agendamento duplicado no mesmo horário deveria ser bloqueado');
  });

  await run('fluxo de redes e filiais', async () => {
    const createNetwork = await api('/redes', {
      method: 'POST',
      body: JSON.stringify({
        nome_rede: 'Rede Teste',
        descricao: 'Rede criada no e2e',
        plano: 'trial',
        cpf_cnpj: '11111111111'
      })
    }, companyToken);
    assert(
      [201, 409].includes(createNetwork.response.status),
      `Criação de rede deveria retornar 201 ou 409, recebido ${createNetwork.response.status}`
    );

    const listNetworks = await api('/redes', {}, companyToken);
    assert(listNetworks.response.status === 200, 'Listagem de rede deveria retornar 200');
    const networkId = listNetworks.body.id || createNetwork.body.id;
    assert(networkId, 'Rede sem id após criação/listagem');

    const createBranch = await api(`/redes/${networkId}/empresas`, {
      method: 'POST',
      body: JSON.stringify({
        nome_unidade: 'Filial Centro',
        whatsapp: '11977776666',
        endereco: 'Rua Teste 123',
        cidade: 'Sao Paulo',
        estado: 'SP',
        cep: '01000-000'
      })
    }, companyToken);
    assert(createBranch.response.status === 201, 'Criação de filial deveria retornar 201');
    const branchId = createBranch.body.id;
    assert(branchId, 'Filial criada sem id');

    const branchBooking = await api('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({
        empresa_id: branchId,
        funcionario_id: 2,
        data_agendamento: '2026-10-21',
        hora_inicio: '15:00',
        servicos: [1]
      })
    }, customerToken);
    assert(branchBooking.response.status === 201, 'Agendamento na filial deveria ser criado');

    const companyAppointments = await api('/agendamentos', {}, companyToken);
    assert(companyAppointments.response.status === 200, 'Empresa deveria listar agendamentos após criar filial');
    assert(
      companyAppointments.body.some((item) => Number(item.id) === Number(branchBooking.body.id)),
      'Agendamento da filial deveria aparecer na agenda da empresa dona da rede'
    );

    const confirmBranch = await api(`/agendamentos/${branchBooking.body.id}/confirmar`, {
      method: 'PUT'
    }, companyToken);
    assert(confirmBranch.response.status === 200, 'Empresa dona da rede deveria confirmar agendamento da filial');

    const deactivateBranch = await api(`/redes/empresas/${branchId}`, {
      method: 'DELETE'
    }, companyToken);
    assert(deactivateBranch.response.status === 200, 'Desativação de filial deveria retornar 200');
  });

  await run('promocoes, uploads simulados e recuperação de senha', async () => {
    const promotions = await api('/promocoes', {}, companyToken);
    assert(promotions.response.status === 200, 'Listagem de promoções deveria retornar 200');
    assert(Array.isArray(promotions.body), 'Promoções deveria retornar array');

    const uploadProfile = await api('/upload-fotos/foto-perfil', { method: 'POST' }, customerToken);
    assert(uploadProfile.response.status === 200, 'Upload de foto de perfil simulado deveria retornar 200');

    const uploadLogo = await api('/upload-fotos/logo-empresa/1', { method: 'POST' }, companyToken);
    assert(uploadLogo.response.status === 200, 'Upload de logo simulado deveria retornar 200');

    const startRecovery = await api('/auth', {
      method: 'POST',
      body: JSON.stringify({ email: 'cliente@timeflow.local' })
    });
    assert(startRecovery.response.status === 200, 'Solicitação de recuperação deveria retornar 200');

    const verifyCode = await api('/auth/verificar-codigo', {
      method: 'POST',
      body: JSON.stringify({ email: 'cliente@timeflow.local', codigo: '123456' })
    });
    assert(verifyCode.response.status === 200, 'Verificação de código deveria retornar 200');
  });

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
