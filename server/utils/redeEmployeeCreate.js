const MIN_PASSWORD_LENGTH = 8;

const validateNewRedeEmployee = (payload = {}) => {
  const nome = String(payload.nome || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const telefone = String(payload.telefone || '').trim();
  const cargo = String(payload.cargo || '').trim();
  const senha = String(payload.senha || '');

  if (!nome || !email) {
    return { ok: false, status: 400, error: 'Nome e e-mail são obrigatórios' };
  }

  if (!email.includes('@')) {
    return { ok: false, status: 400, error: 'E-mail inválido' };
  }

  if (senha.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, status: 400, error: 'A senha deve ter ao menos 8 caracteres' };
  }

  return {
    ok: true,
    data: {
      nome,
      email,
      telefone,
      cargo,
      senha
    }
  };
};

const toSafeEmployee = (funcionario) => {
  if (!funcionario) return null;
  const raw = typeof funcionario.toJSON === 'function' ? funcionario.toJSON() : { ...funcionario };
  delete raw.senha;
  delete raw.codigo_recuperacao_hash;
  delete raw.expiracao_recuperacao;
  delete raw.tentativas_recuperacao;
  return raw;
};

module.exports = {
  MIN_PASSWORD_LENGTH,
  validateNewRedeEmployee,
  toSafeEmployee
};
