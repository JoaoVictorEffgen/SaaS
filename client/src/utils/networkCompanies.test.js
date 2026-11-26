import { getNetworkBranches, getPrimaryEmpresaId, isPrimaryNetworkEmpresa } from './networkCompanies';

describe('networkCompanies', () => {
  const rede = {
    usuario_admin_id: 7,
    empresas: [
      { id: 1, user_id: 7, nome_unidade: null },
      { id: 8, user_id: 7, nome_unidade: 'Filial Centro' }
    ]
  };

  it('identifica a matriz pelo menor id, mesmo quando a filial compartilha o user_id do admin', () => {
    expect(getPrimaryEmpresaId(rede.empresas)).toBe(1);
    expect(isPrimaryNetworkEmpresa(rede.empresas[0], rede)).toBe(true);
    expect(isPrimaryNetworkEmpresa(rede.empresas[1], rede)).toBe(false);
  });

  it('lista a filial criada pelo admin em vez de escondê-la como matriz', () => {
    expect(getNetworkBranches(rede)).toEqual([rede.empresas[1]]);
  });

  it('respeita empresa_principal_id quando a API envia o valor', () => {
    const withExplicitPrimary = { ...rede, empresa_principal_id: 8 };
    expect(getNetworkBranches(withExplicitPrimary)).toEqual([rede.empresas[0]]);
  });
});
