import { randomUUID } from 'node:crypto';
import { hashSenha } from './senha.js';

export type Papel = 'dono' | 'funcionario';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  papel: Papel;
};

export type Servico = {
  id: string;
  nome: string;
  duracaoMin: number;
  preco: number;
  ativo: boolean;
};

export type StatusAgendamento = 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'falta';

export type Agendamento = {
  id: string;
  servicoId: string;
  servicoNome: string;
  duracaoMin: number;
  preco: number;
  data: string;
  hora: string;
  clienteNome: string;
  clienteTelefone: string;
  status: StatusAgendamento;
  criadoEm: string;
};

export type Horario = {
  abertura: string;
  fechamento: string;
  diasSemana: number[];
  intervaloMin: number;
  diasAntecedencia: number;
};

export type Estabelecimento = {
  nome: string;
  horario: Horario;
};

export type Sessao = { usuarioId: string; expiraEm: number };

export type Store = {
  estabelecimento: Estabelecimento;
  usuarios: Usuario[];
  servicos: Servico[];
  agendamentos: Agendamento[];
  sessoes: Map<string, Sessao>;
  tentativasLogin: Map<string, { falhas: number; desde: number }>;
};

export type Seed = {
  nomeEstabelecimento: string;
  dono: { nome: string; email: string; senha: string };
};

export const novoId = () => randomUUID();

export function criarStore(seed: Seed): Store {
  return {
    estabelecimento: {
      nome: seed.nomeEstabelecimento,
      horario: {
        abertura: '09:00',
        fechamento: '18:00',
        diasSemana: [1, 2, 3, 4, 5, 6],
        intervaloMin: 30,
        diasAntecedencia: 60
      }
    },
    usuarios: [
      {
        id: novoId(),
        nome: seed.dono.nome,
        email: seed.dono.email.toLowerCase(),
        senhaHash: hashSenha(seed.dono.senha),
        papel: 'dono'
      }
    ],
    servicos: [
      { id: novoId(), nome: 'Corte', duracaoMin: 30, preco: 40, ativo: true },
      { id: novoId(), nome: 'Barba', duracaoMin: 30, preco: 30, ativo: true },
      { id: novoId(), nome: 'Corte + Barba', duracaoMin: 60, preco: 65, ativo: true }
    ],
    agendamentos: [],
    sessoes: new Map(),
    tentativasLogin: new Map()
  };
}

export function usuarioPublico({ senhaHash: _, ...usuario }: Usuario) {
  return usuario;
}
