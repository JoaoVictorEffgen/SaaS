import cors from 'cors';
import express from 'express';
import { type Agora, agoraNoFuso } from './agenda.js';
import { config } from './config.js';
import { tratarErros } from './http.js';
import { rotasAgendamentos } from './rotas/agendamentos.js';
import { rotasAuth } from './rotas/auth.js';
import { rotasServicos } from './rotas/servicos.js';
import { rotasUsuarios } from './rotas/usuarios.js';
import type { Store } from './store.js';

export function criarApp(store: Store, agora: () => Agora = () => agoraNoFuso(config.timezone)) {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/estabelecimento', (_req, res) => {
    res.json(store.estabelecimento);
  });

  app.use('/api/auth', rotasAuth(store));
  app.use('/api/servicos', rotasServicos(store));
  app.use('/api/usuarios', rotasUsuarios(store));
  app.use('/api', rotasAgendamentos(store, agora));

  app.use('/api', (_req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
  });
  app.use(tratarErros);

  return app;
}
