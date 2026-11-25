import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { Aviso, Botao, Campo, Cartao } from '../ui';

export default function Login() {
  const { usuario, entrar } = useAuth();
  const navegar = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/painel" replace />;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(email, senha);
      navegar('/painel', { replace: true });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Cartao className="w-full max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">TimeFlow</p>
        <h1 className="mb-6 mt-1 text-xl font-bold text-slate-900">Área da equipe</h1>
        <form onSubmit={enviar} className="space-y-4">
          <Campo rotulo="E-mail" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Campo
            rotulo="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          {erro && <Aviso>{erro}</Aviso>}
          <Botao type="submit" disabled={enviando} className="w-full">
            {enviando ? 'Entrando...' : 'Entrar'}
          </Botao>
        </form>
        <Link to="/" className="mt-4 block text-center text-sm text-slate-500 hover:text-slate-700">
          Voltar para o agendamento
        </Link>
      </Cartao>
    </main>
  );
}
