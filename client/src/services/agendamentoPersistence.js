import { LOCAL_DEV } from '../config/appConfig';
import { readJsonStorage, writeJsonStorage } from '../utils/storage';
import apiService from './apiService';

const GLOBAL_KEY = 'agendamentos';

const empresaKey = (empresaId) => `agendamentos_${empresaId}`;

const sameId = (left, right) => String(left) === String(right);

export const dedupeAgendamentos = (agendamentos) => {
  const seen = new Set();
  return agendamentos.filter((agendamento) => {
    const id = agendamento?.id;
    if (id == null) {
      return true;
    }
    const key = String(id);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const listarAgendamentosLocais = ({
  empresaId,
  clienteEmail,
  funcionarioId
} = {}) => {
  const globais = readJsonStorage(GLOBAL_KEY, []);
  const daEmpresa = empresaId != null ? readJsonStorage(empresaKey(empresaId), []) : [];
  const merged = dedupeAgendamentos([...globais, ...daEmpresa]);

  return merged.filter((agendamento) => {
    if (clienteEmail && agendamento.cliente_email !== clienteEmail) {
      return false;
    }
    if (funcionarioId != null && !sameId(agendamento.funcionario_id, funcionarioId)) {
      return false;
    }
    if (
      empresaId != null &&
      agendamento.empresa_id != null &&
      !sameId(agendamento.empresa_id, empresaId)
    ) {
      return false;
    }
    return true;
  });
};

export const salvarAgendamentoLocal = (agendamento) => {
  const globais = readJsonStorage(GLOBAL_KEY, []);
  writeJsonStorage(GLOBAL_KEY, [...globais, agendamento]);

  if (agendamento.empresa_id != null) {
    const key = empresaKey(agendamento.empresa_id);
    const daEmpresa = readJsonStorage(key, []);
    writeJsonStorage(key, [...daEmpresa, agendamento]);
  }

  return agendamento;
};

const payloadApi = (agendamento) => ({
  empresa_id: agendamento.empresa_id,
  funcionario_id: agendamento.funcionario_id,
  data: agendamento.data,
  hora: agendamento.hora,
  servicos: agendamento.servicos,
  observacoes: agendamento.observacoes,
  valor_total: agendamento.valor_total
});

export const persistirAgendamento = async (agendamento, options = {}) => {
  const localDev = options.localDev ?? LOCAL_DEV;
  const api = options.apiService ?? apiService;

  if (!localDev) {
    const criado = await api.createAgendamento(payloadApi(agendamento));
    const persistido = {
      ...agendamento,
      id: criado?.id ?? agendamento.id,
      status: criado?.status ?? agendamento.status
    };
    salvarAgendamentoLocal(persistido);
    return persistido;
  }

  salvarAgendamentoLocal(agendamento);
  try {
    await api.createAgendamento(payloadApi(agendamento));
  } catch (error) {
    console.warn('API de agendamento indisponível no modo local:', error.message);
  }
  return agendamento;
};
