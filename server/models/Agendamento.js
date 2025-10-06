const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Agendamento = sequelize.define('Agendamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  funcionario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('em_aprovacao', 'agendado', 'confirmado', 'realizado', 'cancelado'),
    defaultValue: 'em_aprovacao'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  valor_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  data_confirmacao: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_realizacao: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_cancelamento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  justificativa_cancelamento: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelado_por: {
    type: DataTypes.ENUM('cliente', 'funcionario', 'sistema'),
    allowNull: true
  }
}, {
  tableName: 'agendamentos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['cliente_id'] },
    { fields: ['funcionario_id'] },
    { fields: ['empresa_id'] },
    { fields: ['data', 'hora'] },
    { fields: ['status'] }
  ]
});

module.exports = Agendamento;