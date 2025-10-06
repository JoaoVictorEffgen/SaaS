const User = require('./User');
const Empresa = require('./Empresa');
const Servico = require('./Servico');
const Agendamento = require('./Agendamento');

// Relacionamentos limpos e únicos
function setupAssociations() {
  // === RELACIONAMENTOS USER ===
  
  // 1. User (Empresa) tem muitos funcionários
  User.hasMany(User, {
    foreignKey: 'empresa_id',
    as: 'funcionariosEmpresa'
  });
  
  // 2. User (Funcionário) pertence a uma empresa
  User.belongsTo(User, {
    foreignKey: 'empresa_id',
    as: 'empresaPai'
  });

  // === RELACIONAMENTOS EMPRESA ===
  
  // 3. User (Empresa) tem um registro na tabela empresas
  User.hasOne(Empresa, {
    foreignKey: 'user_id',
    as: 'dadosEmpresa'
  });
  
  // 4. Empresa pertence a um User
  Empresa.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // === RELACIONAMENTOS SERVIÇO ===
  
  // 5. Empresa tem muitos serviços
  Empresa.hasMany(Servico, {
    foreignKey: 'empresa_id',
    as: 'servicos'
  });
  
  // 6. Servico pertence a uma empresa
  Servico.belongsTo(Empresa, {
    foreignKey: 'empresa_id',
    as: 'empresa'
  });

  // === RELACIONAMENTOS AGENDAMENTO ===
  
  // 7. User (Cliente) tem muitos agendamentos
  User.hasMany(Agendamento, {
    foreignKey: 'cliente_id',
    as: 'agendamentosComoCliente'
  });

  // 8. User (Funcionário) tem muitos agendamentos
  User.hasMany(Agendamento, {
    foreignKey: 'funcionario_id',
    as: 'agendamentosComoFuncionario'
  });

  // 9. Empresa tem muitos agendamentos
  Empresa.hasMany(Agendamento, {
    foreignKey: 'empresa_id',
    as: 'agendamentos'
  });

  // === RELACIONAMENTOS INVERSA ===
  
  // 10. Agendamento pertence a um cliente
  Agendamento.belongsTo(User, {
    foreignKey: 'cliente_id',
    as: 'cliente'
  });

  // 11. Agendamento pertence a um funcionário
  Agendamento.belongsTo(User, {
    foreignKey: 'funcionario_id',
    as: 'funcionario'
  });

  // 12. Agendamento pertence a uma empresa
  Agendamento.belongsTo(Empresa, {
    foreignKey: 'empresa_id',
    as: 'empresa'
  });

  console.log('✅ Relacionamentos configurados com sucesso!');
}

module.exports = setupAssociations;