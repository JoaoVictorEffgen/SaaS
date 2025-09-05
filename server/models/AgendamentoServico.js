const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AgendamentoServico = sequelize.define('AgendamentoServico', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  agendamento_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'agendamentos',
      key: 'id'
    }
  },
  servico_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'servicos',
      key: 'id'
    }
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  preco_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  preco_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  duracao_total: {
    type: DataTypes.INTEGER, // em minutos
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'agendamento_servicos',
  timestamps: true
});

module.exports = AgendamentoServico;
