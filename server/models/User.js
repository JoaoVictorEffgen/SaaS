const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
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
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  empresa: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: true
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plano: {
    type: DataTypes.STRING,
    defaultValue: 'free',
    validate: {
      isIn: [['free', 'pro', 'business']]
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ativo',
    validate: {
      isIn: [['ativo', 'inativo', 'suspenso']]
    }
  },
  email_verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  telefone_verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  stripe_customer_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  stripe_subscription_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  data_expiracao_plano: {
    type: DataTypes.DATE,
    allowNull: true
  },
  configuracoes: {
    type: DataTypes.TEXT, // JSON como string para SQLite
    allowNull: true,
    defaultValue: JSON.stringify({
      notificacoes_email: true,
      notificacoes_whatsapp: false,
      horario_padrao: '09:00',
      duracao_padrao: 60,
      intervalo_agendamento: 30,
      dias_trabalho: [1, 2, 3, 4, 5], // Segunda a Sexta
      horario_inicio: '08:00',
      horario_fim: '18:00'
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
  tableName: 'usuarios',
  hooks: {
    beforeCreate: async (user) => {
      if (user.senha) {
        user.senha = await bcrypt.hash(user.senha, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('senha')) {
        user.senha = await bcrypt.hash(user.senha, 12);
      }
    }
  }
});

// Métodos de instância
User.prototype.verificarSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.senha;
  return values;
};

// Métodos de classe
User.findByEmail = function(email) {
  return this.findOne({ where: { email } });
};

User.findByStripeCustomerId = function(stripeCustomerId) {
  return this.findOne({ where: { stripe_customer_id: stripeCustomerId } });
};

module.exports = User; 