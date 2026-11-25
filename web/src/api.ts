export type Papel = 'dono' | 'funcionario';

export type Usuario = { id: string; nome: string; email: string; papel: Papel };

export type Servico = { id: string; nome: string; duracaoMin: number; preco: number; ativo: boolean };

export type StatusAgendamento = 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'falta';

export type Agendamento = {
  id: string;
  servicoNome: string;
  duracaoMin: number;
  preco: number;
  data: string;
  hora: string;
  clienteNome: string;
  clienteTelefone: string;
  status: StatusAgendamento;
};

export type Estabelecimento = {
  nome: string;
  horario: { abertura: string; fechamento: string; diasSemana: number[]; diasAntecedencia: number };
};

const API_URL = import.meta.env.VITE_API_URL ?? '';
const CHAVE_TOKEN = 'timeflow.token';

export const tokenSalvo = {
  ler: () => localStorage.getItem(CHAVE_TOKEN),
  salvar: (token: string) => localStorage.setItem(CHAVE_TOKEN, token),
  limpar: () => localStorage.removeItem(CHAVE_TOKEN)
};

export class ErroApi extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export async function api<T>(rota: string, opcoes: { metodo?: string; corpo?: unknown } = {}): Promise<T> {
  const token = tokenSalvo.ler();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${rota}`, {
      method: opcoes.metodo ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo)
    });
  } catch {
    throw new ErroApi(0, 'Não foi possível conectar ao servidor');
  }
  if (res.status === 204) return undefined as T;
  const dados = await res.json().catch(() => null);
  if (!res.ok) throw new ErroApi(res.status, dados?.erro ?? 'Erro inesperado');
  return dados as T;
}
