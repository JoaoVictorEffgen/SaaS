import { Router } from 'express';
import { z } from 'zod';
import { autenticar, encerrarSessoesDoUsuario } from '../auth.js';
import { HttpError, validar } from '../http.js';
import { hashSenha } from '../senha.js';
import { novoId, type Store, usuarioPublico } from '../store.js';

const funcionarioSchema = z.object({
  nome: z.string({ message: 'Informe o nome' }).trim().min(2, 'Nome muito curto').max(80, 'Nome muito longo'),
  email: z.string({ message: 'Informe o e-mail' }).trim().toLowerCase().email('E-mail inválido'),
  senha: z.string({ message: 'Informe a senha' }).min(8, 'A senha deve ter pelo menos 8 caracteres')
});

export function rotasUsuarios(store: Store) {
  const router = Router();
  router.use(autenticar(store, ['dono']));

  router.get('/', (_req, res) => {
    res.json(store.usuarios.map(usuarioPublico));
  });

  router.post('/', (req, res) => {
    const { nome, email, senha } = validar(funcionarioSchema, req.body);
    if (store.usuarios.some((u) => u.email === email)) {
      throw new HttpError(409, 'Já existe um usuário com esse e-mail');
    }
    const usuario = { id: novoId(), nome, email, senhaHash: hashSenha(senha), papel: 'funcionario' as const };
    store.usuarios.push(usuario);
    res.status(201).json(usuarioPublico(usuario));
  });

  router.delete('/:id', (req, res) => {
    const usuario = store.usuarios.find((u) => u.id === req.params.id);
    if (!usuario) throw new HttpError(404, 'Usuário não encontrado');
    if (usuario.papel === 'dono') throw new HttpError(400, 'O dono não pode ser removido');
    store.usuarios = store.usuarios.filter((u) => u.id !== usuario.id);
    encerrarSessoesDoUsuario(store, usuario.id);
    res.status(204).end();
  });

  return router;
}
