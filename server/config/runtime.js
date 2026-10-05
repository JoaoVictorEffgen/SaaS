require('dotenv').config();

const { parseBoolean, resolveBasicMode } = require('./runtimeFlags');

const runtimeConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  basicMode: resolveBasicMode(process.env),
  localDev: parseBoolean(process.env.LOCAL_DEV, false)
};

module.exports = runtimeConfig;
