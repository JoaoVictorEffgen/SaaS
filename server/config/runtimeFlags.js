const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return String(value).toLowerCase() === 'true';
};

/**
 * Modo básico (estado em memória) só é o padrão fora de produção.
 * Em produção, sem BASIC_MODE explícito, o servidor usa o banco — caso
 * contrário um restart do processo apaga agendamentos, usuários e empresas.
 */
const resolveBasicMode = (env = process.env) => {
  const defaultBasicMode = env.NODE_ENV !== 'production';
  return parseBoolean(env.BASIC_MODE, defaultBasicMode);
};

module.exports = {
  parseBoolean,
  resolveBasicMode
};
