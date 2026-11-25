import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import type { Server } from 'node:http';
import type { Agora } from '../src/agenda.js';
import { criarApp } from '../src/app.js';
import { criarStore } from '../src/store.js';

// 2026-11-25 is a Wednesday; 10:00 local time.
const AGORA: Agora = { data: '2026-11-25', minutos: 10 * 60 };
const DONO = { email: 'dono@teste.local', senha: 'senha-do-dono' };

let server: Server;
let base: string;

async function chamar(metodo: string, rota: string, corpo?: unknown, token?: string) {
  const res = await fetch(`${base}${rota}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo)
  });
  const texto = await res.text();
  return { status: res.status, corpo: texto ? JSON.parse(texto) : null };
}

async function login(email: string, senha: string) {
  const res = await chamar('POST', '/api/auth/login', { email, senha });
  assert.equal(res.status, 200);
  return res.corpo.token as string;
}

before(async () => {
  const store = criarStore({ nomeEstabelecimento: 'Salão Teste', dono: { nome: 'Dono', ...DONO } });
  server = criarApp(store, () => AGORA).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

describe('login', () => {
  test('rejeita senha errada e aceita a correta', async () => {
    assert.equal((await chamar('POST', '/api/auth/login', { email: DONO.email, senha: 'errada' })).status, 401);
    const token = await login(DONO.email, DONO.senha);
    const me = await chamar('GET', '/api/auth/me', undefined, token);
    assert.equal(me.corpo.usuario.papel, 'dono');
    assert.equal(me.corpo.usuario.senhaHash, undefined);
  });

  test('bloqueia após 5 tentativas erradas', async () => {
    const email = 'ninguem@teste.local';
    for (let i = 0; i < 5; i++) {
      assert.equal((await chamar('POST', '/api/auth/login', { email, senha: 'x' })).status, 401);
    }
    assert.equal((await chamar('POST', '/api/auth/login', { email, senha: 'x' })).status, 429);
  });

  test('logout invalida o token', async () => {
    const token = await login(DONO.email, DONO.senha);
    assert.equal((await chamar('POST', '/api/auth/logout', undefined, token)).status, 204);
    assert.equal((await chamar('GET', '/api/auth/me', undefined, token)).status, 401);
  });
});

describe('serviços', () => {
  test('público vê só os ativos; dono cria, edita, desativa e remove', async () => {
    const token = await login(DONO.email, DONO.senha);
    assert.equal((await chamar('POST', '/api/servicos', { nome: 'X', duracaoMin: 30, preco: 1 })).status, 401);

    const criado = await chamar('POST', '/api/servicos', { nome: 'Hidratação', duracaoMin: 45, preco: 50 }, token);
    assert.equal(criado.status, 201);

    const duplicado = await chamar('POST', '/api/servicos', { nome: 'hidratação', duracaoMin: 45, preco: 50 }, token);
    assert.equal(duplicado.status, 409);

    const invalido = await chamar('POST', '/api/servicos', { nome: 'Y', duracaoMin: 7, preco: -1 }, token);
    assert.equal(invalido.status, 400);

    const id = criado.corpo.id;
    const editado = await chamar('PUT', `/api/servicos/${id}`, { nome: 'Hidratação', duracaoMin: 45, preco: 55, ativo: false }, token);
    assert.equal(editado.corpo.preco, 55);

    const publicos = await chamar('GET', '/api/servicos');
    assert.ok(!publicos.corpo.some((s: { id: string }) => s.id === id));
    const todos = await chamar('GET', '/api/servicos/todos', undefined, token);
    assert.ok(todos.corpo.some((s: { id: string }) => s.id === id));

    assert.equal((await chamar('DELETE', `/api/servicos/${id}`, undefined, token)).status, 204);
    assert.equal((await chamar('DELETE', `/api/servicos/${id}`, undefined, token)).status, 404);
  });
});

describe('equipe', () => {
  test('dono cadastra funcionário, que acessa a agenda mas não gerencia serviços', async () => {
    const tokenDono = await login(DONO.email, DONO.senha);
    const novo = { nome: 'Ana', email: 'ana@teste.local', senha: 'senha-da-ana' };
    const criado = await chamar('POST', '/api/usuarios', novo, tokenDono);
    assert.equal(criado.status, 201);
    assert.equal(criado.corpo.papel, 'funcionario');
    assert.equal((await chamar('POST', '/api/usuarios', novo, tokenDono)).status, 409);

    const tokenAna = await login(novo.email, novo.senha);
    assert.equal((await chamar('GET', '/api/agendamentos', undefined, tokenAna)).status, 200);
    assert.equal((await chamar('GET', '/api/usuarios', undefined, tokenAna)).status, 403);
    assert.equal((await chamar('POST', '/api/servicos', { nome: 'Z', duracaoMin: 30, preco: 1 }, tokenAna)).status, 403);

    assert.equal((await chamar('DELETE', `/api/usuarios/${criado.corpo.id}`, undefined, tokenDono)).status, 204);
    assert.equal((await chamar('GET', '/api/agendamentos', undefined, tokenAna)).status, 401);
  });
});

describe('agendamento público', () => {
  test('mostra horários livres, agenda e impede conflito', async () => {
    const servicos = (await chamar('GET', '/api/servicos')).corpo;
    const corte = servicos.find((s: { nome: string }) => s.nome === 'Corte');
    const combo = servicos.find((s: { nome: string }) => s.nome === 'Corte + Barba');

    const hoje = await chamar('GET', `/api/disponibilidade?servicoId=${corte.id}&data=2026-11-25`);
    assert.equal(hoje.corpo.horarios[0], '10:30');
    assert.equal(hoje.corpo.horarios.at(-1), '17:30');

    const domingo = await chamar('GET', `/api/disponibilidade?servicoId=${corte.id}&data=2026-11-29`);
    assert.deepEqual(domingo.corpo.horarios, []);
    const passado = await chamar('GET', `/api/disponibilidade?servicoId=${corte.id}&data=2026-11-24`);
    assert.deepEqual(passado.corpo.horarios, []);

    const pedido = { servicoId: combo.id, data: '2026-11-26', hora: '14:00', clienteNome: 'Maria', clienteTelefone: '(11) 98888-7777' };
    const criado = await chamar('POST', '/api/agendamentos', pedido);
    assert.equal(criado.status, 201);
    assert.equal(criado.corpo.clienteTelefone, '11988887777');

    assert.equal((await chamar('POST', '/api/agendamentos', pedido)).status, 409);
    assert.equal((await chamar('POST', '/api/agendamentos', { ...pedido, servicoId: corte.id, hora: '14:30' })).status, 409);
    assert.equal((await chamar('POST', '/api/agendamentos', { ...pedido, hora: '09:15' })).status, 409);
    assert.equal((await chamar('POST', '/api/agendamentos', { ...pedido, data: '2026-11-25', hora: '09:00' })).status, 409);
    assert.equal((await chamar('POST', '/api/agendamentos', { ...pedido, clienteTelefone: '123' })).status, 400);

    const amanha = await chamar('GET', `/api/disponibilidade?servicoId=${corte.id}&data=2026-11-26`);
    assert.ok(!amanha.corpo.horarios.includes('14:00'));
    assert.ok(!amanha.corpo.horarios.includes('14:30'));
    assert.ok(amanha.corpo.horarios.includes('15:00'));
    assert.ok(amanha.corpo.horarios.includes('13:30'));
  });

  test('equipe vê a agenda do dia e muda o status; cancelar libera o horário', async () => {
    const token = await login(DONO.email, DONO.senha);
    assert.equal((await chamar('GET', '/api/agendamentos?data=2026-11-26')).status, 401);

    const agenda = await chamar('GET', '/api/agendamentos?data=2026-11-26', undefined, token);
    assert.equal(agenda.corpo.length, 1);
    const id = agenda.corpo[0].id;

    const confirmado = await chamar('PATCH', `/api/agendamentos/${id}/status`, { status: 'confirmado' }, token);
    assert.equal(confirmado.corpo.status, 'confirmado');
    assert.equal((await chamar('PATCH', `/api/agendamentos/${id}/status`, { status: 'agendado' }, token)).status, 409);
    assert.equal((await chamar('PATCH', `/api/agendamentos/${id}/status`, { status: 'cancelado' }, token)).status, 200);
    assert.equal((await chamar('PATCH', `/api/agendamentos/${id}/status`, { status: 'realizado' }, token)).status, 409);

    const corte = (await chamar('GET', '/api/servicos')).corpo.find((s: { nome: string }) => s.nome === 'Corte');
    const livres = await chamar('GET', `/api/disponibilidade?servicoId=${corte.id}&data=2026-11-26`);
    assert.ok(livres.corpo.horarios.includes('14:00'));
  });
});

test('rotas desconhecidas e JSON inválido respondem com erro claro', async () => {
  assert.equal((await chamar('GET', '/api/nao-existe')).status, 404);
  const res = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(res.status, 400);
});
