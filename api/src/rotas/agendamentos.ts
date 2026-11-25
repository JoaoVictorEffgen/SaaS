import { Router } from 'express';
import { z } from 'zod';
import { type Agora, horariosLivres } from '../agenda.js';
import { autenticar } from '../auth.js';
import { HttpError, validar } from '../http.js';
import { type Agendamento, novoId, type StatusAgendamento, type Store } from '../store.js';

const dataSchema = z
  .string({ message: 'Informe a data' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), 'Data inválida');

const disponibilidadeSchema = z.object({
  servicoId: z.string({ message: 'Informe o serviço' }),
  data: dataSchema
});

const agendamentoSchema = z.object({
  servicoId: z.string({ message: 'Informe o serviço' }),
  data: dataSchema,
  hora: z.string({ message: 'Informe o horário' }).regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido'),
  clienteNome: z.string({ message: 'Informe seu nome' }).trim().min(2, 'Informe seu nome').max(80, 'Nome muito longo'),
  clienteTelefone: z
    .string({ message: 'Informe seu telefone' })
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length >= 10 && v.length <= 13, 'Telefone inválido')
});

const TRANSICOES: Record<StatusAgendamento, StatusAgendamento[]> = {
  agendado: ['confirmado', 'realizado', 'cancelado', 'falta'],
  confirmado: ['realizado', 'cancelado', 'falta'],
  realizado: [],
  cancelado: [],
  falta: []
};

const statusSchema = z.object({
  status: z.enum(['agendado', 'confirmado', 'realizado', 'cancelado', 'falta'], { message: 'Status inválido' })
});

export function rotasAgendamentos(store: Store, agora: () => Agora) {
  const router = Router();
  const equipe = autenticar(store, ['dono', 'funcionario']);

  const servicoAtivo = (id: string) => {
    const servico = store.servicos.find((s) => s.id === id && s.ativo);
    if (!servico) throw new HttpError(404, 'Serviço não encontrado');
    return servico;
  };

  router.get('/disponibilidade', (req, res) => {
    const { servicoId, data } = validar(disponibilidadeSchema, req.query);
    const servico = servicoAtivo(servicoId);
    res.json({ data, horarios: horariosLivres(store.estabelecimento.horario, store.agendamentos, servico, data, agora()) });
  });

  router.post('/agendamentos', (req, res) => {
    const dados = validar(agendamentoSchema, req.body);
    const servico = servicoAtivo(dados.servicoId);
    const livres = horariosLivres(store.estabelecimento.horario, store.agendamentos, servico, dados.data, agora());
    if (!livres.includes(dados.hora)) throw new HttpError(409, 'Horário indisponível. Escolha outro.');

    const agendamento: Agendamento = {
      id: novoId(),
      servicoId: servico.id,
      servicoNome: servico.nome,
      duracaoMin: servico.duracaoMin,
      preco: servico.preco,
      data: dados.data,
      hora: dados.hora,
      clienteNome: dados.clienteNome,
      clienteTelefone: dados.clienteTelefone,
      status: 'agendado',
      criadoEm: new Date().toISOString()
    };
    store.agendamentos.push(agendamento);
    res.status(201).json(agendamento);
  });

  router.get('/agendamentos', equipe, (req, res) => {
    const { data } = validar(z.object({ data: dataSchema.optional() }), req.query);
    const dia = data ?? agora().data;
    res.json(
      store.agendamentos.filter((a) => a.data === dia).sort((a, b) => a.hora.localeCompare(b.hora))
    );
  });

  router.patch('/agendamentos/:id/status', equipe, (req, res) => {
    const agendamento = store.agendamentos.find((a) => a.id === req.params.id);
    if (!agendamento) throw new HttpError(404, 'Agendamento não encontrado');
    const { status } = validar(statusSchema, req.body);
    if (!TRANSICOES[agendamento.status].includes(status)) {
      throw new HttpError(409, `Não é possível mudar de "${agendamento.status}" para "${status}"`);
    }
    agendamento.status = status;
    res.json(agendamento);
  });

  return router;
}
