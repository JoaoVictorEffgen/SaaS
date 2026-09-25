const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizePromocaoUpdate } = require('./promocaoUpdate');

test('mantém apenas campos editáveis da promoção', () => {
  const sanitized = sanitizePromocaoUpdate({
    nome: 'Black Friday',
    descricao: 'Desconto de lançamento',
    destaque: true,
    ativo: true,
    valor_desconto: 20
  });

  assert.deepEqual(sanitized, {
    nome: 'Black Friday',
    descricao: 'Desconto de lançamento',
    destaque: true,
    ativo: true,
    valor_desconto: 20
  });
});

test('bloqueia reatribuição de empresa_id e demais campos internos', () => {
  const sanitized = sanitizePromocaoUpdate({
    id: 99,
    empresa_id: 777,
    uso_atual: 50,
    created_at: '2026-01-01',
    updated_at: '2026-01-02',
    nome: '90% OFF na loja da vítima',
    extra_malicioso: 'ignorar'
  });

  assert.deepEqual(sanitized, {
    nome: '90% OFF na loja da vítima'
  });
  assert.equal(Object.hasOwn(sanitized, 'empresa_id'), false);
  assert.equal(Object.hasOwn(sanitized, 'uso_atual'), false);
  assert.equal(Object.hasOwn(sanitized, 'id'), false);
});

test('aceita body vazio sem quebrar', () => {
  assert.deepEqual(sanitizePromocaoUpdate(undefined), {});
  assert.deepEqual(sanitizePromocaoUpdate(null), {});
});
