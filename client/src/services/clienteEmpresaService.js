import apiService from './apiService';

const unwrapData = (response) => response?.data ?? response;
const normalizeId = (value) => String(value);

const normalizeEmpresa = (empresa) => {
  const horario = empresa?.horario_funcionamento || {};
  const hasConfiguredSchedule = Boolean(
    empresa?.horario_inicio || empresa?.horario_fim || horario.inicio || horario.fim ||
    horario.horario_inicio || horario.horario_fim
  );
  const servicos = Array.isArray(empresa?.servicos)
    ? empresa.servicos.map(normalizeServico)
    : [];

  return {
    ...empresa,
    id: normalizeId(empresa.id),
    horario_inicio: empresa.horario_inicio || horario.inicio || horario.horario_inicio || '08:00',
    horario_fim: empresa.horario_fim || horario.fim || horario.horario_fim || '18:00',
    horario_informado: hasConfiguredSchedule,
    servicos,
    categorias: Array.isArray(empresa?.categorias) ? empresa.categorias.filter(Boolean) : [],
    total_profissionais: Number(empresa?.total_profissionais) || 0,
    disponivel_para_agendamento: Boolean(empresa?.disponivel_para_agendamento)
  };
};

const normalizeFuncionario = (funcionario) => ({
  ...funcionario,
  id: normalizeId(funcionario.id)
});

function normalizeServico(servico) {
  return {
    ...servico,
    id: normalizeId(servico.id),
    preco: Number(servico.preco) || 0,
    duracao: Number(servico.duracao ?? servico.duracao_minutos) || 0
  };
}

const normalizeBookingData = (data) => {
  if (!data?.id) {
    throw new Error('Dados da empresa não foram retornados pela API.');
  }

  const { funcionarios = [], servicos = [], ...empresa } = data;

  return {
    empresa: normalizeEmpresa(empresa),
    funcionarios: funcionarios.map(normalizeFuncionario),
    servicos: servicos.map(normalizeServico)
  };
};

export const listarEmpresasCliente = async () => {
  const response = await apiService.getClientesEmpresas();
  const empresas = unwrapData(response);

  if (!Array.isArray(empresas)) {
    throw new Error('A API retornou uma lista de empresas inválida.');
  }

  return empresas.map(normalizeEmpresa);
};

export const buscarEmpresaParaAgendamento = async (empresaId) => {
  const response = await apiService.getClienteEmpresa(empresaId);
  return normalizeBookingData(unwrapData(response));
};
