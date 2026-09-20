const toSafeEmployee = (funcionario) => {
  if (!funcionario) return null;
  const raw = typeof funcionario.toJSON === 'function' ? funcionario.toJSON() : { ...funcionario };
  delete raw.senha;
  delete raw.codigo_recuperacao_hash;
  delete raw.expiracao_recuperacao;
  delete raw.tentativas_recuperacao;
  return raw;
};

const canAssignEmployeeToRede = (funcionario, redeId) => {
  if (!funcionario || funcionario.tipo !== 'funcionario' || funcionario.ativo === false) {
    return { ok: false, status: 404, error: 'Funcionário não encontrado' };
  }

  if (funcionario.empresa_id) {
    return { ok: false, status: 400, error: 'Funcionário já está vinculado a uma empresa' };
  }

  if (funcionario.rede_id == null || Number(funcionario.rede_id) !== Number(redeId)) {
    return { ok: false, status: 403, error: 'Funcionário não pertence a esta rede' };
  }

  return { ok: true };
};

module.exports = {
  canAssignEmployeeToRede,
  toSafeEmployee
};
