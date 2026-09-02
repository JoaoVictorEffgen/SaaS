import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Users
} from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { LOCAL_DEV } from '../../config/appConfig';
import { getUserHomeRoute } from '../../utils/authRoutes';
import TimeFlowBrand from './TimeFlowBrand';

const demoProfiles = [
  { type: 'empresa', label: 'Empresa', icon: Building2 },
  { type: 'funcionario', label: 'Funcionário', icon: Users },
  { type: 'cliente', label: 'Cliente', icon: UserRound }
];

const UnifiedLoginPanel = ({ notice, onOpenClientRegistration, onOpenPasswordRecovery }) => {
  const navigate = useNavigate();
  const { login, setLocalDevUser } = useMySqlAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Informe seu acesso e sua senha.');
      return;
    }

    try {
      setLoading(true);
      const result = await login(identifier.trim(), password, null, null, rememberSession);
      if (!result.success) {
        setError(result.error || 'Não foi possível entrar com essas credenciais.');
        return;
      }

      const destination = getUserHomeRoute(result.user?.tipo);
      if (!destination) {
        setError('Sua conta não possui um perfil de acesso válido.');
        return;
      }

      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = (userType) => {
    const user = setLocalDevUser(userType);
    navigate(getUserHomeRoute(user.tipo), { replace: true });
  };

  return (
    <section className="flex h-full flex-col justify-center px-6 py-8 sm:px-10 lg:px-12" aria-labelledby="login-title">
      <div className="mb-7 lg:hidden">
        <TimeFlowBrand compact />
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Acesso identificado automaticamente
          </div>
          <h1 id="login-title" className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Bem-vindo de volta
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Entre uma única vez. O TimeFlow reconhece se você é empresa, funcionário ou cliente e abre a área certa.
          </p>
        </div>

        {notice && (
          <div className="mb-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100">
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-identifier" className="mb-1.5 block text-sm font-bold text-slate-800 dark:text-slate-200">
              E-mail, telefone, CPF ou CNPJ
            </label>
            <input
              id="login-identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="Digite seu acesso"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Senha
              </label>
              <button type="button" onClick={onOpenPasswordRecovery} className="text-xs font-bold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300">
                Esqueci minha senha
              </button>
            </div>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={rememberSession}
              onChange={(event) => setRememberSession(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />
            Manter minha sessão neste dispositivo
          </label>

          <button
            type="submit"
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Identificando acesso...' : 'Entrar e continuar'}
            {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
          </button>
        </form>

        {LOCAL_DEV && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-400/20 dark:bg-amber-400/10">
            <p className="mb-2 text-xs font-bold text-amber-900 dark:text-amber-200">Acesso rápido de demonstração</p>
            <div className="grid grid-cols-3 gap-2">
              {demoProfiles.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleDemoAccess(type)}
                  className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2 text-[11px] font-bold text-slate-700 shadow-sm hover:text-cyan-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          Ainda não tem acesso?{' '}
          <button type="button" onClick={onOpenClientRegistration} className="font-extrabold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300">
            Criar conta de cliente
          </button>
          <span className="mx-2 text-slate-300 dark:text-slate-700">•</span>
          <Link to="/empresa/cadastro" className="font-extrabold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300">
            Cadastrar empresa
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UnifiedLoginPanel;
