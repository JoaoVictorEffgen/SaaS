const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'password-recovery-test-secret-32chars';

const {
  GENERIC_RECOVERY_MESSAGE,
  normalizeRecoveryEmail,
  hashRecoveryCode,
  isValidRecoveryCode
} = require('./passwordRecovery');

test('normaliza e-mail de recuperação como o login: trim + lowercase', () => {
  assert.equal(normalizeRecoveryEmail('  Joao@Empresa.COM '), 'joao@empresa.com');
  assert.equal(normalizeRecoveryEmail('cliente@timeflow.local'), 'cliente@timeflow.local');
  assert.equal(normalizeRecoveryEmail(undefined), '');
});

test('mensagem genérica não revela se a conta existe', () => {
  assert.match(GENERIC_RECOVERY_MESSAGE, /Se os dados informados existirem/i);
});

test('código válido confere tipo, prazo e hash', () => {
  const codigo = '123456';
  const user = {
    tipo: 'cliente',
    codigo_recuperacao_hash: hashRecoveryCode(codigo),
    expiracao_recuperacao: new Date(Date.now() + 15 * 60 * 1000),
    tentativas_recuperacao: 0
  };

  assert.equal(isValidRecoveryCode(user, codigo, 'cliente'), true);
  assert.equal(isValidRecoveryCode(user, codigo, 'empresa'), false);
  assert.equal(isValidRecoveryCode(user, '000000', 'cliente'), false);
  assert.equal(isValidRecoveryCode(null, codigo, 'cliente'), false);
});

test('código expirado ou com hash corrompido não derruba o handler', () => {
  const codigo = '654321';
  const expired = {
    tipo: 'empresa',
    codigo_recuperacao_hash: hashRecoveryCode(codigo),
    expiracao_recuperacao: new Date(Date.now() - 1000),
    tentativas_recuperacao: 0
  };
  const corrupted = {
    tipo: 'empresa',
    codigo_recuperacao_hash: 'not-hex',
    expiracao_recuperacao: new Date(Date.now() + 15 * 60 * 1000),
    tentativas_recuperacao: 0
  };

  assert.equal(isValidRecoveryCode(expired, codigo, 'empresa'), false);
  assert.equal(isValidRecoveryCode(corrupted, codigo, 'empresa'), false);
});
