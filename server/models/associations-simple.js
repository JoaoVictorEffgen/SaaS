const User = require('./User');
const Empresa = require('./Empresa');
const Servico = require('./Servico');
const Agendamento = require('./Agendamento');
const RedeEmpresarial = require('./RedeEmpresarial');
const PacotePersonalizado = require('./PacotePersonalizado');
const ContratoPacote = require('./ContratoPacote');
const Promocao = require('./Promocao');

// Relacionamentos simplificados e corretos
let associationsSetup = false;

function setupAssociations() {
  if (associationsSetup) {
    return;
  }
  
  console.log('🔧 Configurando relacionamentos...');
  
  // 1. EMPRESA - pode existir independentemente
  // Empresa pertence a um usuário (empresa)
  Empresa.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'owner'
  });
  
  // Usuário pode ter uma empresa (se for tipo empresa)
  User.hasOne(Empresa, {
    foreignKey: 'user_id',
    as: 'empresa'
  });
  
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
  User.belongsTo(Empresa, {
    foreignKey: 'empresa_id',
    as: 'empresaDoFuncionario'
  });
  
  Empresa.hasMany(User, {
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

  // 5. REDE EMPRESARIAL
  // Rede pertence a um usuário admin
  RedeEmpresarial.belongsTo(User, {
    foreignKey: 'usuario_admin_id',
    as: 'admin'
  });
  
  // Usuário admin pode ter uma rede
  User.hasOne(RedeEmpresarial, {
    foreignKey: 'usuario_admin_id',
    as: 'redeAdmin'
  });
  
  // Usuário pode pertencer a uma rede (funcionários de rede)
  User.belongsTo(RedeEmpresarial, {
    foreignKey: 'rede_id',
    as: 'rede'
  });
  
  // Rede pode ter múltiplos usuários
  RedeEmpresarial.hasMany(User, {
    foreignKey: 'rede_id',
    as: 'usuarios'
  });
  
  // Empresa pode pertencer a uma rede
  Empresa.belongsTo(RedeEmpresarial, {
    foreignKey: 'rede_id',
    as: 'rede'
  });
  
  // Rede pode ter múltiplas empresas
  RedeEmpresarial.hasMany(Empresa, {
    foreignKey: 'rede_id',
    as: 'empresas'
  });

  // 6. PACOTES PERSONALIZADOS
  // Pacote pertence a uma empresa (criadora)
  PacotePersonalizado.belongsTo(Empresa, {
    foreignKey: 'empresa_id',
    as: 'empresaCriadora'
  });

  // Empresa pode criar múltiplos pacotes
  Empresa.hasMany(PacotePersonalizado, {
    foreignKey: 'empresa_id',
    as: 'pacotesCriados'
  });

  // 7. CONTRATOS DE PACOTES
  // Contrato pertence a um pacote
  ContratoPacote.belongsTo(PacotePersonalizado, {
    foreignKey: 'pacote_id',
    as: 'pacote'
  });

  // Pacote pode ter múltiplos contratos
  PacotePersonalizado.hasMany(ContratoPacote, {
    foreignKey: 'pacote_id',
    as: 'contratos'
  });

  // Contrato pertence a empresa contratante
  ContratoPacote.belongsTo(Empresa, {
    foreignKey: 'empresa_contratante_id',
    as: 'empresaContratante'
  });

  // Empresa pode ter múltiplos contratos (como contratante)
  Empresa.hasMany(ContratoPacote, {
    foreignKey: 'empresa_contratante_id',
    as: 'contratosContratados'
  });

  // Contrato pertence a empresa vendedora
  ContratoPacote.belongsTo(Empresa, {
    foreignKey: 'empresa_vendedora_id',
    as: 'empresaVendedora'
  });

  // Empresa pode ter múltiplos contratos (como vendedora)
  Empresa.hasMany(ContratoPacote, {
    foreignKey: 'empresa_vendedora_id',
    as: 'contratosVendidos'
  });

  // 8. PROMOÇÕES
  // Promoção pertence a uma empresa (criadora)
  Promocao.belongsTo(Empresa, {
    foreignKey: 'empresa_id',
    as: 'empresaCriadora'
  });

  // Empresa pode criar múltiplas promoções
  Empresa.hasMany(Promocao, {
    foreignKey: 'empresa_id',
    as: 'promocoesCriadas'
  });

  console.log('✅ Relacionamentos configurados com sucesso!');
  associationsSetup = true;
}

module.exports = setupAssociations;
