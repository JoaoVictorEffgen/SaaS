require('dotenv').config();

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return String(value).toLowerCase() === 'true';
};

const runtimeConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  basicMode: parseBoolean(process.env.BASIC_MODE, true),
  localDev: parseBoolean(process.env.LOCAL_DEV, false)
};

module.exports = runtimeConfig;
