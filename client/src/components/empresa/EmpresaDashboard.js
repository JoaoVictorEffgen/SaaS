import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  UserPlus, 
  BarChart3, 
  Download, 
  LogOut,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Edit3,
  Home
} from 'lucide-react';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import localStorageService from '../../services/localStorageService';

const EmpresaDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useLocalAuth();
  const [currentUser, setCurrentUser] = useState(user);
  
  // Memoização dos dados para evitar recálculos desnecessários
  const { agendamentos, funcionarios } = useMemo(() => {
    if (!user?.id) return { agendamentos: [], funcionarios: [] };
    
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${user.id}`) || '[]');
    const funcionarios = JSON.parse(localStorage.getItem(`funcionarios_${user.id}`) || '[]');
    
    return { agendamentos, funcionarios };
  }, [user?.id]);

  // Cálculo memoizado das estatísticas
  const stats = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const agendamentosHoje = agendamentos.filter(a => a.data === hoje).length;
    
    const receitaMes = agendamentos
      .filter(a => a.status === 'confirmado')
      .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);

    return {
      totalAgendamentos: agendamentos.length,
      agendamentosHoje,
      funcionarios: funcionarios.length,
      receitaMes
    };
  }, [agendamentos, funcionarios]);

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      setCurrentUser(user);
    }
  }, [navigate, user]);

  const handleLogout = async () => {
    try {
      console.log('🚪 EmpresaDashboard - Iniciando logout...');
      
      // Executar logout (limpeza completa sem reload)
      await logout();
      
      // Navegar para a tela de login
      navigate('/', { replace: true });
      
      console.log('✅ EmpresaDashboard - Logout concluído e navegação realizada');
      
    } catch (error) {
      console.error('❌ Erro no logout do EmpresaDashboard:', error);
      // Fallback: navegar para login
      navigate('/', { replace: true });
    }
  };

  const handleLogoUpload = () => {
    // Criar input de arquivo temporário
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Verificar tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Arquivo muito grande! Selecione uma imagem menor que 5MB.');
          return;
        }
        
        // Ler o arquivo como URL
        const reader = new FileReader();
        reader.onload = (event) => {
          const logoUrl = event.target.result;
          
          if (currentUser) {
            // Atualizar no localStorageService (para persistência completa)
            const updatedUser = localStorageService.updateUser(currentUser.id, { 
              logo_url: logoUrl 
            });
            
            if (updatedUser) {
              // Atualizar também na lista de empresas (para exibição nos cards)
              const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
              const empresaIndex = empresas.findIndex(emp => emp.id === currentUser.id);
              
              if (empresaIndex !== -1) {
                empresas[empresaIndex].logo_url = logoUrl;
                localStorage.setItem('empresas', JSON.stringify(empresas));
              }
              
              // Atualizar o currentUser no localStorage
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              
              // Atualizar o estado local sem recarregar a página
              setCurrentUser(updatedUser);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (!currentUser || !currentUser.id) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {currentUser?.logo_url ? (
                <div className="relative group">
                  <img
                    src={currentUser.logo_url}
                    alt={`Logo ${currentUser.razaoSocial}`}
                    className="h-14 w-14 object-contain rounded-2xl border border-gray-200 shadow-lg"
                  />
                  <button 
                    onClick={handleLogoUpload}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-blue-700"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="relative group">
                  <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <button 
                    onClick={handleLogoUpload}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-blue-700"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {currentUser.razaoSocial} #{currentUser.id}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Dashboard Empresarial
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-300 font-medium"
              title="Voltar à Página Inicial"
            >
              <Home className="h-4 w-4 mr-2" />
              Início
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium"
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
          <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Agendamentos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAgendamentos}</p>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Hoje</p>
              <p className="text-3xl font-bold text-gray-900">{stats.agendamentosHoje}</p>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <UserPlus className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Funcionários</p>
              <p className="text-3xl font-bold text-gray-900">{stats.funcionarios}</p>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-orange-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Receita do Mês</p>
              <p className="text-3xl font-bold text-gray-900">R$ {stats.receitaMes.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Ações Rápidas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/servicos')}
              className="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Serviços</h3>
                <p className="text-sm text-gray-600">Gerenciar serviços</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/funcionarios')}
              className="group relative bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-green-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Funcionários</h3>
                <p className="text-sm text-gray-600">Gerenciar funcionários</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/kpis')}
              className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Dashboard Avançado</h3>
                <p className="text-sm text-gray-600">KPIs, gráficos e CRM</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/exportar')}
              className="group relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-orange-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-orange-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Exportar</h3>
                <p className="text-sm text-gray-600">Exportar dados</p>
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
                <p><strong>CNPJ:</strong> {currentUser?.cnpj || 'Não informado'}</p>
                <p><strong>Email:</strong> {currentUser?.email || 'Não informado'}</p>
                <p><strong>Telefone:</strong> {currentUser?.telefone || 'Não informado'}</p>
                {currentUser?.endereco && <p><strong>Endereço:</strong> {currentUser.endereco}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Funcionamento</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Especialização:</strong> {currentUser?.especializacao || 'Não informado'}</p>
                {currentUser?.horario_inicio && currentUser?.horario_fim && (
                  <p><strong>Horário:</strong> {currentUser.horario_inicio} - {currentUser.horario_fim}</p>
                )}
                {currentUser?.dias_funcionamento && currentUser.dias_funcionamento.length > 0 && (
                  <p><strong>Dias:</strong> {currentUser.dias_funcionamento.map(d => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d]).join(', ')}</p>
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
