const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateNewRedeEmployee, toSafeEmployee } = require('./redeEmployeeCreate');

test('rejeita criação sem senha — o formulário da rede não pode gravar funcionário sem credencial', () => {
  const result = validateNewRedeEmployee({
    nome: 'Ana Martins',
    email: 'ana@salao.local',
    telefone: '11999990000',
    cargo: 'Cabeleireira'
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.match(result.error, /senha/i);
});

test('rejeita senha com menos de 8 caracteres', () => {
  const result = validateNewRedeEmployee({
    nome: 'Ana Martins',
    email: 'ana@salao.local',
    senha: '1234567'
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test('rejeita nome ou e-mail vazios', () => {
  assert.equal(validateNewRedeEmployee({ email: 'ana@salao.local', senha: '12345678' }).ok, false);
  assert.equal(validateNewRedeEmployee({ nome: 'Ana', senha: '12345678' }).ok, false);
  assert.equal(validateNewRedeEmployee({ nome: 'Ana', email: 'sem-arroba', senha: '12345678' }).ok, false);
});

test('aceita payload válido e normaliza e-mail', () => {
  const result = validateNewRedeEmployee({
    nome: '  Ana Martins  ',
    email: 'Ana@Salao.Local',
    telefone: '11999990000',
    cargo: 'Cabeleireira',
    senha: 'senhaSegura1'
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.nome, 'Ana Martins');
  assert.equal(result.data.email, 'ana@salao.local');
  assert.equal(result.data.senha, 'senhaSegura1');
});

test('remove senha da resposta do funcionário criado', () => {
  const safe = toSafeEmployee({
    id: 4,
    nome: 'Ana',
    senha: 'hash-secreto',
    codigo_recuperacao_hash: 'abc',
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
