import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, UserRound, Users, X } from 'lucide-react';
import ThemeIconToggle from '../../components/ThemeIconToggle';
import RecuperarSenha from '../../components/RecuperarSenha';
import ClientRegistrationModal from '../../components/home/ClientRegistrationModal';
import FeaturedCompaniesSection from '../../components/home/FeaturedCompaniesSection';
import HeroCarousel from '../../components/home/HeroCarousel';
import TimeFlowBrand from '../../components/home/TimeFlowBrand';
import UnifiedLoginPanel from '../../components/home/UnifiedLoginPanel';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LOCAL_DEV } from '../../config/appConfig';
import { listarEmpresasCliente } from '../../services/clienteEmpresaService';
import { readJsonStorage } from '../../utils/storage';

const recoveryProfiles = [
  { type: 'empresa', label: 'Empresa', description: 'Conta responsável pelo negócio', icon: Building2 },
  { type: 'funcionario', label: 'Funcionário', description: 'Conta vinculada a uma empresa', icon: Users },
  { type: 'cliente', label: 'Cliente', description: 'Conta usada para agendamentos', icon: UserRound }
];

const enrichCompanies = (companies) =>
  companies
    .filter((company) => company?.id && company?.nome)
    .map((company, index) => ({
      ...company,
      avaliacao: Number(company.avaliacao ?? company.notaMedia ?? (4.9 - (index % 3) * 0.1)),
      totalAvaliacoes: Number(company.totalAvaliacoes ?? 0)
    }))
    .sort((first, second) => second.avaliacao - first.avaliacao)
    .slice(0, 6);

const mergeCompanies = (remoteCompanies, storedCompanies) =>
  remoteCompanies.map((remoteCompany) => {
    const storedCompany = storedCompanies.find((company) => String(company.id) === String(remoteCompany.id));
    return { ...storedCompany, ...remoteCompany };
  });

const AccessSelector = () => {
  const navigate = useNavigate();
  const { user, setLocalDevUser } = useMySqlAuth();
  const { isDark } = useTheme();
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [loginNotice, setLoginNotice] = useState('');
  const [showClientRegistration, setShowClientRegistration] = useState(false);
  const [showRecoverySelector, setShowRecoverySelector] = useState(false);
  const [recoveryType, setRecoveryType] = useState(null);

  const storedCompanies = useMemo(() => readJsonStorage('empresas', []), []);

  const loadFeaturedCompanies = useCallback(async () => {
    if (storedCompanies.length) {
      setFeaturedCompanies(enrichCompanies(storedCompanies));
    }

    try {
      const remoteCompanies = await listarEmpresasCliente();
      if (remoteCompanies.length) {
        setFeaturedCompanies(enrichCompanies(mergeCompanies(remoteCompanies, storedCompanies)));
      }
    } catch (error) {
      if (!storedCompanies.length) {
        setFeaturedCompanies([]);
      }
    }
  }, [storedCompanies]);

  useEffect(() => {
    loadFeaturedCompanies();
  }, [loadFeaturedCompanies]);

  const handleSelectCompany = (company) => {
    localStorage.setItem('empresaSelecionada', JSON.stringify(company));

    if (LOCAL_DEV) {
      setLocalDevUser('cliente');
      navigate(`/cliente/empresa/${company.id}`);
      return;
    }

    if (user?.tipo === 'cliente') {
      navigate(`/cliente/empresa/${company.id}`);
      return;
    }

    setLoginNotice(`Entre como cliente para ver os horários de ${company.nome}.`);
    document.getElementById('home-login-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => document.getElementById('login-identifier')?.focus(), 350);
  };

  const closeRecovery = () => {
    setRecoveryType(null);
    setShowRecoverySelector(false);
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <main>
        <section className="px-3 pb-2 pt-3 sm:px-5 sm:pt-5" aria-label="Acesso ao TimeFlow">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/15">
            <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
              {LOCAL_DEV && (
                <span className="hidden rounded-full border border-amber-300/30 bg-amber-300/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-100 sm:inline-flex">
                  Modo local
                </span>
              )}
              <div className="rounded-xl border border-white/20 bg-slate-950/40 p-1 shadow-lg backdrop-blur-xl">
                <ThemeIconToggle />
              </div>
            </div>

            <div className="grid min-h-[620px] lg:grid-cols-[1.04fr_0.96fr]">
              <aside className="relative min-h-[260px] overflow-hidden lg:min-h-[620px]">
                <HeroCarousel />
              </aside>

              <div id="home-login-panel" className={`relative ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <UnifiedLoginPanel
                  notice={loginNotice}
                  onOpenClientRegistration={() => setShowClientRegistration(true)}
                  onOpenPasswordRecovery={() => setShowRecoverySelector(true)}
                />
              </div>
            </div>
          </div>
        </section>

        <FeaturedCompaniesSection companies={featuredCompanies} onSelectCompany={handleSelectCompany} isDark={isDark} />

        <footer className="px-5 pb-7">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:text-left">
            <TimeFlowBrand compact />
            <p>© {new Date().getFullYear()} TimeFlow. Agendamentos que acompanham o seu ritmo.</p>
          </div>
        </footer>
      </main>

      {showClientRegistration && <ClientRegistrationModal onClose={() => setShowClientRegistration(false)} />}

      {showRecoverySelector && !recoveryType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="recovery-profile-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="recovery-profile-title" className="text-xl font-black text-slate-950 dark:text-white">Qual é o seu perfil?</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Precisamos dessa informação apenas para recuperar a conta correta.</p>
              </div>
              <button type="button" onClick={closeRecovery} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar recuperação de senha"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-2">
              {recoveryProfiles.map(({ type, label, description, icon: Icon }) => (
                <button key={type} type="button" onClick={() => setRecoveryType(type)} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-cyan-400 hover:bg-cyan-50 dark:border-slate-700 dark:hover:bg-cyan-400/10">
                  <span className="rounded-xl bg-gradient-to-br from-sky-500 to-emerald-400 p-2.5 text-white"><Icon className="h-5 w-5" /></span>
                  <span><span className="block font-extrabold text-slate-900 dark:text-white">{label}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {recoveryType && <RecuperarSenha tipoUsuario={recoveryType} onBack={closeRecovery} />}
    </div>
  );
};

export default AccessSelector;
