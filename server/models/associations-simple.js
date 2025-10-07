const User = require('./User');
const Empresa = require('./Empresa');
const Servico = require('./Servico');
const Agendamento = require('./Agendamento');

// Relacionamentos simplificados e corretos
function setupAssociations() {
  console.log('🔧 Configurando relacionamentos...');
  
  // 1. EMPRESA - pode existir independentemente
  Empresa.hasMany(Servico, {
    foreignKey: 'empresa_id',
    as: 'servicos'
  });
  
  Empresa.hasMany(Agendamento, {
    foreignKey: 'empresa_id',
    as: 'agendamentos'
  });

  // 2. USER (todos os tipos: empresa, cliente, funcionario)
  // Funcionários pertencem a uma empresa
  User.belongsTo(User, {
    foreignKey: 'empresa_id',
    as: 'empresaDono'
  });
  
  User.hasMany(User, {
    foreignKey: 'empresa_id',
    as: 'funcionarios'
  });

  // Usuários têm agendamentos como cliente
  User.hasMany(Agendamento, {
    foreignKey: 'cliente_id',
    as: 'agendamentosComoCliente'
  });

  // Usuários têm agendamentos como funcionário
  User.hasMany(Agendamento, {
    foreignKey: 'funcionario_id',
    as: 'agendamentosComoFuncionario'
  });

  // 3. SERVIÇO
  Servico.belongsTo(Empresa, {
    foreignKey: 'empresa_id',
    as: 'empresa'
  });

  // 4. AGENDAMENTO
  Agendamento.belongsTo(User, {
    foreignKey: 'cliente_id',
    as: 'cliente'
  });

  Agendamento.belongsTo(User, {
    foreignKey: 'funcionario_id',
    as: 'funcionario'
  });

  Agendamento.belongsTo(Empresa, {
    foreignKey: 'empresa_id',
    as: 'empresa'
  });

  console.log('✅ Relacionamentos configurados com sucesso!');
}

module.exports = setupAssociations;
