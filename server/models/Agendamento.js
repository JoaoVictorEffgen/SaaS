const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Agendamento = sequelize.define('Agendamento', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  agenda_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  cliente_nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cliente_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  cliente_telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  cliente_observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fim: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duracao: {
    type: DataTypes.INTEGER, // em minutos
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pendente',
    validate: {
      isIn: [['pendente', 'confirmado', 'cancelado', 'reagendado', 'concluido', 'nao_compareceu']]
    }
  },
  tipo: {
    type: DataTypes.STRING,
    defaultValue: 'presencial',
    validate: {
      isIn: [['presencial', 'online', 'telefone']]
    }
  },
  local: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  link_meeting: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  moeda: {
    type: DataTypes.STRING(3),
    defaultValue: 'BRL'
  },
  pagamento_status: {
    type: DataTypes.STRING,
    defaultValue: 'pendente',
    validate: {
      isIn: [['pendente', 'pago', 'cancelado', 'reembolsado']]
    }
  },
  stripe_payment_intent_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  confirmacao_enviada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lembrete_24h_enviado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lembrete_1h_enviado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  cancelamento_motivo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelamento_por: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['cliente', 'profissional', 'sistema']]
    }
  },
  reagendamento_de: {
    type: DataTypes.UUID,
    allowNull: true
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
  tableName: 'agendamentos'
});

// Métodos de instância
Agendamento.prototype.podeSerCancelado = function() {
  const agora = new Date();
  const dataAgendamento = new Date(`${this.data}T${this.hora_inicio}`);
  const horasAntes = (dataAgendamento - agora) / (1000 * 60 * 60);
  
  // Pode cancelar até 24h antes (configurável)
  return horasAntes >= 24;
};

Agendamento.prototype.podeSerReagendado = function() {
  return this.status === 'confirmado' && this.podeSerCancelado();
};

Agendamento.prototype.marcarComoConcluido = function() {
  this.status = 'concluido';
  return this.save();
};

// Métodos de classe
Agendamento.findByUsuario = function(usuarioId, options = {}) {
  const where = { usuario_id: usuarioId };
  
  if (options.data) {
    where.data = options.data;
  }
  
  if (options.status) {
    where.status = options.status;
  }
  
  return this.findAll({
    where,
    order: [['data', 'ASC'], ['hora_inicio', 'ASC']]
  });
};

Agendamento.findByCliente = function(clienteEmail) {
  return this.findAll({
    where: { cliente_email: clienteEmail },
    order: [['data', 'ASC'], ['hora_inicio', 'ASC']]
  });
};

Agendamento.findProximos = function(usuarioId, limite = 10) {
  const hoje = new Date().toISOString().split('T')[0];
  
  return this.findAll({
    where: {
      usuario_id: usuarioId,
      data: {
        [sequelize.Op.gte]: hoje
      },
      status: {
        [sequelize.Op.in]: ['pendente', 'confirmado']
      }
    },
    order: [['data', 'ASC'], ['hora_inicio', 'ASC']],
    limit: limite
  });
};

module.exports = Agendamento; 