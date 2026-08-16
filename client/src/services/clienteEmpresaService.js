import apiService from './apiService';
import { LOCAL_DEV } from '../config/appConfig';
import { readJsonStorage } from '../utils/storage';

const unwrapData = (response) => response?.data ?? response;
const normalizeId = (value) => String(value);

const normalizeEmpresa = (empresa) => {
  const horario = empresa?.horario_funcionamento || {};

  return {
    ...empresa,
    id: normalizeId(empresa.id),
    horario_inicio: empresa.horario_inicio || horario.inicio || '08:00',
    horario_fim: empresa.horario_fim || horario.fim || '18:00'
  };
};

const normalizeFuncionario = (funcionario) => ({
  ...funcionario,
  id: normalizeId(funcionario.id)
});

const normalizeServico = (servico) => ({
  ...servico,
  id: normalizeId(servico.id),
  preco: Number(servico.preco) || 0,
  duracao: Number(servico.duracao ?? servico.duracao_minutos) || 0
});

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

const getLocalBookingData = (empresaId) => {
  const normalizedId = normalizeId(empresaId);
  const empresas = readJsonStorage('empresas', []);
  const empresa = empresas.find((item) => normalizeId(item.id) === normalizedId);

  if (!empresa) {
    return null;
  }

  const funcionarios = readJsonStorage(`funcionarios_${normalizedId}`, empresa.funcionarios || []);
  const servicos = readJsonStorage(`servicos_${normalizedId}`, empresa.servicos || []);

  return normalizeBookingData({ ...empresa, funcionarios, servicos });
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
  try {
    const response = await apiService.getClienteEmpresa(empresaId);
    return normalizeBookingData(unwrapData(response));
  } catch (error) {
    if (!LOCAL_DEV) {
      throw error;
    }

    const localData = getLocalBookingData(empresaId);
    if (localData) {
      return localData;
    }

    throw error;
  }
};

