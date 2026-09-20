const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canAssignEmployeeToRede, toSafeEmployee } = require('./employeeAssignment');

test('rejeita cliente, empresa ou usuário inexistente no lugar de funcionário', () => {
  assert.equal(canAssignEmployeeToRede(null, 1).status, 404);
  assert.equal(canAssignEmployeeToRede({ tipo: 'cliente', empresa_id: null, rede_id: 1, ativo: true }, 1).status, 404);
  assert.equal(canAssignEmployeeToRede({ tipo: 'empresa', empresa_id: null, rede_id: 1, ativo: true }, 1).status, 404);
  assert.equal(canAssignEmployeeToRede({ tipo: 'funcionario', empresa_id: null, rede_id: 1, ativo: false }, 1).status, 404);
});

test('rejeita funcionário que já está vinculado a uma empresa', () => {
  const result = canAssignEmployeeToRede({
    tipo: 'funcionario',
    empresa_id: 9,
    rede_id: 1,
    ativo: true
  }, 1);
  assert.equal(result.status, 400);
});

test('rejeita funcionário de outra rede ou sem rede — impede sequestro cross-tenant', () => {
  const otherNetwork = canAssignEmployeeToRede({
    tipo: 'funcionario',
    empresa_id: null,
    rede_id: 2,
    ativo: true
  }, 1);
  assert.equal(otherNetwork.status, 403);

  const unscoped = canAssignEmployeeToRede({
    tipo: 'funcionario',
    empresa_id: null,
    rede_id: null,
    ativo: true
  }, 1);
  assert.equal(unscoped.status, 403);
});

test('permite vincular funcionário desvinculado da mesma rede', () => {
  const result = canAssignEmployeeToRede({
    tipo: 'funcionario',
    empresa_id: null,
    rede_id: 7,
    ativo: true
  }, 7);
  assert.equal(result.ok, true);
});

test('remove senha e dados de recuperação da resposta', () => {
  const safe = toSafeEmployee({
    id: 4,
    nome: 'Ana',
    senha: 'hash-secreto',
    codigo_recuperacao_hash: 'abc',
    expiracao_recuperacao: '2026-01-01',
    tentativas_recuperacao: 2,
    toJSON() {
      return {
        id: this.id,
        nome: this.nome,
        senha: this.senha,
        codigo_recuperacao_hash: this.codigo_recuperacao_hash
      };
    }
  });

  assert.equal(safe.nome, 'Ana');
  assert.equal(safe.senha, undefined);
  assert.equal(safe.codigo_recuperacao_hash, undefined);
});
