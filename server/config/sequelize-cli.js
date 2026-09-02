require('dotenv').config();
const path = require('path');

const sqlite = {
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '..', process.env.DB_STORAGE || './data/local-dev.sqlite'),
  logging: false
};

const mysql = {
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false
};

module.exports = {
  development: process.env.DB_DIALECT === 'mysql' ? mysql : sqlite,
  test: sqlite,
  production: mysql
};
