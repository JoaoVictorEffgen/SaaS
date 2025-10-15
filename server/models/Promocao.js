const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Promocao = sequelize.define('Promocao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nome da promoção (ex: Black Friday, Natal)'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição detalhada da promoção'
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'empresas',
      key: 'id'
    },
    comment: 'ID da empresa que criou a promoção'
  },
  tipo_desconto: {
    type: DataTypes.ENUM('percentual', 'valor_fixo', 'meses_gratis', 'funcionalidade_extra'),
    allowNull: false,
    comment: 'Tipo de desconto aplicado'
  },
  valor_desconto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valor do desconto (percentual ou valor fixo)'
  },
  meses_gratis: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Número de meses gratuitos (para tipo meses_gratis)'
  },
  funcionalidade_extra: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Funcionalidades extras liberadas (para tipo funcionalidade_extra)'
  },
  codigo_promocional: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'Código promocional (ex: BLACK50, GRATIS1)'
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data de início da promoção'
  },
  data_fim: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data de fim da promoção'
  },
  pacotes_aplicaveis: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'IDs dos pacotes onde a promoção pode ser aplicada (vazio = todos)'
  },
  condicoes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Condições para aplicar a promoção (ex: só novos clientes)'
  },
  limite_uso: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Limite de vezes que a promoção pode ser usada (null = ilimitado)'
  },
  uso_atual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantas vezes a promoção já foi usada'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Se a promoção está ativa'
  },
  destaque: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se a promoção aparece em destaque'
  },
  cor_destaque: {
    type: DataTypes.STRING(7),
    allowNull: true,
    comment: 'Cor de destaque da promoção (hex)'
  },
  imagem_promocao_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL da imagem da promoção'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações sobre a promoção'
  }
}, {
  tableName: 'promocoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['empresa_id'] },
    { fields: ['ativo'] },
    { fields: ['data_inicio', 'data_fim'] },
    { fields: ['codigo_promocional'] },
    { fields: ['tipo_desconto'] }
  ]
});

module.exports = Promocao;
