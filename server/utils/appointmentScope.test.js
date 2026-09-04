const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  getAppointmentOwnerFilter,
  appointmentMatchesOwnerFilter
} = require('./appointmentScope');

test('cliente só enxerga os próprios agendamentos', () => {
  const filter = getAppointmentOwnerFilter({ id: 3, tipo: 'cliente' });
  assert.deepEqual(filter, { where: { cliente_id: 3 } });
  assert.equal(
    appointmentMatchesOwnerFilter({ cliente_id: 3, empresa_id: 1 }, filter),
    true
  );
  assert.equal(
    appointmentMatchesOwnerFilter({ cliente_id: 99, empresa_id: 1 }, filter),
    false
  );
});

test('funcionario só enxerga a própria agenda', () => {
  const filter = getAppointmentOwnerFilter({ id: 2, tipo: 'funcionario' });
  assert.deepEqual(filter, { where: { funcionario_id: 2 } });
});

test('empresa é limitada à própria filial', () => {
  const filter = getAppointmentOwnerFilter({ id: 1, tipo: 'empresa' }, 7);
  assert.deepEqual(filter, { where: { empresa_id: 7 } });
});

test('empresa sem filial não vaza a agenda global', () => {
  const filter = getAppointmentOwnerFilter({ id: 1, tipo: 'empresa' }, null);
  assert.deepEqual(filter, { notFound: true });
  assert.equal(appointmentMatchesOwnerFilter({ empresa_id: 1 }, filter), false);
});

test('tipo desconhecido é negado em vez de listar tudo', () => {
  const filter = getAppointmentOwnerFilter({ id: 1, tipo: 'admin' });
  assert.deepEqual(filter, { denied: true });
});
