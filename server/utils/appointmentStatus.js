const { isFutureBusinessSlot } = require('./businessTime');

const STATUS_TRANSITIONS = Object.freeze({
  em_aprovacao: new Set(['agendado', 'confirmado', 'cancelado']),
  agendado: new Set(['confirmado', 'realizado', 'cancelado']),
  confirmado: new Set(['realizado', 'cancelado']),
  realizado: new Set(),
  cancelado: new Set()
});

const ACTIVE_BOOKING_STATUSES = Object.freeze(['em_aprovacao', 'agendado', 'confirmado']);

const isKnownStatus = (status) => Object.hasOwn(STATUS_TRANSITIONS, status);

const canTransitionAppointment = (currentStatus, nextStatus) => (
  currentStatus === nextStatus || Boolean(STATUS_TRANSITIONS[currentStatus]?.has(nextStatus))
);

const timeToMinutes = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getHours() * 60 + value.getMinutes();
  }
  const match = String(value || '').match(/^(\d{2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
};

const getAppointmentDateTime = (appointment) => ({
  date: appointment?.data || appointment?.data_agendamento,
  time: appointment?.hora || appointment?.hora_inicio
});

const canCompleteAppointment = (appointment, now = new Date()) => {
  const { date, time } = getAppointmentDateTime(appointment);
  const minutes = timeToMinutes(time);
  if (!date || minutes === null) return false;
  return !isFutureBusinessSlot(date, minutes, now);
};

const appointmentOccupiesSlot = (appointment, now = new Date()) => {
  const status = String(appointment?.status || '');
  if (ACTIVE_BOOKING_STATUSES.includes(status)) return true;
  if (status === 'realizado') return !canCompleteAppointment(appointment, now);
  return false;
};

module.exports = {
  STATUS_TRANSITIONS,
  ACTIVE_BOOKING_STATUSES,
  isKnownStatus,
  canTransitionAppointment,
  timeToMinutes,
  canCompleteAppointment,
  appointmentOccupiesSlot
};
