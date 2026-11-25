import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function conferirSenha(senha: string, armazenado: string): boolean {
  const [salt, hash] = armazenado.split(':');
  if (!salt || !hash) return false;
  const esperado = Buffer.from(hash, 'hex');
  const calculado = scryptSync(senha, salt, esperado.length);
  return timingSafeEqual(esperado, calculado);
}
