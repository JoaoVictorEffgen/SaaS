const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  plano: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['free', 'pro', 'business']]
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pendente',
    validate: {
      isIn: [['ativo', 'cancelado', 'expirado', 'suspenso', 'pendente']]
    }
  },
  stripe_subscription_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  stripe_price_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  preco_mensal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  moeda: {
    type: DataTypes.STRING(3),
    defaultValue: 'BRL'
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  data_fim: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_proximo_pagamento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_cancelamento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  motivo_cancelamento: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ciclo_faturamento: {
    type: DataTypes.STRING,
    defaultValue: 'mensal',
    validate: {
      isIn: [['mensal', 'trimestral', 'semestral', 'anual']]
    }
  },
  desconto_percentual: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  cupom_aplicado: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  limite_agendamentos: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  agendamentos_utilizados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  recursos_inclusos: {
    type: DataTypes.TEXT, // JSON como string para SQLite
    allowNull: true,
    defaultValue: JSON.stringify({
      whatsapp: false,
      relatorios: false,
      multiusuario: false,
      personalizacao: false,
      integracoes: false,
      suporte_prioritario: false
    }),
    get() {
      const value = this.getDataValue('recursos_inclusos');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('recursos_inclusos', JSON.stringify(value));
    }
  },
  metadata: {
    type: DataTypes.TEXT, // JSON como string para SQLite
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('metadata');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('metadata', JSON.stringify(value));
    }
  }
}, {
  tableName: 'assinaturas'
});

// Métodos de instância
Subscription.prototype.estaAtiva = function() {
  return this.status === 'ativo' && (!this.data_fim || new Date() < this.data_fim);
};

Subscription.prototype.podeFazerAgendamento = function() {
  if (!this.estaAtiva()) return false;
  
  // Plano free tem limite
  if (this.plano === 'free') {
    return this.agendamentos_utilizados < (this.limite_agendamentos || 10);
  }
  
  // Planos pagos são ilimitados
  return true;
};

Subscription.prototype.incrementarAgendamento = function() {
  if (this.plano === 'free') {
    this.agendamentos_utilizados += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

Subscription.prototype.cancelar = function(motivo) {
  this.status = 'cancelado';
  this.data_cancelamento = new Date();
  this.motivo_cancelamento = motivo;
  return this.save();
};

Subscription.prototype.renovar = function() {
  this.status = 'ativo';
  this.data_cancelamento = null;
  this.motivo_cancelamento = null;
  
  // Calcular nova data de fim baseada no ciclo
  const dataInicio = new Date();
  this.data_inicio = dataInicio;
  
  switch (this.ciclo_faturamento) {
    case 'mensal':
      this.data_fim = new Date(dataInicio.getFullYear(), dataInicio.getMonth() + 1, dataInicio.getDate());
      break;
    case 'trimestral':
      this.data_fim = new Date(dataInicio.getFullYear(), dataInicio.getMonth() + 3, dataInicio.getDate());
      break;
    case 'semestral':
      this.data_fim = new Date(dataInicio.getFullYear(), dataInicio.getMonth() + 6, dataInicio.getDate());
      break;
    case 'anual':
      this.data_fim = new Date(dataInicio.getFullYear() + 1, dataInicio.getMonth(), dataInicio.getDate());
      break;
  }
  
  return this.save();
};

// Métodos de classe
Subscription.findAtiva = function(usuarioId) {
  return this.findOne({
    where: {
      usuario_id: usuarioId,
      status: 'ativo'
    },
    order: [['data_inicio', 'DESC']]
  });
};

Subscription.findExpiradas = function() {
  return this.findAll({
    where: {
      status: 'ativo',
      data_fim: {
        [sequelize.Op.lt]: new Date()
      }
    }
  });
};

Subscription.findProximasExpiracao = function(dias = 7) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + dias);
  
  return this.findAll({
    where: {
      status: 'ativo',
      data_fim: {
        [sequelize.Op.between]: [new Date(), dataLimite]
      }
    }
  });
};

// Constantes dos planos
Subscription.PLANOS = {
  FREE: {
    nome: 'Free',
    preco: 0.00,
    limite_agendamentos: 10,
    recursos: {
      whatsapp: false,
      relatorios: false,
      multiusuario: false,
      personalizacao: false,
      integracoes: false,
      suporte_prioritario: false
    }
  },
  PRO: {
    nome: 'Pro',
    preco: 39.90,
    limite_agendamentos: null, // ilimitado
    recursos: {
      whatsapp: true,
      relatorios: true,
      multiusuario: false,
      personalizacao: true,
      integracoes: true,
      suporte_prioritario: false
    }
  },
  BUSINESS: {
    nome: 'Business',
    preco: 99.90,
    limite_agendamentos: null, // ilimitado
    recursos: {
      whatsapp: true,
      relatorios: true,
      multiusuario: true,
      personalizacao: true,
      integracoes: true,
      suporte_prioritario: true
    }
  }
};

module.exports = Subscription; 