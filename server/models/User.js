const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('empresa', 'funcionario', 'cliente'),
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true
  },
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: true
  },
  razao_social: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'empresas',
      key: 'id'
    }
  },
  cargo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  foto_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['tipo'] },
    { fields: ['email'] },
    { fields: ['empresa_id'] }
  ]
});

module.exports = User;