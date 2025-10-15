const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContratoPacote = sequelize.define('ContratoPacote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pacote_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pacotes_personalizados',
      key: 'id'
    },
    comment: 'ID do pacote contratado'
  },
  empresa_contratante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'empresas',
      key: 'id'
    },
    comment: 'ID da empresa que contratou o pacote'
  },
  empresa_vendedora_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'empresas',
      key: 'id'
    },
    comment: 'ID da empresa que vendeu o pacote'
  },
  
  // DADOS DO CONTRATO
  valor_contrato: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Valor total do contrato'
  },
  valor_mensal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Valor da mensalidade'
  },
  tipo_cobranca: {
    type: DataTypes.ENUM('mensal', 'trimestral', 'semestral', 'anual', 'unico'),
    allowNull: false,
    comment: 'Frequência de cobrança'
  },
  
  // PERÍODO DO CONTRATO
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data de início do contrato'
  },
  data_fim: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de fim do contrato (null = renovação automática)'
  },
  data_proxima_cobranca: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data da próxima cobrança'
  },
  
  // STATUS DO CONTRATO
  status: {
    type: DataTypes.ENUM('ativo', 'suspenso', 'cancelado', 'expirado', 'trial'),
    allowNull: false,
    defaultValue: 'ativo',
    comment: 'Status atual do contrato'
  },
  
  // CONFIGURAÇÕES ATIVAS
  limites_ativos: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    comment: 'Limites ativos do contrato'
  },
  funcionalidades_ativas: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    comment: 'Funcionalidades ativas do contrato'
  },
  
  // DADOS DE COBRANÇA
  metodo_pagamento: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Método de pagamento (cartão, boleto, PIX)'
  },
  gateway_pagamento: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Gateway de pagamento usado'
  },
  id_transacao_gateway: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID da transação no gateway'
  },
  
  // RENOVAÇÃO AUTOMÁTICA
  renovacao_automatica: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Se o contrato renova automaticamente'
  },
  dias_aviso_renovacao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 7,
    comment: 'Dias de antecedência para avisar sobre renovação'
  },
  
  // DESCONTOS E PROMOÇÕES
  desconto_aplicado: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Desconto aplicado (%)'
  },
  valor_original: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valor original antes do desconto'
  },
  codigo_promocional: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Código promocional usado'
  },
  
  // COMISSÕES
  comissao_plataforma: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 5.00,
    comment: 'Comissão da plataforma (%)'
  },
  
  // OBSERVAÇÕES
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações sobre o contrato'
  }
}, {
  tableName: 'contratos_pacotes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['pacote_id'] },
    { fields: ['empresa_contratante_id'] },
    { fields: ['empresa_vendedora_id'] },
    { fields: ['status'] },
    { fields: ['data_proxima_cobranca'] }
  ]
});

module.exports = ContratoPacote;
