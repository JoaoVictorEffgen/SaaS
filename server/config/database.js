const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const config = require('./environment');

console.log('🔍 Configuração MySQL:', {
  DB_NAME: config.database.name,
  DB_USER: config.database.user,
  DB_HOST: config.database.host,
  DB_PORT: config.database.port
});

// Configuração MySQL simplificada
const sequelize = new Sequelize({
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
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