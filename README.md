# TimeFlow

Sistema de agendamentos para **um único estabelecimento**. O projeto está sendo
reconstruído do zero, uma etapa por vez.

## O que já funciona

- **Agendamento público** (`/`): o cliente escolhe o serviço, o dia e um horário
  livre, e informa nome e WhatsApp. O sistema impede horários sobrepostos, no
  passado, fora do expediente e aos domingos.
- **Login da equipe** (`/login`): dono e funcionários, com sessão por token e
  bloqueio temporário após 5 senhas erradas.
- **Painel** (`/painel`):
  - Agenda do dia: confirmar, concluir, marcar falta ou cancelar. Cancelar libera
    o horário.
  - Serviços (só o dono): criar, editar, desativar e remover, sem nomes repetidos.
  - Equipe (só o dono): cadastrar e remover funcionários.

Os dados ficam **em memória** e voltam ao estado inicial quando a API reinicia.
O banco de dados será uma etapa futura.

## Estrutura

- `api/`: API em Node.js, Express, TypeScript e Zod
- `web/`: frontend em React, Vite, TypeScript e Tailwind

## Como rodar

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/health
- Login inicial do dono: `dono@timeflow.local` / `trocar123`

Para trocar o nome do estabelecimento, o login do dono e outras opções, copie
`api/.env.example` para `api/.env`.

## Testes

```bash
npm test -w api
npm run typecheck
```

## Rotas da API

| Método | Rota                             | Acesso      |
| ------ | -------------------------------- | ----------- |
| GET    | `/api/health`                    | Público     |
| GET    | `/api/estabelecimento`           | Público     |
| GET    | `/api/servicos`                  | Público     |
| GET    | `/api/disponibilidade`           | Público     |
| POST   | `/api/agendamentos`              | Público     |
| POST   | `/api/auth/login`                | Público     |
| GET    | `/api/auth/me`                   | Equipe      |
| POST   | `/api/auth/logout`               | Equipe      |
| GET    | `/api/agendamentos?data=`        | Equipe      |
| PATCH  | `/api/agendamentos/:id/status`   | Equipe      |
| GET    | `/api/servicos/todos`            | Dono        |
| POST   | `/api/servicos`                  | Dono        |
| PUT    | `/api/servicos/:id`              | Dono        |
| DELETE | `/api/servicos/:id`              | Dono        |
| GET    | `/api/usuarios`                  | Dono        |
| POST   | `/api/usuarios`                  | Dono        |
| DELETE | `/api/usuarios/:id`              | Dono        |
