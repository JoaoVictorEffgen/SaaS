const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

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
  rede_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'redes_empresariais',
      key: 'id'
    },
    comment: 'ID da rede empresarial (para usuários admin de rede)'
  },
  cargo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  foto_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  url_foto_perfil: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
    comment: 'URL da foto de perfil do usuário'
  },
  disponibilidade: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
  },
  pausas: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  plano: {
    type: DataTypes.ENUM('free', 'pro', 'business'),
    allowNull: false,
    defaultValue: 'free'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  codigo_recuperacao_hash: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  expiracao_recuperacao: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tentativas_recuperacao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
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
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.senha && !user.senha.startsWith('$2')) {
        user.senha = await bcrypt.hash(user.senha, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('senha') && user.senha && !user.senha.startsWith('$2')) {
        user.senha = await bcrypt.hash(user.senha, 12);
      }
    }
  }
});

User.findByEmail = function findByEmail(email) {
  return this.findOne({ where: { email } });
};

User.prototype.verificarSenha = function verificarSenha(senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = User;
