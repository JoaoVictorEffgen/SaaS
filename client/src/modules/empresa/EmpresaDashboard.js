import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  UserPlus, 
  BarChart3, 
  Download, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Sun,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Home,
  Bell,
  Settings,
  Star
} from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import apiService from '../../services/apiService';
import ImageUpload from '../../components/shared/ImageUpload';

const EmpresaDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useMySqlAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentRankingIndex, setCurrentRankingIndex] = useState(0);
  const [logoUrl, setLogoUrl] = useState(null);
  const [empresaData, setEmpresaData] = useState(null);
  
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

    const receitaDia = agendamentos
      .filter(a => a.data === hoje && a.status === 'confirmado')
      .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);

    return {
      totalAgendamentos: agendamentos.length,
      agendamentosHoje,
      funcionarios: funcionarios.length,
      receitaMes,
      receitaDia
    };
  }, [agendamentos, funcionarios]);

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      setCurrentUser(user);
      // Buscar logo da empresa do banco de dados
      loadEmpresaLogo();
    }
  }, [navigate, user]);

  // Função para carregar logo da empresa
  const loadEmpresaLogo = async () => {
    if (!user?.id) return;
    
    try {
      const { default: apiService } = await import('../../services/apiService');
      
      // Buscar todas as empresas e encontrar a associada ao usuário
      const empresas = await apiService.getEmpresas();
      const empresaDoUsuario = empresas.find(empresa => empresa.user_id === user.id);
      
      if (empresaDoUsuario) {
        const empresaData = await apiService.getEmpresa(empresaDoUsuario.id);
        
        if (empresaData?.logo_url) {
          setLogoUrl(empresaData.logo_url);
        }
        
        // Salvar dados da empresa no estado
        setEmpresaData(empresaData);
      }
    } catch (error) {
      console.error('Erro ao carregar logo da empresa:', error);
    }
  };

  // Rotação automática dos rankings a cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRankingIndex(prev => (prev + 1) % 3); // Alterna entre 0, 1, 2
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      console.log('🚪 EmpresaDashboard - Iniciando logout específico...');
      
      // Executar logout específico da empresa (mantém outras sessões)
      await logout('empresa');
      
      // Navegar para a tela de login
      navigate('/', { replace: true });
      
      console.log('✅ EmpresaDashboard - Logout específico concluído e navegação realizada');
      
    } catch (error) {
      console.error('❌ Erro no logout do EmpresaDashboard:', error);
      // Fallback: navegar para login
      navigate('/', { replace: true });
    }
  };

  // Função para lidar com upload da logo
  const handleLogoUpload = async (base64Image, file) => {
    try {
      console.log('📷 Upload de logo iniciado...');
      console.log('👤 Usuário atual:', currentUser);
      
      // Verificar se há token no localStorage
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token no localStorage:', token ? 'Presente' : 'Ausente');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }
      
      // Atualizar logo localmente imediatamente
      setLogoUrl(base64Image);
      
      // Garantir que o apiService tem o token atualizado
      apiService.setToken(token);
      
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('logo', file);
      
      // Enviar para o backend via API de upload
      const response = await fetch('http://localhost:5000/api/upload/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Erro no upload: ${response.statusText}`);
      }
      
      const uploadResult = await response.json();
      console.log('📡 Resultado do upload:', uploadResult);
      
      if (uploadResult.success) {
        // Atualizar a empresa com a nova URL da logo
        const updateResponse = await apiService.request(`/empresas/${currentUser.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            logo_url: uploadResult.url
          })
        });
        
        console.log('✅ Logo atualizada com sucesso!');
        console.log('🔗 URL da logo:', uploadResult.url);
        
        // Atualizar a logo local com a URL completa
        const fullLogoUrl = uploadResult.url.startsWith('/api/uploads/') 
          ? `http://localhost:5000${uploadResult.url}`
          : uploadResult.url;
        setLogoUrl(fullLogoUrl);
        
        // Atualizar o usuário no contexto
        setCurrentUser(prev => ({ ...prev, logo_url: uploadResult.url }));
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar logo:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      alert(`Erro ao atualizar logo: ${error.message}`);
      // Reverter mudança local em caso de erro
      setLogoUrl(currentUser?.logo_url || null);
    }
  };

  // Carregar notificações da empresa
  const loadNotifications = () => {
    if (!currentUser?.id) return;
    
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${currentUser.id}`) || '[]');
    const notificacoes = agendamentos
      .filter(a => a.status === 'agendado' || a.status === 'confirmado')
      .map(a => ({
        id: a.id,
        titulo: 'Novo Agendamento',
        mensagem: `${a.cliente_nome || a.cliente_email} agendou ${a.servicos?.map(s => s.nome).join(', ') || 'serviços'}`,
        data: a.data,
        hora: a.hora,
        status: a.status,
        tipo: 'agendamento'
      }))
      .sort((a, b) => new Date(`${b.data}T${b.hora}`) - new Date(`${a.data}T${a.hora}`))
      .slice(0, 10); // Últimas 10 notificações
    
    setNotifications(notificacoes);
  };

  // Carregar notificações quando o componente monta
  useEffect(() => {
    loadNotifications();
  }, [currentUser?.id]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);


  // Função para obter top funcionários por atendimentos
  const getTopFuncionariosPorAtendimentos = () => {
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    
    // Filtrar funcionários da empresa atual
    const funcionariosEmpresa = funcionarios.filter(f => f.empresa_id === currentUser?.id);
    
    // Calcular atendimentos por funcionário
    const funcionariosComAtendimentos = funcionariosEmpresa.map(funcionario => {
      const totalAtendimentos = agendamentos.filter(a => a.funcionario_id === funcionario.id).length;
      return {
        ...funcionario,
        totalAtendimentos
      };
    });
    
    // Ordenar por número de atendimentos e pegar top 3
    return funcionariosComAtendimentos
      .sort((a, b) => b.totalAtendimentos - a.totalAtendimentos)
      .slice(0, 3);
  };

  // Função para obter top funcionários por satisfação
  const getTopFuncionariosPorSatisfacao = () => {
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    const avaliacoes = JSON.parse(localStorage.getItem('avaliacoes') || '[]');
    
    // Filtrar funcionários da empresa atual
    const funcionariosEmpresa = funcionarios.filter(f => f.empresa_id === currentUser?.id);
    
    // Calcular satisfação por funcionário
    const funcionariosComSatisfacao = funcionariosEmpresa.map(funcionario => {
      const avaliacoesFuncionario = avaliacoes.filter(a => a.funcionario_id === funcionario.id);
      const satisfacao = avaliacoesFuncionario.length > 0 
        ? avaliacoesFuncionario.reduce((sum, a) => sum + a.nota, 0) / avaliacoesFuncionario.length
        : 0;
      return {
        ...funcionario,
        satisfacao
      };
    });
    
    // Ordenar por satisfação e pegar top 3
    return funcionariosComSatisfacao
      .sort((a, b) => b.satisfacao - a.satisfacao)
      .slice(0, 3);
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
    <div className="min-h-screen bg-gray-50">
      {/* Barra Preta Superior */}
      <div className="bg-black h-1 w-full"></div>
      
      {/* Header Principal */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Lado Esquerdo - Logo e Título */}
            <div className="flex items-center space-x-4">
              {/* Logo com upload */}
              <div className="flex flex-col items-center">
                <ImageUpload
                  currentImage={logoUrl}
                  onImageChange={handleLogoUpload}
                  type="logo"
                  size="medium"
                  className="mb-1"
                />
              </div>
              
              {/* Título */}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {empresaData?.nome || currentUser?.razaoSocial || 'Empresa'}
                </h1>
                <p className="text-sm text-gray-500">
                  Dashboard Empresarial
                </p>
              </div>
            </div>
            
            {/* Lado Direito - Botões */}
            <div className="flex items-center space-x-3 -mt-10">
              {/* Sino de Notificação */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  title="Notificações"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
                
                {/* Dropdown de Notificações */}
                {showNotifications && (
                  <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notificações</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{notification.titulo}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.mensagem}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.data).toLocaleDateString('pt-BR')} às {notification.hora}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>Nenhuma notificação</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => navigate('/empresa/configuracoes')}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200 font-medium"
                title="Configurações da Empresa"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors duration-200 font-medium"
                title="Voltar à Página Inicial"
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </button>
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

          <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-yellow-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Receita do Dia</p>
              <p className="text-3xl font-bold text-gray-900">R$ {stats.receitaDia.toFixed(2)}</p>
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

          {/* Segunda linha - Pacotes e Rede lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <button
              onClick={() => navigate('/pacotes')}
              className="group relative bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-indigo-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Meus Pacotes</h3>
                <p className="text-sm text-gray-600">Criar e gerenciar pacotes personalizados</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/rede')}
              className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Rede Empresarial</h3>
                <p className="text-sm text-gray-600">Gerenciar franquias e unidades da rede</p>
              </div>
            </button>
          </div>
        </div>


        {/* Informações da Empresa */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informações da Empresa</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Dados Básicos</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>CNPJ:</strong> {currentUser?.cnpj || 'Não informado'}</p>
                <p><strong>Email:</strong> {currentUser?.email || 'Não informado'}</p>
                <p><strong>Telefone:</strong> {currentUser?.telefone || 'Não informado'}</p>
                <p><strong>ID da Empresa:</strong> {currentUser?.id || 'Não informado'}</p>
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
              
              {/* Ranking dos Melhores Funcionários */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3 text-sm">🏆 Funcionário em Destaque</h4>
                
                {/* Ranking por Atendimentos - Alternando automaticamente */}
                <div className="mb-4">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Mais Atendimentos</h5>
                  <div className="flex justify-center">
                    {(() => {
                      const topFuncionarios = getTopFuncionariosPorAtendimentos();
                      const funcionarioAtual = topFuncionarios[currentRankingIndex];
                      
                      if (!funcionarioAtual) {
                        return (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-16 bg-gray-100 rounded border-2 border-gray-300 flex items-center justify-center">
                              <Users className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-500 mt-1">Nenhum funcionário</span>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded border-2 border-blue-300 flex items-center justify-center">
                              {funcionarioAtual.foto ? (
                                <img 
                                  src={funcionarioAtual.foto} 
                                  alt={funcionarioAtual.nome}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <Users className="w-6 h-6 text-blue-600" />
                              )}
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                              {currentRankingIndex + 1}
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 mt-1 text-center max-w-12 truncate">
                            {funcionarioAtual.nome}
                          </span>
                          <span className="text-xs text-blue-600 font-medium">
                            {funcionarioAtual.totalAtendimentos} atendimentos
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Ranking por Satisfação - Alternando automaticamente */}
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Melhor Satisfação</h5>
                  <div className="flex justify-center">
                    {(() => {
                      const topFuncionarios = getTopFuncionariosPorSatisfacao();
                      const funcionarioAtual = topFuncionarios[currentRankingIndex];
                      
                      if (!funcionarioAtual) {
                        return (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-16 bg-gray-100 rounded border-2 border-gray-300 flex items-center justify-center">
                              <Star className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-500 mt-1">Nenhum funcionário</span>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div className="w-12 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded border-2 border-green-300 flex items-center justify-center">
                              {funcionarioAtual.foto ? (
                                <img 
                                  src={funcionarioAtual.foto} 
                                  alt={funcionarioAtual.nome}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <Star className="w-6 h-6 text-green-600" />
                              )}
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                              {currentRankingIndex + 1}
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 mt-1 text-center max-w-12 truncate">
                            {funcionarioAtual.nome}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            {funcionarioAtual.satisfacao.toFixed(1)}★
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Satisfação</h3>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mb-3">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {(stats.satisfacao || 0).toFixed(1)}★
                  </div>
                  <div className="text-gray-600 text-sm">Avaliação Média</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpresaDashboard;
