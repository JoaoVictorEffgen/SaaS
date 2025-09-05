const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Funcionario = sequelize.define('Funcionario', {
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
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  especialidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  foto_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ativo',
    validate: {
      isIn: [['ativo', 'inativo', 'ferias']]
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
  configuracoes: {
    type: DataTypes.TEXT, // JSON como string para SQLite
    allowNull: true,
    defaultValue: JSON.stringify({
      horario_inicio: '08:00',
      horario_fim: '18:00',
      dias_trabalho: [1, 2, 3, 4, 5], // Segunda a Sexta
      duracao_padrao: 60,
      intervalo_agendamento: 30
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
  tableName: 'funcionarios',
  timestamps: true
});

module.exports = Funcionario;
