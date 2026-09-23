const test = require('node:test');
const assert = require('node:assert/strict');
const {
  canCompleteAppointment,
  appointmentOccupiesSlot,
  timeToMinutes
} = require('./appointmentStatus');

test('timeToMinutes aceita HH:MM e HH:MM:SS', () => {
  assert.equal(timeToMinutes('14:00'), 14 * 60);
  assert.equal(timeToMinutes('09:30:00'), 9 * 60 + 30);
  assert.equal(timeToMinutes('invalido'), null);
});

test('não permite concluir agendamento futuro', () => {
  const now = new Date('2026-09-23T12:00:00-03:00');
  const future = { data: '2026-09-24', hora: '14:00', status: 'confirmado' };
  assert.equal(canCompleteAppointment(future, now), false);
});

test('permite concluir agendamento cujo horário já passou', () => {
  const now = new Date('2026-09-23T15:00:00-03:00');
  const past = { data: '2026-09-23', hora: '14:00', status: 'confirmado' };
  assert.equal(canCompleteAppointment(past, now), true);
});

test('realizado futuro continua ocupando o horário', () => {
  const now = new Date('2026-09-23T12:00:00-03:00');
  const premature = {
    data_agendamento: '2026-09-24',
    hora_inicio: '14:00',
    status: 'realizado'
  };
  assert.equal(appointmentOccupiesSlot(premature, now), true);
});

test('realizado passado deixa de bloquear novos horários', () => {
  const now = new Date('2026-09-23T16:00:00-03:00');
  const done = { data: '2026-09-23', hora: '09:00', status: 'realizado' };
  assert.equal(appointmentOccupiesSlot(done, now), false);
});

test('agendado e confirmado sempre ocupam o horário', () => {
  const now = new Date('2026-09-23T16:00:00-03:00');
  assert.equal(appointmentOccupiesSlot({ data: '2026-09-23', hora: '09:00', status: 'agendado' }, now), true);
  assert.equal(appointmentOccupiesSlot({ data: '2026-09-23', hora: '09:00', status: 'confirmado' }, now), true);
  assert.equal(appointmentOccupiesSlot({ data: '2026-09-23', hora: '09:00', status: 'cancelado' }, now), false);
});
