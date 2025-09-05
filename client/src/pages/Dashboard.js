import React, { useState, useEffect } from 'react';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import { useNavigate } from 'react-router-dom';
import localStorageService from '../services/localStorageService';
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  TrendingUp,
  DollarSign,
  MessageCircle,
  Briefcase,
  UserPlus,
  Image,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout, subscription, resetData } = useLocalAuth();
  const navigate = useNavigate();
  const [agendas, setAgendas] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = () => {
    const userAgendas = localStorageService.getAgendasByUser(user.id);
    const userAgendamentos = localStorageService.getAgendamentosByUser(user.id);
    setAgendas(userAgendas);
    setAgendamentos(userAgendamentos);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetData = () => {
    resetData();
    setShowResetModal(false);
    navigate('/login');
  };

  const deleteAgenda = (id) => {
    localStorageService.deleteAgenda(id);
    loadUserData();
  };

  const deleteAgendamento = (id) => {
    localStorageService.deleteAgendamento(id);
    loadUserData();
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">AgendaPro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user.nome}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendas</p>
                <p className="text-2xl font-semibold text-gray-900">{agendas.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-2xl font-semibold text-gray-900">{agendamentos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Plano</p>
                <p className="text-2xl font-semibold text-gray-900 capitalize">{subscription?.plano}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-semibold text-green-600 capitalize">{subscription?.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/servicos')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Serviços</p>
                <p className="text-xs text-gray-500">Gerenciar serviços</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/funcionarios')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Funcionários</p>
                <p className="text-xs text-gray-500">Gerenciar equipe</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/configuracoes')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Configurações</p>
                <p className="text-xs text-gray-500">Horários e preferências</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/notificacoes')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Notificações</p>
                <p className="text-xs text-gray-500">Email e WhatsApp</p>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agendas */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Minhas Agendas</h2>
                <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Agenda
                </button>
              </div>
            </div>
            <div className="p-6">
              {agendas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma agenda criada ainda</p>
              ) : (
                <div className="space-y-4">
                  {agendas.map((agenda) => (
                    <div key={agenda.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{agenda.titulo}</h3>
                          <p className="text-sm text-gray-600">
                            {agenda.data} • {agenda.hora_inicio} - {agenda.hora_fim}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duração: {agenda.duracao} min
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteAgenda(agenda.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Agendamentos */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Agendamentos</h2>
                <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Agendamento
                </button>
              </div>
            </div>
            <div className="p-6">
              {agendamentos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum agendamento ainda</p>
              ) : (
                <div className="space-y-4">
                  {agendamentos.map((agendamento) => (
                    <div key={agendamento.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{agendamento.cliente_nome}</h3>
                          <p className="text-sm text-gray-600">{agendamento.cliente_email}</p>
                          <p className="text-sm text-gray-600">
                            {agendamento.data} • {agendamento.hora_inicio}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            agendamento.status === 'confirmado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {agendamento.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteAgendamento(agendamento.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Informações do Plano</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">WhatsApp</h3>
                <p className="text-sm text-gray-600">
                  {subscription?.recursos?.whatsapp ? 'Incluído' : 'Não incluído'}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Relatórios</h3>
                <p className="text-sm text-gray-600">
                  {subscription?.recursos?.relatorios ? 'Incluído' : 'Não incluído'}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Multi-usuário</h3>
                <p className="text-sm text-gray-600">
                  {subscription?.recursos?.multiusuario ? 'Incluído' : 'Não incluído'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Development Tools */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Ferramentas de Desenvolvimento</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Sistema funcionando 100% local com localStorage
              </p>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3 py-1 text-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors"
            >
              Reset Dados
            </button>
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resetar Dados</h3>
            <p className="text-sm text-gray-600 mb-6">
              Isso irá limpar todos os dados e voltar ao estado inicial. Tem certeza?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 