import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  UserPlus, 
  BarChart3, 
  Download, 
  LogOut,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';
import { useLocalAuth } from '../contexts/LocalAuthContext';

const EmpresaDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useLocalAuth();
  const [stats, setStats] = useState({
    totalAgendamentos: 0,
    agendamentosHoje: 0,
    funcionarios: 0,
    receitaMes: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/empresa/login');
      return;
    }
    loadStats(user.id);
  }, [navigate, user]);

  const loadStats = (empresaId) => {
    // Carregar estatísticas básicas
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    const funcionarios = JSON.parse(localStorage.getItem(`funcionarios_${empresaId}`) || '[]');
    
    const hoje = new Date().toISOString().split('T')[0];
    const agendamentosHoje = agendamentos.filter(a => a.data === hoje).length;
    
    const receitaMes = agendamentos
      .filter(a => a.status === 'confirmado')
      .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);

    setStats({
      totalAgendamentos: agendamentos.length,
      agendamentosHoje,
      funcionarios: funcionarios.length,
      receitaMes
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/empresa/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {user?.logo_url ? (
                <img
                  src={user.logo_url}
                  alt={`Logo ${user.razaoSocial}`}
                  className="h-12 w-12 object-contain rounded-lg border border-gray-200"
                />
              ) : (
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {(user?.razaoSocial || 'E').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.razaoSocial}</h1>
                <p className="text-sm text-gray-600">Dashboard Empresarial</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAgendamentos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.agendamentosHoje}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Funcionários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.funcionarios}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita do Mês</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.receitaMes.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
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
                <p className="text-xs text-gray-500">Gerenciar funcionários</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/kpis')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">KPIs</p>
                <p className="text-xs text-gray-500">Métricas e indicadores</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/exportar')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <Download className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Exportar</p>
                <p className="text-xs text-gray-500">Exportar dados</p>
              </div>
            </button>
          </div>
        </div>

        {/* Informações da Empresa */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informações da Empresa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Dados Básicos</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>CNPJ:</strong> {user.cnpj}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Telefone:</strong> {user.telefone}</p>
                {user.endereco && <p><strong>Endereço:</strong> {user.endereco}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Funcionamento</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Especialização:</strong> {user.especializacao}</p>
                {user.horario_inicio && user.horario_fim && (
                  <p><strong>Horário:</strong> {user.horario_inicio} - {user.horario_fim}</p>
                )}
                {user.dias_funcionamento && user.dias_funcionamento.length > 0 && (
                  <p><strong>Dias:</strong> {user.dias_funcionamento.map(d => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d]).join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpresaDashboard;
