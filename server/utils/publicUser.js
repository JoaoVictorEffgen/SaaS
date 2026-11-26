const SENSITIVE_USER_FIELDS = [
  'senha',
  'codigo_recuperacao_hash',
  'expiracao_recuperacao',
  'tentativas_recuperacao'
];

const toPublicUser = (user) => {
  if (!user) return null;
  const json = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  for (const field of SENSITIVE_USER_FIELDS) {
    delete json[field];
  }
  return json;
};

module.exports = {
  SENSITIVE_USER_FIELDS,
  toPublicUser
};
