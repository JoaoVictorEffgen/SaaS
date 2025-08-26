const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Testar conexão
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão com SQLite estabelecida com sucesso');
  })
  .catch(err => {
    console.error('❌ Erro ao conectar com SQLite:', err);
  });

module.exports = { sequelize }; 