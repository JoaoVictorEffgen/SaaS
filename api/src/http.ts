import type { ErrorRequestHandler } from 'express';
import { type z, ZodError, type ZodTypeAny } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function validar<S extends ZodTypeAny>(schema: S, dados: unknown): z.output<S> {
  const resultado = schema.safeParse(dados);
  if (!resultado.success) {
    throw new HttpError(400, resultado.error.issues[0]?.message ?? 'Dados inválidos');
  }
  return resultado.data;
}

export const tratarErros: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ erro: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ erro: err.issues[0]?.message ?? 'Dados inválidos' });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ erro: 'JSON inválido' });
    return;
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno' });
};
