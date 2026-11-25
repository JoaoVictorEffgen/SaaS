import cors from 'cors';
import express from 'express';
import { config } from './config.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/estabelecimento', (_req, res) => {
  res.json({ nome: config.establishmentName });
});

app.listen(config.port, () => {
  console.log(`API em http://localhost:${config.port}`);
});
