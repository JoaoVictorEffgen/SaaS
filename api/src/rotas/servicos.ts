import { Router } from 'express';
import { z } from 'zod';
import { autenticar } from '../auth.js';
import { HttpError, validar } from '../http.js';
import { novoId, type Servico, type Store } from '../store.js';

const servicoSchema = z.object({
  nome: z.string({ message: 'Informe o nome' }).trim().min(2, 'Nome muito curto').max(80, 'Nome muito longo'),
  duracaoMin: z
    .number({ message: 'Informe a duração em minutos' })
    .int('Duração inválida')
    .min(5, 'Duração mínima de 5 minutos')
    .max(480, 'Duração máxima de 8 horas')
    .refine((v) => v % 5 === 0, 'A duração deve ser múltipla de 5 minutos'),
  preco: z.number({ message: 'Informe o preço' }).min(0, 'Preço inválido').max(100_000, 'Preço inválido'),
  ativo: z.boolean().default(true)
});

export function rotasServicos(store: Store) {
  const router = Router();
  const apenasDono = autenticar(store, ['dono']);

  const buscar = (id: string) => {
    const servico = store.servicos.find((s) => s.id === id);
    if (!servico) throw new HttpError(404, 'Serviço não encontrado');
    return servico;
  };

  const garantirNomeUnico = (nome: string, ignorarId?: string) => {
    const existe = store.servicos.some(
      (s) => s.id !== ignorarId && s.nome.toLowerCase() === nome.toLowerCase()
    );
    if (existe) throw new HttpError(409, 'Já existe um serviço com esse nome');
  };

  router.get('/', (_req, res) => {
    res.json(store.servicos.filter((s) => s.ativo));
  });

  router.get('/todos', apenasDono, (_req, res) => {
    res.json(store.servicos);
  });

  router.post('/', apenasDono, (req, res) => {
    const dados = validar(servicoSchema, req.body);
    garantirNomeUnico(dados.nome);
    const servico: Servico = { id: novoId(), ...dados, preco: Math.round(dados.preco * 100) / 100 };
    store.servicos.push(servico);
    res.status(201).json(servico);
  });

  router.put('/:id', apenasDono, (req, res) => {
    const servico = buscar(req.params.id);
    const dados = validar(servicoSchema, req.body);
    garantirNomeUnico(dados.nome, servico.id);
    Object.assign(servico, dados, { preco: Math.round(dados.preco * 100) / 100 });
    res.json(servico);
  });

  router.delete('/:id', apenasDono, (req, res) => {
    const servico = buscar(req.params.id);
    store.servicos = store.servicos.filter((s) => s.id !== servico.id);
    res.status(204).end();
  });

  return router;
}
