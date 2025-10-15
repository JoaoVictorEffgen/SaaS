const { sequelize } = require('../config/database');

// Importar todos os modelos
const User = require('./User');
const Empresa = require('./Empresa');
const Servico = require('./Servico');
const Agendamento = require('./Agendamento');
const RedeEmpresarial = require('./RedeEmpresarial');
const PacotePersonalizado = require('./PacotePersonalizado');
const ContratoPacote = require('./ContratoPacote');
const Promocao = require('./Promocao');

// Configurar relacionamentos
const setupAssociations = require('./associations-simple');
setupAssociations();

module.exports = {
  sequelize,
  User,
  Empresa,
  Servico,
  Agendamento,
  RedeEmpresarial,
  PacotePersonalizado,
  ContratoPacote,
  Promocao
};
