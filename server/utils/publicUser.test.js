const { test } = require('node:test');
const assert = require('node:assert/strict');
const { toPublicUser } = require('./publicUser');

test('remove senha e campos de recuperação de um usuário Sequelize-like', () => {
  const user = {
    toJSON() {
      return {
        id: 7,
        nome: 'Ana',
        email: 'ana@empresa.com',
        senha: '$2b$12$hashesensitive',
        codigo_recuperacao_hash: 'abc123',
        expiracao_recuperacao: '2026-11-26T12:00:00.000Z',
        tentativas_recuperacao: 2,
        tipo: 'funcionario'
      };
    }
  };

  const publicUser = toPublicUser(user);

  assert.equal(publicUser.id, 7);
  assert.equal(publicUser.nome, 'Ana');
  assert.equal(publicUser.tipo, 'funcionario');
  assert.equal('senha' in publicUser, false);
  assert.equal('codigo_recuperacao_hash' in publicUser, false);
  assert.equal('expiracao_recuperacao' in publicUser, false);
  assert.equal('tentativas_recuperacao' in publicUser, false);
});

test('remove os mesmos campos de um objeto plano', () => {
  const publicUser = toPublicUser({
    id: 3,
    senha: '12345678',
    codigo_recuperacao_hash: 'deadbeef',
    cargo: 'Barbeiro'
  });

  assert.deepEqual(publicUser, { id: 3, cargo: 'Barbeiro' });
});

test('retorna null quando não há usuário', () => {
  assert.equal(toPublicUser(null), null);
  assert.equal(toPublicUser(undefined), null);
});
