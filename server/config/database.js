const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const config = require('./environment');
const { isLocalDev } = require('./localDev');

const useSqlite = isLocalDev || process.env.DB_DIALECT === 'sqlite';

let sequelize;

if (useSqlite) {
  const storagePath = path.resolve(
    __dirname,
    '..',
    process.env.DB_STORAGE || './data/local-dev.sqlite'
  );
  const storageDir = path.dirname(storagePath);

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  console.log('🔍 Configuração SQLite (modo local):', storagePath);

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  console.log('🔍 Configuração MySQL:', {
    DB_NAME: config.database.name,
    DB_USER: config.database.user,
    DB_HOST: config.database.host,
    DB_PORT: config.database.port
  });

  sequelize = new Sequelize({
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
}

sequelize
  .authenticate()
  .then(() => {
    console.log(`✅ Conexão com ${useSqlite ? 'SQLite' : 'MySQL'} estabelecida com sucesso`);
  })
  .catch((err) => {
    console.error(`❌ Erro ao conectar com ${useSqlite ? 'SQLite' : 'MySQL'}:`, err.message);
  });

module.exports = { sequelize, useSqlite };
