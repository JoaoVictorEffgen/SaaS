# TimeFlow

Sistema de agendamentos para **um único estabelecimento**. O projeto está sendo
reconstruído do zero, uma etapa por vez.

## Estrutura

- `api/`: API em Node.js, Express e TypeScript
- `web/`: frontend em React, Vite, TypeScript e Tailwind

## Como rodar

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/health

Para configurar a API, copie `api/.env.example` para `api/.env`.

## Rotas da API

| Método | Rota                   | Descrição                   |
| ------ | ---------------------- | --------------------------- |
| GET    | `/api/health`          | Status da API               |
| GET    | `/api/estabelecimento` | Dados do estabelecimento    |
