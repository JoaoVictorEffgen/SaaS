const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

console.log('🔍 Variáveis de ambiente:', {
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT
});

const sequelize = new Sequelize({
  database: 'SaaS',
  username: 'root',
  password: 'Cecilia@2020',
  host: '127.0.0.1',
  port: 3306,
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