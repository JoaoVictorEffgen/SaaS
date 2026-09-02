import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Heart,
  Home,
  LogOut,
  Moon,
  Search,
  Sparkles,
  Sun,
  Tag,
  Users
} from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/apiService';
import { listarEmpresasCliente } from '../../services/clienteEmpresaService';
import { readJsonStorage } from '../../utils/storage';

const cardTones = [
  'from-cyan-600 via-blue-700 to-slate-950',
  'from-emerald-600 via-teal-700 to-slate-950',
  'from-violet-600 via-indigo-700 to-slate-950',
  'from-amber-500 via-orange-700 to-slate-950'
];

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const unwrapData = (response) => response?.data ?? response;

const formatLocation = (empresa) => {
  const cityState = [empresa.cidade, empresa.estado].filter(Boolean).join(' - ');
  return cityState || empresa.endereco || 'Localização não informada';
};

const getPromotionLabel = (promocao) => {
  if (promocao.tipo_desconto === 'percentual') return `${Number(promocao.valor_desconto)}% OFF`;
  if (promocao.tipo_desconto === 'valor_fixo') {
    return `${Number(promocao.valor_desconto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} OFF`;
  }
  if (promocao.tipo_desconto === 'meses_gratis') return `${promocao.meses_gratis} meses grátis`;
  return promocao.nome || 'Oferta disponível';
};

const formatAppointmentDate = (value) => {
  if (!value) return 'Data não informada';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
};

const getNextAppointment = (response) => {
  const appointments = unwrapData(response);
  if (!Array.isArray(appointments)) return null;

  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

  return appointments
    .filter((appointment) =>
      appointment.status !== 'cancelado' &&
      appointment.status !== 'realizado' &&
      String(appointment.data || '') >= todayKey
    )
    .sort((left, right) =>
      `${left.data || ''}T${left.hora || '00:00'}`.localeCompare(
        `${right.data || ''}T${right.hora || '00:00'}`
      )
    )[0] || null;
};

const IconButton = ({ children, label, onClick, as: Component = 'button', ...props }) => (
  <Component
    type={Component === 'button' ? 'button' : undefined}
    onClick={onClick}
    aria-label={label}
    title={label}
    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
    {...props}
  >
    {children}
  </Component>
);

const CompanyCard = ({ empresa, index, isFavorite, onToggleFavorite }) => {
  const services = Array.isArray(empresa.servicos) ? empresa.servicos : [];
  const promotions = Array.isArray(empresa.promocoes) ? empresa.promocoes : [];
  const primaryCategory = empresa.categoria || empresa.categorias?.[0] || 'Serviços';
  const available = empresa.disponivel_para_agendamento;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-950/5 dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-cyan-800">
      <div
        className={`relative h-40 overflow-hidden bg-gradient-to-br ${cardTones[index % cardTones.length]}`}
        style={empresa.imagem_fundo_url ? { backgroundImage: `url(${empresa.imagem_fundo_url})`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/20 bg-slate-950/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
            {primaryCategory}
          </span>
          {promotions[0] && (
            <span className="rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-950">
              {getPromotionLabel(promotions[0])}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onToggleFavorite(empresa.id)}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-950/45 text-white backdrop-blur transition hover:bg-white hover:text-rose-500"
          aria-label={isFavorite ? `Remover ${empresa.nome} dos favoritos` : `Adicionar ${empresa.nome} aos favoritos`}
          aria-pressed={isFavorite}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white/15 text-white backdrop-blur">
            {empresa.logo_url ? (
              <img src={empresa.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-bold">{empresa.nome?.charAt(0)?.toUpperCase() || 'E'}</span>
            )}
          </div>
          <div className="min-w-0 pb-0.5">
            <h3 className="truncate text-lg font-bold text-white">{empresa.nome}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-200">{formatLocation(empresa)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600 dark:text-slate-300">
          {empresa.descricao || 'Conheça os serviços e escolha o melhor horário para você.'}
        </p>

        <div className="mt-4 flex min-h-7 flex-wrap gap-2">
          {services.length > 0 ? services.slice(0, 3).map((service) => (
            <span key={service.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {service.nome}
            </span>
          )) : (
            <span className="text-xs text-slate-400">Serviços ainda não publicados</span>
          )}
          {services.length > 3 && (
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">
              +{services.length - 3}
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-900 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>{empresa.total_profissionais > 0 ? `${empresa.total_profissionais} profissional${empresa.total_profissionais > 1 ? 'is' : ''} disponível${empresa.total_profissionais > 1 ? 'is' : ''}` : 'Equipe ainda não cadastrada'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>{empresa.horario_informado ? `${empresa.horario_inicio} — ${empresa.horario_fim}` : 'Horários exibidos ao agendar'}</span>
          </div>
        </div>

        <div className="mt-auto pt-5">
          {available ? (
            <Link
              to={`/cliente/empresa/${empresa.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-200"
            >
              Ver serviços e horários
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button type="button" disabled className="w-full cursor-not-allowed rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400 dark:bg-slate-900 dark:text-slate-600">
              Cadastro em preparação
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const SelecaoEmpresa = () => {
  const { user, logout } = useMySqlAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todas');
  const [showNotifications, setShowNotifications] = useState(false);
  const favoriteStorageKey = `cliente_favoritos_${user?.id || 'local'}`;
  const [favorites, setFavorites] = useState(() =>
    new Set(readJsonStorage(`cliente_favoritos_${user?.id || 'local'}`, []).map(String))
  );

  useEffect(() => {
    setFavorites(new Set(readJsonStorage(favoriteStorageKey, []).map(String)));
  }, [favoriteStorageKey]);

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      setLoading(true);
      setError('');

      const [companiesResult, appointmentsResult] = await Promise.allSettled([
        listarEmpresasCliente(),
        apiService.getAgendamentos()
      ]);

      if (!active) return;

      if (companiesResult.status === 'rejected') {
        setEmpresas([]);
        setError('Não foi possível carregar as empresas agora. Tente novamente em instantes.');
      } else {
        setEmpresas(companiesResult.value);
      }

      setNextAppointment(
        appointmentsResult.status === 'fulfilled'
          ? getNextAppointment(appointmentsResult.value)
          : null
      );
      setLoading(false);
    };

    loadContent();
    return () => {
      active = false;
    };
  }, [retryToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.client-notification-menu')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const filters = useMemo(() => {
    const categories = empresas.flatMap((empresa) => [
      empresa.categoria,
      ...(Array.isArray(empresa.categorias) ? empresa.categorias : [])
    ]).filter(Boolean);
    return ['todas', 'favoritas', ...Array.from(new Set(categories))];
  }, [empresas]);

  const empresasFiltradas = useMemo(() => empresas.filter((empresa) => {
    const searchableText = normalizeText([
      empresa.nome,
      empresa.descricao,
      empresa.cidade,
      empresa.estado,
      empresa.endereco,
      empresa.categoria,
      ...(empresa.categorias || []),
      ...(empresa.servicos || []).map((service) => service.nome)
    ].filter(Boolean).join(' '));
    const matchesSearch = searchableText.includes(normalizeText(searchTerm));

    if (activeFilter === 'favoritas') {
      return matchesSearch && favorites.has(String(empresa.id));
    }
    if (activeFilter === 'todas') return matchesSearch;

    const companyCategories = [empresa.categoria, ...(empresa.categorias || [])]
      .filter(Boolean)
      .map(normalizeText);
    return matchesSearch && companyCategories.includes(normalizeText(activeFilter));
  }), [activeFilter, empresas, favorites, searchTerm]);

  const totals = useMemo(() => ({
    services: empresas.reduce((total, empresa) => total + (empresa.servicos?.length || 0), 0),
    promotions: empresas.reduce((total, empresa) => total + (empresa.promocoes?.length || 0), 0)
  }), [empresas]);

  const toggleFavorite = (empresaId) => {
    const normalizedId = String(empresaId);
    setFavorites((current) => {
      const updated = new Set(current);
      if (updated.has(normalizedId)) updated.delete(normalizedId);
      else updated.add(normalizedId);
      localStorage.setItem(favoriteStorageKey, JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  const handleLogout = async () => {
    await logout('cliente');
    navigate('/', { replace: true });
  };

  const scrollToCompanies = () => {
    document.getElementById('empresas-disponiveis')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-[#070b14] dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-[#070b14]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-400 text-sm font-black text-slate-950">TF</div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950 dark:text-white">TimeFlow</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Área do cliente</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IconButton label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'} onClick={toggleTheme}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </IconButton>

            <div className="client-notification-menu relative">
              <IconButton label="Abrir lembretes" onClick={() => setShowNotifications((current) => !current)}>
                <Bell className="h-4 w-4" />
                {nextAppointment && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-cyan-500 dark:border-slate-950" />}
              </IconButton>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-bold">Lembretes</p>
                  {nextAppointment ? (
                    <div className="mt-3 rounded-xl bg-cyan-500/10 p-3">
                      <p className="text-xs font-semibold text-cyan-800 dark:text-cyan-200">Próximo atendimento</p>
                      <p className="mt-1 text-sm font-bold">{nextAppointment.empresa?.nome || 'Empresa cadastrada'}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatAppointmentDate(nextAppointment.data)} · {nextAppointment.hora?.slice(0, 5)}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nenhum agendamento futuro encontrado.</p>
                  )}
                </div>
              )}
            </div>

            <IconButton as={Link} to="/" label="Voltar ao início"><Home className="h-4 w-4" /></IconButton>
            <IconButton label="Sair da conta" onClick={handleLogout}><LogOut className="h-4 w-4" /></IconButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-5 py-7 text-white shadow-xl sm:px-8 sm:py-9 dark:border-slate-800">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative grid gap-7 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Olá, {user?.nome || 'Cliente'}</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Encontre o próximo serviço para a sua rotina.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Empresas, profissionais e horários conectados em uma experiência simples de agendamento.</p>

              <div className="relative mt-6 max-w-2xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Busque por empresa, serviço ou cidade"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 pl-12 pr-4 text-sm text-white outline-none backdrop-blur placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <div className="rounded-xl bg-white/5 p-3 text-center"><p className="text-xl font-bold text-cyan-300">{empresas.length}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">Empresas</p></div>
              <div className="rounded-xl bg-white/5 p-3 text-center"><p className="text-xl font-bold text-emerald-300">{totals.services}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">Serviços</p></div>
              <div className="rounded-xl bg-white/5 p-3 text-center"><p className="text-xl font-bold text-amber-300">{totals.promotions}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">Ofertas</p></div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70 lg:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-4 p-5 sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"><Calendar className="h-6 w-6" /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Próximo agendamento</p>
              {nextAppointment ? (
                <><p className="mt-1 truncate text-base font-bold">{nextAppointment.empresa?.nome || 'Empresa cadastrada'}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatAppointmentDate(nextAppointment.data)} · {nextAppointment.hora?.slice(0, 5)} · {nextAppointment.funcionario?.nome || 'Profissional definido no agendamento'}</p></>
              ) : (
                <><p className="mt-1 text-base font-bold">Sua agenda está livre</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Escolha uma empresa abaixo para marcar seu próximo horário.</p></>
              )}
            </div>
          </div>
          <div className="flex items-center border-t border-slate-200 p-4 dark:border-slate-800 lg:border-l lg:border-t-0">
            <button type="button" onClick={scrollToCompanies} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 lg:w-auto">Explorar empresas<ArrowRight className="h-4 w-4" /></button>
          </div>
        </section>

        <section id="empresas-disponiveis" className="scroll-mt-24 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-400">Catálogo conectado</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Empresas disponíveis</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Somente cadastros ativos retornados pelo TimeFlow.</p>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{empresasFiltradas.length} resultado{empresasFiltradas.length === 1 ? '' : 's'}</p>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => {
              const active = activeFilter === filter;
              const label = filter === 'todas' ? 'Todas' : filter === 'favoritas' ? `Favoritas (${favorites.size})` : filter;
              return (
                <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${active ? 'border-cyan-500 bg-cyan-500 text-slate-950' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-cyan-800'}`}>{label}</button>
              );
            })}
          </div>

          {loading ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => <div key={item} className="h-[28rem] animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />)}
            </div>
          ) : error ? (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-950 dark:bg-rose-950/20">
              <p className="font-bold text-rose-800 dark:text-rose-200">Não conseguimos abrir o catálogo</p>
              <p className="mt-2 text-sm text-rose-700/80 dark:text-rose-300/80">{error}</p>
              <button type="button" onClick={() => setRetryToken((current) => current + 1)} className="mt-5 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-800">Tentar novamente</button>
            </div>
          ) : empresasFiltradas.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {empresasFiltradas.map((empresa, index) => (
                <CompanyCard key={empresa.id} empresa={empresa} index={index} isFavorite={favorites.has(String(empresa.id))} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-950/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900"><Search className="h-6 w-6" /></div>
              <h3 className="mt-4 font-bold">Nenhuma empresa encontrada</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Altere a busca ou selecione outro filtro.</p>
              <button type="button" onClick={() => { setSearchTerm(''); setActiveFilter('todas'); }} className="mt-5 text-sm font-bold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300">Limpar filtros</button>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/70 sm:grid-cols-3 sm:p-6">
          <div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"><Building2 className="h-5 w-5" /></div><div><p className="text-sm font-bold">Empresas cadastradas</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Nada de vitrines fictícias na lista principal.</p></div></div>
          <div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><Briefcase className="h-5 w-5" /></div><div><p className="text-sm font-bold">Serviços vinculados</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Cada opção pertence à empresa selecionada.</p></div></div>
          <div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300"><Tag className="h-5 w-5" /></div><div><p className="text-sm font-bold">Ofertas reais</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Promoções aparecem apenas quando estão ativas.</p></div></div>
        </section>

        <footer className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400"><Sparkles className="h-3.5 w-3.5" />TimeFlow · Seu tempo, do seu jeito.</footer>
      </main>
    </div>
  );
};

export default SelecaoEmpresa;
