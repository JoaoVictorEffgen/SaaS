const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Servico = sequelize.define('Servico', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duracao_minutos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: 15,
      max: 480
    }
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ativo',
    validate: {
      isIn: [['ativo', 'inativo']]
    }
  },
  empresa_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  funcionario_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'funcionarios',
      key: 'id'
    }
  },
  configuracoes: {
    type: DataTypes.TEXT, // JSON como string para SQLite
    allowNull: true,
    defaultValue: JSON.stringify({
      permite_agendamento_online: true,
      requer_pagamento_antecipado: false,
      cancelamento_minimo_horas: 24,
      reagendamento_maximo_dias: 30
    }),
    get() {
      const value = this.getDataValue('configuracoes');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('configuracoes', JSON.stringify(value));
    }
  }
}, {
  tableName: 'servicos',
  timestamps: true
});

module.exports = Servico;
