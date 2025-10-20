const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

console.log('🔍 Configuração MySQL:', {
  DB_NAME: process.env.DB_NAME || 'SaaS_Novo',
  DB_USER: process.env.DB_USER || 'root',
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: process.env.DB_PORT || 3306
});

// Configuração MySQL simplificada
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'SaaS_Novo',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Cecilia@2020',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Testar conexão
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão com MySQL estabelecida com sucesso');
  })
  .catch(err => {
    console.error('❌ Erro ao conectar com MySQL:', err);
  });

module.exports = { sequelize }; 