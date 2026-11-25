import { type FormEvent, useEffect, useState } from 'react';
import { api, type Usuario } from '../../api';
import { Aviso, Botao, Campo, Cartao } from '../../ui';

const VAZIO = { nome: '', email: '', senha: '' };

export default function Equipe() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = () =>
    api<Usuario[]>('/usuarios')
      .then(setUsuarios)
      .catch((e: Error) => setErro(e.message));

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await api('/usuarios', { metodo: 'POST', corpo: form });
      setSucesso(`${form.nome} já pode entrar com o e-mail ${form.email}.`);
      setForm(VAZIO);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(usuario: Usuario) {
    if (!confirm(`Remover o acesso de ${usuario.nome}?`)) return;
    try {
      await api(`/usuarios/${usuario.id}`, { metodo: 'DELETE' });
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
      <Cartao className="!p-0">
        <ul className="divide-y divide-slate-100">
          {usuarios.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-slate-900">{u.nome}</p>
                <p className="text-sm text-slate-500">
                  {u.email} · {u.papel === 'dono' ? 'Dono' : 'Funcionário'}
                </p>
              </div>
              {u.papel === 'funcionario' && (
                <Botao variante="perigo" onClick={() => remover(u)}>
                  Remover
                </Botao>
              )}
            </li>
          ))}
        </ul>
      </Cartao>

      <Cartao>
        <h2 className="mb-4 font-semibold text-slate-900">Novo funcionário</h2>
        <form onSubmit={adicionar} className="space-y-3">
          <Campo rotulo="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <Campo rotulo="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Campo
            rotulo="Senha inicial"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            required
          />
          {erro && <Aviso>{erro}</Aviso>}
          {sucesso && <Aviso tipo="sucesso">{sucesso}</Aviso>}
          <Botao type="submit" disabled={salvando} className="w-full">
            {salvando ? 'Salvando...' : 'Adicionar'}
          </Botao>
        </form>
      </Cartao>
    </div>
  );
}
