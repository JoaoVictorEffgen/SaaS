const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

console.log('🔍 Variáveis de ambiente:', {
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT
});

// Configuração dinâmica baseada no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = process.env.DB_DIALECT === 'postgres' || isProduction;

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'SaaS',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Cecilia@2020',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || (usePostgres ? 5432 : 3306),
  dialect: usePostgres ? 'postgres' : 'mysql',
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
  },
  // Configurações específicas para PostgreSQL
  ...(usePostgres && {
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  })
});

// Testar conexão
sequelize.authenticate()
  .then(() => {
    console.log(`✅ Conexão com ${usePostgres ? 'PostgreSQL' : 'MySQL'} estabelecida com sucesso`);
  })
  .catch(err => {
    console.error(`❌ Erro ao conectar com ${usePostgres ? 'PostgreSQL' : 'MySQL'}:`, err);
  });

module.exports = { sequelize }; 