const User = require('./User');
const Agenda = require('./Agenda');
const Agendamento = require('./Agendamento');
const Subscription = require('./Subscription');

// Associações User - Agenda (1:N)
User.hasMany(Agenda, {
  foreignKey: 'usuario_id',
  as: 'agendas'
});
Agenda.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Associações User - Agendamento (1:N)
User.hasMany(Agendamento, {
  foreignKey: 'usuario_id',
  as: 'agendamentos'
});
Agendamento.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Associações Agenda - Agendamento (1:N)
Agenda.hasMany(Agendamento, {
  foreignKey: 'agenda_id',
  as: 'agendamentos'
});
Agendamento.belongsTo(Agenda, {
  foreignKey: 'agenda_id',
  as: 'agenda'
});

// Associações User - Subscription (1:N)
User.hasMany(Subscription, {
  foreignKey: 'usuario_id',
  as: 'assinaturas'
});
Subscription.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Associação Agendamento - Agendamento (reagendamento)
Agendamento.hasOne(Agendamento, {
  foreignKey: 'reagendamento_de',
  as: 'reagendamento'
});
Agendamento.belongsTo(Agendamento, {
  foreignKey: 'reagendamento_de',
  as: 'agendamento_original'
});

module.exports = {
  User,
  Agenda,
  Agendamento,
  Subscription
}; 