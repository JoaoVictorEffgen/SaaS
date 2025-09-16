import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Star, 
  MessageSquare, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  LogOut
} from 'lucide-react';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import LoginStatusIndicator from '../shared/LoginStatusIndicator';
import AvaliacaoModal from './AvaliacaoModal';

const ClienteAgendamentos = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useLocalAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [agendamentoParaAvaliar, setAgendamentoParaAvaliar] = useState(null);
  const [empresaParaAvaliar, setEmpresaParaAvaliar] = useState(null);
  const [funcionarioParaAvaliar, setFuncionarioParaAvaliar] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    loadAgendamentos();
  }, [currentUser, navigate]);

  const loadAgendamentos = () => {
    try {
      const todosAgendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
      const agendamentosCliente = todosAgendamentos.filter(ag => 
        ag.cliente_email === currentUser.email
      );

      // Ordenar por data (mais recentes primeiro)
      agendamentosCliente.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      setAgendamentos(agendamentosCliente);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'concluido':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'cancelado':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pendente':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'concluido':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarHora = (hora) => {
    return hora.substring(0, 5);
  };

  const podeAvaliar = (agendamento) => {
    return agendamento.status === 'concluido' && !agendamento.avaliado;
  };

  const handleAvaliar = (agendamento) => {
    // Buscar dados da empresa e funcionário
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    
    const empresa = empresas.find(e => e.id === agendamento.empresa_id);
    const funcionario = funcionarios.find(f => f.id === agendamento.funcionario_id);
    
    setEmpresaParaAvaliar(empresa);
    setFuncionarioParaAvaliar(funcionario);
    setAgendamentoParaAvaliar(agendamento);
    setShowAvaliacaoModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Início</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Meus Agendamentos</h1>
            </div>
            
            <LoginStatusIndicator />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {agendamentos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum agendamento encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Você ainda não fez nenhum agendamento. Que tal agendar um serviço?
            </p>
            <button
              onClick={() => navigate('/cliente')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Calendar className="w-5 h-5" />
              Fazer Agendamento
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Resumo dos Agendamentos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{agendamentos.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {agendamentos.filter(a => a.status === 'concluido').length}
                  </div>
                  <div className="text-sm text-gray-600">Concluídos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {agendamentos.filter(a => a.status === 'confirmado').length}
                  </div>
                  <div className="text-sm text-gray-600">Confirmados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {agendamentos.filter(a => a.status === 'cancelado').length}
                  </div>
                  <div className="text-sm text-gray-600">Cancelados</div>
                </div>
              </div>
            </div>

            {/* Lista de Agendamentos */}
            <div className="space-y-4">
              {agendamentos.map((agendamento) => (
                <div key={agendamento.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(agendamento.status)}
                        <h3 className="text-lg font-medium text-gray-900">
                          {agendamento.servico_nome || 'Serviço'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                          {getStatusText(agendamento.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Data:</span>
                          <span className="font-medium">{formatarData(agendamento.data)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Horário:</span>
                          <span className="font-medium">{formatarHora(agendamento.hora_inicio)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Funcionário:</span>
                          <span className="font-medium">{agendamento.funcionario_nome || 'Não definido'}</span>
                        </div>
                      </div>

                      {agendamento.observacoes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Observações:</p>
                              <p className="text-sm text-gray-600">{agendamento.observacoes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2 ml-6">
                      {podeAvaliar(agendamento) && (
                        <button
                          onClick={() => handleAvaliar(agendamento)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                        >
                          <Star className="w-4 h-4" />
                          Avaliar
                        </button>
                      )}
                      
                      {agendamento.avaliado && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                          <Star className="w-4 h-4 fill-current" />
                          Avaliado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Avaliação */}
      {showAvaliacaoModal && (
        <AvaliacaoModal
          isOpen={showAvaliacaoModal}
          onClose={() => setShowAvaliacaoModal(false)}
          empresa={empresaParaAvaliar}
          funcionario={funcionarioParaAvaliar}
          agendamento={agendamentoParaAvaliar}
          onAvaliar={loadAgendamentos}
        />
      )}
    </div>
  );
};

export default ClienteAgendamentos;
