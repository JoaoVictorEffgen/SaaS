const STATUS_TRANSITIONS = Object.freeze({
  em_aprovacao: new Set(['agendado', 'confirmado', 'cancelado']),
  agendado: new Set(['confirmado', 'realizado', 'cancelado']),
  confirmado: new Set(['realizado', 'cancelado']),
  realizado: new Set(),
  cancelado: new Set()
});

const isKnownStatus = (status) => Object.hasOwn(STATUS_TRANSITIONS, status);

const canTransitionAppointment = (currentStatus, nextStatus) => (
  currentStatus === nextStatus || Boolean(STATUS_TRANSITIONS[currentStatus]?.has(nextStatus))
);

module.exports = {
  STATUS_TRANSITIONS,
  isKnownStatus,
  canTransitionAppointment
};
