const getPrimaryEmpresaId = (empresas) => {
  const ids = (empresas || [])
    .map((empresa) => Number(empresa?.id))
    .filter((id) => Number.isInteger(id) && id > 0);
  return ids.length ? Math.min(...ids) : null;
};

const isPrimaryEmpresa = (empresa, empresas) => {
  const primaryId = getPrimaryEmpresaId(empresas);
  return primaryId !== null && Number(empresa?.id) === primaryId;
};

module.exports = {
  getPrimaryEmpresaId,
  isPrimaryEmpresa
};
