import { Router } from 'express';
import { z } from 'zod';
import { autenticar, criarSessao } from '../auth.js';
import { HttpError, validar } from '../http.js';
import { conferirSenha } from '../senha.js';
import { type Store, usuarioPublico } from '../store.js';

const MAX_FALHAS = 5;
const JANELA_MS = 15 * 60_000;

const loginSchema = z.object({
  email: z.string({ message: 'Informe o e-mail' }).trim().toLowerCase().email('E-mail inválido'),
  senha: z.string({ message: 'Informe a senha' }).min(1, 'Informe a senha')
});

export function rotasAuth(store: Store) {
  const router = Router();

  router.post('/login', (req, res) => {
    const { email, senha } = validar(loginSchema, req.body);

    const tentativa = store.tentativasLogin.get(email);
    if (tentativa && Date.now() - tentativa.desde > JANELA_MS) store.tentativasLogin.delete(email);
    if ((store.tentativasLogin.get(email)?.falhas ?? 0) >= MAX_FALHAS) {
      throw new HttpError(429, 'Muitas tentativas. Aguarde alguns minutos.');
    }

    const usuario = store.usuarios.find((u) => u.email === email);
    if (!usuario || !conferirSenha(senha, usuario.senhaHash)) {
      const atual = store.tentativasLogin.get(email) ?? { falhas: 0, desde: Date.now() };
      store.tentativasLogin.set(email, { ...atual, falhas: atual.falhas + 1 });
      throw new HttpError(401, 'E-mail ou senha incorretos');
    }

    store.tentativasLogin.delete(email);
    res.json({ token: criarSessao(store, usuario.id), usuario: usuarioPublico(usuario) });
  });

  router.get('/me', autenticar(store), (req, res) => {
    res.json({ usuario: usuarioPublico(req.usuario!) });
  });

  router.post('/logout', autenticar(store), (req, res) => {
    store.sessoes.delete(req.token!);
    res.status(204).end();
  });

  return router;
}
