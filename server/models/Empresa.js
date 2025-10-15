const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Empresa = sequelize.define('Empresa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nome da empresa'
  },
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: true,
    comment: 'CNPJ da empresa'
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone da empresa'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
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
    comment: 'ID da rede empresarial (null para empresas independentes)'
  },
  nome_unidade: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nome da unidade (ex: Unidade Centro, Filial Shopping)'
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  cep: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  horario_funcionamento: {
    type: DataTypes.JSON,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  imagem_fundo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL da imagem de fundo para exibição na área do cliente'
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  instagram: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  whatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  identificador_empresa: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  }
}, {
  tableName: 'empresas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Empresa;
