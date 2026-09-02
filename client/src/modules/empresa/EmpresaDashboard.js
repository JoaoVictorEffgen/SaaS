import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Home,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Phone,
  Settings,
  Star,
  Sun,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import EmpresaLogoHeader from '../../components/EmpresaLogoHeader';
import apiService from '../../services/apiService';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const metricTones = {
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-300'
};

const quickActions = [
  { title: 'Serviços', description: 'Gerenciar serviços', path: '/servicos', icon: Briefcase, tone: 'cyan' },
  { title: 'Funcionários', description: 'Gerenciar equipe', path: '/funcionarios', icon: UserPlus, tone: 'emerald' },
  { title: 'Dashboard avançado', description: 'KPIs, gráficos e CRM', path: '/kpis', icon: BarChart3, tone: 'violet' },
  { title: 'Exportar', description: 'Exportar dados', path: '/exportar', icon: Download, tone: 'amber' },
  { title: 'Meus pacotes', description: 'Pacotes personalizados', path: '/pacotes', icon: Briefcase, tone: 'blue' },
  { title: 'Rede empresarial', description: 'Franquias e unidades', path: '/rede', icon: Users, tone: 'violet' }
];

const readStorageArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const isSameId = (left, right) => String(left ?? '') === String(right ?? '');

const toLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) return 'Data não informada';
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const formatWorkingDays = (value) => {
  if (!value || value.length === 0) return 'Não informado';
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const days = Array.isArray(value) ? value : String(value).split(',');

  return days
    .map((day) => {
      const normalized = Number(day);
      return Number.isNaN(normalized) ? String(day).trim() : labels[normalized];
    })
    .filter(Boolean)
    .join(', ');
};

const getBookingValue = (booking) => Number.parseFloat(booking.valor_total) || 0;

const getServiceLabel = (booking) => {
  if (Array.isArray(booking.servicos) && booking.servicos.length > 0) {
    return booking.servicos.map((service) => service.nome).filter(Boolean).join(', ');
  }
  return booking.servico_nome || booking.servico || 'Serviço não informado';
};

const getStatusLabel = (status) => {
  const labels = {
    confirmado: 'Confirmado',
    agendado: 'Agendado',
    cancelado: 'Cancelado',
    em_aprovacao: 'Em aprovação',
    realizado: 'Realizado'
  };
  return labels[status] || status || 'Sem status';
};

const statusClasses = {
  confirmado: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  agendado: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  cancelado: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  em_aprovacao: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  realizado: 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
};

const MetricCard = ({ icon: Icon, label, value, description, tone }) => (
  <article className="min-w-0 border-b border-slate-200 p-5 last:border-b-0 dark:border-slate-800 sm:p-6 lg:border-b-0 lg:border-r lg:last:border-r-0">
    <div className="flex items-start justify-between gap-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${metricTones[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <TrendingUp className="h-4 w-4 text-slate-300 dark:text-slate-700" aria-hidden="true" />
    </div>
    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950 dark:text-white xl:text-3xl">{value}</p>
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{description}</p>
  </article>
);

const SectionHeading = ({ eyebrow, title, description, trailing }) => (
  <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between sm:px-6">
    <div>
      {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">{eyebrow}</p>}
      <h2 className="mt-1 text-base font-bold text-slate-950 dark:text-white">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    {trailing}
  </div>
);

const StatusBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="tabular-nums text-slate-500 dark:text-slate-400">{value} <span className="text-xs">({percentage}%)</span></span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </div>
    <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
  </div>
);

const FeaturedEmployee = ({ employee, icon: Icon, label, detail, tone }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl ${metricTones[tone]}`}>
      {employee?.foto || employee?.foto_url || employee?.url_foto_perfil ? <img src={employee.foto || employee.foto_url || employee.url_foto_perfil} alt={employee.nome} className="h-full w-full object-cover" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{employee?.nome || 'Nenhum funcionário'}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{employee ? detail : 'Cadastre sua equipe para acompanhar'}</p>
    </div>
  </div>
);

const EmpresaDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useMySqlAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentRankingIndex, setCurrentRankingIndex] = useState(0);
  const [empresaData, setEmpresaData] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);

  const dashboardData = useMemo(() => {
    const today = new Date();
    const todayKey = toLocalDateKey(today);
    const currentMonth = todayKey.slice(0, 7);
    const completed = agendamentos.filter((booking) => booking.status === 'realizado');
    const validRatings = avaliacoes.map((rating) => Number.parseFloat(rating.nota)).filter((rating) => Number.isFinite(rating));

    const stats = {
      totalAgendamentos: agendamentos.length,
      agendamentosHoje: agendamentos.filter((booking) => booking.data === todayKey).length,
      funcionarios: funcionarios.length,
      receitaDia: completed.filter((booking) => booking.data === todayKey).reduce((total, booking) => total + getBookingValue(booking), 0),
      receitaMes: completed.filter((booking) => String(booking.data || '').startsWith(currentMonth)).reduce((total, booking) => total + getBookingValue(booking), 0),
      satisfacao: validRatings.length > 0 ? validRatings.reduce((total, rating) => total + rating, 0) / validRatings.length : 0
    };

    const statusCounts = agendamentos.reduce((counts, booking) => {
      if (Object.prototype.hasOwnProperty.call(counts, booking.status)) counts[booking.status] += 1;
      return counts;
    }, { em_aprovacao: 0, confirmado: 0, agendado: 0, cancelado: 0, realizado: 0 });

    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = toLocalDateKey(date);
      const dailyBookings = agendamentos.filter((booking) => booking.data === key);
      return {
        key,
        label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        count: dailyBookings.length,
        revenue: dailyBookings.filter((booking) => booking.status === 'realizado').reduce((total, booking) => total + getBookingValue(booking), 0)
      };
    });

    const upcoming = agendamentos
      .filter((booking) => booking.status !== 'cancelado' && String(booking.data || '') >= todayKey)
      .sort((left, right) => `${left.data || ''}T${left.hora || '00:00'}`.localeCompare(`${right.data || ''}T${right.hora || '00:00'}`))
      .slice(0, 5);

    return { stats, statusCounts, lastSevenDays, upcoming };
  }, [agendamentos, avaliacoes, funcionarios]);

  const rankings = useMemo(() => {
    const byAppointments = funcionarios
      .map((employee) => ({
        ...employee,
        totalAtendimentos: agendamentos.filter((booking) => isSameId(booking.funcionario_id, employee.id)).length
      }))
      .sort((left, right) => right.totalAtendimentos - left.totalAtendimentos)
      .slice(0, 3);

    const bySatisfaction = funcionarios
      .map((employee) => {
        const employeeRatings = avaliacoes
          .filter((rating) => isSameId(rating.funcionario_id, employee.id))
          .map((rating) => Number.parseFloat(rating.nota))
          .filter((rating) => Number.isFinite(rating));
        return {
          ...employee,
          satisfacao: employeeRatings.length > 0 ? employeeRatings.reduce((total, rating) => total + rating, 0) / employeeRatings.length : 0
        };
      })
      .sort((left, right) => right.satisfacao - left.satisfacao)
      .slice(0, 3);

    return { byAppointments, bySatisfaction };
  }, [agendamentos, avaliacoes, funcionarios]);

  const notifications = useMemo(() => agendamentos
    .filter((booking) => ['em_aprovacao', 'agendado', 'confirmado'].includes(booking.status))
    .map((booking) => ({
      id: booking.id,
      title: 'Novo agendamento',
      message: `${booking.cliente?.nome || booking.cliente_nome || booking.cliente_email || 'Cliente'} · ${getServiceLabel(booking)}`,
      date: booking.data,
      time: booking.hora
    }))
    .sort((left, right) => `${right.date || ''}T${right.time || '00:00'}`.localeCompare(`${left.date || ''}T${left.time || '00:00'}`))
    .slice(0, 10), [agendamentos]);

  useEffect(() => {
    if (!user) navigate('/');
  }, [navigate, user]);

  useEffect(() => {
    if (!user?.id) return undefined;
    let active = true;

    const loadCompany = async () => {
      try {
        const [empresaResponse, agendamentosResponse, funcionariosResponse] = await Promise.all([
          apiService.getEmpresa('me'),
          apiService.getAgendamentos(),
          apiService.getMeusFuncionarios()
        ]);
        if (!active) return;
        const empresa = empresaResponse?.data || empresaResponse;
        const equipe = funcionariosResponse?.data || [];
        const employeeIds = new Set(equipe.map((employee) => String(employee.id)));
        setEmpresaData(empresa);
        setAgendamentos(Array.isArray(agendamentosResponse) ? agendamentosResponse : agendamentosResponse?.data || []);
        setFuncionarios(equipe);
        setAvaliacoes(readStorageArray('avaliacoes').filter(
          (rating) => isSameId(rating.empresa_id, empresa.id) || employeeIds.has(String(rating.funcionario_id))
        ));
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
      }
    };

    loadCompany();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentRankingIndex((current) => (current + 1) % 3), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleLogout = async () => {
    try {
      await logout('empresa');
    } finally {
      navigate('/', { replace: true });
    }
  };

  if (!user?.id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500 dark:border-slate-800 dark:border-t-cyan-400" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const { stats, statusCounts, lastSevenDays, upcoming } = dashboardData;
  const maxDailyBookings = Math.max(...lastSevenDays.map((day) => day.count), 1);
  const company = { ...user, ...(empresaData || {}) };
  const companyName = company.nome || company.razaoSocial || 'Empresa';
  const featuredAppointments = rankings.byAppointments.length > 0 ? rankings.byAppointments[currentRankingIndex % rankings.byAppointments.length] : null;
  const featuredSatisfaction = rankings.bySatisfaction.length > 0 ? rankings.bySatisfaction[currentRankingIndex % rankings.bySatisfaction.length] : null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-[#070b14] dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-[#070b14]/95">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <EmpresaLogoHeader showText={false} />
            <div className="min-w-0 border-l border-slate-200 pl-3 dark:border-slate-800">
              <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{companyName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dashboard empresarial</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300" aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'} title={isDark ? 'Tema claro' : 'Tema escuro'}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="notification-dropdown relative">
              <button type="button" onClick={() => setShowNotifications((current) => !current)} className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300" aria-label="Abrir notificações" aria-expanded={showNotifications}>
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[9px] font-bold text-slate-950">{notifications.length > 9 ? '9+' : notifications.length}</span>}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                  <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                    <p className="text-sm font-bold">Notificações</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Últimos movimentos da agenda</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((notification) => (
                      <div key={notification.id} className="border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-900">
                        <div className="flex gap-3">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{notification.message}</p>
                            <p className="mt-1 text-[11px] text-slate-400">{formatDate(notification.date)} · {notification.time || 'Horário não informado'}</p>
                          </div>
                        </div>
                      </div>
                    )) : <EmptyState icon={Bell} title="Nenhuma notificação" description="Novos agendamentos aparecerão aqui." />}
                  </div>
                </div>
              )}
            </div>

            <button type="button" onClick={() => navigate('/empresa/configuracoes')} className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-800 dark:text-slate-200 dark:hover:border-cyan-700 dark:hover:text-cyan-300">
              <Settings className="h-4 w-4" /><span className="hidden sm:inline">Configurações</span>
            </button>
            <button type="button" onClick={() => navigate('/')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300" aria-label="Voltar ao início" title="Início"><Home className="h-4 w-4" /></button>
            <button type="button" onClick={handleLogout} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:text-rose-300" aria-label="Sair da conta" title="Sair"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Visão geral</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Sua operação em um só lugar</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Atualizado com os dados atuais da agenda</p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard icon={Calendar} label="Agendamentos" value={stats.totalAgendamentos} description="Total registrado" tone="cyan" />
            <MetricCard icon={Clock} label="Hoje" value={stats.agendamentosHoje} description="Atendimentos do dia" tone="emerald" />
            <MetricCard icon={Users} label="Funcionários" value={stats.funcionarios} description="Profissionais cadastrados" tone="violet" />
            <MetricCard icon={DollarSign} label="Receita do dia" value={currencyFormatter.format(stats.receitaDia)} description="Agendamentos confirmados" tone="amber" />
            <MetricCard icon={TrendingUp} label="Receita do mês" value={currencyFormatter.format(stats.receitaMes)} description="Mês atual" tone="blue" />
          </div>

          <div className="grid border-t border-slate-200 dark:border-slate-800 lg:grid-cols-5">
            <article className="border-b border-slate-200 dark:border-slate-800 lg:col-span-3 lg:border-b-0 lg:border-r">
              <SectionHeading eyebrow="Últimos 7 dias" title="Movimento da agenda" description="Quantidade diária de atendimentos registrados." trailing={<div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{lastSevenDays.reduce((total, day) => total + day.count, 0)} no período</div>} />
              <div className="px-5 py-6 sm:px-6">
                <div className="flex h-52 items-end gap-2 sm:gap-4">
                  {lastSevenDays.map((day) => {
                    const height = day.count > 0 ? Math.max((day.count / maxDailyBookings) * 100, 14) : 4;
                    return (
                      <div key={day.key} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                        <div className="mb-2 text-center text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">{day.count}</div>
                        <div className="flex h-36 items-end overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-900">
                          <div className="w-full rounded-t-xl bg-gradient-to-t from-cyan-600 to-emerald-400 transition-[height] duration-500" style={{ height: `${height}%` }} title={`${day.count} agendamentos · ${currencyFormatter.format(day.revenue)}`} />
                        </div>
                        <p className="mt-2 truncate text-center text-[11px] font-medium uppercase text-slate-400">{day.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>

            <article className="lg:col-span-2">
              <SectionHeading eyebrow="Distribuição" title="Status dos agendamentos" description="Leitura rápida de toda a agenda cadastrada." />
              <div className="space-y-6 px-5 py-6 sm:px-6">
                <StatusBar label="Confirmados" value={statusCounts.confirmado} total={stats.totalAgendamentos} color="bg-emerald-500" />
                <StatusBar label="Agendados" value={statusCounts.agendado} total={stats.totalAgendamentos} color="bg-cyan-500" />
                <StatusBar label="Em aprovação" value={statusCounts.em_aprovacao} total={stats.totalAgendamentos} color="bg-amber-500" />
                <StatusBar label="Realizados" value={statusCounts.realizado} total={stats.totalAgendamentos} color="bg-violet-500" />
                <StatusBar label="Cancelados" value={statusCounts.cancelado} total={stats.totalAgendamentos} color="bg-rose-500" />
                <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <div><p className="text-xs text-slate-500 dark:text-slate-400">Receita no período</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{currencyFormatter.format(lastSevenDays.reduce((total, day) => total + day.revenue, 0))}</p></div>
                  <div><p className="text-xs text-slate-500 dark:text-slate-400">Avaliação média</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{stats.satisfacao.toFixed(1)} <span className="text-amber-500">★</span></p></div>
                </div>
              </div>
            </article>
          </div>

          <div className="grid border-t border-slate-200 dark:border-slate-800 lg:grid-cols-12">
            <article className="border-b border-slate-200 dark:border-slate-800 lg:col-span-6 lg:border-b-0 lg:border-r">
              <SectionHeading eyebrow="Agenda" title="Próximos atendimentos" description="Compromissos futuros, sem cancelamentos." />
              {upcoming.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[580px] text-left">
                    <thead><tr className="border-b border-slate-200 text-[10px] uppercase tracking-[0.14em] text-slate-400 dark:border-slate-800"><th className="px-6 py-3 font-semibold">Cliente</th><th className="px-4 py-3 font-semibold">Serviço</th><th className="px-4 py-3 font-semibold">Data</th><th className="px-6 py-3 text-right font-semibold">Status</th></tr></thead>
                    <tbody>
                      {upcoming.map((booking, index) => (
                        <tr key={booking.id || `${booking.data}-${booking.hora}-${index}`} className="border-b border-slate-100 last:border-0 dark:border-slate-900">
                          <td className="px-6 py-3.5"><p className="max-w-40 truncate text-sm font-semibold text-slate-900 dark:text-white">{booking.cliente?.nome || booking.cliente_nome || booking.cliente_email || 'Cliente'}</p></td>
                          <td className="px-4 py-3.5"><p className="max-w-44 truncate text-xs text-slate-500 dark:text-slate-400">{getServiceLabel(booking)}</p></td>
                          <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">{formatDate(booking.data)} · {booking.hora || '--:--'}</td>
                          <td className="px-6 py-3.5 text-right"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClasses[booking.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}>{getStatusLabel(booking.status)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <EmptyState icon={Calendar} title="Agenda livre" description="Nenhum atendimento futuro encontrado neste momento." />}
            </article>

            <article className="border-b border-slate-200 dark:border-slate-800 lg:col-span-3 lg:border-b-0 lg:border-r">
              <SectionHeading title="Saúde da operação" description="Resumo do momento atual." />
              <div className="flex min-h-64 flex-col items-center justify-center px-6 py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><CheckCircle className="h-7 w-7" /></div>
                <p className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{statusCounts.cancelado === 0 ? 'Tudo em ordem' : 'Agenda acompanhada'}</p>
                <p className="mt-2 max-w-52 text-xs leading-5 text-slate-500 dark:text-slate-400">{statusCounts.cancelado === 0 ? 'Nenhum cancelamento registrado na visão atual.' : `${statusCounts.cancelado} cancelamento(s) registrado(s) para acompanhamento.`}</p>
                <button type="button" onClick={() => navigate('/kpis')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-cyan-700 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-200">Ver análise completa<ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
            </article>

            <article className="lg:col-span-3">
              <SectionHeading title="Atividade recente" description="Últimos movimentos da agenda." />
              {notifications.length > 0 ? (
                <div>{notifications.slice(0, 4).map((notification) => (
                  <div key={notification.id} className="flex gap-3 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-slate-900 sm:px-6">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"><Activity className="h-4 w-4" /></div>
                    <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{notification.message}</p><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{formatDate(notification.date)} · {notification.time || '--:--'}</p></div>
                  </div>
                ))}</div>
              ) : <EmptyState icon={Activity} title="Sem atividade recente" description="As novas movimentações aparecerão nesta área." />}
            </article>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <SectionHeading eyebrow="Atalhos" title="Ações rápidas" description="Todos os acessos existentes, agora em um único bloco compacto." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.path} type="button" onClick={() => navigate(action.path)} className="group flex min-h-28 items-center gap-3 border-b border-slate-200 p-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/70 sm:border-r lg:border-b-0 xl:last:border-r-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metricTones[action.tone]}`}><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900 dark:text-white">{action.title}</p><p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{action.description}</p></div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-500 dark:text-slate-700" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <SectionHeading eyebrow="Cadastro" title="Informações da empresa" description="Os mesmos dados existentes, organizados para leitura rápida." trailing={<button type="button" onClick={() => navigate('/empresa/configuracoes')} className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200">Editar informações<ArrowRight className="h-3.5 w-3.5" /></button>} />
          <div className="grid lg:grid-cols-12">
            <article className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6 lg:col-span-4 lg:border-b-0 lg:border-r">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dados básicos</h3>
              <div className="mt-5 space-y-4">
                <div className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" /><div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-slate-400">E-mail</p><p className="mt-1 break-words text-sm text-slate-700 dark:text-slate-200">{company.email || 'Não informado'}</p></div></div>
                <div className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" /><div><p className="text-[10px] uppercase tracking-wider text-slate-400">Telefone</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{company.telefone || 'Não informado'}</p></div></div>
                <div className="flex gap-3"><Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" /><div><p className="text-[10px] uppercase tracking-wider text-slate-400">CNPJ</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{company.cnpj || 'Não informado'}</p></div></div>
                <div className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" /><div><p className="text-[10px] uppercase tracking-wider text-slate-400">Endereço</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{company.endereco || 'Não informado'}</p></div></div>
                <p className="border-t border-slate-200 pt-4 text-[11px] text-slate-400 dark:border-slate-800">ID da empresa: <span className="font-mono">{company.id}</span></p>
              </div>
            </article>

            <article className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6 lg:col-span-4 lg:border-b-0 lg:border-r">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Funcionamento</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Especialização</p><p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{company.categoria || 'Não informado'}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Horário</p><p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{company.horario_funcionamento?.horario_inicio && company.horario_funcionamento?.horario_fim ? `${company.horario_funcionamento.horario_inicio} — ${company.horario_funcionamento.horario_fim}` : 'Não informado'}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Dias de atendimento</p><p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatWorkingDays(company.horario_funcionamento?.dias_trabalho)}</p></div>
              </div>
            </article>

            <article className="p-5 sm:p-6 lg:col-span-4">
              <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-slate-900 dark:text-white">Destaques da equipe</h3><div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300"><Star className="h-3.5 w-3.5 fill-current" />{stats.satisfacao.toFixed(1)}</div></div>
              <div className="mt-5 space-y-3">
                <FeaturedEmployee employee={featuredAppointments} icon={Award} label="Mais atendimentos" detail={`${featuredAppointments?.totalAtendimentos || 0} atendimentos`} tone="cyan" />
                <FeaturedEmployee employee={featuredSatisfaction} icon={Star} label="Melhor satisfação" detail={`${featuredSatisfaction?.satisfacao?.toFixed(1) || '0.0'} de avaliação`} tone="emerald" />
              </div>
              <p className="mt-4 text-[11px] leading-5 text-slate-400">Os destaques alternam automaticamente entre os três melhores resultados.</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmpresaDashboard;
