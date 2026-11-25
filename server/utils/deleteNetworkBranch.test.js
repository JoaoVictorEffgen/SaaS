process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = require('path').join(
  require('os').tmpdir(),
  `timeflow-delete-branch-${process.pid}.sqlite`
);

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const {
  sequelize,
  User,
  Empresa,
  RedeEmpresarial,
  Agendamento,
  Servico
} = require('../models');
const { deleteNetworkBranch } = require('./deleteNetworkBranch');

const password = 'senha-teste-123';

const createFixture = async () => {
  const admin = await User.create({
    tipo: 'empresa',
    nome: 'Admin Rede',
    email: `admin-${Date.now()}@timeflow.test`,
    senha: password,
    ativo: true
  });

  const cliente = await User.create({
    tipo: 'cliente',
    nome: 'Cliente',
    email: `cliente-${Date.now()}@timeflow.test`,
    senha: password,
    ativo: true
  });

  const rede = await RedeEmpresarial.create({
    nome_rede: 'Rede Teste',
    usuario_admin_id: admin.id,
    plano: 'enterprise',
    limite_empresas: 10,
    empresas_ativas: 2,
    ativo: true
  });

  const matriz = await Empresa.create({
    nome: 'Matriz',
    user_id: admin.id,
    rede_id: rede.id,
    nome_unidade: 'Matriz',
    ativo: true
  });

  const filial = await Empresa.create({
    nome: 'Filial Centro',
    user_id: admin.id,
    rede_id: rede.id,
    nome_unidade: 'Centro',
    ativo: true
  });

  const funcionarioFilial = await User.create({
    tipo: 'funcionario',
    nome: 'Barbeiro Filial',
    email: `func-filial-${Date.now()}@timeflow.test`,
    senha: password,
    empresa_id: filial.id,
    rede_id: rede.id,
    ativo: true
  });

  const funcionarioMatriz = await User.create({
    tipo: 'funcionario',
    nome: 'Barbeiro Matriz',
    email: `func-matriz-${Date.now()}@timeflow.test`,
    senha: password,
    empresa_id: matriz.id,
    rede_id: rede.id,
    ativo: true
  });

  await Servico.create({
    empresa_id: filial.id,
    nome: 'Corte',
    duracao_minutos: 30,
    preco: 50
  });

  const agendamentoFilial = await Agendamento.create({
    cliente_id: cliente.id,
    funcionario_id: funcionarioFilial.id,
    empresa_id: filial.id,
    data: '2026-12-01',
    hora: '10:00:00',
    status: 'confirmado',
    servicos: [{ nome: 'Corte', duracao_minutos: 30, preco: 50 }],
    valor_total: 50
  });

  const agendamentoMatriz = await Agendamento.create({
    cliente_id: cliente.id,
    funcionario_id: funcionarioMatriz.id,
    empresa_id: matriz.id,
    data: '2026-12-01',
    hora: '11:00:00',
    status: 'confirmado',
    servicos: [{ nome: 'Corte', duracao_minutos: 30, preco: 50 }],
    valor_total: 50
  });

  return {
    admin,
    cliente,
    rede,
    matriz,
    filial,
    funcionarioFilial,
    funcionarioMatriz,
    agendamentoFilial,
    agendamentoMatriz
  };
};

before(async () => {
  await sequelize.sync({ force: true });
});

after(async () => {
  await sequelize.close();
  fs.rmSync(process.env.DB_STORAGE, { force: true });
});

test('exclui a filial com serviços sem perder a agenda da matriz', async () => {
  const fixture = await createFixture();

  const result = await deleteNetworkBranch({
    empresa: fixture.filial,
    rede: fixture.rede
  });

  assert.equal(result.funcionariosRemovidos, 1);
  assert.equal(await Empresa.count({ where: { id: fixture.filial.id } }), 0);
  assert.equal(await Agendamento.count({ where: { empresa_id: fixture.filial.id } }), 0);
  assert.equal(await Servico.count({ where: { empresa_id: fixture.filial.id } }), 0);
  assert.equal(await Agendamento.count({ where: { id: fixture.agendamentoMatriz.id } }), 1);
  assert.equal(await Empresa.count({ where: { id: fixture.matriz.id } }), 1);

  await fixture.funcionarioFilial.reload();
  assert.equal(fixture.funcionarioFilial.empresa_id, null);
  assert.equal(fixture.funcionarioFilial.rede_id, fixture.rede.id);

  await fixture.rede.reload();
  assert.equal(fixture.rede.empresas_ativas, 1);
});

test('se a exclusão da empresa falhar, os agendamentos da filial não são apagados', async () => {
  const fixture = await createFixture();
  const failDestroy = () => {
    throw new Error('falha simulada ao excluir empresa');
  };
  Empresa.addHook('beforeDestroy', failDestroy);

  try {
    await assert.rejects(
      () => deleteNetworkBranch({ empresa: fixture.filial, rede: fixture.rede }),
      /falha simulada ao excluir empresa/
    );

    assert.equal(await Agendamento.count({ where: { id: fixture.agendamentoFilial.id } }), 1);
    assert.equal(await Empresa.count({ where: { id: fixture.filial.id } }), 1);
    assert.equal(await Servico.count({ where: { empresa_id: fixture.filial.id } }), 1);

    await fixture.funcionarioFilial.reload();
    assert.equal(fixture.funcionarioFilial.empresa_id, fixture.filial.id);

    await fixture.rede.reload();
    assert.equal(fixture.rede.empresas_ativas, 2);
  } finally {
    Empresa.removeHook('beforeDestroy', failDestroy);
  }
});
