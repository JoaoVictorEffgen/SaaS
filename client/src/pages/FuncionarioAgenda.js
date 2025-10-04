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
  ClipboardList
} from 'lucide-react';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import LoginStatusIndicator from '../components/shared/LoginStatusIndicator';

const FuncionarioAgenda = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useLocalAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('agenda');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingConfirmations, setPendingConfirmations] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({});
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

        setLoading(false);
        console.log('✅ Dados carregados com sucesso');
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, authLoading, navigate]);

  const loadAgendamentos = async () => {
    try {
      const agendamentosData = JSON.parse(localStorage.getItem('agendamentos') || '[]');
      const funcionarioAgendamentos = agendamentosData.filter(
        agendamento => agendamento.funcionarioId === currentUser.id
      );
      
      setAgendamentos(funcionarioAgendamentos);

      // Filtrar agendamentos de hoje
      const hoje = new Date().toISOString().split('T')[0];
      const hojeAgendamentos = funcionarioAgendamentos.filter(
        agendamento => agendamento.data === hoje
      );
      setAgendamentosHoje(hojeAgendamentos);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
      const funcionario = funcionarios.find(f => f.id === currentUser.id);
      
      if (funcionario) {
        setProfileData({
          nome: funcionario.nome,
          cpf: funcionario.cpf,
          telefone: funcionario.telefone,
          email: funcionario.email,
          cargo: funcionario.cargo || 'Funcionário'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
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
      const agendamentosData = JSON.parse(localStorage.getItem('agendamentos') || '[]');
      const agendamentosAtualizados = agendamentosData.map(agendamento => {
        if (agendamento.id === agendamentoId) {
          return { ...agendamento, status: novoStatus };
        }
        return agendamento;
      });
      
      localStorage.setItem('agendamentos', JSON.stringify(agendamentosAtualizados));
      await loadAgendamentos();
      
      addNotification(
        'Status Atualizado',
        `Agendamento ${novoStatus === 'confirmado' ? 'confirmado' : 'cancelado'} com sucesso.`,
        'success'
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
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
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== novaNotificacao.id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
      case 'confirmado': return 'text-green-600 bg-green-100';
      case 'cancelado': return 'text-red-600 bg-red-100';
      case 'realizado': return 'text-blue-600 bg-blue-100';
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Área do Funcionário</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {currentUser?.nome}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {pendingConfirmations.length > 0 && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Confirmar Hoje ({pendingConfirmations.length})</span>
                </button>
              )}
              
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Início</span>
              </button>
              
              <LoginStatusIndicator />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-20 right-4 z-50 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
          </div>
          <div className="p-4">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma notificação</p>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      notification.tipo === 'success' ? 'border-green-500 bg-green-50' :
                      notification.tipo === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      notification.tipo === 'error' ? 'border-red-500 bg-red-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{notification.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.mensagem}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
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
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

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
                      {agendamentos.map(agendamento => (
                        <tr key={agendamento.id}>
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
                            {agendamento.status === 'pendente' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateAgendamentoStatus(agendamento.id, 'confirmado')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => updateAgendamentoStatus(agendamento.id, 'cancelado')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Cancelar
                                </button>
                              </div>
                            )}
                            {agendamento.status === 'confirmado' && (
                              <button
                                onClick={() => updateAgendamentoStatus(agendamento.id, 'realizado')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Marcar Realizado
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
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