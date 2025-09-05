const User = require('./User');
const Agenda = require('./Agenda');
const Agendamento = require('./Agendamento');
const Subscription = require('./Subscription');
const Funcionario = require('./Funcionario');
const Servico = require('./Servico');
const AgendamentoServico = require('./AgendamentoServico');

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

// Associações User - Funcionario (1:N)
User.hasMany(Funcionario, {
  foreignKey: 'empresa_id',
  as: 'funcionarios'
});
Funcionario.belongsTo(User, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

// Associações User - Servico (1:N)
User.hasMany(Servico, {
  foreignKey: 'empresa_id',
  as: 'servicos'
});
Servico.belongsTo(User, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

// Associações Funcionario - Servico (1:N)
Funcionario.hasMany(Servico, {
  foreignKey: 'funcionario_id',
  as: 'servicos'
});
Servico.belongsTo(Funcionario, {
  foreignKey: 'funcionario_id',
  as: 'funcionario'
});

// Associações Agendamento - Funcionario (N:1)
Agendamento.belongsTo(Funcionario, {
  foreignKey: 'funcionario_id',
  as: 'funcionario'
});
Funcionario.hasMany(Agendamento, {
  foreignKey: 'funcionario_id',
  as: 'agendamentos'
});

// Associações Agendamento - Cliente (N:1)
Agendamento.belongsTo(User, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});
User.hasMany(Agendamento, {
  foreignKey: 'cliente_id',
  as: 'agendamentos_cliente'
});

// Associações Agendamento - Servico (N:N)
Agendamento.belongsToMany(Servico, {
  through: AgendamentoServico,
  foreignKey: 'agendamento_id',
  otherKey: 'servico_id',
  as: 'servicos'
});
Servico.belongsToMany(Agendamento, {
  through: AgendamentoServico,
  foreignKey: 'servico_id',
  otherKey: 'agendamento_id',
  as: 'agendamentos'
});

module.exports = {
  User,
  Agenda,
  Agendamento,
  Subscription,
  Funcionario,
  Servico,
  AgendamentoServico
}; 