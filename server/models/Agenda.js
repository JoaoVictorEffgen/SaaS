const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Agenda = sequelize.define('Agenda', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Horário Disponível'
  },
  descricao: {
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
    allowNull: false,
    defaultValue: 60
  },
  intervalo: {
    type: DataTypes.INTEGER, // intervalo entre agendamentos em minutos
    allowNull: false,
    defaultValue: 30
  },
  max_agendamentos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  agendamentos_atuais: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'disponivel',
    validate: {
      isIn: [['disponivel', 'ocupado', 'cancelado', 'pausado']]
    }
  },
  tipo: {
    type: DataTypes.STRING,
    defaultValue: 'unico',
    validate: {
      isIn: [['unico', 'recorrente']]
    }
  },
  recorrencia: {
    type: DataTypes.TEXT, // JSON como string para SQLite
    allowNull: true,
    get() {
      const value = this.getDataValue('recorrencia');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('recorrencia', value ? JSON.stringify(value) : null);
    }
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
  local: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  link_meeting: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  instrucoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cor: {
    type: DataTypes.STRING(7), // hex color
    defaultValue: '#3B82F6'
  },
  tags: {
    type: DataTypes.TEXT, // Array como string para SQLite
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('tags');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value || []));
    }
  },
  configuracoes: {
    type: DataTypes.TEXT, // JSON como string para SQLite
    allowNull: true,
    defaultValue: JSON.stringify({
      confirmacao_automatica: true,
      lembrete_24h: true,
      lembrete_1h: true,
      cancelamento_ate: 24, // horas antes
      reagendamento_permitido: true,
      pagamento_obrigatorio: false
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
  tableName: 'agendas'
});

// Métodos de instância
Agenda.prototype.estaDisponivel = function() {
  return this.status === 'disponivel' && this.agendamentos_atuais < this.max_agendamentos;
};

Agenda.prototype.adicionarAgendamento = function() {
  if (this.agendamentos_atuais < this.max_agendamentos) {
    this.agendamentos_atuais += 1;
    if (this.agendamentos_atuais >= this.max_agendamentos) {
      this.status = 'ocupado';
    }
    return true;
  }
  return false;
};

Agenda.prototype.removerAgendamento = function() {
  if (this.agendamentos_atuais > 0) {
    this.agendamentos_atuais -= 1;
    if (this.status === 'ocupado') {
      this.status = 'disponivel';
    }
    return true;
  }
  return false;
};

// Métodos de classe
Agenda.findDisponiveis = function(usuarioId, data, horaInicio, horaFim) {
  return this.findAll({
    where: {
      usuario_id: usuarioId,
      data: data,
      status: 'disponivel',
      hora_inicio: {
        [sequelize.Op.gte]: horaInicio
      },
      hora_fim: {
        [sequelize.Op.lte]: horaFim
      }
    },
    order: [['hora_inicio', 'ASC']]
  });
};

Agenda.findByUsuario = function(usuarioId, options = {}) {
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

module.exports = Agenda; 