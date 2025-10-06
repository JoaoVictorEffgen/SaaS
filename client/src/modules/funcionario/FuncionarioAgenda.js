import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Home, 
  Bell, 
  CheckSquare, 
  Coffee, 
  Star, 
  Edit, 
  Save, 
  X,
  BarChart3,
  ClipboardList,
  RefreshCw
} from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import localStorageService from '../../services/localStorageService';

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
    console.log('🔄 FuncionarioAgenda - useEffect triggered');
    console.log('Auth loading:', authLoading);
    console.log('Current user:', currentUser);

    // Aguardar o contexto de autenticação carregar
    if (authLoading) {
      console.log('⏳ Aguardando contexto de autenticação...');
      return;
    }

    const loadData = async () => {
      try {
        console.log('🔍 Verificando usuário atual:', currentUser);
        
        if (!currentUser) {
          console.log('❌ FuncionarioAgenda - Nenhum usuário logado, redirecionando...');
          console.log('🔍 currentUser:', currentUser);
          navigate('/');
          return;
        }

        if (currentUser.tipo !== 'funcionario') {
          console.log('❌ FuncionarioAgenda - Usuário não é funcionário, redirecionando...');
          console.log('🔍 Tipo do usuário:', currentUser.tipo);
          console.log('🔍 Usuário completo:', currentUser);
          navigate('/');
          return;
        }

        console.log('✅ Usuário funcionário válido, carregando dados...');

        await Promise.all([
          loadAgendamentos(),
          loadProfileData(),
          loadAvailability(),
          loadBreaks(),
          checkPendingConfirmations()
        ]);

        // Carregar notificações do funcionário
        loadFuncionarioNotifications();

        setLoading(false);
        console.log('✅ Dados carregados com sucesso');
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, authLoading, navigate]);

  // Escutar mudanças no localStorage para atualizações em tempo real
  useEffect(() => {
    if (!currentUser?.id) return;

    const handleStorageChange = (e) => {
      if (e.key === `notifications_funcionario_${currentUser.id}`) {
        console.log('🔔 Nova notificação detectada, atualizando...');
        loadFuncionarioNotifications();
      }
    };

    // Escutar mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);

    // Escutar eventos customizados (para mudanças na mesma aba)
    const handleCustomEvent = () => {
      console.log('🔔 Evento customizado de notificação detectado');
      // Só carregar novas notificações, não recarregar todas
      loadFuncionarioNotifications();
    };

    window.addEventListener('notificationUpdate', handleCustomEvent);

    // Remover intervalo automático - usuário controla quando atualizar

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notificationUpdate', handleCustomEvent);
    };
  }, [currentUser?.id]);

  // Timer para verificar automaticamente agendamentos que devem ser marcados como realizados
  useEffect(() => {
    if (!currentUser?.id) return;

    const checkAutoRealizados = () => {
      console.log('⏰ Verificando agendamentos para auto-marcação como realizados...');
      loadAgendamentos();
    };

    // Verificar imediatamente
    checkAutoRealizados();

    // Verificar a cada 5 minutos
    const interval = setInterval(checkAutoRealizados, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const loadAgendamentos = async () => {
    try {
      console.log('🔍 Carregando agendamentos para funcionário:', currentUser.id);
      
      const agendamentosData = JSON.parse(localStorage.getItem('agendamentos') || '[]');
      console.log('📋 Todos os agendamentos:', agendamentosData);
      
      const funcionarioAgendamentos = agendamentosData.filter(
        agendamento => agendamento.funcionario_id === currentUser.id
      );
      
      console.log('👤 Agendamentos do funcionário:', funcionarioAgendamentos);
      
      // Verificar e marcar automaticamente agendamentos que já passaram como realizados
      const agora = new Date();
      let agendamentosAtualizados = false;
      
      const agendamentosComAutoRealizado = funcionarioAgendamentos.map(agendamento => {
        // Verificar se o agendamento já passou da data/hora e ainda não foi cancelado/realizado
        if (agendamento.status === 'agendado' || agendamento.status === 'confirmado') {
          const dataAgendamento = new Date(`${agendamento.data}T${agendamento.hora}`);
          
          // Se já passou da data/hora (com margem de 30 minutos para evitar problemas de timezone)
          if (dataAgendamento.getTime() < (agora.getTime() - (30 * 60 * 1000))) {
            console.log('⏰ Auto-marcando como realizado:', {
              id: agendamento.id,
              data: agendamento.data,
              hora: agendamento.hora,
              status: agendamento.status
            });
            
            agendamentosAtualizados = true;
            return {
              ...agendamento,
              status: 'realizado',
              dataRealizacao: agora.toISOString()
            };
          }
        }
        return agendamento;
      });
      
      // Se houve atualizações, salvar no localStorage
      if (agendamentosAtualizados) {
        const todosAgendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
        const todosAtualizados = todosAgendamentos.map(agendamento => {
          const atualizado = agendamentosComAutoRealizado.find(a => a.id === agendamento.id);
          return atualizado || agendamento;
        });
        
        localStorage.setItem('agendamentos', JSON.stringify(todosAtualizados));
        
        // Atualizar também na chave específica da empresa
        const empresaIds = [...new Set(agendamentosComAutoRealizado.map(a => a.empresa_id))];
        empresaIds.forEach(empresaId => {
          const agendamentosEmpresa = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
          const agendamentosEmpresaAtualizados = agendamentosEmpresa.map(agendamento => {
            const atualizado = agendamentosComAutoRealizado.find(a => a.id === agendamento.id);
            return atualizado || agendamento;
          });
          localStorage.setItem(`agendamentos_${empresaId}`, JSON.stringify(agendamentosEmpresaAtualizados));
        });
        
        console.log('✅ Agendamentos auto-marcados como realizados salvos no localStorage');
        
        // Notificar o funcionário sobre os agendamentos auto-marcados
        const autoRealizados = agendamentosComAutoRealizado.filter(a => a.status === 'realizado' && a.dataRealizacao);
        if (autoRealizados.length > 0) {
          addNotification(
            'Agendamentos Auto-Marcados',
            `${autoRealizados.length} agendamento(s) foram automaticamente marcados como realizados por terem passado da data/hora prevista.`,
            'info'
          );
        }
        
        // Usar os agendamentos atualizados para continuar o processamento
        funcionarioAgendamentos.splice(0, funcionarioAgendamentos.length, ...agendamentosComAutoRealizado);
      }
      
      // Mapear dados corretamente
      const agendamentosMapeados = funcionarioAgendamentos.map(agendamento => ({
        ...agendamento,
        // Garantir que os campos estão corretos
        clienteNome: agendamento.cliente_nome || agendamento.clienteNome || 'Cliente não informado',
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
        
        // Status que não precisam de resposta (prioridade baixa)
        const naoPrecisaResposta = (status) => ['cancelado', 'agendado', 'confirmado', 'realizado'].includes(status);
        
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
        
        const resultado = dataA - dataB;
        console.log(`📅 Ordenação por data: ${resultado > 0 ? 'b vem primeiro' : resultado < 0 ? 'a vem primeiro' : 'iguais'}`);
        
        return resultado; // Ordem crescente (mais antigo primeiro)
      });
      
      console.log('✅ Agendamentos mapeados e ordenados:', agendamentosOrdenados);
      setAgendamentos(agendamentosOrdenados);

      // Filtrar agendamentos de hoje
      const hoje = new Date().toISOString().split('T')[0];
      const hojeAgendamentos = agendamentosOrdenados.filter(
        agendamento => agendamento.data === hoje
      );
      setAgendamentosHoje(hojeAgendamentos);
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      // Buscar funcionários da empresa específica
      const funcionarios = JSON.parse(localStorage.getItem(`funcionarios_${currentUser.empresa_id}`) || '[]');
      const funcionario = funcionarios.find(f => f.id === currentUser.id);
      
      if (funcionario) {
        setProfileData({
          nome: funcionario.nome_completo || `${funcionario.nome} ${funcionario.sobrenome}`,
          cpf: funcionario.cpf,
          telefone: funcionario.telefone,
          email: funcionario.email || `funcionario_${funcionario.cpf}@empresa.com`,
          cargo: funcionario.cargo || 'Funcionário',
          foto: funcionario.foto
        });
      } else {
        // Se não encontrou, usar dados do currentUser
        setProfileData({
          nome: currentUser.nome_completo || currentUser.nome,
          cpf: currentUser.cpf,
          telefone: currentUser.telefone,
          email: currentUser.email,
          cargo: currentUser.cargo || 'Funcionário',
          foto: currentUser.foto
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Fallback: usar dados do currentUser
      setProfileData({
        nome: currentUser.nome_completo || currentUser.nome,
        cpf: currentUser.cpf,
        telefone: currentUser.telefone,
        email: currentUser.email,
        cargo: currentUser.cargo || 'Funcionário',
        foto: currentUser.foto
      });
    }
  };

  const handleLogoUpload = () => {
    // Criar input de arquivo temporário
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validar tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('A imagem deve ter no máximo 5MB.');
          return;
        }
        
        // Validar tipo do arquivo
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecione apenas arquivos de imagem.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const fotoUrl = e.target.result;
          
          // Atualizar estado local
          setProfileData(prev => ({ ...prev, foto: fotoUrl }));
          
          // Salvar no localStorage da empresa
          try {
            const funcionarios = JSON.parse(localStorage.getItem(`funcionarios_${currentUser.empresa_id}`) || '[]');
            const funcionarioIndex = funcionarios.findIndex(f => f.id === currentUser.id);
            
            if (funcionarioIndex !== -1) {
              funcionarios[funcionarioIndex].foto = fotoUrl;
              localStorage.setItem(`funcionarios_${currentUser.empresa_id}`, JSON.stringify(funcionarios));
              
              // Atualizar também no currentUser
              const updatedUser = { ...currentUser, foto: fotoUrl };
              localStorage.setItem('funcionarioSession', JSON.stringify(updatedUser));
              
              console.log('✅ Foto do funcionário atualizada com sucesso');
            }
          } catch (error) {
            console.error('Erro ao salvar foto:', error);
            alert('Erro ao salvar a foto. Tente novamente.');
          }
        };
        
        reader.readAsDataURL(file);
      }
    };
    
    // Adicionar ao DOM e clicar
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const loadAvailability = async () => {
    try {
      const availabilityData = localStorage.getItem(`availability_${currentUser.id}`);
      if (availabilityData) {
        setAvailability(JSON.parse(availabilityData));
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
      const breaksData = localStorage.getItem(`breaks_${currentUser.id}`);
      if (breaksData) {
        setBreaks(JSON.parse(breaksData));
      }
    } catch (error) {
      console.error('Erro ao carregar pausas:', error);
    }
  };

  const checkPendingConfirmations = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const pendentes = agendamentos.filter(
        agendamento => agendamento.data === hoje && agendamento.status === 'pendente'
      );
      setPendingConfirmations(pendentes);
      
      if (pendentes.length > 0) {
        addNotification(
          'Confirmação Necessária',
          `Você tem ${pendentes.length} agendamento(s) pendente(s) para confirmar hoje.`,
          'warning'
        );
      }
    } catch (error) {
      console.error('Erro ao verificar confirmações:', error);
    }
  };

  const updateAgendamentoStatus = async (agendamentoId, novoStatus) => {
    try {
      console.log('🔄 Atualizando status do agendamento:', { agendamentoId, novoStatus });
      
      if (novoStatus === 'agendado') {
        // Usar o localStorageService para confirmar
        localStorageService.confirmarAgendamento(agendamentoId);
      } else if (novoStatus === 'cancelado') {
        // Usar o localStorageService para cancelar
        const resultado = localStorageService.cancelarAgendamento(agendamentoId);
        if (!resultado.sucesso) {
          alert(`❌ Erro ao cancelar: ${resultado.erro}`);
          return;
        }
      } else {
        // Para outros status, atualizar manualmente
        const agendamentosData = JSON.parse(localStorage.getItem('agendamentos') || '[]');
        const agendamentosAtualizados = agendamentosData.map(agendamento => {
          if (agendamento.id === agendamentoId) {
            return { ...agendamento, status: novoStatus };
          }
          return agendamento;
        });
        
        localStorage.setItem('agendamentos', JSON.stringify(agendamentosAtualizados));
        
        // Também atualizar na chave específica da empresa
        const agendamento = agendamentosData.find(a => a.id === agendamentoId);
        if (agendamento?.empresa_id) {
          const agendamentosEmpresa = JSON.parse(localStorage.getItem(`agendamentos_${agendamento.empresa_id}`) || '[]');
          const agendamentosEmpresaAtualizados = agendamentosEmpresa.map(a => {
            if (a.id === agendamentoId) {
              return { ...a, status: novoStatus };
            }
            return a;
          });
          localStorage.setItem(`agendamentos_${agendamento.empresa_id}`, JSON.stringify(agendamentosEmpresaAtualizados));
        }
      }
      
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
      const agendamentosData = JSON.parse(localStorage.getItem('agendamentos') || '[]');
      const agendamentosAtualizados = agendamentosData.map(agendamento => {
        if (pendingConfirmations.some(p => p.id === agendamento.id)) {
          return { ...agendamento, status: 'confirmado' };
        }
        return agendamento;
      });
      
      localStorage.setItem('agendamentos', JSON.stringify(agendamentosAtualizados));
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
    console.log('🗑️ Removendo notificação:', id);
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, removidaPeloUsuario: true } : n
    ).filter(n => n.id !== id));
  };

  // Confirmar agendamento diretamente da notificação
  const confirmarAgendamentoNotificacao = (agendamentoId) => {
    try {
      console.log('✅ Confirmando agendamento:', agendamentoId);
      localStorageService.confirmarAgendamento(agendamentoId);
      
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
  const cancelarAgendamentoNotificacao = (agendamentoId) => {
    try {
      console.log('❌ Cancelando agendamento:', agendamentoId);
      const resultado = localStorageService.cancelarAgendamento(agendamentoId);
      
      if (resultado.sucesso) {
        // Remover notificação pendente
        setNotifications(prev => prev.filter(n => n.agendamentoId !== agendamentoId));
        
        // Não recarregar automaticamente - usuário controla as notificações
        
        alert('❌ Agendamento cancelado com sucesso!');
      } else {
        alert(`❌ Não foi possível cancelar: ${resultado.erro}`);
      }
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
      console.log('❌ Cancelando agendamento com justificativa:', {
        agendamentoId: cancelAgendamentoId,
        justificativa: cancelJustificativa
      });

      const resultado = localStorageService.cancelarAgendamentoComJustificativa(cancelAgendamentoId, cancelJustificativa);
      
      if (resultado.sucesso) {
        await loadAgendamentos();
        setShowCancelModal(false);
        setCancelJustificativa('');
        setCancelAgendamentoId(null);
        
        addNotification(
          'Agendamento Cancelado',
          `Agendamento cancelado com sucesso. Justificativa enviada ao cliente.`,
          'success'
        );
      } else {
        alert(`❌ Não foi possível cancelar: ${resultado.erro}`);
      }
    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento:', error);
      alert('❌ Erro ao cancelar agendamento');
    }
  };

  // Carregar notificações específicas do funcionário
  const loadFuncionarioNotifications = () => {
    if (!currentUser?.id) {
      console.log('❌ loadFuncionarioNotifications: currentUser.id não encontrado');
      return;
    }
    
    try {
      console.log('🔍 Carregando notificações para funcionário:', currentUser.id);
      
      // Buscar notificações específicas do funcionário
      const funcionarioNotifications = JSON.parse(localStorage.getItem(`notifications_funcionario_${currentUser.id}`) || '[]');
      console.log('📋 Notificações encontradas:', funcionarioNotifications);
      
      // Converter para o formato esperado
      const notificacoesFormatadas = funcionarioNotifications.map(notif => ({
        id: `funcionario_${notif.id}`,
        titulo: notif.titulo || (notif.acao === 'confirmado' ? 'Agendamento Confirmado' : 
                                 notif.acao === 'cancelado' ? 'Agendamento Cancelado' : 
                                 'Novo Agendamento'),
        mensagem: notif.mensagem,
        tipo: notif.acao === 'confirmado' ? 'success' : 
              notif.acao === 'cancelado' ? 'error' : 'info',
        timestamp: new Date(notif.dataCriacao),
        lida: notif.lida || false,
        // Propriedades para ações
        acao: notif.acao,
        podeConfirmar: notif.podeConfirmar || false,
        podeCancelar: notif.podeCancelar || false,
        agendamentoId: notif.agendamentoId,
        clienteEmail: notif.clienteEmail,
        // Flag para controlar se já foi removida pelo usuário
        removidaPeloUsuario: false
      }));
      
      console.log('✅ Notificações formatadas:', notificacoesFormatadas);
      
      // Só adicionar notificações que não foram removidas pelo usuário
      setNotifications(prev => {
        const notificacoesExistentes = prev.filter(n => n.removidaPeloUsuario !== true);
        const novasNotificacoes = notificacoesFormatadas.filter(nova => 
          !notificacoesExistentes.some(existente => existente.id === nova.id)
        );
        
        return [...notificacoesExistentes, ...novasNotificacoes];
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar notificações do funcionário:', error);
    }
  };

  const saveProfileData = async () => {
    try {
      const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
      const funcionariosAtualizados = funcionarios.map(funcionario => {
        if (funcionario.id === currentUser.id) {
          // Salvar apenas os campos editáveis (telefone e email)
          return { 
            ...funcionario, 
            telefone: profileData.telefone,
            email: profileData.email
          };
        }
        return funcionario;
      });
      
      localStorage.setItem('funcionarios', JSON.stringify(funcionariosAtualizados));
      setIsEditingProfile(false);
      
      addNotification('Contato Atualizado', 'Telefone e email salvos com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      addNotification('Erro', 'Erro ao salvar dados de contato.', 'error');
    }
  };

  const saveAvailability = async () => {
    try {
      localStorage.setItem(`availability_${currentUser.id}`, JSON.stringify(availability));
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
      localStorage.setItem(`breaks_${currentUser.id}`, JSON.stringify(breaks));
      addNotification('Pausas Salvas', 'Configuração de pausas salva com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao salvar pausas:', error);
      addNotification('Erro', 'Erro ao salvar configuração de pausas.', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'em_aprovacao': return 'text-orange-600 bg-orange-100';
      case 'confirmado': return 'text-green-600 bg-green-100';
      case 'agendado': return 'text-green-600 bg-green-100';
      case 'cancelado': return 'text-red-600 bg-red-100';
      case 'realizado': return 'text-blue-600 bg-blue-100';
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Verificando autenticação...' : 'Carregando agenda...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header Moderno */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Seção Superior */}
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">Área do Funcionário</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Avatar do Usuário Clicável */}
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleLogoUpload}
                  title="Clique para alterar foto"
                >
                  {profileData?.foto ? (
                    <img 
                      src={profileData.foto} 
                      alt="Foto do funcionário" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
                <span className="text-gray-900 font-medium">{currentUser?.nome || 'Funcionário'}</span>
              </div>
            </div>
          </div>
          
          {/* Linha Divisória */}
          <div className="border-t border-gray-200"></div>
          
          {/* Barra de Navegação */}
          <div className="flex justify-between items-center py-4">
            <nav className="flex space-x-8">
              {[
                { id: 'agenda', label: 'Agenda', icon: Calendar },
                { id: 'perfil', label: 'Perfil', icon: User },
                { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
                { id: 'horarios', label: 'Horários', icon: Clock }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
            
            {/* Botões de Ação */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
                title="Notificações"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => {
                  console.log('🔄 Atualizando notificações manualmente...');
                  loadFuncionarioNotifications();
                }}
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                title="Atualizar Notificações"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              
              
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="font-medium">Início</span>
              </button>
              
              <button
                onClick={async () => {
                  try {
                    await logout('funcionario');
                    navigate('/', { replace: true });
                  } catch (error) {
                    console.error('Erro no logout:', error);
                    navigate('/', { replace: true });
                  }
                }}
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-20 right-4 z-50 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Fechar"
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma notificação</p>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 relative ${
                      notification.tipo === 'success' ? 'border-green-500 bg-green-50' :
                      notification.tipo === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      notification.tipo === 'error' ? 'border-red-500 bg-red-50' :
                      'border-blue-500 bg-blue-50'
                    } ${!notification.lida ? 'ring-2 ring-blue-200' : ''}`}
                  >
                    {/* Indicador de não lida */}
                    {!notification.lida && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                    
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.mensagem}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                        
                        {/* Botões de ação para agendamentos pendentes */}
                        {notification.acao === 'pendente' && notification.podeConfirmar && (
                          <div className="flex space-x-3 mt-3">
                            <button
                              onClick={() => confirmarAgendamentoNotificacao(notification.agendamentoId)}
                              className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-green-500 text-green-600 text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-green-50"
                            >
                              <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                              <span>Confirmar</span>
                            </button>
                            <button
                              onClick={() => cancelarAgendamentoNotificacao(notification.agendamentoId)}
                              className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-red-500 text-red-600 text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-red-50"
                            >
                              <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-bold">✕</span>
                              </div>
                              <span>Cancelar</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Agendamentos do Dia
            </h3>
            <p className="text-gray-600 mb-4">
              Você tem {pendingConfirmations.length} agendamento(s) pendente(s) para hoje.
              Deseja confirmar todos?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarTodosAgendamentos}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Confirmar Todos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal with Justification */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancelar Agendamento
            </h3>
            <p className="text-gray-600 mb-4">
              Você está prestes a cancelar um agendamento já confirmado. 
              Por favor, informe a justificativa que será enviada ao cliente.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificativa *
              </label>
              <textarea
                value={cancelJustificativa}
                onChange={(e) => setCancelJustificativa(e.target.value)}
                placeholder="Ex: Horário indisponível, emergência médica, etc..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {cancelJustificativa.length}/500 caracteres
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelJustificativa('');
                  setCancelAgendamentoId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={cancelarComJustificativa}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Tab Content */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            {/* Agendamentos de Hoje */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-600" />
                Agendamentos de Hoje
              </h2>
              
              {agendamentosHoje.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum agendamento para hoje</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {agendamentosHoje.map(agendamento => (
                    <div key={agendamento.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{agendamento.servicoNome}</h3>
                          <p className="text-sm text-gray-600">Cliente: {agendamento.clienteNome}</p>
                          <p className="text-sm text-gray-600">Horário: {agendamento.horario}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                              {getStatusText(agendamento.status)}
                            </span>
                          </div>
                        </div>
                        
                        {agendamento.status === 'pendente' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateAgendamentoStatus(agendamento.id, 'confirmado')}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => updateAgendamentoStatus(agendamento.id, 'cancelado')}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                        
                        {agendamento.status === 'confirmado' && (
                          <button
                            onClick={() => updateAgendamentoStatus(agendamento.id, 'realizado')}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                          >
                            Marcar Realizado
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de Todos os Agendamentos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-purple-600" />
                Todos os Agendamentos
              </h2>
              
              {agendamentos.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum agendamento encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Horário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serviço
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {agendamentos.map(agendamento => {
                        const precisaResposta = ['em_aprovacao', 'pendente'].includes(agendamento.status);
                        return (
                        <tr key={agendamento.id} className={precisaResposta ? 'bg-orange-50 border-l-4 border-orange-400' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(agendamento.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {agendamento.horario}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {agendamento.clienteNome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {agendamento.servicoNome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                              {getStatusText(agendamento.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {/* Botões para agendamentos em aprovação */}
                            {(agendamento.status === 'em_aprovacao' || agendamento.status === 'pendente') && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateAgendamentoStatus(agendamento.id, 'agendado')}
                                  className="flex items-center space-x-1 px-3 py-1 bg-white border-2 border-green-500 text-green-600 text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-green-50"
                                >
                                  <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center shadow-sm">
                                    <span className="text-white text-xs font-bold">✓</span>
                                  </div>
                                  <span>Confirmar</span>
                                </button>
                                <button
                                  onClick={() => updateAgendamentoStatus(agendamento.id, 'cancelado')}
                                  className="flex items-center space-x-1 px-3 py-1 bg-white border-2 border-red-500 text-red-600 text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-red-50"
                                >
                                  <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center shadow-sm">
                                    <span className="text-white text-xs font-bold">✕</span>
                                  </div>
                                  <span>Cancelar</span>
                                </button>
                              </div>
                            )}
                            
                            {/* Botão para agendamentos confirmados */}
                            {(agendamento.status === 'confirmado' || agendamento.status === 'agendado') && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateAgendamentoStatus(agendamento.id, 'realizado')}
                                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                >
                                  ✅ Realizado
                                </button>
                                <button
                                  onClick={() => abrirModalCancelamento(agendamento.id)}
                                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                >
                                  ❌ Cancelar
                                </button>
                              </div>
                            )}
                            
                            {/* Status final - sem ações */}
                            {(agendamento.status === 'realizado' || agendamento.status === 'cancelado') && (
                              <div className="flex flex-col items-center">
                                <span className="text-gray-400 text-xs">
                                  Finalizado
                                </span>
                                {agendamento.status === 'realizado' && agendamento.dataRealizacao && (
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full mt-1" title="Auto-marcado como realizado">
                                    Auto
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba Perfil */}
        {activeTab === 'perfil' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                Meu Perfil
              </h2>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar Contato</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveProfileData}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campos preenchidos automaticamente pela empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={profileData.nome || ''}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Definido pela empresa
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  value={profileData.cpf || ''}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Definido pela empresa
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  value={profileData.cargo || ''}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Definido pela empresa
                </p>
              </div>

              {/* Campos editáveis pelo funcionário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="text"
                  value={profileData.telefone || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
                    setProfileData(prev => ({ ...prev, telefone: value }));
                  }}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  maxLength={11}
                  placeholder="11999999999"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Você pode alterar seu telefone
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={profileData.email || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditingProfile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="seu@email.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Você pode alterar seu email
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Informações Importantes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Nome, CPF e cargo são definidos pela empresa</li>
                <li>• Você pode alterar apenas telefone e email</li>
                <li>• Seus horários de trabalho são gerenciados pela empresa</li>
                <li>• Mantenha seus dados de contato sempre atualizados</li>
              </ul>
            </div>
          </div>
        )}

        {/* Aba Estatísticas */}
        {activeTab === 'estatisticas' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Minhas Estatísticas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Agendamentos Realizados</p>
                    <p className="text-3xl font-bold">
                      {agendamentos.filter(a => a.status === 'realizado').length}
                    </p>
                  </div>
                  <CheckSquare className="h-8 w-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Taxa de Comparecimento</p>
                    <p className="text-3xl font-bold">
                      {agendamentos.length > 0 
                        ? Math.round((agendamentos.filter(a => a.status === 'realizado').length / agendamentos.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Total de Clientes</p>
                    <p className="text-3xl font-bold">
                      {new Set(agendamentos.map(a => a.clienteId)).size}
                    </p>
                  </div>
                  <User className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Avaliações dos Clientes</h3>
              <p className="text-gray-600">
                As avaliações dos clientes são gerenciadas pela empresa e ficam disponíveis 
                no sistema de gestão. Você pode solicitar feedback direto aos clientes 
                após a realização dos serviços.
              </p>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Dica:</strong> Sempre pergunte aos clientes como foi o atendimento 
                  e se ficaram satisfeitos com o serviço prestado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Aba Horários */}
        {activeTab === 'horarios' && (
          <div className="space-y-6">
            {/* Disponibilidade */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  Minha Disponibilidade
                </h2>
                <button
                  onClick={saveAvailability}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(availability).map(([dia, config]) => (
                  <div key={dia} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 capitalize">{dia}</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.disponivel}
                          onChange={(e) => setAvailability(prev => ({
                            ...prev,
                            [dia]: { ...prev[dia], disponivel: e.target.checked }
                          }))}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Disponível</span>
                      </label>
                    </div>
                    
                    {config.disponivel && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Início
                          </label>
                          <input
                            type="time"
                            value={config.inicio}
                            onChange={(e) => setAvailability(prev => ({
                              ...prev,
                              [dia]: { ...prev[dia], inicio: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fim
                          </label>
                          <input
                            type="time"
                            value={config.fim}
                            onChange={(e) => setAvailability(prev => ({
                              ...prev,
                              [dia]: { ...prev[dia], fim: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pausas e Intervalos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Coffee className="h-5 w-5 mr-2 text-purple-600" />
                  Pausas e Intervalos
                </h2>
                <button
                  onClick={addBreak}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Coffee className="h-4 w-4" />
                  <span>Adicionar Pausa</span>
                </button>
              </div>

              {breaks.length === 0 ? (
                <div className="text-center py-8">
                  <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma pausa configurada</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Adicione pausas para intervalos, almoço, café, etc.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {breaks.map(pausa => (
                    <div key={pausa.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <input
                          type="text"
                          placeholder="Nome da pausa (ex: Almoço, Café)"
                          value={pausa.nome}
                          onChange={(e) => updateBreak(pausa.id, 'nome', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => removeBreak(pausa.id)}
                          className="ml-3 p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Início
                          </label>
                          <input
                            type="time"
                            value={pausa.inicio}
                            onChange={(e) => updateBreak(pausa.id, 'inicio', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fim
                          </label>
                          <input
                            type="time"
                            value={pausa.fim}
                            onChange={(e) => updateBreak(pausa.id, 'fim', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dias da Semana
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map(dia => (
                            <label key={dia} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={pausa.dias.includes(dia)}
                                onChange={() => toggleBreakDay(pausa.id, dia)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 capitalize">{dia}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveBreaks}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar Pausas</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuncionarioAgenda;