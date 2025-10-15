const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PacotePersonalizado = sequelize.define('PacotePersonalizado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nome do pacote personalizado'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição detalhada do pacote'
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'empresas',
      key: 'id'
    },
    comment: 'ID da empresa que criou o pacote'
  },
  
  // PREÇO E COBRANÇA
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Preço do pacote em reais'
  },
  tipo_cobranca: {
    type: DataTypes.ENUM('mensal', 'trimestral', 'semestral', 'anual', 'unico'),
    allowNull: false,
    defaultValue: 'mensal',
    comment: 'Frequência de cobrança'
  },
  
  // LIMITES DO PACOTE
  limite_funcionarios: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Limite de funcionários (null = ilimitado)'
  },
  limite_agendamentos_mes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Limite de agendamentos por mês (null = ilimitado)'
  },
  limite_clientes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Limite de clientes cadastrados (null = ilimitado)'
  },
  limite_servicos: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Limite de serviços oferecidos (null = ilimitado)'
  },
  
  // FUNCIONALIDADES INCLUÍDAS
  funcionalidades: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    comment: 'Funcionalidades incluídas no pacote'
  },
  
  // CONFIGURAÇÕES ESPECÍFICAS
  configuracao_agendamento: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Configurações específicas de agendamento'
  },
  configuracao_notificacoes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Configurações de notificações incluídas'
  },
  
  // MARKETING
  cor_primaria: {
    type: DataTypes.STRING(7),
    allowNull: true,
    comment: 'Cor primária do pacote (hex)'
  },
  cor_secundaria: {
    type: DataTypes.STRING(7),
    allowNull: true,
    comment: 'Cor secundária do pacote (hex)'
  },
  imagem_pacote_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL da imagem do pacote'
  },
  
  // STATUS E CONTROLE
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Se o pacote está ativo para venda'
  },
  publico: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se o pacote é público (aparece no marketplace)'
  },
  destaque: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se o pacote aparece em destaque'
  },
  
  // ESTATÍSTICAS
  vendas_totais: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Número total de vendas'
  },
  receita_total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Receita total gerada pelo pacote'
  },
  
  // CATEGORIZAÇÃO
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Categoria do pacote (ex: Estética, Saúde, Fitness)'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Tags para categorização e busca'
  },
  
  // TERMOS E CONDIÇÕES
  termos_uso: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Termos de uso específicos do pacote'
  },
  politica_cancelamento: {
    type: DataTypes.ENUM('imediato', '30_dias', 'nao_permitido'),
    allowNull: false,
    defaultValue: '30_dias',
    comment: 'Política de cancelamento'
  },
  
  // COMISSÕES
  comissao_plataforma: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 5.00,
    comment: 'Comissão da plataforma (%)'
  }
}, {
  tableName: 'pacotes_personalizados',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['empresa_id'] },
    { fields: ['ativo'] },
    { fields: ['publico'] },
    { fields: ['categoria'] },
    { fields: ['preco'] }
  ]
});

module.exports = PacotePersonalizado;