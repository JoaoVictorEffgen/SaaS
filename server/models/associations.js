const User = require('./User');
const Empresa = require('./Empresa');
const Servico = require('./Servico');
const Agendamento = require('./Agendamento');

// Relacionamentos mínimos sem conflitos
function setupAssociations() {
  // Relacionamentos básicos apenas
  User.hasMany(User, {
    foreignKey: 'empresa_id',
    as: 'funcionariosDaEmpresa'
  });
  
  User.belongsTo(User, {
    foreignKey: 'empresa_id',
    as: 'empresaDoFuncionario'
  });

  User.hasOne(Empresa, {
    foreignKey: 'user_id'
  });
  
  Empresa.belongsTo(User, {
    foreignKey: 'user_id'
  });

  Empresa.hasMany(Servico, {
    foreignKey: 'empresa_id'
  });
  
  Servico.belongsTo(Empresa, {
    foreignKey: 'empresa_id'
  });

  User.hasMany(Agendamento, {
    foreignKey: 'cliente_id',
    as: 'agendamentosComoCliente'
  });

  User.hasMany(Agendamento, {
    foreignKey: 'funcionario_id',
    as: 'agendamentosComoFuncionario'
  });

  Empresa.hasMany(Agendamento, {
    foreignKey: 'empresa_id'
  });

  Agendamento.belongsTo(User, {
    foreignKey: 'cliente_id',
    as: 'clienteAgendamento'
  });

  Agendamento.belongsTo(User, {
    foreignKey: 'funcionario_id',
    as: 'funcionarioAgendamento'
  });

  Agendamento.belongsTo(Empresa, {
    foreignKey: 'empresa_id'
  });

  console.log('✅ Relacionamentos configurados com sucesso!');
}

module.exports = setupAssociations;