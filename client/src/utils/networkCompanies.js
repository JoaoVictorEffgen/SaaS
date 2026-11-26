export const getPrimaryEmpresaId = (empresas) => {
  const ids = (empresas || [])
    .map((empresa) => Number(empresa?.id))
    .filter((id) => Number.isInteger(id) && id > 0);
  return ids.length ? Math.min(...ids) : null;
};

export const getNetworkBranches = (rede) => {
  const empresas = rede?.empresas || [];
  const primaryId = rede?.empresa_principal_id ?? getPrimaryEmpresaId(empresas);
  return empresas.filter((empresa) => Number(empresa.id) !== Number(primaryId));
};

export const isPrimaryNetworkEmpresa = (empresa, rede) => {
  const primaryId = rede?.empresa_principal_id ?? getPrimaryEmpresaId(rede?.empresas);
  return primaryId !== null && Number(empresa?.id) === Number(primaryId);
};
