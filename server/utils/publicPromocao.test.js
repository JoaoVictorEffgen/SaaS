const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  PUBLIC_PROMOCAO_ATTRIBUTES,
  SECRET_PROMOCAO_FIELDS,
  toPublicPromocao
} = require('./publicPromocao');

test('vitrine pública omite código, limites e observações internas', () => {
  const publicPromo = toPublicPromocao({
    id: 12,
    nome: 'Black Friday',
    descricao: 'Desconto de lançamento',
    tipo_desconto: 'percentual',
    valor_desconto: 50,
    meses_gratis: null,
    destaque: true,
    cor_destaque: '#111111',
    imagem_promocao_url: '/promo.png',
    data_inicio: '2026-11-01',
    data_fim: '2026-11-30',
    codigo_promocional: 'BLACK50',
    limite_uso: 10,
    uso_atual: 3,
    observacoes: 'só para clientes VIP',
    condicoes: { apenas_novos: true },
    pacotes_aplicaveis: [9],
    funcionalidade_extra: { relatorios: true },
    empresa_id: 4
  });

  assert.equal(publicPromo.nome, 'Black Friday');
  assert.equal(publicPromo.valor_desconto, 50);
  assert.equal(publicPromo.destaque, true);
  for (const field of SECRET_PROMOCAO_FIELDS) {
    assert.equal(publicPromo[field], undefined, `${field} não pode vazar na vitrine`);
  }
  assert.equal(publicPromo.empresa_id, undefined);
});

test('respeita toJSON do Sequelize e não inventa campos ausentes', () => {
  const publicPromo = toPublicPromocao({
    id: 1,
    nome: 'Primeiro agendamento',
    tipo_desconto: 'percentual',
    valor_desconto: 10,
    toJSON() {
      return {
        id: this.id,
        nome: this.nome,
        tipo_desconto: this.tipo_desconto,
        valor_desconto: this.valor_desconto,
        codigo_promocional: 'INTERNO10',
        observacoes: 'não publicar'
      };
    }
  });

  assert.deepEqual(Object.keys(publicPromo).sort(), ['id', 'nome', 'tipo_desconto', 'valor_desconto'].sort());
  assert.equal(publicPromo.codigo_promocional, undefined);
});

test('lista pública não inclui os campos secretos', () => {
  for (const field of SECRET_PROMOCAO_FIELDS) {
    assert.equal(PUBLIC_PROMOCAO_ATTRIBUTES.includes(field), false);
  }
});

test('vitrine do modo básico não publica o código da promoção seed', () => {
  const { state } = require('../basic/store');
  const seeded = state.promotions.find((item) => Number(item.id) === 1);
  assert.ok(seeded?.codigo_promocional, 'seed precisa ter código para regressão');
  const published = toPublicPromocao(seeded);
  assert.equal(published.codigo_promocional, undefined);
  assert.equal(published.observacoes, undefined);
  assert.equal(published.limite_uso, undefined);
});
