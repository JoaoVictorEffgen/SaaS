import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import { User, Building2, ClipboardList, LogOut, LogIn, X, Home, Calendar } from 'lucide-react';

const LoginStatusIndicator = () => {
  const { user, logout } = useLocalAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const getLoginInfo = () => {
    // Verificar se há usuário logado no contexto
    if (user) {
      return {
        isLoggedIn: true,
        type: user.tipo || 'empresa',
        name: user.razaoSocial || user.nome || 'Usuário',
        id: user.id
      };
    }

    // Verificar se há cliente logado
    const clienteLogado = localStorage.getItem('clienteLogado');
    if (clienteLogado) {
      const cliente = JSON.parse(clienteLogado);
      return {
        isLoggedIn: true,
        type: 'cliente',
        name: cliente.nome || 'Cliente',
        id: cliente.id
      };
    }

    // Verificar se há empresa logada
    const empresaLogada = localStorage.getItem('empresaLogada');
    if (empresaLogada) {
      const empresa = JSON.parse(empresaLogada);
      return {
        isLoggedIn: true,
        type: 'empresa',
        name: empresa.nome || empresa.razaoSocial || 'Empresa',
        id: empresa.id
      };
    }

    // Verificar se há funcionário logado
    const funcionarioLogado = localStorage.getItem('funcionarioLogado');
    if (funcionarioLogado) {
      const funcionario = JSON.parse(funcionarioLogado);
      return {
        isLoggedIn: true,
        type: 'funcionario',
        name: funcionario.nome || 'Funcionário',
        id: funcionario.id
      };
    }

    return { isLoggedIn: false };
  };

  const loginInfo = getLoginInfo();

  const handleLogout = async () => {
    try {
      console.log('🚪 LoginStatusIndicator - Iniciando logout...');
      
      // Executar logout (limpeza completa sem reload)
      await logout();
      
      // Navegar para a tela de login
      navigate('/', { replace: true });
      
      console.log('✅ LoginStatusIndicator - Logout concluído e navegação realizada');
      
    } catch (error) {
      console.error('❌ Erro no logout do LoginStatusIndicator:', error);
      // Fallback: navegar para login
      navigate('/', { replace: true });
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'empresa':
        return <Building2 className="w-4 h-4" />;
      case 'cliente':
        return <User className="w-4 h-4" />;
      case 'funcionario':
        return <ClipboardList className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };


  const getTypeColor = (type) => {
    switch (type) {
      case 'empresa':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cliente':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'funcionario':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!loginInfo.isLoggedIn) {
    return (
      <div className="flex items-center space-x-3">
        {/* Status offline - Mais Destacado */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 border-2 border-red-200 rounded-lg shadow-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-red-800">❌ OFFLINE</span>
        </div>

        {/* Botão de Login - Mais Chamativo */}
        <button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-semibold"
          title="Fazer Login"
        >
          <LogIn className="w-5 h-5" />
          <span className="text-sm font-bold">🔑 FAZER LOGIN</span>
        </button>

        {/* Botão Voltar ao Início */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-semibold"
          title="Voltar à Página Inicial"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-bold">🏠 INÍCIO</span>
        </button>

        {/* Modal de seleção de login */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              {/* Header do Modal */}
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-3xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <LogIn className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Acesso ao Sistema</h2>
                      <p className="text-blue-100 text-sm">Escolha como deseja entrar</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowLoginModal(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Conteúdo do Modal */}
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  {/* Login Empresa */}
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      // Redirecionar para cadastro de empresa
                      window.location.href = '/empresa/cadastro';
                    }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">Área da Empresa</h3>
                      <p className="text-sm text-gray-600">Gerencie suas agendas e clientes</p>
                    </div>
                  </button>

                  {/* Login Cliente */}
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      // Redirecionar para seleção de empresas
                      window.location.href = '/empresas';
                    }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">Área do Cliente</h3>
                      <p className="text-sm text-gray-600">Agende serviços online</p>
                    </div>
                  </button>

                  {/* Login Funcionário */}
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      // Redirecionar para página principal para abrir modal
                      window.location.href = '/';
                      // Disparar evento para abrir modal de funcionário
                      setTimeout(() => {
                        const evento = new CustomEvent('openFuncionarioModal');
                        window.dispatchEvent(evento);
                      }, 100);
                    }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">Área do Funcionário</h3>
                      <p className="text-sm text-gray-600">Visualize sua agenda pessoal</p>
                    </div>
                  </button>
                </div>
                
                {/* Informação adicional */}
                <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800 text-center">
                    🔐 Escolha o tipo de acesso que melhor se adequa ao seu perfil
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">

      {/* Informações do usuário - Mais Visível */}
      <div className="flex items-center space-x-3 px-4 py-3 rounded-xl border-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${getTypeColor(loginInfo.type)} shadow-md`}>
            <div className="text-xl">
              {getIcon(loginInfo.type)}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900">
              {loginInfo.name}
            </span>
            <span className="text-xs font-medium text-gray-600">
              {loginInfo.type === 'empresa' ? '🏢 Empresa' : 
               loginInfo.type === 'cliente' ? '👤 Cliente' : '👨‍💼 Funcionário'}
            </span>
          </div>
        </div>
      </div>

      {/* Botão Meus Agendamentos (apenas para clientes) */}
      {loginInfo.type === 'cliente' && (
        <button
          onClick={() => navigate('/cliente/agendamentos')}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 font-semibold"
          title="Ver Meus Agendamentos"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-bold">📅 MEUS AGENDAMENTOS</span>
        </button>
      )}

      {/* Botão Voltar ao Início */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 font-semibold"
        title="Voltar à Página Inicial"
      >
        <Home className="w-4 h-4" />
        <span className="text-sm font-bold">🏠 INÍCIO</span>
      </button>

      {/* Botão de logout - Mais Destacado */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300 font-semibold"
        title="Sair"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-bold">🚪 SAIR</span>
      </button>
    </div>
  );
};

export default LoginStatusIndicator;
