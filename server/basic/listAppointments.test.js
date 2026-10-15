const assert = require('assert');
const {
  state,
  listAppointmentsForUser,
  userManagesAppointment
} = require('./store');

const owner = state.users.find((user) => user.id === 1 && user.tipo === 'empresa');
assert(owner, 'Usuário empresa demo deveria existir');

const branch = {
  id: 9001,
  user_id: owner.id,
  nome: 'Filial Centro',
  ativo: true
};
const branchAppointment = {
  id: 9002,
  empresa_id: branch.id,
  funcionario_id: 2,
  cliente_id: 3,
  data_agendamento: '2026-10-20',
  hora_inicio: '14:00',
  status: 'em_aprovacao',
  servicos: [1]
};

state.companies.push(branch);
state.appointments.push(branchAppointment);

try {
  const listed = listAppointmentsForUser(owner);
  assert(
    listed.some((appointment) => Number(appointment.id) === branchAppointment.id),
    'A empresa dona da rede deve ver agendamentos da filial'
  );
  assert(
    userManagesAppointment(owner, branchAppointment),
    'A empresa dona da rede deve poder gerenciar agendamentos da filial'
  );

  const otherOwner = { id: 999, tipo: 'empresa' };
  assert.strictEqual(
    listAppointmentsForUser(otherOwner).length,
    0,
    'Outra empresa não deve ver a agenda da filial'
  );
  assert.strictEqual(
    userManagesAppointment(otherOwner, branchAppointment),
    false,
    'Outra empresa não deve gerenciar a agenda da filial'
  );
} finally {
  const companyIndex = state.companies.findIndex((company) => company.id === branch.id);
  if (companyIndex >= 0) state.companies.splice(companyIndex, 1);
  const appointmentIndex = state.appointments.findIndex((item) => item.id === branchAppointment.id);
  if (appointmentIndex >= 0) state.appointments.splice(appointmentIndex, 1);
}

console.log('listAppointments.test.js ok');
