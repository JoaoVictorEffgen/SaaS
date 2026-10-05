const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseBoolean, resolveBasicMode } = require('./runtimeFlags');

test('parseBoolean usa o fallback quando o valor está ausente', () => {
  assert.equal(parseBoolean(undefined, true), true);
  assert.equal(parseBoolean('', false), false);
  assert.equal(parseBoolean(null, true), true);
});

test('parseBoolean só trata a string true (qualquer caixa) como verdadeiro', () => {
  assert.equal(parseBoolean('true'), true);
  assert.equal(parseBoolean('TRUE'), true);
  assert.equal(parseBoolean('false'), false);
  assert.equal(parseBoolean('1'), false);
});

test('produção sem BASIC_MODE não usa estado em memória', () => {
  assert.equal(resolveBasicMode({ NODE_ENV: 'production' }), false);
});

test('desenvolvimento sem BASIC_MODE continua no modo básico', () => {
  assert.equal(resolveBasicMode({ NODE_ENV: 'development' }), true);
  assert.equal(resolveBasicMode({}), true);
});

test('BASIC_MODE explícito prevalece inclusive em produção', () => {
  assert.equal(resolveBasicMode({ NODE_ENV: 'production', BASIC_MODE: 'true' }), true);
  assert.equal(resolveBasicMode({ NODE_ENV: 'development', BASIC_MODE: 'false' }), false);
});
