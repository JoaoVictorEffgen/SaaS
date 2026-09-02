import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Home, 
  Bell, 
  Coffee, 
  Save, 
  X,
  BarChart3,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  LogOut,
  Users
} from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import apiService from '../../services/apiService';
import FuncionarioProfileTab from '../../components/funcionario/FuncionarioProfileTab';
import FuncionarioStatsTab from '../../components/funcionario/FuncionarioStatsTab';

const FuncionarioAgenda = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading, logout } = useMySqlAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('agenda');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingConfirmations, setPendingConfirmations] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelAgendamentoId, setCancelAgendamentoId] = useState(null);
  const [cancelJustificativa, setCancelJustificativa] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    cargo: '',
    foto: null
  });
  const [availability, setAvailability] = useState({});
  const [breaks, setBreaks] = useState([]);

  // Estados para agendamentos
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);

  useEffect(() => {
    // Aguardar o contexto de autenticação carregar
    if (authLoading) {
      return;
    }

    const loadData = async () => {
      try {
        if (!currentUser) {
          navigate('/');
          return;
        }

        if (currentUser.tipo !== 'funcionario') {
          navigate('/');
          return;
        }

        await Promise.all([
          loadAgendamentos(),
          loadProfileData(),
          loadAvailability(),
          loadBreaks()
        ]);

        setLoading(false);
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    loadData();
    // As rotinas abaixo leem o usuário atual; a carga deve reagir à autenticação, não à identidade das funções.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, authLoading, navigate]);

  // Atualizar a agenda periodicamente sem alterar o status dos atendimentos.
  useEffect(() => {
    if (!currentUser?.id) return;

    const refreshAppointments = () => {
      loadAgendamentos();
    };

    refreshAppointments();

    const interval = setInterval(refreshAppointments, 5 * 60 * 1000);

    return () => clearInterval(interval);
    // O temporizador só precisa ser recriado quando o funcionário mudar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const loadAgendamentos = async () => {
    try {
      const response = await apiService.getFuncionarioAgendamentos();
      const funcionarioAgendamentos = response?.data || [];
      
      // Mapear dados corretamente
      const agendamentosMapeados = funcionarioAgendamentos.map(agendamento => ({
        ...agendamento,
        // Garantir que os campos estão corretos
        clienteNome: agendamento.cliente?.nome || agendamento.cliente_nome || agendamento.clienteNome || 'Cliente não informado',
        servicoNome: agendamento.servicos ? 
          (Array.isArray(agendamento.servicos) ? 
            agendamento.servicos.map(s => s.nome).join(', ') : 
            agendamento.servicos.nome || 'Serviço não informado') : 
          'Serviço não informado',
        horario: agendamento.hora || agendamento.horario || 'Horário não informado',
        data: agendamento.data || 'Data não informada'
      }));
      
      // Ordenar agendamentos: primeiro os que precisam de resposta, depois os que não precisam
      const agendamentosOrdenados = agendamentosMapeados.sort((a, b) => {
        // Status que precisam de resposta (prioridade alta)
        const precisaResposta = (status) => ['em_aprovacao', 'pendente'].includes(status);
        
        const aPrecisaResposta = precisaResposta(a.status);
        const bPrecisaResposta = precisaResposta(b.status);
        
        // Se um precisa de resposta e o outro não, priorizar o que precisa
        if (aPrecisaResposta && !bPrecisaResposta) {
          return -1;
        }
        if (!aPrecisaResposta && bPrecisaResposta) {
          return 1;
        }
        
        // Se ambos têm a mesma prioridade, ordenar por data e horário
        const dataA = new Date(`${a.data}T${a.horario}`);
        const dataB = new Date(`${b.data}T${b.horario}`);
        
        return dataA - dataB; // Ordem crescente (mais antigo primeiro)
      });

      setAgendamentos(agendamentosOrdenados);
      loadFuncionarioNotifications(agendamentosOrdenados);

      // Filtrar agendamentos de hoje
      const agora = new Date();
      const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
      const hojeAgendamentos = agendamentosOrdenados.filter(
        agendamento => agendamento.data === hoje
      );
      setAgendamentosHoje(hojeAgendamentos);
      setPendingConfirmations(
        hojeAgendamentos.filter((agendamento) =>
          ['em_aprovacao', 'pendente'].includes(agendamento.status)
        )
      );
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      const funcionario = await apiService.getProfile();
      setProfileData({
        nome: funcionario.nome,
        cpf: funcionario.cpf,
        telefone: funcionario.telefone,
        email: funcionario.email,
        cargo: funcionario.cargo || 'Funcionário',
        foto: funcionario.foto_url || funcionario.url_foto_perfil
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Fallback: usar dados do currentUser
      setProfileData({
        nome: currentUser.nome_completo || currentUser.nome,
        cpf: currentUser.cpf,
        telefone: currentUser.telefone,
        email: currentUser.email,
        cargo: currentUser.cargo || 'Funcionário',
        foto: currentUser.foto || currentUser.foto_url || currentUser.url_foto_perfil
      });
    }
  };

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.style.display = 'none';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('A imagem deve ter no máximo 5MB.');
          return;
        }
        
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          alert('Selecione uma imagem JPG, PNG ou WebP.');
          return;
        }

        try {
          const result = await apiService.uploadProfilePhoto(file);
          const fotoUrl = result.url;
          setProfileData((prev) => ({ ...prev, foto: fotoUrl }));

          addNotification('Foto atualizada', 'Sua foto de perfil foi salva com segurança.', 'success');
        } catch (error) {
          console.error('Erro ao salvar foto:', error);
          alert(error.message || 'Erro ao salvar a foto. Tente novamente.');
        }
      }
    };

    document.body.appendChild(input);
    input.click();
    input.addEventListener('change', () => input.remove(), { once: true });
  };

  const loadAvailability = async () => {
    try {
      const profile = await apiService.getProfile();
      if (profile.disponibilidade) {
        setAvailability(profile.disponibilidade);
      } else {
        // Valores padrão
        setAvailability({
          segunda: { inicio: '08:00', fim: '18:00', disponivel: true },
          terca: { inicio: '08:00', fim: '18:00', disponivel: true },
          quarta: { inicio: '08:00', fim: '18:00', disponivel: true },
          quinta: { inicio: '08:00', fim: '18:00', disponivel: true },
          sexta: { inicio: '08:00', fim: '18:00', disponivel: true },
          sabado: { inicio: '08:00', fim: '14:00', disponivel: false },
          domingo: { inicio: '08:00', fim: '14:00', disponivel: false }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
    }
  };

  const loadBreaks = async () => {
    try {
      const profile = await apiService.getProfile();
      setBreaks(Array.isArray(profile.pausas) ? profile.pausas : []);
    } catch (error) {
      console.error('Erro ao carregar pausas:', error);
    }
  };

  const updateAgendamentoStatus = async (agendamentoId, novoStatus) => {
    try {
      await apiService.updateAgendamentoStatus(agendamentoId, novoStatus);
      await loadAgendamentos();
      
      const mensagemStatus = {
        'agendado': 'confirmado',
        'cancelado': 'cancelado',
        'realizado': 'marcado como realizado'
      }[novoStatus] || novoStatus;
      
      addNotification(
        'Status Atualizado',
        `Agendamento ${mensagemStatus} com sucesso.`,
        'success'
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      addNotification('Erro', 'Erro ao atualizar status do agendamento.', 'error');
    }
  };

  const confirmarTodosAgendamentos = async () => {
    try {
      await Promise.all(pendingConfirmations.map((agendamento) =>
        apiService.updateAgendamentoStatus(agendamento.id, 'confirmado')
      ));
      await loadAgendamentos();
      
      setPendingConfirmations([]);
      setShowConfirmModal(false);
      
      addNotification(
        'Agendamentos Confirmados',
        'Todos os agendamentos do dia foram confirmados com sucesso.',
        'success'
      );
    } catch (error) {
      console.error('Erro ao confirmar agendamentos:', error);
      addNotification('Erro', 'Erro ao confirmar agendamentos.', 'error');
    }
  };

  const addNotification = (titulo, mensagem, tipo) => {
    const novaNotificacao = {
      id: Date.now(),
      titulo,
      mensagem,
      tipo,
      timestamp: new Date()
    };
    
    setNotifications(prev => [novaNotificacao, ...prev.slice(0, 9)]);
    
    // Não auto-remover mais - usuário controla quando fechar
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, removidaPeloUsuario: true } : n
    ).filter(n => n.id !== id));
  };

  // Confirmar agendamento diretamente da notificação
  const confirmarAgendamentoNotificacao = async (agendamentoId) => {
    try {
      await apiService.updateAgendamentoStatus(agendamentoId, 'confirmado');
      
      // Remover notificação pendente
      setNotifications(prev => prev.filter(n => n.agendamentoId !== agendamentoId));
      
      // Não recarregar automaticamente - usuário controla as notificações
      
      alert('✅ Agendamento confirmado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao confirmar agendamento:', error);
      alert('❌ Erro ao confirmar agendamento');
    }
  };

  // Cancelar agendamento diretamente da notificação
  const cancelarAgendamentoNotificacao = async (agendamentoId) => {
    try {
      await apiService.updateAgendamentoStatus(agendamentoId, 'cancelado');
      setNotifications(prev => prev.filter(n => n.agendamentoId !== agendamentoId));
      alert('Agendamento cancelado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento:', error);
      alert('❌ Erro ao cancelar agendamento');
    }
  };

  // Mostrar modal de cancelamento com justificativa
  const abrirModalCancelamento = (agendamentoId) => {
    setCancelAgendamentoId(agendamentoId);
    setCancelJustificativa('');
    setShowCancelModal(true);
  };

  // Cancelar agendamento com justificativa
  const cancelarComJustificativa = async () => {
    if (!cancelJustificativa.trim()) {
      alert('❌ Por favor, informe a justificativa para o cancelamento.');
      return;
    }

    try {
      await apiService.cancelarAgendamento(cancelAgendamentoId, cancelJustificativa);
      await loadAgendamentos();
      setShowCancelModal(false);
      setCancelJustificativa('');
      setCancelAgendamentoId(null);
      addNotification(
        'Agendamento Cancelado',
        'Agendamento cancelado com sucesso. Justificativa enviada ao cliente.',
        'success'
      );
    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento:', error);
      alert('❌ Erro ao cancelar agendamento');
    }
  };

  const loadFuncionarioNotifications = (source = agendamentos) => {
    const apiNotifications = source
      .filter((appointment) => ['em_aprovacao', 'agendado', 'confirmado'].includes(appointment.status))
      .slice(0, 10)
      .map((appointment) => ({
        id: `agendamento_${appointment.id}`,
        titulo: appointment.status === 'em_aprovacao' ? 'Novo agendamento' : 'Agenda atualizada',
        mensagem: `${appointment.clienteNome} · ${appointment.servicoNome} · ${formatAppointmentDate(appointment.data)} às ${appointment.horario}`,
        tipo: appointment.status === 'em_aprovacao' ? 'info' : 'success',
        timestamp: new Date(`${appointment.data}T${appointment.horario}`),
        acao: appointment.status,
        podeConfirmar: appointment.status === 'em_aprovacao',
        podeCancelar: appointment.status !== 'cancelado',
        agendamentoId: appointment.id,
        removidaPeloUsuario: false
      }));
    setNotifications((previous) => [
      ...apiNotifications,
      ...previous.filter((notification) => !String(notification.id).startsWith('agendamento_'))
    ].slice(0, 12));
  };

  const saveProfileData = async () => {
    try {
      await apiService.updateProfile({ telefone: profileData.telefone });
      setIsEditingProfile(false);
      
      addNotification('Contato Atualizado', 'Telefone salvo com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      addNotification('Erro', 'Erro ao salvar dados de contato.', 'error');
    }
  };

  const saveAvailability = async () => {
    try {
      await apiService.updateProfile({ disponibilidade: availability });
      addNotification('Horários Salvos', 'Disponibilidade salva com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao salvar disponibilidade:', error);
      addNotification('Erro', 'Erro ao salvar horários.', 'error');
    }
  };

  const addBreak = () => {
    const novaPausa = {
      id: Date.now(),
      nome: '',
      inicio: '12:00',
      fim: '13:00',
      dias: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
    };
    setBreaks(prev => [...prev, novaPausa]);
  };

  const removeBreak = (id) => {
    setBreaks(prev => prev.filter(pausa => pausa.id !== id));
  };

  const updateBreak = (id, campo, valor) => {
    setBreaks(prev => prev.map(pausa => {
      if (pausa.id === id) {
        return { ...pausa, [campo]: valor };
      }
      return pausa;
    }));
  };

  const toggleBreakDay = (breakId, dia) => {
    setBreaks(prev => prev.map(pausa => {
      if (pausa.id === breakId) {
        const dias = pausa.dias.includes(dia)
          ? pausa.dias.filter(d => d !== dia)
          : [...pausa.dias, dia];
        return { ...pausa, dias };
      }
      return pausa;
    }));
  };

  const saveBreaks = async () => {
    try {
      await apiService.updateProfile({ pausas: breaks });
      addNotification('Pausas Salvas', 'Configuração de pausas salva com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao salvar pausas:', error);
      addNotification('Erro', 'Erro ao salvar configuração de pausas.', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'em_aprovacao': return 'text-amber-700 bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300';
      case 'confirmado': return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'agendado': return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'cancelado': return 'text-red-700 bg-red-100 dark:bg-red-950/50 dark:text-red-300';
      case 'realizado': return 'text-blue-700 bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300';
      case 'pendente': return 'text-amber-700 bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300';
      default: return 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'em_aprovacao': return 'Em Aprovação';
      case 'confirmado': return 'Confirmado';
      case 'agendado': return 'Agendado';
      case 'cancelado': return 'Cancelado';
      case 'realizado': return 'Realizado';
      case 'pendente': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const formatAppointmentDate = (date) => {
    if (!date || date === 'Data não informada') return 'Data não informada';
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  };

  const renderAppointmentActions = (agendamento) => {
    if (['em_aprovacao', 'pendente'].includes(agendamento.status)) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateAgendamentoStatus(agendamento.id, 'agendado')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirmar
          </button>
          <button
            type="button"
            onClick={() => updateAgendamentoStatus(agendamento.id, 'cancelado')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:hover:bg-red-950/40"
          >
            <X className="h-4 w-4" />
            Recusar
          </button>
        </div>
      );
    }

    if (['confirmado', 'agendado'].includes(agendamento.status)) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateAgendamentoStatus(agendamento.id, 'realizado')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Concluir
          </button>
          <button
            type="button"
            onClick={() => abrirModalCancelamento(agendamento.id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
        </div>
      );
    }

    return <span className="text-xs font-semibold text-slate-400">Sem ações pendentes</span>;
  };

  const pendingCount = agendamentos.filter((item) =>
    ['em_aprovacao', 'pendente'].includes(item.status)
  ).length;
  const confirmedCount = agendamentos.filter((item) =>
    ['confirmado', 'agendado'].includes(item.status)
  ).length;
  const completedCount = agendamentos.filter((item) => item.status === 'realizado').length;
  const uniqueClientsCount = new Set(
    agendamentos.map((item) => item.cliente_id || item.clienteId || item.clienteNome).filter(Boolean)
  ).size;
  const todayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  }).format(new Date());
  const dayLabels = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-11 w-11 border-2 border-slate-200 border-t-blue-600 mx-auto mb-4 dark:border-slate-800 dark:border-t-cyan-400"></div>
          <p className="text-slate-600 dark:text-slate-300">
            {authLoading ? 'Verificando autenticação...' : 'Carregando agenda...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex min-h-20 items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">TimeFlow</p>
                  <h1 className="truncate text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">Área do Funcionário</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Abrir notificações"
                aria-expanded={showNotifications}
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={loadFuncionarioNotifications}
                className="hidden rounded-xl border border-slate-200 p-2.5 text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:block"
                aria-label="Atualizar notificações"
              >
                <RefreshCw className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={handleLogoUpload}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-left transition-colors hover:border-blue-200 dark:border-slate-700 dark:bg-slate-900"
                title="Alterar foto do perfil"
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                  {profileData?.foto ? (
                    <img src={profileData.foto} alt="Foto do funcionário" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block max-w-36 truncate text-sm font-bold text-slate-900 dark:text-white">{profileData.nome || currentUser?.nome || 'Funcionário'}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{profileData.cargo || 'Funcionário'}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await logout('funcionario');
                    navigate('/', { replace: true });
                  } catch (error) {
                    console.error('Erro no logout:', error);
                    navigate('/', { replace: true });
                  }
                }}
                className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40"
                aria-label="Sair da conta"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-2" aria-label="Navegação da área do funcionário">
              {[
                { id: 'agenda', label: 'Agenda', icon: Calendar },
                { id: 'perfil', label: 'Perfil', icon: User },
                { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
                { id: 'horarios', label: 'Horários', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="hidden flex-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 md:flex"
            >
              <Home className="h-4 w-4" />
              Início
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      {showNotifications && (
        <aside className="fixed right-4 top-24 z-50 flex max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900 sm:right-6">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-400">Central</p>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Notificações</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Fechar notificações"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto p-4">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <Bell className="h-5 w-5" />
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-100">Tudo em dia</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Nenhuma notificação nova.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`relative rounded-xl border p-4 ${
                      notification.tipo === 'success' ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30' :
                      notification.tipo === 'warning' ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30' :
                      notification.tipo === 'error' ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30' :
                      'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30'
                    } ${!notification.lida ? 'ring-2 ring-blue-200/70 dark:ring-blue-800' : ''}`}
                  >
                    {!notification.lida && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white">{notification.titulo}</h4>
                        <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{notification.mensagem}</p>
                        <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>

                        {notification.acao === 'pendente' && notification.podeConfirmar && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => confirmarAgendamentoNotificacao(notification.agendamentoId)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelarAgendamentoNotificacao(notification.agendamentoId)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:hover:bg-red-950/50"
                            >
                              <X className="h-4 w-4" />
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNotification(notification.id)}
                        className="rounded-md p-1 text-slate-400 hover:bg-white/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label={`Remover notificação: ${notification.titulo}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
              Confirmar Agendamentos do Dia
            </h3>
            <p className="mb-6 mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Você tem {pendingConfirmations.length} agendamento(s) pendente(s) para hoje.
              Deseja confirmar todos?
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarTodosAgendamentos}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
              >
                Confirmar Todos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal with Justification */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
            </span>
            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
              Cancelar Agendamento
            </h3>
            <p className="mb-4 mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Você está prestes a cancelar um agendamento já confirmado. 
              Por favor, informe a justificativa que será enviada ao cliente.
            </p>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                Justificativa *
              </label>
              <textarea
                value={cancelJustificativa}
                onChange={(e) => setCancelJustificativa(e.target.value)}
                placeholder="Ex: Horário indisponível, emergência médica, etc..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                rows={4}
                maxLength={500}
              />
              <p className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
                {cancelJustificativa.length}/500 caracteres
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelJustificativa('');
                  setCancelAgendamentoId(null);
                }}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={cancelarComJustificativa}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

        {/* Tab Content */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-950/10 dark:border dark:border-slate-800">
              <div className="grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Visão do dia</p>
                  <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                    Olá, {(profileData.nome || currentUser?.nome || 'profissional').split(' ')[0]}.
                  </h2>
                  <p className="mt-2 capitalize text-slate-300">{todayLabel}</p>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                    Você tem {agendamentosHoje.length} atendimento(s) hoje, {confirmedCount} confirmado(s) na agenda e {completedCount} concluído(s) no histórico.
                  </p>
                </div>
                {pendingConfirmations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-slate-950 transition-colors hover:bg-amber-300"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Revisar {pendingConfirmations.length} pendência(s)
                  </button>
                )}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo da agenda">
              {[
                { label: 'Atendimentos hoje', value: agendamentosHoje.length, icon: CalendarDays, tone: 'blue' },
                { label: 'Aguardando resposta', value: pendingCount, icon: AlertCircle, tone: 'amber' },
                { label: 'Concluídos', value: completedCount, icon: CheckCircle2, tone: 'emerald' },
                { label: 'Clientes atendidos', value: uniqueClientsCount, icon: Users, tone: 'cyan' }
              ].map((item) => {
                const Icon = item.icon;
                const tones = {
                  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'
                };

                return (
                  <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                        <p className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">{item.value}</p>
                      </div>
                      <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${tones[item.tone]}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Agendamentos de Hoje */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-cyan-400">Hoje</p>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">Próximos atendimentos</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Acompanhe e atualize o andamento do seu dia.</p>
                </div>
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Clock className="h-5 w-5" />
                </span>
              </div>
              
              {agendamentosHoje.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-950/50">
                  <Calendar className="mx-auto mb-3 h-9 w-9 text-slate-400" />
                  <p className="font-bold text-slate-800 dark:text-slate-100">Agenda livre hoje</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Novos agendamentos aparecerão automaticamente aqui.</p>
                </div>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {agendamentosHoje.map(agendamento => (
                    <article key={agendamento.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-3">
                            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white text-lg font-extrabold text-blue-700 shadow-sm dark:bg-slate-800 dark:text-cyan-300">
                              {agendamento.horario?.slice(0, 2) || '--'}
                            </span>
                            <div className="min-w-0">
                              <h3 className="truncate font-extrabold text-slate-900 dark:text-white">{agendamento.servicoNome}</h3>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{agendamento.clienteNome}</p>
                              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Horário: {agendamento.horario}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                              {getStatusText(agendamento.status)}
                            </span>
                          </div>
                        </div>
                        {renderAppointmentActions(agendamento)}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Lista de Todos os Agendamentos */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-cyan-400">Histórico</p>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">Todos os agendamentos</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pendências aparecem primeiro para facilitar sua rotina.</p>
                </div>
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <ClipboardList className="h-5 w-5" />
                </span>
              </div>
              
              {agendamentos.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <ClipboardList className="mx-auto mb-3 h-9 w-9 text-slate-400" />
                  <p className="font-bold text-slate-800 dark:text-slate-100">Nenhum agendamento encontrado</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">O histórico ficará disponível assim que houver reservas.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-950/60">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:px-6">
                          Data
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Horário
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Cliente
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Serviço
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Status
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                      {agendamentos.map(agendamento => {
                        const precisaResposta = ['em_aprovacao', 'pendente'].includes(agendamento.status);
                        return (
                        <tr key={agendamento.id} className={precisaResposta ? 'border-l-4 border-amber-400 bg-amber-50/70 dark:bg-amber-950/20' : 'transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50'}>
                          <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white sm:px-6">
                            {formatAppointmentDate(agendamento.data)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {agendamento.horario}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                            {agendamento.clienteNome}
                          </td>
                          <td className="max-w-56 px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {agendamento.servicoNome}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                              {getStatusText(agendamento.status)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm font-medium">
                            {renderAppointmentActions(agendamento)}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'perfil' && (
          <FuncionarioProfileTab
            isEditing={isEditingProfile}
            onEditingChange={setIsEditingProfile}
            profileData={profileData}
            onProfileDataChange={setProfileData}
            onSave={saveProfileData}
          />
        )}

        {activeTab === 'estatisticas' && (
          <FuncionarioStatsTab agendamentos={agendamentos} />
        )}

        {/* Aba Horários */}
        {activeTab === 'horarios' && (
          <div className="space-y-6">
            {/* Disponibilidade */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-400">Jornada semanal</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">Minha disponibilidade</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Defina os dias e horários em que você pode receber clientes.</p>
                </div>
                <button
                  type="button"
                  onClick={saveAvailability}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar disponibilidade</span>
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(availability).map(([dia, config]) => (
                  <article key={dia} className={`rounded-xl border p-4 transition-colors ${config.disponivel ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50'}`}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-extrabold text-slate-900 dark:text-white">{dayLabels[dia] || dia}</h3>
                      <label className="flex cursor-pointer items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm dark:bg-slate-900">
                        <input
                          type="checkbox"
                          checked={config.disponivel}
                          onChange={(e) => setAvailability(prev => ({
                            ...prev,
                            [dia]: { ...prev[dia], disponivel: e.target.checked }
                          }))}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-950"
                        />
                        <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-200">Disponível</span>
                      </label>
                    </div>
                    
                    {config.disponivel && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Início
                          </label>
                          <input
                            type="time"
                            value={config.inicio}
                            onChange={(e) => setAvailability(prev => ({
                              ...prev,
                              [dia]: { ...prev[dia], inicio: e.target.value }
                            }))}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Fim
                          </label>
                          <input
                            type="time"
                            value={config.fim}
                            onChange={(e) => setAvailability(prev => ({
                              ...prev,
                              [dia]: { ...prev[dia], fim: e.target.value }
                            }))}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {/* Pausas e Intervalos */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-400">Bloqueios recorrentes</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">Pausas e intervalos</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Reserve horários para almoço, café ou compromissos fixos.</p>
                </div>
                <button
                  type="button"
                  onClick={addBreak}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                >
                  <Coffee className="h-4 w-4" />
                  <span>Adicionar pausa</span>
                </button>
              </div>

              {breaks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-950/50">
                  <Coffee className="mx-auto mb-3 h-9 w-9 text-slate-400" />
                  <p className="font-bold text-slate-800 dark:text-slate-100">Nenhuma pausa configurada</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Adicione pausas para intervalos, almoço, café, etc.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {breaks.map(pausa => (
                    <article key={pausa.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                      <div className="mb-4 flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="Nome da pausa (ex: Almoço, Café)"
                          value={pausa.nome}
                          onChange={(e) => updateBreak(pausa.id, 'nome', e.target.value)}
                          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeBreak(pausa.id)}
                          className="ml-3 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                          aria-label={`Remover pausa ${pausa.nome || ''}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Início
                          </label>
                          <input
                            type="time"
                            value={pausa.inicio}
                            onChange={(e) => updateBreak(pausa.id, 'inicio', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Fim
                          </label>
                          <input
                            type="time"
                            value={pausa.fim}
                            onChange={(e) => updateBreak(pausa.id, 'fim', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Dias da Semana
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map(dia => (
                            <label key={dia} className="flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                              <input
                                type="checkbox"
                                checked={pausa.dias.includes(dia)}
                                onChange={() => toggleBreakDay(pausa.id, dia)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-950"
                              />
                              <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-200">{dayLabels[dia] || dia}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={saveBreaks}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar pausas</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default FuncionarioAgenda;
