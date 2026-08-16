import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  Sparkles,
  Sun
} from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import RecuperarSenha from '../../components/RecuperarSenha';

// Entrada empresarial redesenhada a partir da identidade visual do TimeFlow.
const EmpresaLogin = () => {
  const navigate = useNavigate();
  const { login } = useMySqlAuth();
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecuperarSenha, setShowRecuperarSenha] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await login(
        formData.email,
        formData.senha,
        'empresa',
        null,
        rememberSession
      );

      if (result?.success) {
        navigate('/empresa/dashboard');
      } else {
        alert('Credenciais inválidas. Verifique email e senha.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-[#f7f9fc] text-slate-950'
      }`}
    >
      <div className="grid min-h-screen lg:grid-cols-[0.94fr_1.06fr]">
        <section className="relative flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-14 xl:px-20">
          <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <header className="relative z-10 flex items-center justify-between">
            <Link to="/" className="group flex items-center gap-3" aria-label="Voltar para a página inicial">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-blue-500/10 ring-1 ring-slate-200/70">
                <img src="/logo.png" alt="Logo TimeFlow" className="h-11 w-11 object-cover" />
              </span>
              <span>
                <span className="block text-xl font-extrabold tracking-tight">TimeFlow</span>
                <span className={`block text-[10px] font-semibold uppercase tracking-[0.23em] ${isDark ? 'text-cyan-300' : 'text-blue-600'}`}>
                  Gestão inteligente
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                isDark
                  ? 'border-slate-700 bg-slate-900 text-cyan-300 hover:border-cyan-400/50'
                  : 'border-slate-200 bg-white text-blue-600 shadow-sm hover:border-blue-300'
              }`}
              aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </header>

          <div className="relative z-10 mx-auto flex w-full max-w-[470px] flex-1 items-center py-12 lg:py-8">
            <div className="w-full animate-fade-in">
              <Link
                to="/"
                className={`mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar ao início
              </Link>

              <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                isDark
                  ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
                  : 'border-blue-200 bg-blue-50 text-blue-700'
              }`}>
                <Sparkles className="h-3.5 w-3.5" />
                Área exclusiva para empresas
              </div>

              <h1 className="max-w-md text-4xl font-black leading-[1.08] tracking-[-0.04em] sm:text-5xl">
                Sua operação,
                <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 bg-clip-text text-transparent">
                  no ritmo certo.
                </span>
              </h1>
              <p className={`mt-5 max-w-md text-base leading-7 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Entre para acompanhar agendas, equipe e resultados em um só lugar.
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="empresa-email" className={`mb-2 block text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    E-mail corporativo
                  </label>
                  <div className={`group flex items-center rounded-2xl border px-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 ${
                    isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white shadow-sm'
                  }`}>
                    <Mail className={`h-5 w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      id="empresa-email"
                      type="email"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                      className="w-full bg-transparent px-3 py-4 text-sm outline-none"
                      placeholder="empresa@exemplo.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="empresa-senha" className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRecuperarSenha(true)}
                      className="text-sm font-bold text-blue-600 transition-colors hover:text-cyan-500"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className={`group flex items-center rounded-2xl border px-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 ${
                    isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white shadow-sm'
                  }`}>
                    <LockKeyhole className={`h-5 w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      id="empresa-senha"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.senha}
                      onChange={(event) => setFormData({ ...formData, senha: event.target.value })}
                      className="w-full bg-transparent px-3 py-4 text-sm outline-none"
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className={`rounded-lg p-1 transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <label className={`flex w-fit cursor-pointer items-center gap-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(event) => setRememberSession(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Manter minha sessão ativa
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 px-5 py-4 font-extrabold text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Entrando...' : 'Entrar na minha conta'}
                  {!loading && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <span className={`h-px flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Primeiro acesso?</span>
                <span className={`h-px flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>

              <Link
                to="/empresa/cadastro"
                className={`flex w-full items-center justify-center rounded-2xl border px-5 py-4 text-sm font-extrabold transition-all hover:-translate-y-0.5 ${
                  isDark
                    ? 'border-slate-700 bg-slate-900 text-white hover:border-cyan-400/50'
                    : 'border-slate-200 bg-white text-slate-800 shadow-sm hover:border-blue-300'
                }`}
              >
                Criar conta empresarial
              </Link>
            </div>
          </div>

          <p className={`relative z-10 text-center text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            © 2026 TimeFlow · Ambiente seguro e protegido
          </p>
        </section>

        <section className="relative m-4 hidden min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950 p-10 text-white lg:flex xl:p-14">
          <div className="absolute -right-32 -top-28 h-[430px] w-[430px] rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="absolute -bottom-44 -left-28 h-[480px] w-[480px] rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />

          <div className="relative z-10 flex w-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="max-w-md">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-xl">
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                  Tudo sincronizado em tempo real
                </span>
                <h2 className="mt-7 text-4xl font-black leading-tight tracking-[-0.04em] xl:text-5xl">
                  Menos tarefas.<br />Mais tempo para crescer.
                </h2>
                <p className="mt-5 max-w-sm text-base leading-7 text-blue-100/80">
                  Uma visão clara do seu dia para transformar cada horário em uma oportunidade.
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-cyan-300" />
            </div>

            <div className="relative mx-auto my-8 w-full max-w-xl">
              <div className="absolute -left-9 top-20 z-20 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl xl:-left-16">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                    <Clock3 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-blue-100/70">Horários ocupados</p>
                    <p className="text-xl font-black">87%</p>
                  </div>
                </div>
              </div>

              <div className="rotate-[-2deg] rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl transition-transform duration-500 hover:rotate-0 xl:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Agenda de hoje</p>
                    <p className="mt-1 text-xl font-black">Quinta-feira, 16</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <CalendarDays className="h-6 w-6 text-cyan-300" />
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    ['09:00', 'Mariana Costa', 'Confirmado', 'bg-cyan-300'],
                    ['10:30', 'Ricardo Alves', 'Confirmado', 'bg-emerald-300'],
                    ['13:00', 'Horário disponível', 'Livre', 'bg-white/30'],
                    ['15:30', 'Camila Santos', 'Confirmado', 'bg-violet-300']
                  ].map(([time, client, status, dot]) => (
                    <div key={`${time}-${client}`} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                      <span className="w-12 text-sm font-black text-blue-100">{time}</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{client}</span>
                      <span className="text-xs text-blue-100/60">{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-7 -right-8 z-20 max-w-[240px] rounded-2xl border border-white/15 bg-slate-950/55 p-4 shadow-2xl backdrop-blur-xl xl:-right-14">
                <div className="mb-2 flex items-center gap-1 text-yellow-300">★★★★★</div>
                <p className="text-sm leading-5 text-blue-50">“A agenda ficou simples para toda a equipe.”</p>
                <p className="mt-2 text-xs font-bold text-cyan-300">Clínica Essencial</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              {[
                ['24h', 'Agendamentos'],
                ['100%', 'Na nuvem'],
                ['1 painel', 'Toda a gestão']
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-lg font-black text-white">{value}</p>
                  <p className="text-xs text-blue-100/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {showRecuperarSenha && (
        <RecuperarSenha
          tipoUsuario="empresa"
          onBack={() => setShowRecuperarSenha(false)}
        />
      )}
    </main>
  );
};

export default EmpresaLogin;
