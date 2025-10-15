const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RedeEmpresarial = sequelize.define('RedeEmpresarial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome_rede: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nome da rede empresarial (ex: Barbearia do João)'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição da rede'
  },
  usuario_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID do usuário administrador da rede'
  },
  plano: {
    type: DataTypes.ENUM('trial', 'basico', 'premium', 'enterprise'),
    allowNull: false,
    defaultValue: 'trial',
    comment: 'Plano da rede (trial = 15 dias free, enterprise permite múltiplas empresas)'
  },
  limite_empresas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 999,
    comment: 'Limite de empresas conforme o plano (trial = ilimitado)'
  },
  empresas_ativas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Número de empresas ativas na rede'
  },
  logo_rede_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL do logo da rede'
  },
  configuracoes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Configurações específicas da rede'
  },
  trial_inicio: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de início do trial (15 dias free)'
  },
  trial_fim: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de fim do trial'
  },
  cpf_cnpj_usado: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: 'CPF ou CNPJ usado para validação (evita múltiplos trials)'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'redes_empresariais',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['usuario_admin_id']
    },
    {
      fields: ['plano']
    },
    {
      fields: ['ativo']
    }
  ]
});

module.exports = RedeEmpresarial;
