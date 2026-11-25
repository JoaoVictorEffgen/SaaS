import { randomBytes } from 'node:crypto';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { config } from './config.js';
import { HttpError } from './http.js';
import type { Papel, Store, Usuario } from './store.js';

declare global {
  namespace Express {
    interface Request {
      usuario?: Usuario;
      token?: string;
    }
  }
}

export function criarSessao(store: Store, usuarioId: string): string {
  const token = randomBytes(32).toString('hex');
  store.sessoes.set(token, { usuarioId, expiraEm: Date.now() + config.sessaoHoras * 3600_000 });
  return token;
}

export function encerrarSessoesDoUsuario(store: Store, usuarioId: string) {
  for (const [token, sessao] of store.sessoes) {
    if (sessao.usuarioId === usuarioId) store.sessoes.delete(token);
  }
}

export function autenticar(store: Store, papeis?: Papel[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const sessao = token ? store.sessoes.get(token) : undefined;
    if (!token || !sessao || sessao.expiraEm < Date.now()) {
      if (token) store.sessoes.delete(token);
      return next(new HttpError(401, 'Faça login para continuar'));
    }
    const usuario = store.usuarios.find((u) => u.id === sessao.usuarioId);
    if (!usuario) {
      store.sessoes.delete(token);
      return next(new HttpError(401, 'Faça login para continuar'));
    }
    if (papeis && !papeis.includes(usuario.papel)) {
      return next(new HttpError(403, 'Sem permissão para esta ação'));
    }
    req.usuario = usuario;
    req.token = token;
    next();
  };
}
